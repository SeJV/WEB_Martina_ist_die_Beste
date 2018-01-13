const path = require('path');
const Player = require(path.join(__dirname, 'player'));

module.exports = class Game {
    constructor() {
        this._isRunning = false;

        this.player1 = new Player('Player1', this);
        this.player2 = new Player('Player2', this);

        this.turn = this.player1.id;
    }

    joinLobby(socket) {
        console.log('a user connected');
        //If Player1 isn't initialized
        if (this.player1.isNotConnected()) {
            this.player1.playerSocket = socket;

            //Game already started before and other player is connected
            if(this._isRunning && !this.player2.isNotConnected()) {
                this.player1.initializeSocket();

                this.player1.showShips();
                this.player1.showHits();
                this.emitTurn();
            }

            //make ready for new Game
            else {
                this.resetPlayerNames();
                this._isRunning = false;
                this.player1.makeReadyToPlay(this.player2);
            }
            return true;
        } else if(this.player2.isNotConnected()) {
            this.player2.playerSocket = socket;

            //Game already started before and other player is connected
            if(this._isRunning) {
                this.player2.initializeSocket();

                this.player2.showShips();
                this.player2.showHits();
                this.emitTurn();
            }
            //make ready for new Game
            else {
                this._isRunning = true;

                this.player2.makeReadyToPlay(this.player1);

                this.player1.initializeSocket();
                this.player2.initializeSocket();
                this.player1.showShips();
                this.player2.showShips();
                this.emitTurn();
            }
            return true;
        } else {
            return false;
        }
    }

    isAbleToPlay() {
        return this.player1.playerSocket
            && this.player2.playerSocket
            && !this.gameOver()
            && this.player1.name
            && this.player2.name;
    }

    refreshNames() {
        if(this.player2 && this.player2.name && this.player1.playerSocket){
            this.player1.playerSocket.emit('refreshName' , this.player2.name);
        }
        if(this.player1 && this.player1.name && this.player2.playerSocket){
            this.player2.playerSocket.emit('refreshName' , this.player1.name);
        }
    }

    resetPlayerNames(){
        if(this.player1 && this.player1.name){
            this.player1.name = null;
        }
        if(this.player2 && this.player2.name){
            this.player2.name = null;
        }
    }

    isAbleToShoot(player, x, y) {
        return player.id === this.turn && this.isAbleToPlay() && !player.fieldOfShots[y][x];
    }

    nextTurn() {
        if(this.turn === this.player1.id){
            this.turn = this.player2.id;
        }
        else{
            this.turn = this.player1.id;
        }
    }

    emitTurn() {
        if (this.turn === this.player1.id) {
            this.player1.playerSocket.emit('playerTurn', true);
            this.player2.playerSocket.emit('playerTurn', false);
        } else {
            this.player1.playerSocket.emit('playerTurn', false);
            this.player2.playerSocket.emit('playerTurn', true);
        }
    }

    reset() {
        this.player1.playerSocket.emit('resetField');
        this.player2.playerSocket.emit('resetField');
        this.player1.reset();
        this.player2.reset();
        this.emitTurn();
    }

    gameOver() {
        if(!this.player1.ships || !this.player2.ships){
            this._isRunning = false;
            return true;
        }
        return (this.player1.allShipsDestroyed() || this.player2.allShipsDestroyed());
    }
};