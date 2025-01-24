import { Request, Response } from "express";
import { UserDB } from "../models/user.model";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;

import { totp } from "otplib";
import mongoose, { Mongoose } from "mongoose";
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
    const { salt, encryptedPassword } = userData;
    if (!salt || !encryptedPassword) {
      return res.send({ code: 400, message: "Data not found!" });
    }
    const hash = hashPass(String(GivenPassword), salt);
    if (hash !== encryptedPassword)
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

  let userId = new mongoose.Types.ObjectId("6793270bbec238057a361408");
  const foundUser = await UserDB.findOne({ _id: userId });
  if (!foundUser) {
    return res.send({ code: 400, message: "User not found!" });
  }

  const sendPasscodes = () => {
    const applications = foundUser.validationSubCategories;

    const categoryObj: {
      categoryId: mongoose.Types.ObjectId;
      otp: string;
    }[] = [];

    applications.forEach((app: any) => {
      let obj = {
        categoryId: app._id,
        otp: totp.generate(app.salt),
      };
      categoryObj.push(obj);
    });
    res.write(`data:${JSON.stringify({ categoryObj })}\n\n`);
  };
  sendPasscodes();
  const interval = setInterval(sendPasscodes, 30000);
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
};

//other applications will integrate this api to verify otp
export const verifyOTP = async (req: any, res: any) => {
  try {
    const { otp, email, appName } = req.body;
    const userFound = await UserDB.findOne({ email: email });
    if (!userFound) return res.send({ code: 400, message: "User not found" });
    const appDetails = userFound.validationSubCategories.find((app: any) => {
      app.application == appName;
    });
    if (!appDetails || appDetails.salt)
      return res.send({ code: 400, message: "Application Details not found!" });

    const saltedOTP = totp.generate(appDetails.salt as string);
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
export const addValidationSubCategory = async (req: any, res: any) => {
  try {
    let userId = new mongoose.Types.ObjectId("6793270bbec238057a361408"); // will be decoded from token
    console.log("UserId:", userId);
    const { application } = req.body;
    console.log("application:", application);

    let foundUser = await UserDB.findOne({ _id: userId });
    console.log("FoundUser:", foundUser);
    let applicationSalt = crypto.randomBytes(16).toString("hex");
    await UserDB.updateOne(
      { _id: userId },
      {
        $push: {
          validationSubCategories: {
            application: application,
            salt: applicationSalt,
          },
        },
      }
    );
    return res.send({ code: 200, message: "Application added successfully!" });
  } catch (err: any) {
    console.error("Error:", err);
    return res.send({ code: 500, message: "ISE" });
  }
};
