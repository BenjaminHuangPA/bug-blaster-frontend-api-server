
const family = ["Benjamin", "Jeremy", "Sarabeth", "Mom", "Dad", "PoPo", "YeYe", "David"];

var number = 0;

var N_SERVERS = 0;
const MAX_SERVERS = 2;

const SERVER_INACTIVE = -1; //server is restarting, broken, etc (unable to respond to requests)
const SERVER_EMPTY = 0; //server is currently empty, no players have joined. Waiting...
const SERVER_WAITING = 1; //server is not empty (a player has joined), but the game has not started.
const SERVER_FULL = 2; //server is full, but the game has not started
const SERVER_GAME_STARTED = 3; //server is full and the game has started.
const SERVER_GAME_EMPTY = 4; //server is full and the game has started

var LOCAL = false;

var SERVER_STATUSES = {
    1: SERVER_EMPTY,
    2: SERVER_EMPTY,
}

var SERVER_PORTS = {
    1: 3005,
    2: 3010
}

var lobby_ids = {
    //map a lobby passcode to its corresponding server ID
    //used for players joining via passcode
    "iBGZLPGmQh": 1,
    "hkRfLlutq5": 2
};

var server_id_to_passcode = {
    1: "iBGZLPGmQh",
    2: "hkRfLlutq5"
}

var player_names = {
    "iBGZLPGmQh": {
        0: "Player 1",
        1: "Player 2",
        2: "Player 3",
        3: "Player 4"
    },
    "hkRfLlutq5": {
        0: "Player 1",
        1: "Player 2",
        2: "Player 3",
        3: "Player 4"
    }
}



module.exports = {
    "N_SERVERS": N_SERVERS,
    "MAX_SERVERS": MAX_SERVERS,
    "lobby_ids": lobby_ids,
    "server_id_to_passcode": server_id_to_passcode,
    "player_names": player_names,
    "SERVER_INACTIVE": SERVER_INACTIVE,
    "SERVER_EMPTY": SERVER_EMPTY,
    "SERVER_WAITING": SERVER_WAITING,
    "SERVER_FULL": SERVER_FULL,
    "SERVER_GAME_STARTED": SERVER_GAME_STARTED,
    "SERVER_GAME_EMPTY": SERVER_GAME_EMPTY,
    "SERVER_STATUSES": SERVER_STATUSES,
    "SERVER_PORTS": SERVER_PORTS,
    "LOCAL": LOCAL,
    "number": number
}