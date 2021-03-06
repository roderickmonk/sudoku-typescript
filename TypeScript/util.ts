import assert from "assert";
import chalk from "chalk";
import { Placement, Board } from "./interfaces";

export const displayBoard = (board: Board) => {
    //
    assert(board.length == 81);

    for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
            const cell = board[9 * i + j];
            if (cell === null) {
                process.stdout.write(chalk.white("   -  "));
            } else {
                process.stdout.write(chalk.red(cell.toString().padStart(4, " ") + "  "));
            }
        }
        process.stdout.write("\n");
    }
};

export const getToken = (resp: any): string => {
    const cookies = resp.headers["set-cookie"][0].split(";");
    return cookies[0].split("=")[1];
};

export const placeNumber = (placeData: Placement, board: Board): void => {
    const { i, j, value } = placeData;
    board[9 * i + j] = value;
};

