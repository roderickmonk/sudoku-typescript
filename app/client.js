"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const util_1 = require("./util");
const endPoint = "http://localhost:8000";
(async () => {
    try {
        let token;
        let puzzle;
        {
            const resp = await axios_1.default({
                method: "post",
                url: `${endPoint}/signin`,
                data: {
                    username: "user1",
                    password: "password1",
                },
            });
            console.log(resp);
            token = util_1.getToken(resp);
            puzzle = resp.data;
            util_1.displayPuzzle(puzzle);
            console.log({ token });
        }
        {
            const resp = await axios_1.default({
                method: "get",
                url: `${endPoint}/game/refresh`,
                headers: {
                    Cookie: `token=${token}`,
                },
            });
            const puzzle = resp.data;
            util_1.displayPuzzle(puzzle);
        }
        {
            const placeData = {
                i: 0,
                j: 0,
                value: 4,
            };
            let resp;
            try {
                resp = await axios_1.default({
                    method: "post",
                    url: `${endPoint}/game/place`,
                    data: placeData,
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
            }
            catch (err) {
                throw new Error(`${err.message} (${err.response.data})`);
            }
            util_1.placeNumber(placeData, puzzle);
            console.log({ respData: resp.data });
        }
    }
    catch (err) {
        throw err;
    }
})().catch((err) => {
    console.log(err.message);
});
