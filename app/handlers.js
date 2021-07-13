"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.place = exports.signIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ioredis_1 = __importDefault(require("ioredis"));
const sudoku_1 = require("sudoku");
const util_1 = require("./util");
const lodash_1 = __importDefault(require("lodash"));
const environment = process.env.NODE_ENV;
const redis = new ioredis_1.default(process.env.REDIS_STORAGE);
const jwtKey = process.env.JWT_KEY;
const users = {
    user1: "password1",
    user2: "password2",
};
const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password || users[username] !== password) {
            return res.status(401).end();
        }
        const token = jsonwebtoken_1.default.sign({ username }, jwtKey, {
            algorithm: "HS256",
        });
        const puzzle = sudoku_1.makepuzzle();
        await redis.set(token, JSON.stringify(puzzle));
        if (environment === "development") {
            console.log("signin token:", token);
            const json = await redis.get(token);
            if (json) {
                const puzzle = JSON.parse(json);
                util_1.displayPuzzle(puzzle);
            }
        }
        res.cookie("token", token);
        res.send(puzzle);
        const junk = lodash_1.default.chunk(puzzle, 9);
        const junk2 = lodash_1.default.zip(...junk);
        console.log({ junk });
        console.log({ junk2 });
    }
    catch (err) {
        throw err;
    }
};
exports.signIn = signIn;
const place = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).end();
    }
    if ((await redis.get(token)) === null) {
        return res.status(400).end();
    }
    if (environment === "development") {
        console.log("place token:", token);
        const json = await redis.get(token);
        if (json) {
            const puzzle = JSON.parse(json);
            util_1.displayPuzzle(puzzle);
        }
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, jwtKey);
    }
    catch (e) {
        if (e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(400).end();
    }
    const { i, j, value } = req.body;
    console.log({ i, j, value });
    let json = await redis.get(token);
    if (json === null) {
        return res.status(400).send("Token Not Recognized");
    }
    const puzzle = JSON.parse(json);
    console.log("place puzzle");
    util_1.displayPuzzle(puzzle);
    if (puzzle[9 * i + j]) {
        return res.status(400).send("CellConflict");
    }
    const byRow = lodash_1.default.chunk(puzzle, 9);
    const byColumn = lodash_1.default.zip(...byRow);
    const squares = [
        [
            byRow[0][0],
            byRow[0][1],
            byRow[0][2],
            byRow[1][0],
            byRow[1][1],
            byRow[1][2],
            byRow[2][0],
            byRow[2][1],
            byRow[2][2],
        ],
        [
            byRow[0][3],
            byRow[0][4],
            byRow[0][5],
            byRow[1][3],
            byRow[1][4],
            byRow[1][5],
            byRow[2][3],
            byRow[2][4],
            byRow[2][5],
        ],
        [
            byRow[0][6],
            byRow[0][7],
            byRow[0][8],
            byRow[1][6],
            byRow[1][7],
            byRow[1][8],
            byRow[2][6],
            byRow[2][7],
            byRow[2][8],
        ],
        [
            byRow[3][0],
            byRow[3][1],
            byRow[3][2],
            byRow[4][0],
            byRow[4][1],
            byRow[4][2],
            byRow[5][0],
            byRow[5][1],
            byRow[5][2],
        ],
        [
            byRow[3][3],
            byRow[3][4],
            byRow[3][5],
            byRow[4][3],
            byRow[4][4],
            byRow[4][5],
            byRow[5][3],
            byRow[5][4],
            byRow[5][5],
        ],
        [
            byRow[3][6],
            byRow[3][7],
            byRow[3][8],
            byRow[4][6],
            byRow[4][7],
            byRow[4][8],
            byRow[5][6],
            byRow[5][7],
            byRow[5][8],
        ],
        [
            byRow[6][0],
            byRow[6][1],
            byRow[6][2],
            byRow[7][0],
            byRow[7][1],
            byRow[7][2],
            byRow[8][0],
            byRow[8][1],
            byRow[8][2],
        ],
        [
            byRow[6][3],
            byRow[6][4],
            byRow[6][5],
            byRow[7][3],
            byRow[7][4],
            byRow[7][5],
            byRow[8][3],
            byRow[8][4],
            byRow[8][5],
        ],
        [
            byRow[6][6],
            byRow[6][7],
            byRow[6][8],
            byRow[7][6],
            byRow[7][7],
            byRow[7][8],
            byRow[8][6],
            byRow[8][7],
            byRow[8][8],
        ],
    ];
    let box;
    if (i < 3) {
        if (j < 3) {
            box = 0;
        }
        else if (j < 6) {
            box = 1;
        }
        else {
            box = 2;
        }
    }
    else if (i < 6) {
        if (j < 3) {
            box = 3;
        }
        else if (j < 6) {
            box = 4;
        }
        else {
            box = 5;
        }
    }
    else {
        if (j < 3) {
            box = 6;
        }
        else if (j < 6) {
            box = 7;
        }
        else {
            box = 8;
        }
    }
    if (squares[box].includes(value)) {
        return res.status(400).send("BoxConflict");
    }
    if (byRow[i].includes(value)) {
        return res.status(400).send("RowConflict");
    }
    console.log({ byRow: byRow[i] });
    if (byColumn[j].includes(value)) {
        return res.status(400).send("ColumnConflict");
    }
    console.log({ byColumn: byColumn[j] });
    puzzle[9 * i + j] = value;
    await redis.set(token, JSON.stringify(puzzle));
    util_1.displayPuzzle(puzzle);
    res.send("Placed");
};
exports.place = place;
const refresh = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).end();
        }
        if (environment === "development") {
            console.log("refresh token:", token);
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, jwtKey);
        }
        catch (e) {
            if (e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).end();
            }
            return res.status(400).end();
        }
        const json = await redis.get(token);
        if (json) {
            const puzzle = JSON.parse(json);
            util_1.displayPuzzle(puzzle);
            res.cookie("token", token);
            res.send(puzzle);
        }
        else {
            return res.status(400).end();
        }
    }
    catch (err) { }
};
exports.refresh = refresh;
