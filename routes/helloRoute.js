var express = require('express');

var data = require("../data");

var router = express.Router();

const k8s = require("@kubernetes/client-node");
const { KubeConfig } = require('@kubernetes/client-node');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

router.get("/", async function (req, res, next) {
    res.send(data.family);
});

router.get("/number", async function (req, res, next) {
    res.status(200).json({
        "number": data.number
    })
})

router.get("/increasenumber", async function (req, res, next) {
    data.number += 1;
    res.status(200).json({
        "status": "increased number to " + data.number
    })
});


router.get("/getservices", async function (req, res, next){
    try{
        let result = await k8sApi.listNamespacedService("default");
        services = result.body.items;
        res.status(200).json(services)
    } catch (error){
        console.log("Error:");
        console.log(error);
        res.status(400).json({
            "error": error
        })
    }
});


module.exports = router;