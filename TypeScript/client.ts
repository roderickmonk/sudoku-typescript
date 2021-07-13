import axios from "axios";
import setCookie from "set-cookie-parser";
import { PlaceNumber, Puzzle, SignIn } from "./interfaces";
import { getToken, displayPuzzle, placeNumber } from "./util";

const endPoint = "http://localhost:8000";

(async () => {
    try {
        let token: string;
        let puzzle: Puzzle;

        // Signin
        {
            const resp = await axios({
                method: "post",
                url: `${endPoint}/signin`,
                data: {
                    username: "user1",
                    password: "password1",
                } as SignIn,
            });
            console.log(resp);

            token = getToken(resp);

            puzzle = resp.data;
            displayPuzzle(puzzle);

            console.log({ token });
        }

        // Refresh the onboard game
        {
            const resp = await axios({
                method: "get",
                url: `${endPoint}/game/refresh`,
                headers: {
                    Cookie: `token=${token}`,
                },
            });

            const puzzle = resp.data as Puzzle;
            displayPuzzle(puzzle);
        }

        // Place a number
        {
            const placeData: PlaceNumber = {
                i: 0,
                j: 0,
                value: 4,
            };

            let resp: any;
            try {
                resp = await axios({
                    method: "post",
                    url: `${endPoint}/game/place`,
                    data: placeData,
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
            } catch (err) {
                throw new Error(`${err.message} (${err.response.data})`);
            }

            placeNumber(placeData, puzzle);

            console.log({ respData: resp.data });
        }
    } catch (err) {
        throw err;
    }
})().catch((err: Error) => {
    console.log(err.message);
});
