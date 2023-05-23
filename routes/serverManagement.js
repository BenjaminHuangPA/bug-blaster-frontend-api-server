var express = require('express');
var data = require('../data');
const  {v4: uuidv4} = require("uuid");

var router = express.Router();

router.use(express.json());

router.post("/getPasscode", async function(req, res, next){
    const {server_number} = req.body;
    console.log("Received a request to get a server passcode from server " + server_number);
    if(!(server_number in data.server_id_to_passcode)){
        return res.status(400).json({
            status: "failure",
            data: null,
            message: "Invalid server number"
        });
    } else {

        //let server_uuid = uuidv4();
        //let server_passcode = server_uuid.slice(0, 8);

        //data.lobby_ids[server_passcode] = server_number;
        //data.server_id_to_passcode[server_number] = server_passcode;

        console.log("Successfully received a request from server " + server_number);
        console.log("The passcode for that server is " + data.server_id_to_passcode[server_number]);
        return res.status(200).json({
            status: "success",
            data: data.server_id_to_passcode[server_number],
            message: "Successfully got server passcode"
        })
    }
});

router.post("/playerjoined", function(req, res, next){
    console.log("A player joined!");
    const { server_number, n_players } = req.body;
    if(n_players < 4){
        data.SERVER_STATUSES[server_number] = data.SERVER_WAITING;
    } else {
        data.SERVER_STATUSES[server_number] = data.SERVER_FULL;
    }
    return res.status(200).json({
        status: "success",
        data: null,
        message: "Acknowledged."
    })
});

router.post("/playerleft", function(req, res, next){
    console.log("A player left!");
    const { server_name, n_players, player_id } = req.body;
    console.log("Server name: " + server_name);
    console.log("Number of players left: " + n_players);
    let server_number = parseInt(server_name.slice(-1));

    let server_passcode = data.server_id_to_passcode[server_number];
    data.player_names[server_passcode][player_id] = "Player " + (player_id + 1);

    if(n_players == 0){
        console.log("Server is empty");
        console.log(server_number);
        data.SERVER_STATUSES[server_number] = data.SERVER_EMPTY;
    }
    return res.status(200).json({
        status: "success",
        data: null,
        message: "Player left"
    });
})

module.exports = router;