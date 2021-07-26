import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { makepuzzle } from "sudoku";
import { Placement, Board, Token } from "./interfaces";
import { PlaceResult } from "./enums";
import { displayBoard } from "./util";
import _ from "lodash";
import assert from "assert";

const environment = process.env.NODE_ENV;

const redis = new Redis(process.env.REDIS_STORAGE);

const jwtKey = process.env.JWT_KEY!;

const users = {
    user1: "12345678",
    user2: "12345678",
};

const getBoard = async (req: any, res: any): Promise<[Token, Board]> => {

    try {
        const token = req.cookies.token;

        // if token missing or unknown or corrupt, return unauthorized
        if (!token || (await redis.get(token)) === null) {
            res.status(401).send("Unauthorized");
            return Promise.reject("Unauthorized");
        }

        try {
            jwt.verify(token, jwtKey);
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                res.status(401).send("Unauthorized");
                return Promise.reject("Unauthorized");

            }
            // otherwise a bad request
            res.status(400).end();
            return Promise.reject("Bad Request");

        }

        const board = JSON.parse((await redis.get(token)) as string);

        return [token, board];

    } catch (err) {
        return Promise.reject(err);
    }
};

export const signIn = async (req: any, res: any) => {
    //
    try {
        // Get credentials from JSON body and validate
        const { username, password } = req.body as { username: string; password: string; };
        //@ts-ignore
        if (!username || !password || users[username] !== password) {
            return res.status(401).end();
        }

        // Create a new token with the username in the payload
        const token = jwt.sign({ username }, jwtKey, {
            algorithm: "HS256",
        });

        const board = makepuzzle();

        // Associate the token with the board
        await redis.set(token, JSON.stringify(board));

        if (environment === "development") {
            console.log("signin token:", token);

            const json = await redis.get(token);

            if (json) {
                const board = JSON.parse(json);
                displayBoard(board);
            }
        }

        res.cookie("token", token);
        res.send(board);

    } catch (err) {
        throw err;
    }
};

export const place = async (req: any, res: any) => {
    //

    try {

        const [token, board] = await getBoard(req, res);

        const { i, j, value } = req.body as Placement;

        if (environment === "development") {
            displayBoard(board);
            console.log({ i, j, value });
        }

        // Already occupied?
        if (board[9 * i + j]) {
            return res.status(403).send(PlaceResult.CellConflict);
        }

        const byRow = _.chunk(board, 9);
        const byColumn = _.zip(...byRow);

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
            return res.status(403).send(PlaceResult.BoxConflict);
        }

        if (byRow[i].includes(value)) {
            return res.status(403).send(PlaceResult.RowConflict);
        }

        if (byColumn[j].includes(value)) {
            return res.status(403).send(PlaceResult.ColumnConflict);
        }

        // Place the number
        board[9 * i + j] = value;

        // Record the now modified row
        await redis.set(token, JSON.stringify(board));

        if (environment === 'development') {
            displayBoard(board);
        }

        res.send(PlaceResult.Placed);

    } catch (err) {
        throw err;
    }
};

export const setBoard = async (req: any, res: any) => {
    try {
        const [token,] = await getBoard(req, res);

        const board = req.body as Board;

        if (board.length !== 81) {
            return res.status(403).send("Illegal Board");
        }

        await redis.set(token, JSON.stringify(board));

        res.status(200).end();

    } catch (err) { throw err; }
};

export const refresh = async (req: any, res: any) => {
    try {
        const [, board] = await getBoard(req, res);
        res.send(board);

    } catch (err) { throw err; }
};
