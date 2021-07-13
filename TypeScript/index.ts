import express from 'express';
import jwt from "jsonwebtoken"

const username = "rod";

const app = express();
 
const port = 3001;
 
const axios = require('axios');

const jwtKey = "my_secret_key"
const jwtExpirySeconds = 30000000

const token = jwt.sign({ username }, jwtKey, {
    algorithm: "HS256",
    expiresIn: 0,
})
console.log("token:", token)
 
app.get('/', async (req: any, res: any) => {
 try {
    console.log ("here-0")
   
    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
    res.end();

    return res.status(200).send({
     error: false,
     data: token
   });
  
 } catch (error) {
     console.log(error)
 }
});
 
app.listen(port,  () => {
 console.log(`Server running on port ${port}`);
});
 
 
module.exports = app;