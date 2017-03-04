import * as request from "request";
import * as dotenv from "dotenv";

dotenv.config();

let quandlUrl = "https://www.quandl.com/api/v3/datatables/WIKI/PRICES.json?qopts.columns=ticker,date,close,volume,split_ratio,adj_close"
quandlUrl += "&api_key=" + process.env.QUANDL_API_KEY;

export function getHistory(symbol: string) {
    let requestUrl = quandlUrl + "&ticker=" + String(symbol).substr(0, 5).toUpperCase();
    return new Promise(function (resolve, reject) {
        request(requestUrl, function (error, response, body) {
            if (error) {
                return reject(error);
            }

            let jsonBody = JSON.parse(body);

            if (jsonBody.quandl_error != undefined) {
                return reject({message: "Invalid stock symbol entered"});
            }

            if (jsonBody.datatable.data.length < 1) {
                return reject({message: "Stock symbol not found"});
            }

            let result = {
                symbol: symbol,
                quotes: jsonBody.datatable.data.map(quote => {
                    return {
                        symbol: quote[0],
                        price: quote[2],
                        size: quote[3],
                        time: new Date(quote[1])
                    };
                })
            };
            return resolve(result);
        });
    });
}