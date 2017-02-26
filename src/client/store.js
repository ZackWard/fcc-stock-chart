const Vue = require('vue');
import * as Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        stocks: []
    },
    getters: {
        numberOfStocks: state => state.stocks.length
    },
    mutations: {
        addStock (state, stockHistory) {
            state.stocks.push(stockHistory);
        },
        removeStock (state, stockSymbol) {
            state.stocks = state.stocks.filter(stock => stock.symbol != stockSymbol);
        },
        setStocks (state, stocks) {
            state.stocks = stocks;
        }
    },
    actions: {}
});