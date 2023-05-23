var express = require('express');
var data = require("../data");
var router = express.Router();
router.use(express.json());

const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function getServerIP(server_number){
    if("USERNAME" in process.env && process.env.USERNAME == "benja"){
        return "http://localhost:3100";
    }
    try{
        res = await k8sApi.listNamespacedService("default");
        services = res.body.items;
        //IPs = {}
        let service_name = "bug-blaster-server" + server_number + "-service";
        let server_ip = null;
        services.forEach((service) => {
            console.log(service);
            if(service.metadata.name === service_name){
                console.log("Found a service with name " + service.metadata.name);
                console.log(service.status.loadBalancer.ingress);
                let hostname = "";
                if(service.status.loadBalancer.ingress[0].hostname != undefined){
                    hostname = service.status.loadBalancer.ingress[0].hostname;
                } else {
                    hostname = service.status.loadBalancer.ingress[0].ip;
                }
                console.log("Hostname: " + hostname);
                console.log("Server number: ");
                console.log(data.SERVER_PORTS[server_number]);
                server_ip = "http://" + hostname + ":" + data.SERVER_PORTS[server_number];
                //let ip = service.status.loadBalancer.ingress[0].ip;

                //IPs[service.metadata.name] = [hostname, ip];
            }
        })
        return server_ip;
    } catch (error){
        console.log(error);
        return null;
    }
}

router.post("/validatePasscode", async function(req, res, next){
    const { passcode, player_name } = req.body;
    if(passcode in data.lobby_ids){
        let server_number = data.lobby_ids[passcode];
        if(data.SERVER_STATUSES[server_number] === data.SERVER_FULL){
            return res.status(400).json({
                status: "failure",
                data: null,
                message: "The server you are trying to join is full."
            })
        }
        if(data.SERVER_STATUSES[server_number] === data.SERVER_EMPTY){
            data.SERVER_STATUSES[server_number] = data.SERVER_WAITING;
        }
        let server_ip = await getServerIP(server_number);
        console.log("Return value of getServerIP:");
        console.log(server_ip);
        if(server_ip != null){
            let i = 0;
            while(i < 4){
                if(data.player_names[passcode][i] == ("Player " + i)){
                    data.player_names[passcode][i] = player_name;
                    break;
                }
                i += 1;
            }
            return res.status(200).json({
                status: "success",
                data: {
                    name: "bug-blaster-server" + server_number,
                    ip: server_ip
                },
                message: "Successfully validated passcode"
            });
        } else {
            return res.status(400).json({
                status: "success",
                data: server_ip,
                message: "There was an error"
            })
        }
    } else {
        return res.status(400).json({
            status: "failure",
            data: null,
            message: "Invalid passcode"
        })
    };
});

module.exports = router;