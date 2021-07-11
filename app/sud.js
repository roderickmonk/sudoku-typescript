"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sudoku_1 = require("sudoku");
const puzzle = sudoku_1.makepuzzle();
console.log({ puzzle });
console.log(puzzle.length);
console.log("Done");
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
module.exports = app;
