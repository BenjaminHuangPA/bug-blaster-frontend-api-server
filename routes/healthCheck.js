var express = require('express');
var data = require("../data");
var router = express.Router();

router.get("/", function(req, res, next){
    return res.status(200).json({
        "status": "success",
        "data": null,
        "message": "all clear"
    });
});

module.exports = router;