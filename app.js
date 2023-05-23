var express = require("express");
var http = require('http');
var cors = require('cors');

var helloRouter = require("./routes/helloRoute");
//var newGameRouter = require("./routes/newGame");
var gameOverRouter = require("./routes/gameOver");
var getPodsRouter = require("./routes/getPods");
var hostGameRouter = require("./routes/hostGame");
var joinGameRouter = require("./routes/joinGame");
var serverManagementRouter = require("./routes/serverManagement");
//var resetServerRouter = require("./routes/resetServer");
var getFrontendIPRouter = require("./routes/getFrontendIP");
var startGameRouter = require("./routes/startGame");
var healthCheckRouter = require("./routes/healthCheck");
var nameRouter = require("./routes/name");

var app = express();

app.use(cors());

app.use("/hello", helloRouter);
//app.use("/newgame", newGameRouter);
app.use("/gameover", gameOverRouter);
app.use("/getpods", getPodsRouter);
app.use("/hostGame", hostGameRouter);
app.use("/server", serverManagementRouter);
//app.use("/resetserver", resetServerRouter);
app.use("/frontendIP", getFrontendIPRouter);
app.use("/joinGame", joinGameRouter);
app.use("/startgame", startGameRouter);
app.use("/", healthCheckRouter);
app.use("/name", nameRouter);

var server = http.createServer(app);


server.listen(3050, () => {
    console.log("Listening on port 3050");
})