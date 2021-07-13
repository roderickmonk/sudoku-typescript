#!/usr/bin/env node

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { signIn, place, refresh, setBoard } from "./server_handlers";

(async () => {
    try {

        const app = express();
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.post("/signin", signIn);
        app.post("/game/place", place);
        app.get("/game/refresh", refresh);
        app.post("/game/set", setBoard);

        const port = 8000;

        console.log(`Listening on port ${port}`);
        app.listen(port);

    } catch (err) {
        throw err;
    }
})().catch((err: Error) => {
    console.log(err.message);
});
