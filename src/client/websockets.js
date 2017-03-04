import { MDCSnackbar } from "@material/snackbar";
const socketio = require('socket.io-client');

// Set up our client websocket connection

let wsUrl = '//' + window.location.host;

export const socket = socketio(wsUrl);

function formatQuote(quote) {
    return {
        price: Number(quote.price),
        time: new Date(quote.time)
    };
}

const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

export function connect(store) {

    socket.on('current_stocks', function (stocks) {
        stocks = stocks.map(stock => {
            stock.quotes = stock.quotes.map(quote => formatQuote(quote));
            return stock;
        });
        store.commit('setStocks', stocks);
        store.commit('endLoading');
    });

    socket.on('stock_added', function (stockHistory) {
        stockHistory.quotes = stockHistory.quotes.map(quote => formatQuote(quote));
        store.commit('addStock', stockHistory);
        store.commit('endLoading');
        snackbar.show({message: "Stock added: " + stockHistory.symbol});
    });

    socket.on('stock_removed', function (symbol) {
        store.commit('removeStock', symbol);
        snackbar.show({message: "Stock removed: " + symbol});
    });

    socket.on('stock_error', function (error) {
        store.commit('endLoading');
        snackbar.show({message: "Error: " + error.message});
    });
}

export function addStock(symbol) {
    socket.emit('add_stock', symbol);
};

export function removeStock(symbol) {
    socket.emit('remove_stock', symbol);
}