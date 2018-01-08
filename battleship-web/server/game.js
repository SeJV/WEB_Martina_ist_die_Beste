const Coordinate = require(__dirname + '/coordinate');
const Highscore = require(__dirname + '/highscore');
const Score = require(__dirname + '/score');
const highscorePath = __dirname + '/highscore.json';
const Player = require(__dirname + '/player');

module.exports = class Game{
    constructor(){
        this.player1Socket;
        this.player2Socket;
        this._isRunning = false;

        this.player1 = new Player('player 1');
        this.player2 = new Player('player 2');

        this.turn = this.player1.id;
    }

    joinLobby(socket){
        console.log('a user connected');
        if (!this.player1Socket || !this.player1Socket.connected) {
            console.log('Player1 connected');
            this.player1Socket = socket;

            if(this._isRunning){
                socket.emit('myShips', this.player1.field);
                socket.emit('rejoinGame', this.player1.restoreFieldOfShots(this.player2.ships), this.player2.restoreFieldOfShots(this.player1.ships));
                this._makeRestartPossible();
                this._makeFirePossible(this.player1);
                this._makeFirePossible(this.player2);
                this._emitTurn();
            }

            this.player1Socket.on('disconnect', () => {
                console.log('Player1 disconnected');
            });

            this.player1Socket.on('setPlayerName', playerName => {
                this.player1.name = playerName;
                if(this._isAbleToPlay()){
                    this._refreshNames();
                }
            });
            return true;
        } else if (!this.player2Socket || !this.player2Socket.connected) {
            console.log('Player2 connected');
            this.player2Socket = socket;

            if(!this._isRunning) {
                this._isRunning = true;
                this._makeRestartPossible();
                this._makeGamePlayable();
                this._makeFirePossible(this.player1);
                this._makeFirePossible(this.player2);
            } else {
                socket.emit('myShips', this.player2.field);
                socket.emit('rejoinGame', this.player2.restoreFieldOfShots(this.player1.ships), this.player1.restoreFieldOfShots(this.player2.ships));
                this._makeRestartPossible();
                this._makeFirePossible(this.player1);
                this._makeFirePossible(this.player2);
                this._emitTurn();
            }

            this.player2Socket.on('disconnect', () => {
                console.log('Player2 disconnected');
            });
            this.player2Socket.on('setPlayerName', playerName=>{
                this.player2.name = playerName;
                if(this._isAbleToPlay()){
                    this._refreshNames();
                }
            });
            return true;
        } else {
            return false;
        }
    }

    _emitTurn() {
        if (this.turn == this.player1.id) {
            this.player1Socket.emit('playerTurn', true);
            this.player2Socket.emit('playerTurn', false);
        } else {
            this.player1Socket.emit('playerTurn', false);
            this.player2Socket.emit('playerTurn', true);
        }
    }

    _makeRestartPossible() {
        this.player2Socket.on('restart', ()=>{
            this._reset();
        });
        this.player1Socket.on('restart', ()=>{
            this._reset();
        });
    }

    _makeFirePossible(currentPlayer){
        let playerSocket;
        let opponentSocket;
        let nextTurn;
        let opponentField;
        let opponentShips;

        if(currentPlayer.id === this.player1.id){
            playerSocket = this.player1Socket;
            opponentSocket = this.player2Socket;
            opponentField = this.player2.field;
            opponentShips = this.player2.ships;
            nextTurn = this.player2.id;
        } else {
            playerSocket = this.player2Socket;
            opponentSocket = this.player1Socket;
            opponentField = this.player1.field;
            opponentShips = this.player1.ships;
            nextTurn = this.player1.id;
        }

        playerSocket.on('fire', (x, y) => {
            if (currentPlayer.id === this.turn && this._isAbleToPlay() && !currentPlayer.fieldOfShots[y][x]) {
                if (opponentField[y][x]) {
                    playerSocket.emit('fireResult', true);
                    opponentSocket.emit('fireResultEnemy', x, y, true);
                    this._addHit(opponentShips, new Coordinate(x,y));
                    this._markDestroyedShips();
                } else {
                    playerSocket.emit('fireResult', false);
                    opponentSocket.emit('fireResultEnemy', x, y, false);
                    this.turn = nextTurn;
                    this._emitTurn();
                }
                currentPlayer.fieldOfShots[y][x] = 1;
                if(currentPlayer.id === this.player1.id) {
                    this.player1.increaseScore();
                } else {
                    this.player2.increaseScore();
                }
            }
            if(this._gameOver()){
                this._emitWinnerAndLoser();
            }
        });
    }

    _makeGamePlayable(){
        this.player1Socket.emit('myShips', this.player1.field);
        this.player2Socket.emit('myShips', this.player2.field);
        this.turn = this._randomPlayer();
        this._emitTurn();
    }

    _reset(){
        this.player1Socket.emit('resetField');
        this.player2Socket.emit('resetField');
        this.player1.reset();
        this.player2.reset();
    }

    _randomPlayer(){
        //int between 1 and 2
        if(((Math.random()*2 +1) | 0) === 1){
            return this.player1.id;
        } else {
            return this.player2.id;
        }
    }

    _gameOver() {
        if(!this.player1.ships || !this.player2.ships){
            this._isRunning = false;
            return true;
        }
        return (this.player1.allShipsDestroyed() || this.player2.allShipsDestroyed());
    }

    _emitWinnerAndLoser(){
        let winner;
        if(this.player1.allShipsDestroyed()){
            winner = this.player2;
            this.player2Socket.emit('won', winner.score);
            this.player1Socket.emit('lost', winner.score);
        } else {
            winner = this.player1;
            this.player2Socket.emit('lost', winner.score);
            this.player1Socket.emit('won', winner.score);
        }

        let highscore = new Highscore();
        if(!highscore.readHighscore(highscorePath)) {
            console.log("Error reading from " + highscorePath);
        }

        highscore.addScore(new Score(winner.name, winner.score));

        if(!highscore.writeHighscore(highscorePath)) {
            console.log("Error writing in " + highscorePath);
        }
    }

    _addHit(opponentShips, possibleHit) {
        opponentShips.forEach(ship=>{
            ship.addHitCoordinate(possibleHit);
        });
    }

    _markDestroyedShips(){
        this.player1.ships.forEach(ship=>{
            if(ship.isDestroyed()){
                ship.allCoordinates.forEach(coordinate=>{
                    this.player1Socket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this.player2Socket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
        this.player2.ships.forEach(ship=>{
            if(ship.isDestroyed()){
                ship.allCoordinates.forEach(coordinate=>{
                    this.player2Socket.emit('myDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                    this.player1Socket.emit('opponentDestroyedShips', coordinate.xCoordinate, coordinate.yCoordinate);
                });
            }
        });
    }

    _isAbleToPlay(){
        return this.player1Socket
            && this.player2Socket
            && !this._gameOver()
            && this.player1.name
            && this.player2.name;
    }

    _refreshNames() {
        this.player1Socket.emit('refreshName' , this.player2.name);
        this.player2Socket.emit('refreshName' , this.player1.name);
    }
}
