const Coordinate = require(__dirname + '/coordinate');
const Highscore = require(__dirname + '/highscore');
const highscorePath = __dirname + '/highscore.json';
const score = require(__dirname + '/score');
const shipplacement = require(__dirname + '/ship-placement');
const shiplogic = require(__dirname + '/ship-logic');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const servestatic = require('serve-static');
const router = express.Router();
const config = require('config.json')(__dirname + '/config.dev.json');
const publicDirectory = path.join(__dirname, '/../client/public/');

let player1Socket;
let player2Socket;

let player1Name;
let player2Name;

let player1Ships;
let player2Ships;

let player1Field;
let player2Field;

let player1FieldOfShots;
let player2FieldOfShots;

let player1Score = 0;
let player2Score = 0;

const PLAYER_1 = 1;
const PLAYER_2 = 2;

let turn = PLAYER_1;

router.use((req, res, next) => {
    console.log('/' + req.method);
    next();
});

router.get('/', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'battleship.html'));
});

router.get('/api/v1/highscore', (req, res) => {
    let currentHighscore = new highscore();
    if(currentHighscore.readHighscore(highscorePath)) {
        res.setHeader('Content-Type', 'application/json');
        res.send(currentHighscore.scoresJSON);
    } else {
        res.status(500).send('Failed to read the highscore');
    }
});

app.use(servestatic(publicDirectory));

app.use('/', router);

io.on('connection', socket => {
    console.log('a user connected');
    if (!player1Socket) {
        player1Socket = socket;
        player1Socket.on('disconnect', function () {
            console.log('Player1 disconnected');
            player1Socket = undefined;
        });
        player1Socket.on('setPlayerName', playerName=>{
            player1Name = playerName;
            if(isAbleToPlay()){
                refreshNames();
            }
        });
    }
    else if (!player2Socket) {
        player2Socket = socket;

        makeRestartPossible();
        makeGamePlayable();
        makeFirePossible(PLAYER_1);
        makeFirePossible(PLAYER_2);

        player2Socket.on('disconnect', ()=>{
            console.log('Player2 disconnected');
            player2Socket = undefined;
        });
        player2Socket.on('setPlayerName', playerName=>{
            player2Name = playerName;
            if(isAbleToPlay()){
                refreshNames();
            }
        });
    }
});

http.listen(config.server.port, config.server.host, () => {
    console.log('Live at Port ' + config.server.port);
});

function emitTurn() {
    if (turn == PLAYER_1) {
        player1Socket.emit('playerTurn', true);
        player2Socket.emit('playerTurn', false);
    }
    else {
        player1Socket.emit('playerTurn', false);
        player2Socket.emit('playerTurn', true);      
    }
}

function makeRestartPossible() {
    player2Socket.on('restart', ()=>{
        makeGamePlayable();
    });
    player1Socket.on('restart', ()=>{
        makeGamePlayable();
    });
}

function makeFirePossible(playerNumber){
    let playerSocket;
    let opponentSocket;
    let oppontentField;
    let opponentShips;
    let fieldOfShots;
    let nextTurn;

    if(playerNumber === PLAYER_1){
        playerSocket = player1Socket;
        opponentSocket = player2Socket
        oppontentField = player2Field;
        opponentShips = player2Ships;
        fieldOfShots = player1FieldOfShots;
        nextTurn = PLAYER_2;
    }
    else{
        playerSocket = player2Socket;
        opponentSocket = player1Socket;
        oppontentField = player1Field;
        opponentShips = player1Ships;
        fieldOfShots = player2FieldOfShots;
        nextTurn = PLAYER_1;
    }
    playerSocket.on('fire', (x, y) => {
        if (playerNumber === turn && isAbleToPlay() && !fieldOfShots[y][x]) {
            if (oppontentField[y][x]) {
                playerSocket.emit('fireResult', true);
                opponentSocket.emit('fireResultEnemy', x, y, true);
                addHit(opponentShips, new Coordinate(x,y));
                markDestroyedShips();
            }
            else {
                playerSocket.emit('fireResult', false);
                opponentSocket.emit('fireResultEnemy', x, y, false);
                turn = nextTurn;
                emitTurn();
            }
            fieldOfShots[y][x] = 1;
            if(playerNumber === PLAYER_1)player1Score++;
            else player2Score++;
        }
        if(gameOver()){
            emitWinnerAndLoser();
        }
    });
}

function makeGamePlayable(){
    player1Ships = shipplacement.generateShipPlacement();
    player2Ships = shipplacement.generateShipPlacement();
    player1Field = shiplogic.addShips(player1Ships);
    player2Field = shiplogic.addShips(player2Ships);
    player1Score = 0;
    player2Score = 0;
    player1FieldOfShots = shiplogic.createField();
    player2FieldOfShots = shiplogic.createField();

    player1Socket.emit('resetField');
    player2Socket.emit('resetField');

    player1Socket.emit('myShips', player1Field);
    player2Socket.emit('myShips', player2Field);

    turn = ((Math.random()*2 +1)| 0); //int between 1 and 2
    emitTurn();
}



function player1HasWon(){
    return shiplogic.hasWon(player2Ships);
}
function player2HasWon(){
    return shiplogic.hasWon(player1Ships);
}

function gameOver(){
    if(!player1Ships || !player2Ships){
        return true;
    }
    return (player1HasWon() || player2HasWon());
}

function emitWinnerAndLoser(){
    let winnerName;
    let winnerScore;
    if(player1HasWon()){
        player1Socket.emit('won', player1Score);
        player2Socket.emit('lost', player1Score);
        winnerName = player1Name;
        winnerScore = player1Score;
    }
    else{
        player1Socket.emit('lost', player2Score);
        player2Socket.emit('won', player2Score);
        winnerName = player2Name;
        winnerScore = player2Score;
    }
    let highscore = new Highscore();
    if(!highscore.readHighscore(highscorePath)){console.log("Error reading from " + highscorePath);}
    highscore.addScore(new score(winnerName, winnerScore));
    if(!highscore.writeHighscore(highscorePath)){console.log("Error writing in " + highscorePath);}
}

function addHit(opponentShips, possibleHit) {
    opponentShips.forEach(ship=>{
        ship.addHitCoordinate(possibleHit);
    });
}

function markDestroyedShips(){
    player1Ships.forEach(ship=>{
        if(ship.isDestroyed()){
            ship.allCoordinates.forEach(coordinate=>{
                player1Socket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                player2Socket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
            });
        }
    });
    player2Ships.forEach(ship=>{
        if(ship.isDestroyed()){
            ship.allCoordinates.forEach(coordinate=>{
                player2Socket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                player1Socket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
            });
        }
    });
}
function isAbleToPlay(){
    return player1Socket
        &&player2Socket
        &&!gameOver()
        &&player1Name
        &&player2Name;
}

function refreshNames() {
    player1Socket.emit('refreshName' , player2Name);
    player2Socket.emit('refreshName' , player1Name);
}
