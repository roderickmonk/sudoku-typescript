#!/usr/bin/env node

import axios from "axios";
import _ from "lodash";
import { PlaceResult } from "./enums";
import { Placement, Board, SignIn, Token } from "./interfaces";
import { getToken, displayBoard, placeNumber } from "./util";

const endPoint = "http://34.218.191.230:8000";
const environment = process.env.NODE_ENV;


class SudokuClient {

    public token!: Token;
    private board!: Board;

    constructor() { }

    // Signin
    public signIn = async (): Promise<void> => {

        try {
            const resp = await axios({
                method: "post",
                url: `${endPoint}/signin`,
                data: {
                    username: "user1",
                    password: "orderful",
                } as SignIn,
            });

            this.token = getToken(resp);

            this.board = resp.data;

            if (environment === 'development') {
                displayBoard(this.board);
            }

        } catch (err) {
            throw err;
        }
    };

    public place = async (placement: Placement): Promise<void> => {

        try {
            await axios({
                method: "post",
                url: `${endPoint}/game/place`,
                data: placement,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });

        } catch (err) {
            throw err;
        }
    };

    public setBoard = async (board: Board): Promise<void> => {
        try {
            await axios({
                method: "post",
                url: `${endPoint}/game/set`,
                data: board,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });
        } catch (err) {
            throw new Error(`${err.message} (${err.response.data})`);
        }
    };

    public refresh = async (): Promise<void> => {
        // Refresh the onboard game
        try {
            const resp = await axios({
                method: "get",
                url: `${endPoint}/game/refresh`,
                headers: {
                    Cookie: `token=${this.token}`,
                },
            });

            const board = resp.data as Board;
            displayBoard(board);
        } catch (err) {
            throw err;
        }
    };
}

(async () => {
    try {

        const sudoku = new SudokuClient();

        await sudoku.signIn();

        // Ensure all board positions are available on an empty board
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 9; ++j) {

                const board: Board = Array(81).fill(null);
                await sudoku.setBoard(board);

                try {
                    await sudoku.place({ i, j, value: 3 });
                } catch (err) {
                    console.log({ responseData: err.response.data });
                    throw err;
                }
            }
        }
        console.log("Legal Cell Placement Testing Successful");

        // Cell Conflict Testing
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 9; ++j) {

                const board: Board = Array(81).fill(null);
                board[9 * i + j] = 9;
                await sudoku.setBoard(board);

                try {
                    await sudoku.place({ i, j, value: 3 });
                    throw new Error(`Illegal placement into (${i},${j})`);
                } catch (err) {
                    // expecting 403s
                    if (err.response.status !== 403 && err.response.data === PlaceResult.CellConflict) {
                        throw err;
                    }
                }
            }
        }
        console.log("Cell Conflict Testing Successful");

        // Row Conflict Testing
        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 8; ++j) {

                const board: Board = Array(81).fill(null);
                board[9 * i + j] = 4;
                await sudoku.setBoard(board);

                try {
                    await sudoku.place({ i, j: 8, value: 4 });
                    throw new Error(`Illegal placement (${i},${j})`);
                } catch (err) {
                    // expecting 403s
                    if (err.response.status !== 403 ||
                        ![PlaceResult.RowConflict, PlaceResult.BoxConflict].includes(err.response.data)) {

                        console.log({ responseData: err.response.data });
                        throw err;
                    }
                }
            }
        }
        console.log("Row Conflict Testing Successful");

        // Column Conflict Testing
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 9; ++j) {

                const board: Board = Array(81).fill(null);
                board[9 * i + j] = 4;
                await sudoku.setBoard(board);

                try {
                    await sudoku.place({ i: 8, j, value: 4 });
                    throw new Error(`Illegal placement (${i},${j})`);
                } catch (err) {
                    // expecting 403s
                    if (err.response.status !== 403 ||
                        ![PlaceResult.ColumnConflict, PlaceResult.BoxConflict].includes(err.response.data)) {
                        console.log({ responseData: err.response.data });
                        throw err;
                    }
                }
            }
        }
        console.log("Column Conflict Testing Successful");


        // Box Conflict Testing
        const boxes = [
            // top squares
            [[0, 1, 2], [0, 1, 2]],
            [[0, 1, 2], [3, 4, 5]],
            [[0, 1, 2], [6, 7, 8]],
            // middle squares
            [[3, 4, 5], [0, 1, 2]],
            [[3, 4, 5], [3, 4, 5]],
            [[3, 4, 5], [6, 7, 8]],
            // bottom squares
            [[6, 7, 8], [0, 1, 2]],
            [[6, 7, 8], [3, 4, 5]],
            [[6, 7, 8], [6, 7, 8]],
        ];

        const value = 4; // use the same value throughout

        for (const [rows, cols] of boxes) {

            for (let i of rows) {
                for (let j of cols) {

                    const board: Board = Array(81).fill(null);
                    board[9 * i + j] = value;
                    await sudoku.setBoard(board);

                    // Find some other cell
                    const ii = i === rows[0] ? rows[1] : i === rows[1] ? rows[2] : rows[0];
                    const jj = j === cols[0] ? cols[1] : j === cols[1] ? cols[2] : cols[0];

                    try {
                        await sudoku.place({ i: ii, j: jj, value });
                        throw new Error(`Illegal placement (${ii},${jj})`);
                    } catch (err) {
                        // expecting 403s
                        if (err.response.status !== 403 ||
                            ![PlaceResult.BoxConflict].includes(err.response.data)) {
                            console.log({ responseData: err.response.data });
                            throw err;
                        }
                    }
                }
            }
        }
        console.log("Box Conflict Testing Successful");


    } catch (err) {
        throw err;
    }
})().catch((err: Error) => {
    console.log(err.message);
});
