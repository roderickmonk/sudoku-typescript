#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const server_handlers_1 = require("./server_handlers");
(async () => {
    try {
        const app = (0, express_1.default)();
        app.use(body_parser_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.post("/signin", server_handlers_1.signIn);
        app.post("/game/place", server_handlers_1.place);
        app.get("/game/refresh", server_handlers_1.refresh);
        app.post("/game/set", server_handlers_1.setBoard);
        const port = 8000;
        console.log(`Listening on port ${port}`);
        app.listen(port);
    }
    catch (err) {
        throw err;
    }
})().catch((err) => {
    console.log(err.message);
});
