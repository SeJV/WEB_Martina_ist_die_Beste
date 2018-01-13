const path = require('path');
const Player = require(path.join(__dirname, 'player'));

module.exports = class Game {
    constructor() {
        this._isRunning = false;

        this._player1 = new Player('Player1', this);
        this._player2 = new Player('Player2', this);

        this._turn = this.player1.id;
    }

    joinLobby(socket) {
        console.log('a user connected');
        //If Player1 isn't initialized
        if (this._player1.isNotConnected()) {
            this._player1.playerSocket = socket;

            //Game already started before and other player is connected
            if(this._isRunning && !this._player2.isNotConnected()) {
                this._player1.initializeSocket();

                this._player1.showShips();
                this._player1.showHits();
                this.emitTurn();
            }

            //make ready for new Game
            else {
                this.resetPlayerNames();
                this._isRunning = false;
                this._player1.makeReadyToPlay(this._player2);
            }
            return true;
        } else if(this._player2.isNotConnected()) {
            this._player2.playerSocket = socket;

            //Game already started before and other player is connected
            if(this._isRunning) {
                this._player2.initializeSocket();

                this._player2.showShips();
                this._player2.showHits();
                this.emitTurn();
            }
            //make ready for new Game
            else {
                this._isRunning = true;

                this._player2.makeReadyToPlay(this._player1);

                this._player1.initializeSocket();
                this._player2.initializeSocket();
                this._player1.showShips();
                this._player2.showShips();
                this.emitTurn();
            }
            return true;
        } else {
            return false;
        }
    }

    isAbleToPlay() {
        return this._player1.playerSocket
            && this._player2.playerSocket
            && !this.gameOver()
            && this._player1.name
            && this._player2.name;
    }

    refreshNames() {
        if(this._player2 && this._player2.name && this._player1.playerSocket){
            this._player1.playerSocket.emit('refreshName' , this._player2.name);
        }
        if(this._player1 && this._player1.name && this._player2.playerSocket){
            this._player2.playerSocket.emit('refreshName' , this._player1.name);
        }
    }

    resetPlayerNames(){
        if(this._player1 && this._player1.name){
            this._player1.name = null;
        }
        if(this._player2 && this._player2.name){
            this._player2.name = null;
        }
    }

    isAbleToShoot(player, x, y) {
        return player.id === this._turn && this.isAbleToPlay() && !player.fieldOfShots[y][x];
    }

    nextTurn() {
        if(this._turn === this._player1.id){
            this._turn = this._player2.id;
        }
        else{
            this._turn = this._player1.id;
        }
    }

    emitTurn() {
        if (this._turn === this._player1.id) {
            this._player1.playerSocket.emit('playerTurn', true);
            this._player2.playerSocket.emit('playerTurn', false);
        } else {
            this._player1.playerSocket.emit('playerTurn', false);
            this._player2.playerSocket.emit('playerTurn', true);
        }
    }

    reset() {
        if(this._player1.playerSocket){
            this._player1.playerSocket.emit('resetField');
        }
        if(this._player2.playerSocket){
            this._player2.playerSocket.emit('resetField');
        }
        if(this._player2.playerSocket && this._player1.playerSocket){
            this._player1.reset();
            this._player2.reset();
        }
        this.emitTurn();
    }

    gameOver() {
        if(!this._player1.ships || !this._player2.ships){
            this._isRunning = false;
            return true;
        }
        return (this._player1.allShipsDestroyed() || this._player2.allShipsDestroyed());
    }
};
