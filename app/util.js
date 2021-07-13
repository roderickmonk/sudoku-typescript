"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeNumber = exports.getToken = exports.displayBoard = void 0;
const assert_1 = __importDefault(require("assert"));
const chalk_1 = __importDefault(require("chalk"));
const displayBoard = (board) => {
    assert_1.default(board.length == 81);
    for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
            const cell = board[9 * i + j];
            if (cell === null) {
                process.stdout.write(chalk_1.default.white("   -  "));
            }
            else {
                process.stdout.write(chalk_1.default.red(cell.toString().padStart(4, " ") + "  "));
            }
        }
        process.stdout.write("\n");
    }
};
exports.displayBoard = displayBoard;
const getToken = (resp) => {
    const cookies = resp.headers["set-cookie"][0].split(";");
    return cookies[0].split("=")[1];
};
exports.getToken = getToken;
const placeNumber = (placeData, board) => {
    const { i, j, value } = placeData;
    board[9 * i + j] = value;
};
exports.placeNumber = placeNumber;
