import { Request, Response } from "express";
import { UserDB } from "../models/user.model";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;

import { totp } from "otplib";
totp.options = { step: 30 };
const salt = crypto.randomBytes(16).toString("hex");

const hashPass = (password: string, salt: string): string => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
};

export const registerUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const cryptedPass = hashPass(password, salt);
    await UserDB.create({
      email,
      password: cryptedPass,
      salt,
    });
    return res.send({ code: 200, message: "Registeration successfull!!" });
  } catch (err: any) {
    console.error(`Error:${err}`);
    return res.send({ code: 500, message: "ISE" });
  }
};
export const hello = async (req: Request, res: Response) => {
  return res.send({ code: 200, message: "Hello World!!!" });
};

export const userLogin = async (req: any, res: any) => {
  try {
    const { email, GivenPassword } = req.body;
    let userData = await UserDB.findOne({ email: email });
    if (!userData) return res.send({ code: 400, message: "User not found!" });
    const { salt, password } = userData;
    if (!salt || !password) {
      return res.send({ code: 400, message: "Data not found!" });
    }
    const hash = hashPass(String(GivenPassword), salt);
    if (hash !== password)
      return res.send({
        code: 400,
        message: "Please Provide correct Password!",
      });
    if (!jwtSecret) {
      return res.send("Jwt Secret not defined");
    }

    const token = jwt.sign({ userId: userData.id }, jwtSecret, {
      expiresIn: "2H",
    });
    return res.send({
      code: 200,
      message: "User Logged In Successfull!",
      token: token,
    });
  } catch (err: any) {
    console.error(`Error:${err}`);
    return res.send({ code: 500, message: "ISE" });
  }
};
export const sseEvent = async (req: any, res: any) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendPasscode = () => {
    const passCode = totp.generate(salt);
    res.write(`data:${JSON.stringify({ passCode })}\n\n`);
  };
  sendPasscode();
  const interval = setInterval(sendPasscode, 30000);
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
};
export const verifyOTP = async (req: any, res: any) => {
  try {
    const { otp } = req.body;
    const saltedOTP = totp.generate(salt);
    if (otp == saltedOTP) {
      return res.send({ code: 200, message: "OTP validated successfully!" });
    } else {
      return res.send({ code: 400, message: "Incorrect OTP" });
    }
  } catch (err: any) {
    console.error(`Error:${err}`);
    return res.send({ code: 500, message: "ISE" });
  }
};
