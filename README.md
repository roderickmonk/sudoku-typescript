# Demo Sudoku Software

## Purpose

The purpose of this repo is to demonstrate tyoical NodeJS / TypeScript usage.  The motivator is the game of Sudoku.  A Sudoku server runs in an AWS ec2 and is managed by pm2 (https://pm2.keymetrics.io/).  A test client is also available that puts the server through its paces via various tests.

## Theory of Operation
The signing in process assigns a token to the session and this session is constant throughout the session and is returned to client software as a cookie.  Thereafter all subsequent API calls require the use of this token.  Also, at the point of the sign-in, a new game board is created and also returned to the user. This board is  recorded to a Redis database using the assinged token as key.

## Running the test software
After cloning this repo, the test software can be run as follows:

    $ cd rod-sudoku
    $ source project    
    $ npm install
    $ npm run test    

## API

### POST /signin
/signin requires a username and a password. Two users are known to the server, `user1` and `user2`, both having the password `orderful`.  Besides creating a game for a newly signed in user, /signin returns a Json Web Token (JWT) and thereafter the JWT, which is managed as a cookie, is used to locate the board that the user is currently playing.

### GET /game/refresh
There is an underlying assumption that client software is managing a parallel game board, which means that the server is not routinely returning the board to the client every time that the user places a number.  Nevertheless, /game/refresh allows the client software to retrieve the server's board should a resynch be  necessary.  

### POST /game/place
/game/place allows client software to place a number on the board.  However, illegal placements are not permitted and will be rejected as a bad request.  Checks that are applied are the following:

    1. The placement cell is not already occupied.
    2. The placement value does not already exist in the placement row.
    3. The placement value does not already exist in the placement column.
    4. The placement value does not already exist in the placement box.

### POST /game/set
/game/set is strictly for testing purposes.  It allows tests to be composed using canned boards which /game/set then sends to the server.  The server overwrites any existing board that may already exist with the incoming board.  To use this endpoint, the user must be signed-in in the usual way.

## Source Code: ./TypeScript

### server.ts
The server executive.

### server_handlers.ts
The various handlers for the server routes.

### enums.ts
TypesScript enums.

### interfaces.ts
TypesScript interfaces.

### util.ts
Various utility functions.

### test_client.ts
The test code.

