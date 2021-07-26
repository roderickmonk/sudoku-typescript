import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { makepuzzle } from "sudoku";
import { Placement, Board, Token } from "../TypeScript/interfaces";
import { PlaceResult } from "../TypeScript/enums";
import { displayBoard } from "../TypeScript/util";
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

        const boxes2 = [];

        for (let box = 0; box < 9; ++box) {
            const box_row = [];
            for (let row = 0; row < 3; ++row) {
                for (let col = 0; col < 3; ++col) {
                    box_row.push(byRow[3 * Math.floor(box / 3) + row][3 * (box % 3) + col]);
                }
            }
            boxes2.push(box_row);
        }

        const boxes = [
            // Top 3 boxes
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
            // Middle 3 boxes
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
            // Bottom 3 boxes
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

        console.log({ boxes });
        console.log({ boxes2 });

        assert(_.isEqual(boxes, boxes2), "Not Equal");

        let box: number;
        if (i < 3) {
            if (j < 3) {
                box = 0;
            } else if (j < 6) {
                box = 1;
            } else {
                box = 2;
            }
        } else if (i < 6) {
            if (j < 3) {
                box = 3;
            } else if (j < 6) {
                box = 4;
            } else {
                box = 5;
            }
        } else {
            if (j < 3) {
                box = 6;
            } else if (j < 6) {
                box = 7;
            } else {
                box = 8;
            }
        }

        if (boxes2[box].includes(value)) {
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

        // Record the now modified now
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
