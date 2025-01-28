import express, { NextFunction, Request, Response } from "express";
import cluster from "cluster";
import { availableParallelism } from "os";
import process from "process";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

const numCPUs = availableParallelism();
const app = express();
app.use(express.json());
let port = 3000;

import { route } from "./routes";
import { TOTP } from "totp-generator";

app.use((req: Request, res: Response, next: NextFunction) => {
  console.error("Endpoint--->", req.url);
  next();
});
app.use(route);

const dbURL =
  "mongodb+srv://sahil456q:8595882121@cluster0.tu5klfv.mongodb.net/";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("Conntected to MongoDB database");
  })
  .catch((err: any) => {
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

const { otp, expires } = TOTP.generate("ASWDEQVGRSDBQZTY");
// console.log(otp);
// console.log("Expires at:", new Date(expires));

//Websocket
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  //incoming
  ws.on("message", (message: string) => {
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
