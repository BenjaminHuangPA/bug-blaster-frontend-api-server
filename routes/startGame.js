var express = require('express');
var data = require('../data');
const  {v4: uuidv4} = require("uuid");

var router = express.Router();

router.use(express.json());

router.post("/", async function(req, res, next){
    //let the server know that a game has started
    const { server_number } = req.body;
    if(!(server_number in data.SERVER_STATUSES)){
        return res.status(200).json({
            status: "failure",
            data: null,
            message: "Could not find a server with that server number"
        })
    };
    console.log("Successfully told the server that a game started");
    data.SERVER_STATUSES[server_number] = data.SERVER_GAME_STARTED;

    return res.status(200).json({
        status: "success",
        data: null,
        message: "Successfully started the game"
    });

});

module.exports = router;