import * as mongodb from "mongodb";

var state = {
    db: null
};

export function connect(url) {
    return new Promise(function (resolve, reject) {
        mongodb.MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(err);
            } else {
                state.db = db;
                resolve(state.db);
            }
        });
    });
}

export function get() {
    if (state.db == null) {
        return false;
    } else {
        return state.db;
    }
}

export function getHistory(symbol: string, start: Date, end: Date = new Date()) {
    return new Promise(function (resolve, reject) {
        if (state.db == null) {
            reject("Database is not available");
        } else {
            let query = {
                "$and": [
                    { symbol: symbol },
                    { time: { "$gte": start } },
                    { time: { "$lte": end } }
                ]
            };
            let projection = { "_id": 0 };
            state.db.collection('quotes').find(query, projection).toArray(function (err, docs) {
                if (err) {
                    reject(err);
                } else if (docs.length < 1) {
                     reject({error: "Stock symbol not found"});
                } else {
                    let result = {
                        symbol: symbol,
                        quotes: docs.map(doc => { return {time: doc.time, price: doc.price} })
                    };
                    resolve(result);
                }
            });
        }
    });
}