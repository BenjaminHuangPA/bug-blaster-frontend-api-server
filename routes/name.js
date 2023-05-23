var express = require('express');
var data = require('../data');
const  {v4: uuidv4} = require("uuid");

var router = express.Router();

router.use(express.json());

router.post("/putname", async function(req, res, next){
    const {server_passcode, player_name} = req.body;
    if(!(server_passcode in data.player_names)){
        res.status(400).json({
            status: "failure",
            data: null,
            message: "Couldn't find that server passcode in data.player_names"
        });
    }
    let i = 0;
    console.log("PUTTING NAME " + player_name);
    while(i < 4){
        if(data.player_names[server_passcode][i] === "Player " + (i + 1)){
            data.player_names[server_passcode][i] = player_name;
            break;
        }
        i += 1;
    }
    res.status(200).json({
        status: "success",
        data: data.player_names[server_passcode],
        message: "Successfully added this player to the server"
    })
});

router.post("/getname", async function(req, res, next){
    const {server_passcode, player_id} = req.body;
    if(!(server_passcode in data.player_names)){
        res.status(400).json({
            status: "failure",
            data: null,
            message: "Couldn't find that server passcode in data.player_names"
        });
    }
    let player_name = data.player_names[server_passcode][player_id];
    console.log("RETRIEVED PLAYER NAME " + player_name);
    res.status(200).json({
        status: "success",
        data: player_name,
        message: "Successfully retrieved player name"
    })
});



module.exports = router;