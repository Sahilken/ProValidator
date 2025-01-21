import express from "express";
export const route = express();
import {
  hello,
  registerUser,
  sseEvent,
  userLogin,
  verifyOTP,
} from "../controllers/start";

// route.get("/", hello);
route.post("/register", registerUser);
route.post("/login", userLogin);
route.get("/events", sseEvent);
route.post("/verifyOTP", verifyOTP);
