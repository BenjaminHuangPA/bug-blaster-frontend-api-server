var express = require('express');
var data = require("../data");
var router = express.Router();

const  {v4: uuidv4} = require("uuid");

const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function getPodStatuses(res){
    try{
        res = await k8sApi.listNamespacedPod("default");
        let pods = res.body.items;
        pod_data = {}
        pods.forEach((pod) => {
            let server_name = pod.metadata.labels.app;
            let containerStatuses = pod.status.containerStatuses;
            if(containerStatuses.length < 1){
                pod_data[server_name] = false;
            } else {
                let gameserver_container = containerStatuses[0];
                if(gameserver_container.ready && gameserver_container.started){
                    pod_data[server_name] = true;
                } else {
                    pod_data[server_name] = false;
                }
            }
        });
        return pod_data;
    } catch (error){
        console.log("Error:");
        console.log(error);
        return null;
    }
}

async function getServiceStatuses(res){
    try{
        res = await k8sApi.listNamespacedService("default");
        services = res.body.items;
        IPs = {}
        services.forEach((service) => {
            //console.log("Service:");
            //console.log(service);
            //console.log("==========================================================================");
            if(service.metadata.name.substring(0, 18) === 'bug-blaster-server'){
                console.log(service.status.loadBalancer.ingress);
                let hostname = service.status.loadBalancer.ingress[0].hostname;
                let ip = service.status.loadBalancer.ingress[0].ip;
                let port = service.spec.ports[0].port;
                IPs[service.metadata.name] = [hostname, ip, port];
            }
        })
        return IPs;
    } catch (error){
        console.log("Error:");
        console.log(error);
        return null;
    }
}

router.get("/", async function(req, res, next){
    let server_availability = await getPodStatuses(res);
    if(server_availability === null){
        return res.status(400).json({
            status: "failure",
            data: null,
            message: "Encountered an error while trying to fetch pods"
        });
    };
    let service_availability = await getServiceStatuses(res);
    if(service_availability === null){
        return res.status(400).json({
            status: "failure",
            data: null,
            message: "Encountered an error while trying to fetch services"
        })
    }
    console.log(service_availability);
    for(const server_number in data.SERVER_STATUSES){
        let server_name = "bug-blaster-server" + server_number;
        let service_name = "bug-blaster-server" + server_number + "-service";
        let port_number = data.SERVER_PORTS[server_number];
        if(data.SERVER_STATUSES[server_number] == data.SERVER_EMPTY && server_availability[server_name] && service_name in service_availability){
            
            //let server_uuid = uuidv4();
            //let server_passcode = server_uuid.slice(0, 8);
            //console.log(server_passcode);

            //data.lobby_ids[server_passcode] = server_number;
            data.SERVER_PORTS[server_number] = service_availability[service_name][2];

            return res.status(200).json({
                status: "success",
                data: {
                    server_name: server_name,
                    hostname: service_availability[service_name][0],
                    ip: service_availability[service_name][1],
                    //server_passcode: server_passcode,
                    server_passcode: data.server_id_to_passcode[server_number],
                    //port: port_number
                    port: service_availability[service_name][2]
                },
                message: "Found an available server"
            })
        }
    }
    if("USERNAME" in process.env && process.env.USERNAME == "benja"){
        //running locally
        
        //let server_uuid = uuidv4();
        //let server_passcode = server_uuid.slice(0, 8);
        //console.log(server_passcode);

        //data.lobby_ids[server_passcode] = 1;
        //data.server_id_to_passcode[1] = server_passcode;

        let server_passcode = data.server_id_to_passcode[1];

        return res.status(200).json({
            status: "success",
            data: {
                server_name: "bug-blaster-server1",
                hostname: "localhost",
                ip: null,
                server_passcode: server_passcode,
                port: "3100"
            }
        })
    }
    return res.status(200).json({
        status: "failure",
        data: null,
        message: "No servers available"
    })
})

module.exports = router;