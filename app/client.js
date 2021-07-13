#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const util_1 = require("./util");
const endPoint = "http://34.218.191.230:8000";
const environment = process.env.NODE_ENV;
class Sudoku {
    token;
    board;
    constructor() { }
    signIn = async () => {
        try {
            const resp = await axios_1.default({
                method: "post",
                url: `${endPoint}/signin`,
                data: {
                    username: "user1",
                    password: "password1",
                },
            });
            this.token = util_1.getToken(resp);
            this.board = resp.data;
            if (environment === 'development') {
                util_1.displayBoard(this.board);
            }
        }
        catch (err) {
            throw err;
        }
    };
    place = async (placement) => {
        try {
            await axios_1.default({
                method: "post",
                url: `${endPoint}/game/place`,
                data: placement,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });
        }
        catch (err) {
            throw err;
        }
    };
    setBoard = async (board) => {
        try {
            await axios_1.default({
                method: "post",
                url: `${endPoint}/game/set`,
                data: board,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });
        }
        catch (err) {
            throw new Error(`${err.message} (${err.response.data})`);
        }
    };
    refresh = async () => {
        try {
            const resp = await axios_1.default({
                method: "get",
                url: `${endPoint}/game/refresh`,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });
            const board = resp.data;
            util_1.displayBoard(board);
        }
        catch (err) {
            throw err;
        }
    };
}
(async () => {
    try {
        const sudoku = new Sudoku();
        await sudoku.signIn();
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 9; ++j) {
                const board = Array(81).fill(null);
                await sudoku.setBoard(board);
                try {
                    await sudoku.place({ i, j, value: 3 });
                }
                catch (err) {
                    console.log({ responseData: err.response.data });
                    throw err;
                }
            }
        }
        console.log("Legal Cell Placement Testing Successful");
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 9; ++j) {
                const board = Array(81).fill(null);
                board[9 * i + j] = 9;
                await sudoku.setBoard(board);
                try {
                    await sudoku.place({ i, j, value: 3 });
                    throw new Error(`Illegal placement into (${i},${j}`);
                }
                catch (err) {
                    if (err.response.status !== 403 && err.response.data === "CellConflict") {
                        throw err;
                    }
                }
            }
        }
        console.log("Cell Conflict Testing Successful");
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 8; ++j) {
                const board = Array(81).fill(null);
                board[9 * i + j] = 4;
                await sudoku.setBoard(board);
                try {
                    await sudoku.place({ i, j: 8, value: 4 });
                    throw new Error(`Illegal placement (${i},${j}`);
                }
                catch (err) {
                    if (err.response.status !== 403 ||
                        !["RowConflict", "BoxConflict"].includes(err.response.data)) {
                        console.log({ responseData: err.response.data });
                        throw err;
                    }
                }
            }
        }
        console.log("Row Conflict Testing Successful");
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 9; ++j) {
                const board = Array(81).fill(null);
                board[9 * i + j] = 4;
                await sudoku.setBoard(board);
                try {
                    await sudoku.place({ i: 8, j, value: 4 });
                    throw new Error(`Illegal placement (${i},${j}`);
                }
                catch (err) {
                    if (err.response.status !== 403 ||
                        !["ColumnConflict", "BoxConflict"].includes(err.response.data)) {
                        console.log({ responseData: err.response.data });
                        throw err;
                    }
                }
            }
        }
        console.log("Column Conflict Testing Successful");
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 2; ++j) {
                const board = Array(81).fill(null);
                board[9 * i + j] = 4;
                await sudoku.setBoard(board);
                try {
                    await sudoku.place({ i, j: 2, value: 4 });
                    throw new Error(`Illegal placement (${i},${j}`);
                }
                catch (err) {
                    if (err.response.status !== 403 ||
                        !["ColumnConflict", "BoxConflict"].includes(err.response.data)) {
                        console.log({ responseData: err.response.data });
                        throw err;
                    }
                }
            }
        }
        console.log("Box Conflict Testing Successful");
    }
    catch (err) {
        throw err;
    }
})().catch((err) => {
    console.log(err.message);
});
