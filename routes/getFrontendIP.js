var express = require('express');
var data = require("../data");
var router = express.Router();
router.use(express.json());


const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


router.get("/", async function(req, res, next){
    //get the IP of the frontend server, i.e. the main page
    console.log("Received a response");
    let response = await k8sApi.listNamespacedService("default");
    let services = response.body.items;
    let host = "localhost";
    let port = "3000";
    services.forEach((service) => {
        if(service.metadata.name == "bug-blaster-frontend-service"){
            if(service.status.loadBalancer.ingress[0].hostname == undefined){
                host = service.status.loadBalancer.ingress[0].ip;
            } else {
                host = service.status.loadBalancer.ingress[0].hostname;
            }
            
            //port = service.status.loadBalancer.ingress[0].ports
            port = "3000"
        }
    })
    return res.status(200).json({
        status: "success",
        data: {
            "host": host,
            "port": port
        },
        message: "Services fetched"
    });
});

module.exports = router;