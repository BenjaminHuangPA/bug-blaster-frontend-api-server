var express = require('express');
var data = require("../data");
var router = express.Router();
router.use(express.json());
const  {v4: uuidv4} = require("uuid");


const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');
const { SERVER_EMPTY } = require('../data');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

async function getPodNameFromServerNumber(server_number){
    //given a server number, attempts to get the pod name
    try {
        let res = await k8sApi.listNamespacedPod("default");
        let pods = res.body.items;
        let found_pod_name = null;
        pods.forEach((pod) => {
            let pod_name = pod.metadata.name;
            console.log("Pod name: " + pod_name);
            if(pod_name.substring(0, 19) === "bug-blaster-server" + server_number){
                found_pod_name = pod_name
                /*
                console.log("Found a pod with a name starting with bug-blaster-server1");
                let gameserver_containers = pod.spec.containers[0];
                let env_vars = gameserver_containers.env;
                env_vars.forEach((env_var) => {

                    if(env_var.name == 'SERVER_NAME'){
                        console.log("Found an env var with name SERVER_NAME");
                        let server_name = env_var.value;
                        if(parseInt(server_name[server_name.length - 1]) === server_number){
                            found_pod_name = pod_name;
                        }
                    }
                });
                */
            }
        });
        console.log("Returning " + found_pod_name);
        return found_pod_name;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function resetPod(pod_name){
    //"reset" a pod by deleting it and having the deployment spawn a new one
    try {
        let deleted_pod = await k8sApi.deleteNamespacedPod(pod_name, "default");
        return deleted_pod.response.statusCode == 200;
    } catch (error){
        console.log(error);
        return false;
    }
}

async function modify_service(service_name, server_number){
    try {

        let random_portnumber = Math.floor(Math.random() * (4000 - 3000 + 1) + 3000);
        console.log("Generated random port number " + random_portnumber);
        data.SERVER_PORTS[server_number] = random_portnumber;

        const body = [{
            "op": "replace",
            "path": "/spec/ports/0/port",
            "value": random_portnumber
        }];

        const options = {
            "headers": {
                "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH
            }
        }

        let service_modified = await k8sApi.patchNamespacedService(
            service_name,
            "default",
            body,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            options
        );

        console.log(service_modified);
        return true;

    } catch (error) {
        console.log(error.body);
        return false;
    }
}

router.post("/patchservice", async function(req, res, next){
    const { service_name } = req.body;
    let result = await modify_service(service_name);
    if(result){
        return res.status(200).json({
            status: "success",
            data: result,
            message: "Successfully patched service"
        });
    } else {
        return res.status(400).json({
            status: "failure",
            data: result,
            message: "Failed to patch service"
        })
    }
});


router.post("/", async function(req, res, next){
    console.log("RECEIVED A REQUEST FOR GAME OVER!!!!!");
    console.log(req.body);
    const { server_name, server_number, server_passcode } = req.body;
    if(!(server_passcode in data.lobby_ids)){
        return res.status(400).json({
            status: "failure",
            data: null,
            message: "Could not find that lobby ID"
        });
    }

    delete data.lobby_ids[server_passcode];
    delete data.server_id_to_passcode[server_number];

    data.SERVER_STATUSES[server_number] = data.SERVER_INACTIVE;

    if(!("USERNAME" in process.env && process.env.USERNAME == "benja")){
        
        //generate new passcode
        let server_uuid = uuidv4();
        let new_server_passcode = server_uuid.slice(0, 8);

        //set new passcode
        data.lobby_ids[new_server_passcode] = server_number;
        data.server_id_to_passcode[server_number] = new_server_passcode;

        //set new names
        data.player_names[new_server_passcode] = {
            0: "Player 1",
            1: "Player 2",
            2: "Player 3",
            3: "Player 4"
        }

        //running with containers, reset them
        let pod_name = await getPodNameFromServerNumber(server_number);
        console.log("Received pod_name = " + pod_name);
        let reset_pod_status = await resetPod(pod_name);
        if(!reset_pod_status){
            console.log("There was an error in resetting the pod");
        }
        let service_name = "bug-blaster-server" + server_number + "-service";
        let modify_service_status = await modify_service(service_name, server_number);
        if(!modify_service_status){
            console.log("There was an error modifying the service");
        }
    } else {
        let server_uuid = uuidv4();
        let new_server_passcode = server_uuid.slice(0, 8);
        data.lobby_ids[new_server_passcode] = server_number;
        data.server_id_to_passcode[server_number] = new_server_passcode;
    }



    //the resetting of the passcode is done in the /getPasscode route of serverManagement.js

    data.SERVER_STATUSES[server_number] = data.SERVER_EMPTY;


    return res.status(200).json({
        status: "success",
        data: null,
        message: "Successfully deleted the game with ID " + server_passcode
    });
});

module.exports = router;