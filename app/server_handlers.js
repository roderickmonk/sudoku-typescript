"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ioredis_1 = __importDefault(require("ioredis"));
const sudoku_1 = require("sudoku");
const util_1 = require("./util");
const lodash_1 = __importDefault(require("lodash"));
const environment = process.env.NODE_ENV;
const redis = new ioredis_1.default(process.env.REDIS_STORAGE);
const jwtKey = process.env.JWT_KEY;
const users = {
    user1: "12345678",
    user2: "12345678",
};
const getBoard = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token || (await redis.get(token)) === null) {
            res.status(401).send("Unauthorized");
            return Promise.reject("Unauthorized");
        }
        try {
            jsonwebtoken_1.default.verify(token, jwtKey);
        }
        catch (e) {
            if (e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).send("Unauthorized");
                return Promise.reject("Unauthorized");
            }
            res.status(400).end();
            return Promise.reject("Bad Request");
        }
        const board = JSON.parse((await redis.get(token)));
        return [token, board];
    }
    catch (err) {
        return Promise.reject(err);
    }
};
exports.signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password || users[username] !== password) {
            return res.status(401).end();
        }
        const token = jsonwebtoken_1.default.sign({ username }, jwtKey, {
            algorithm: "HS256",
        });
        const board = sudoku_1.makepuzzle();
        await redis.set(token, JSON.stringify(board));
        if (environment === "development") {
            console.log("signin token:", token);
            const json = await redis.get(token);
            if (json) {
                const board = JSON.parse(json);
                util_1.displayBoard(board);
            }
        }
        res.cookie("token", token);
        res.send(board);
    }
    catch (err) {
        throw err;
    }
};
exports.place = async (req, res) => {
    try {
        const [token, board] = await getBoard(req, res);
        const { i, j, value } = req.body;
        if (environment === "development") {
            util_1.displayBoard(board);
            console.log({ i, j, value });
        }
        if (board[9 * i + j]) {
            return res.status(403).send("CellConflict");
        }
        const byRow = lodash_1.default.chunk(board, 9);
        const byColumn = lodash_1.default.zip(...byRow);
        const boxes = [];
        for (let box = 0; box < 9; ++box) {
            const box_row = [];
            for (let row = 0; row < 3; ++row) {
                for (let col = 0; col < 3; ++col) {
                    box_row.push(byRow[3 * Math.floor(box / 3) + row][3 * (box % 3) + col]);
                }
            }
            boxes.push(box_row);
        }
        const box = 3 * Math.floor(i / 3) + Math.floor(j / 3);
        if (boxes[box].includes(value)) {
            return res.status(403).send("BoxConflict");
        }
        if (byRow[i].includes(value)) {
            return res.status(403).send("RowConflict");
        }
        if (byColumn[j].includes(value)) {
            return res.status(403).send("ColumnConflict");
        }
        board[9 * i + j] = value;
        await redis.set(token, JSON.stringify(board));
        if (environment === 'development') {
            util_1.displayBoard(board);
        }
        res.send("Placed");
    }
    catch (err) {
        throw err;
    }
};
exports.setBoard = async (req, res) => {
    try {
        const [token,] = await getBoard(req, res);
        const board = req.body;
        if (board.length !== 81) {
            return res.status(403).send("Illegal Board");
        }
        await redis.set(token, JSON.stringify(board));
        res.status(200).end();
    }
    catch (err) {
        throw err;
    }
};
exports.refresh = async (req, res) => {
    try {
        const [, board] = await getBoard(req, res);
        res.send(board);
    }
    catch (err) {
        throw err;
    }
};
