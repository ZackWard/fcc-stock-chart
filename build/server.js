"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const websocket = require("./websockets");
let port = 3007;
let app = express();
// app.use(helmet());
app.use('/static', express.static(path.join(__dirname, "..", "public")));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
// Set up websockets
const combinedServer = websocket.setup(app);
combinedServer.listen(port, function () {
    console.log("Server listening on port " + port);
});
