"use strict";
const http = require("http");
const socketio = require("socket.io");
const db = require("./db");
var state = {
    currentStocks: [],
    socketServer: null
};
function setup(app) {
    const server = http.createServer(app);
    const io = socketio(server);
    io.on('connection', function (socket) {
        socket.join('stocks');
        socket.emit('current_stocks', state.currentStocks);
        socket.on('add_stock', function (symbol) {
            var firstPromise = db.getHistory(symbol, new Date(2016, 0, 0))
                .then((history) => {
                state.currentStocks.push(history);
                io.emit('stock_added', history);
            })
                .catch((error) => {
                socket.emit('stock_error', error);
            });
        });
        socket.on('remove_stock', function (symbol) {
            state.currentStocks = state.currentStocks.filter(stock => stock.symbol != symbol);
            io.emit('stock_removed', symbol);
        });
    });
    state.socketServer = io;
    return server;
}
exports.setup = setup;
function getSocketServer() {
    return state.socketServer;
}
exports.getSocketServer = getSocketServer;
