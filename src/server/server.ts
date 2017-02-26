import * as path from "path";
import * as express from "express";
import * as helmet from "helmet";
import * as db from "./db";
import * as websocket from "./websockets";

let port = 3007;

let app = express();

app.use('/static', express.static(path.join(__dirname, "..", "public")));

app.get('/', function (req, res) {
    console.log("Serving file " + path.join(__dirname, "..", "public", "index.html"));
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get('/stock/:stock', function (req, res) {
    db.getHistory(req.params.stock, new Date(2017, 1, 1))
    .then(stocks => {
        res.json(stocks);
    })
    .catch(err => {
        res.status(500).json({error: err});
    });
});

// Set up websockets
const combinedServer = websocket.setup(app);

db.connect('mongodb://localhost:27017/iex_data')
.then(db => {
    console.log("Connected to MongoDB");
    combinedServer.listen(port, function () {
        console.log("Server listening on port " + port);
    });
})
.catch(err => {
    console.log(err);
    process.exit(1);
});