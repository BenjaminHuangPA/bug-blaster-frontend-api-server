var express = require('express');
var data = require("../data");
var router = express.Router();

const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

router.get("/", function(req, res, next){
    k8sApi.listNamespacedPod('default').then((k8s_res) => {
        console.log(k8s_res.body);
        let pods = k8s_res.body.items;
        pods.forEach((pod) => {
            console.log(pod.metadata.uid);
            console.log(pod.status);
            let server_name = pod.metadata.labels.app;
            console.log(server_name);
            let containerStatuses = pod.status.containerStatuses;
            if(containerStatuses.length < 1){
                console.log("This pod has 0 containers ready");
            } else {
                let gameserver_container = containerStatuses[0];
                if(gameserver_container.ready && gameserver_container.started){
                    console.log("The game server container for this pod is fully operational");
                }
            }

        })
        return res.status(200).json({
            status: "success",
            data: k8s_res.body,
            message: "Successfully got pods"
        });
    }).catch((err) => {
        console.log("There was an error.");
        console.log(err);
        return res.status(400).json({
            status: "failure",
            data: err,
            message: "failed to fetch pods"
        })
    });
    

})

module.exports = router;