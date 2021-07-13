import { makepuzzle} from "sudoku";


const puzzle = makepuzzle();

console.log ({puzzle})
console.log (puzzle.length)

console.log ("Done")


import express from 'express';

const app = express();

const port = 3000;

app.listen(port, () => {
            console.log(`Server running on port ${port}`);
});

module.exports = app;