"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addValidationSubCategory = exports.verifyOTP = exports.sseEvent = exports.userLogin = exports.hello = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET;
const otplib_1 = require("otplib");
const mongoose_1 = __importDefault(require("mongoose"));
otplib_1.totp.options = { step: 30 };
const salt = crypto_1.default.randomBytes(16).toString("hex");
const hashPass = (password, salt) => {
    return crypto_1.default.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
};
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cryptedPass = hashPass(password, salt);
        await user_model_1.UserDB.create({
            email,
            password: cryptedPass,
            passwordSalt: salt,
        });
        return res.send({ code: 200, message: "Registeration successfull!!" });
    }
    catch (err) {
        console.error(`Error:${err}`);
        return res.send({ code: 500, message: "ISE" });
    }
};
exports.registerUser = registerUser;
const hello = async (req, res) => {
    return res.send({ code: 200, message: "Hello World!!!" });
};
exports.hello = hello;
const userLogin = async (req, res) => {
    try {
        const { email, GivenPassword } = req.body;
        let userData = await user_model_1.UserDB.findOne({ email: email });
        if (!userData)
            return res.send({ code: 400, message: "User not found!" });
        const { passwordSalt, encryptedPassword } = userData;
        if (!passwordSalt || !encryptedPassword) {
            return res.send({ code: 400, message: "Data not found!" });
        }
        const hash = hashPass(String(GivenPassword), passwordSalt);
        if (hash !== encryptedPassword)
            return res.send({
                code: 400,
                message: "Please Provide correct Password!",
            });
        if (!jwtSecret) {
            return res.send("Jwt Secret not defined");
        }
        const token = jsonwebtoken_1.default.sign({ userId: userData.id }, jwtSecret, {
            expiresIn: "2H",
        });
        return res.send({
            code: 200,
            message: "User Logged In Successfull!",
            token: token,
        });
    }
    catch (err) {
        console.error(`Error:${err}`);
        return res.send({ code: 500, message: "ISE" });
    }
};
exports.userLogin = userLogin;
const sseEvent = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let userId = new mongoose_1.default.Types.ObjectId("6793270bbec238057a361408");
    const foundUser = await user_model_1.UserDB.findOne({ _id: userId });
    if (!foundUser) {
        return res.send({ code: 400, message: "User not found!" });
    }
    const sendPasscodes = () => {
        const applications = foundUser.validationSubCategories;
        const categoryObj = [];
        applications.forEach((app) => {
            let obj = {
                categoryId: app._id,
                otp: otplib_1.totp.generate(app.salt),
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
exports.sseEvent = sseEvent;
//other applications will integrate this api to verify otp
const verifyOTP = async (req, res) => {
    try {
        const { otp, email, appName } = req.body;
        const userFound = await user_model_1.UserDB.findOne({ email: email });
        if (!userFound)
            return res.send({ code: 400, message: "User not found" });
        console.log("userFound:", userFound);
        const appDetails = userFound.validationSubCategories.find((app) => {
            return app.application == appName;
        });
        console.log("appDetials:::::::::::::", appDetails);
        if (!appDetails || !appDetails.otpSalt) {
            return res.send({ code: 400, message: "Application Details not found!" });
        }
        const saltedOTP = otplib_1.totp.generate(appDetails.otpSalt);
        console.log("salted Password:", saltedOTP);
        if (otp == saltedOTP) {
            return res.send({ code: 200, message: "OTP validated successfully!" });
        }
        else {
            return res.send({ code: 400, message: "Incorrect OTP" });
        }
    }
    catch (err) {
        console.error(`Error:${err}`);
        return res.send({ code: 500, message: "ISE" });
    }
};
exports.verifyOTP = verifyOTP;
const addValidationSubCategory = async (req, res) => {
    try {
        let userId = new mongoose_1.default.Types.ObjectId("6793270bbec238057a361408"); // will be decoded from token
        console.log("UserId:", userId);
        const { application } = req.body;
        console.log("application:", application);
        let foundUser = await user_model_1.UserDB.findOne({ _id: userId });
        console.log("FoundUser:", foundUser);
        let applicationSalt = crypto_1.default.randomBytes(16).toString("hex");
        await user_model_1.UserDB.updateOne({ _id: userId }, {
            $push: {
                validationSubCategories: {
                    application: application,
                    salt: applicationSalt,
                },
            },
        });
        return res.send({ code: 200, message: "Application added successfully!" });
    }
    catch (err) {
        console.error("Error:", err);
        return res.send({ code: 500, message: "ISE" });
    }
};
exports.addValidationSubCategory = addValidationSubCategory;
//# sourceMappingURL=start.js.map