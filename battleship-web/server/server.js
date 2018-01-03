const Coordinate = require(__dirname + '/coordinate');
const highscore = require(__dirname + '/highscore');
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

let player1Score = 0;
let player2Score = 0;

const PLAYER_1_TURN = 1;
const PLAYER_2_TURN = 2;

let turn = PLAYER_1_TURN;

router.use((req, res, next) => {
    console.log('/' + req.method);
    next();
});

router.get('/', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'battleship.html'));
});

router.get('/api/v1/highscore', (req, res) => {
    let currentHighscore = new highscore();
    if(currentHighscore.readHighscore(__dirname + '/highscore.json')) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(currentHighscore.scores));
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
        player1Socket.on('fire', (x, y) => {
            if (isAbleToPlay() && PLAYER_1_TURN == turn) {
                if (player2Field[y][x]) {
                    player1Socket.emit('fireResult', true);
                    player2Socket.emit('fireResultEnemy', x, y, true);
                    addHit(player2Ships, new Coordinate(x,y));
                    markDestroyedShips();
                }
                else {
                    player1Socket.emit('fireResult', false);
                    player2Socket.emit('fireResultEnemy', x, y, false);
                    turn = PLAYER_2_TURN;
                    emitTurn();
                }
                player1Score++;
            }
            if(gameOver()){
                emitWinnerAndLoser();
            }
        });
    }
    else if (!player2Socket) {
        player2Socket = socket;
        if (!player1Field && !player2Field) {
            player1Ships = shipplacement.generateShipPlacement();
            player2Ships = shipplacement.generateShipPlacement();

            player1Field = shiplogic.addShips(player1Ships);
            player2Field = shiplogic.addShips(player2Ships);
        }
        player1Socket.emit('myShips', player1Field);
        player2Socket.emit('myShips', player2Field);

        emitTurn();

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
        player2Socket.on('fire', (x, y) => {
            if (isAbleToPlay()&&PLAYER_2_TURN === turn) {
                if (player1Field[y][x]) {
                    player1Socket.emit('fireResultEnemy', x, y, true);
                    player2Socket.emit('fireResult', true);
                    addHit(player1Ships, new Coordinate(x,y));
                    markDestroyedShips();
                }
                else {
                    player1Socket.emit('fireResultEnemy', x, y, false);
                    player2Socket.emit('fireResult', false);
                    turn = PLAYER_1_TURN;
                    emitTurn();
                }
                player2Score++;
            }
            if(gameOver()){
                emitWinnerAndLoser();
            }
        });
    }
});

http.listen(config.server.port, config.server.host, () => {
    console.log('Live at Port ' + config.server.port);
});

function emitTurn() {
    if (turn == PLAYER_1_TURN) {
        player1Socket.emit('playerTurn', true);
        player2Socket.emit('playerTurn', false);
    }
    else {
        player1Socket.emit('playerTurn', false);
        player2Socket.emit('playerTurn', true);
    }
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
    if(player1HasWon()){
        player1Socket.emit('won', player1Score);
        player2Socket.emit('lost', player1Score);
    }
    else{
        player1Socket.emit('lost', player2Score);
        player2Socket.emit('won', player2Score);
    }
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
