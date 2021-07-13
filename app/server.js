"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const handlers_1 = require("./handlers");
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(cookie_parser_1.default());
app.post("/signin", handlers_1.signIn);
app.post("/game/place", handlers_1.place);
app.get("/game/refresh", handlers_1.refresh);
app.post("/game/new", handlers_1.refresh);
const port = 8000;
console.log(`Listening on port ${port}`);
app.listen(port);
