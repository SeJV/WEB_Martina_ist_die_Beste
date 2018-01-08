const Highscore = require(__dirname + '/highscore');
const Score = require(__dirname + '/score');
const highscorePath = __dirname + '/highscore.json';
const Player = require(__dirname + '/player');

module.exports = class Game{
    constructor(){
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
                //new player1 socket 'on' function restart
                this.player1.initializeSocket();

                //load old game to player1 client
                this.player1.showShips();
                this.player1.showHits();
                this.emitTurn();
            }
            //make ready for new Game
            else {
                this.player1.makeReadyToPlay(this.player2);
            }
            return true;
        } else if(this.player2.isNotConnected()) {
            this.player2.playerSocket = socket;

            //Game already started before and other player is connected
            if(this._isRunning && !this.player1.isNotConnected()) {
                //player2 socket 'on' functions restart
                this.player2.initializeSocket();

                //load old game to player2 client
                this.player2.showShips();
                this.player2.showHits();
                this.emitTurn();
            }
            //make ready for new Game
            else {
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
        this.player1.playerSocket.emit('refreshName' , this.player2.name);
        this.player2.playerSocket.emit('refreshName' , this.player1.name);
    }

    isAbleToShoot(player, x, y){
        return player.id === this.turn && this.isAbleToPlay() && !player.fieldOfShots[y][x];
    }

    nextTurn() {
        if(this.turn === this.player1.id){
            this.turn = this.player2.id;
        }
        else{
            this.turn = this.player1.id;
        }
        console.log("TURN: " + this.turn);
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
    }

    randomPlayerID() {
        //int between 1 and 2
        if(((Math.random()*2 +1) | 0) === 1){
            return this.player1.id;
        } else {
            return this.player2.id;
        }
    }

    gameOver() {
        if(!this.player1.ships || !this.player2.ships){
            this._isRunning = false;
            return true;
        }
        return (this.player1.allShipsDestroyed() || this.player2.allShipsDestroyed());
    }
}




/**
            if(this._isRunning){
                socket.emit('myShips', this.player1.field);
                socket.emit('rejoinGame', this.player1.restoreFieldOfShots(this.player2.ships), this.player2.restoreFieldOfShots(this.player1.ships));
                this._makeRestartPossible();
                this._makeFirePossible(this.player1);
                this._makeFirePossible(this.player2);
                this.emitTurn();
            }

            this.player1.playerSocket.on('disconnect', () => {
                console.log('Player1 disconnected');
            });

            this.player1.playerSocket.on('setPlayerName', playerName => {
                this.player1.name = playerName;
                if(this._isAbleToPlay()){
                    this._refreshNames();
                }
            });
            return true;
        } else if (!this.player2.playerSocket || !this.player2.playerSocket.connected) {
            console.log('Player2 connected');
            this.player2.playerSocket = socket;

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
                this.emitTurn();
            }

            this.player2.playerSocket.on('disconnect', () => {
                console.log('Player2 disconnected');
            });
            this.player2.playerSocket.on('setPlayerName', playerName=>{
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

    isAbleToPlay(player, x, y){
        return player.id === this.turn && this._isAbleToPlay() && !player.fieldOfShots[y][x];
    }

    gameOver() {
        if(!this.player1.ships || !this.player2.ships){
            this._isRunning = false;
            return true;
        }
        return (this.player1.allShipsDestroyed() || this.player2.allShipsDestroyed());
    }

    getTurn(){
        return this.turn;
    }

    nextTurn(){
        if(turn === this.player1.id){
            turn = this.player2.id;
        }
        else{
            turn = this.player1.id;
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

    _makeRestartPossible() {
        this.player2.playerSocket.on('restart', ()=>{
            this._reset();
        });
        this.player1.playerSocket.on('restart', ()=>{
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
            playerSocket = this.player1.playerSocket;
            opponentSocket = this.player2.playerSocket;
            opponentField = this.player2.field;
            opponentShips = this.player2.ships;
            nextTurn = this.player2.id;
        } else {
            playerSocket = this.player2.playerSocket;
            opponentSocket = this.player1.playerSocket;
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
        this.player1.playerSocket.emit('myShips', this.player1.field);
        this.player2.playerSocket.emit('myShips', this.player2.field);
        this.turn = this._randomPlayer();
        this.emitTurn();
    }

    reset(){
        this.player1.playerSocket.emit('resetField');
        this.player2.playerSocket.emit('resetField');
        this.player1.reset();
        this.player2.reset();
    }

    randomPlayerID(){
        //int between 1 and 2
        if(((Math.random()*2 +1) | 0) === 1){
            return this.player1.id;
        } else {
            return this.player2.id;
        }
    }

    _emitWinnerAndLoser(){
        let winner;
        if(this.player1.allShipsDestroyed()){
            winner = this.player2;
            this.player2.playerSocket.emit('won', winner.score);
            this.player1.playerSocket.emit('lost', winner.score);
        } else {
            winner = this.player1;
            this.player2.playerSocket.emit('lost', winner.score);
            this.player1.playerSocket.emit('won', winner.score);
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

    isAbleToPlay(){
        return this.player1.playerSocket
            && this.player2.playerSocket
            && !this._gameOver()
            && this.player1.name
            && this.player2.name;
    }

    refreshNames() {
        this.player1.playerSocket.emit('refreshName' , this.player2.name);
        this.player2.playerSocket.emit('refreshName' , this.player1.name);
    }
}

*/