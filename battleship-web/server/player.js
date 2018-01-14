const path = require('path');

const shipPlacement = require(path.join(__dirname, 'ship_placement'));
const shipLogic = require(path.join(__dirname, 'ship_logic'));
const Highscore = require(path.join(__dirname, 'highscore'));
const Score = require(path.join(__dirname, 'score'));
const highscorePath = path.join(__dirname, 'highscore.json');
const Coordinate = require(path.join(__dirname, 'coordinate'));

module.exports = class Player {
    constructor(id, gameReference) {
        this._name;
        this._ships;
        this._field;
        this._fieldOfShots;
        this._score;
        this._id = id;
        this._playerSocket;
        this._opponentPlayer;
        this._gameReference = gameReference;
    }

    allShipsDestroyed() {
        return shipLogic.allShipsDestroyed(this._ships);
    }

    showHits() {
        this._playerSocket.emit('rejoinGame', this.restoreFieldOfShots(this._opponentPlayer.ships) , this._opponentPlayer.restoreFieldOfShots(this._ships));
        if(this.allShipsDestroyed()){
            this._playerSocket.emit('lost', this._score);
        } else if(this._opponentPlayer.allShipsDestroyed()){
            this._playerSocket.emit('won', this._score);
        }
    }

    showShips() {
        this._playerSocket.emit('myShips', this._field);
    }

    restoreFieldOfShots(opponentShips) {
        let restoredFieldOfShots = [];
        for(let y = 0; y < this._fieldOfShots.length; ++y) {
            for(let x = 0; x < this._fieldOfShots[y].length; ++x) {
                if(this._fieldOfShots[y][x] === 1) {
                    restoredFieldOfShots.push({'xCoordinate' : x, 'yCoordinate' : y, 'typeOfHit' : 'noHit'});
                }
            }
        }

        opponentShips.forEach(ship => {
            let isDestroyed = ship.isDestroyed();
            ship.allCoordinates.forEach(coordinate => {
                restoredFieldOfShots.forEach(shot => {
                    if(shot['xCoordinate'] === coordinate.xCoordinate && shot['yCoordinate'] === coordinate.yCoordinate) {
                        shot['typeOfHit'] = isDestroyed ? 'destroyed' : 'hit';
                    }
                });
            });
        });
        return restoredFieldOfShots;
    }

    makeReadyToPlay(opponentPlayer) {
        this._score = 0;
        this._fieldOfShots = shipLogic.createField();
        this._ships = shipPlacement.generateShipPlacement();
        this._field = shipLogic.addShips(this._ships);
        this._opponentPlayer = opponentPlayer;
        this._onSetPlayerName();
    }

    _onDisconnect() {
        this._playerSocket.on('disconnect', () => {
            console.log(this._id + ' disconnected');
        });
    }

    _onSetPlayerName() {
        this._playerSocket.on('setPlayerName', playerName => {
            this._name = playerName;
            this._gameReference.refreshNames();
        });
    }

    _onFire() {
        this._playerSocket.on('fire', (x, y) => {
            if (this._gameReference.isAbleToShoot(this, x, y)) {
                if (this._opponentPlayer.field[y][x]) {
                    this._playerSocket.emit('fireResult', true);
                    this._opponentPlayer.playerSocket.emit('fireResultEnemy', x, y, true);
                    this._addHit(this._opponentPlayer.ships, new Coordinate(x,y));
                    this._markDestroyedShips();
                } else {
                    this._playerSocket.emit('fireResult', false);
                    this._opponentPlayer.playerSocket.emit('fireResultEnemy', x, y, false);
                    this._gameReference.nextTurn();
                    this._gameReference.emitTurn();
                }
                this._fieldOfShots[y][x] = 1;
                this.increaseScore();
                if(this._gameReference.gameOver()) {
                    if(this.allShipsDestroyed()) {
                        this._opponentPlayer.hasWon();
                    }
                    else{
                        this.hasWon();
                    }
                }
            }
        });
    }

    reset() {
        this.makeReadyToPlay(this._opponentPlayer);
        this.showShips();
    }

    hasWon() {
        this._playerSocket.emit('won', this._score);
        this._opponentPlayer._playerSocket.emit('lost', this._score);

        let highscore = new Highscore();
        if(!highscore.readHighscore(highscorePath)) {
            let msg = 'Error reading from ' + highscorePath;
            console.log(msg);
            this._playerSocket.emit('highscore_error', msg);
            this._opponentPlayer.playerSocket.emit('highscore_error', msg);
        }

        highscore.addScore(new Score(this._name, this._score));
        if(!highscore.writeHighscore(highscorePath)) {
            let msg = 'Error writing in ' + highscorePath;
            console.log(msg);
            this._playerSocket.emit('highscore_error', msg);
            this._opponentPlayer.playerSocket.emit('highscore_error', msg);
        }
    }

    _addHit(ships, possibleHit) {
        ships.forEach(ship => {
            ship.addHitCoordinate(possibleHit);
        });
    }

    _markDestroyedShips() {
        this._ships.forEach(ship => {
            if(ship.isDestroyed()) {
                ship.allCoordinates.forEach(coordinate => {
                    this._playerSocket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this._opponentPlayer.playerSocket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
        this._opponentPlayer.ships.forEach(ship => {
            if(ship.isDestroyed()) {
                ship.allCoordinates.forEach(coordinate => {
                    this._opponentPlayer.playerSocket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this._playerSocket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
    }

    _onRestart() {
        this._playerSocket.on('restart', () => {
            this._gameReference.reset();
        });
    }

    initializeSocket() {
        this._onDisconnect();
        this._onSetPlayerName();
        this._onFire();
        this._onRestart();
    }

    isNotConnected() {
        return !this._playerSocket || !this._playerSocket.connected;
    }

    set playerSocket(socket) {
        this._playerSocket = socket;
    }

    set opponentPlayer(player) {
        this._opponentPlayer = player;
    }

    set name(name) {
        this._name = name;
    }

    set ships(ships) {
        this._ships = ships;
    }

    set field(field) {
        this._field = field;
    }

    set fieldOfShots(fieldOfShots) {
        this._fieldOfShots = fieldOfShots;
    }

    addShot(x,y) {
        this._fieldOfShots[y][x] = 1;
    }

    increaseScore() {
        this._score++;
    }

    get playerSocket() {
        return this._playerSocket;
    }

    get opponentPlayer() {
        return this._opponentPlayer;
    }

    get name() {
        return this._name;
    }
    get ships() {
        return this._ships;
    }
    get field() {
        return this._field;
    }
    get fieldOfShots() {
        return this._fieldOfShots;
    }
    get score() {
        return this._score;
    }
    get id() {
        return this._id;
    }
};
