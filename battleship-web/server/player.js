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

    allShipsDestroyed() {
        return shipLogic.allShipsDestroyed(this._ships);
    }

    showHits() {
        this.playerSocket.emit('rejoinGame', this.restoreFieldOfShots(this.opponentPlayer.ships) , this.opponentPlayer.restoreFieldOfShots(this.ships));
        if(this.allShipsDestroyed()){
            this._playerSocket.emit('lost', this._score);
        } else if(this.opponentPlayer.allShipsDestroyed()){
            this._playerSocket.emit('won', this._score);
        }
    }

    showShips() {
        this.playerSocket.emit('myShips', this.field);
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
        this.fieldOfShots = shipLogic.createField();
        this.ships = shipPlacement.generateShipPlacement();
        this.field = shipLogic.addShips(this.ships);
        this.opponentPlayer = opponentPlayer;
        this._onSetPlayerName();
    }

    _onDisconnect() {
        this.playerSocket.on('disconnect', () => {
            console.log(this.id + ' disconnected');
        });
    }

    _onSetPlayerName() {
        this.playerSocket.on('setPlayerName', playerName => {
            this.name = playerName;
            this._gameReference.refreshNames();
        });
    }

    _onFire() {
        this.playerSocket.on('fire', (x, y) => {
            if (this._gameReference.isAbleToShoot(this, x, y)) {
                if (this.opponentPlayer.field[y][x]) {
                    this.playerSocket.emit('fireResult', true);
                    this.opponentPlayer.playerSocket.emit('fireResultEnemy', x, y, true);
                    this._addHit(this.opponentPlayer.ships, new Coordinate(x,y));
                    this._markDestroyedShips();
                } else {
                    this.playerSocket.emit('fireResult', false);
                    this.opponentPlayer.playerSocket.emit('fireResultEnemy', x, y, false);
                    this._gameReference.nextTurn();
                    this._gameReference.emitTurn();
                }
                this.fieldOfShots[y][x] = 1;
                this.increaseScore();
                if(this._gameReference.gameOver()) {
                    if(this.allShipsDestroyed()) {
                        this.opponentPlayer.hasWon();
                    }
                    else{
                        this.hasWon();
                    }
                }
            }
        });
    }

    reset() {
        this.makeReadyToPlay(this.opponentPlayer);
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
        highscore.addScore(new Score(this.name, this._score));
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
        this.ships.forEach(ship => {
            if(ship.isDestroyed()) {
                ship.allCoordinates.forEach(coordinate => {
                    this.playerSocket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this.opponentPlayer.playerSocket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
        this.opponentPlayer.ships.forEach(ship => {
            if(ship.isDestroyed()) {
                ship.allCoordinates.forEach(coordinate => {
                    this.opponentPlayer.playerSocket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this.playerSocket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
    }

    _onRestart() {
        this.playerSocket.on('restart', () => {
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
        return !this.playerSocket || !this.playerSocket.connected;
    }
};
