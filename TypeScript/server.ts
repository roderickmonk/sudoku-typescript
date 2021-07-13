#!/usr/bin/env node

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { signIn, place, refresh } from "./handlers";

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.post("/signin", signIn);
app.post("/game/place", place);
app.get("/game/refresh", refresh);
app.post("/game/new", refresh);

const port = 8000;

console.log(`Listening on port ${port}`);
app.listen(port);
