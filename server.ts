import express, { NextFunction, Request, Response } from "express";
import cluster from "cluster";
import { availableParallelism } from "os";
import process from "process";
import mongoose from "mongoose";
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

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
