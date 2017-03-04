const Vue = require('vue');
import * as Vuex from "vuex";

Vue.use(Vuex);

// This is the function that we will use to filter stocks when the user chooses a custom filter, and when we add a new stock
const filterFunction = (stocks, months) => {
    if (months < 1) {
        return stocks;
    }
    let cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    return stocks.map(stock => {
        let filteredQuotes = stock.quotes.filter(quote => quote.time > cutoffDate);
        return {
            symbol: stock.symbol,
            quotes: filteredQuotes
        };
    });
};

export const store = new Vuex.Store({
    state: {
        stocks: [],
        loading: true,
        filterMonths: 12,
        filteredStocks: []
    },
    getters: {
        numberOfStocks: state => state.stocks.length
    },
    mutations: {
        addStock (state, stockHistory) {
            let alreadyExists = false;
            for (let i = 0; i < state.stocks.length; i++) {
                if (state.stocks[i].symbol == stockHistory.symbol) {
                    alreadyExists = true;
                }
            }
            if (! alreadyExists) {
                state.stocks.push(stockHistory);
                state.filteredStocks = filterFunction(state.stocks, state.filterMonths);
            }
        },
        removeStock (state, stockSymbol) {
            state.stocks = state.stocks.filter(stock => stock.symbol != stockSymbol);
            state.filteredStocks = state.filteredStocks.filter(stock => stock.symbol != stockSymbol);
        },
        setStocks (state, stocks) {
            state.stocks = stocks;
            state.filteredStocks = filterFunction(state.stocks, state.filterMonths);
        },
        filterStocks (state, months) {
            state.filterMonths = months;
            state.filteredStocks = filterFunction(state.stocks, state.filterMonths);
        },
        beginLoading (state) {
            state.loading = true;
        },
        endLoading (state) {
            state.loading = false;
        }
    }
});