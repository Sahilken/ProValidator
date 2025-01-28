"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = require("os");
const mongoose_1 = __importDefault(require("mongoose"));
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const numCPUs = (0, os_1.availableParallelism)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
let port = 3000;
const routes_1 = require("./routes");
const totp_generator_1 = require("totp-generator");
app.use((req, res, next) => {
    console.error("Endpoint--->", req.url);
    next();
});
app.use(routes_1.route);
const dbURL = "mongodb+srv://sahil456q:8595882121@cluster0.tu5klfv.mongodb.net/";
mongoose_1.default
    .connect(dbURL)
    .then(() => {
    console.log("Conntected to MongoDB database");
})
    .catch((err) => {
    console.log("error", "Mongoose default connection error: " + err);
});
// console.log("NumCPUs:", numCPUs);
// if (cluster.isPrimary) {
//   console.log(`Primary ${process.pid} is running`);
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
//   app.listen(port, () => console.log(`Worker ${process.pid} started`));
// }
const { otp, expires } = totp_generator_1.TOTP.generate("ASWDEQVGRSDBQZTY");
// console.log(otp);
// console.log("Expires at:", new Date(expires));
//Websocket
wss.on("connection", (ws) => {
    console.log("Client connected");
    //incoming
    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Server received: ${message}`);
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
    ws.send("Welcome to the WebSocket server!");
});
app.listen(port, () => {
    console.log(`Server started at ${port}`);
});
//# sourceMappingURL=index.js.map