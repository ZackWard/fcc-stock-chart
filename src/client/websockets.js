const socketio = require('socket.io-client');

// Set up our client websocket connection

let wsUrl = 'ws://' + window.location.host;

console.log("Attempting WebSocket connection to " + wsUrl);

export const socket = socketio(wsUrl);

socket.on('connect', function () {
    console.log("Connected to server!");
});

socket.on('incoming_message', function (data) {
    console.log("From server: " + data);
});

window.addStock = (symbol) => {
    socket.emit('add_stock', symbol);
};

window.removeStock = (symbol) => {
    socket.emit('remove_stock', symbol);
};

function formatQuote(quote) {
    return {
        price: Number(quote.price),
        time: new Date(quote.time)
    };
}

export function connect(store) {

    socket.on('current_stocks', function (stocks) {
        console.log("Setting initial stock list");
        stocks = stocks.map(stock => {
            stock.quotes = stock.quotes.map(quote => formatQuote(quote));
            return stock;
        });
        store.commit('setStocks', stocks);
    });

    socket.on('stock_added', function (stockHistory) {
        console.log("Client: Stock added: " + stockHistory.symbol);
        stockHistory.quotes = stockHistory.quotes.map(quote => formatQuote(quote));
        store.commit('addStock', stockHistory);
    });

    socket.on('stock_removed', function (symbol) {
        console.log("Client: Stock removed: " + symbol);
        store.commit('removeStock', symbol);
    });

    socket.on('stock_error', function (error) {
        console.log("Error: ");
        console.log(error);
    });
}