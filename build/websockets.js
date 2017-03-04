"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const socketio = require("socket.io");
const quandl = require("./quandl");
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
            // var firstPromise = db.getHistory(String(symbol).toUpperCase().substr(0, 5))
            var firstPromise = quandl.getHistory(String(symbol).substr(0, 5).toUpperCase())
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
