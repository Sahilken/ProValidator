"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = __importDefault(require("express"));
exports.route = (0, express_1.default)();
const start_1 = require("../controllers/start");
// route.get("/", hello);
exports.route.post("/register", start_1.registerUser);
exports.route.post("/login", start_1.userLogin);
exports.route.get("/events", start_1.sseEvent);
exports.route.post("/verifyOTP", start_1.verifyOTP);
exports.route.post("/addValidationSubCategory", start_1.addValidationSubCategory);
//# sourceMappingURL=index.js.map