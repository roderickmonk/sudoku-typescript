"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const username = "rod";
const app = express_1.default();
const port = 3001;
const axios = require('axios');
const jwtKey = "my_secret_key";
const jwtExpirySeconds = 30000000;
const token = jsonwebtoken_1.default.sign({ username }, jwtKey, {
    algorithm: "HS256",
    expiresIn: 0,
});
console.log("token:", token);
app.get('/', async (req, res) => {
    try {
        console.log("here-0");
        res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
        res.end();
        return res.status(200).send({
            error: false,
            data: token
        });
    }
    catch (error) {
        console.log(error);
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
module.exports = app;
