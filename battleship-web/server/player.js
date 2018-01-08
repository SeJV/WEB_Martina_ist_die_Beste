const shipPlacement = require(__dirname + "/ship-placement");
const shipLogic = require(__dirname + "/ship-logic");

module.exports = class Player {
    constructor(id) {
        this._name;
        this._ships;
        this._field;
        this._fieldOfShots;
        this._score;
        this._id = id;
        this.reset();
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

    reset(){
        this._ships = shipPlacement.generateShipPlacement();
        this._field = shipLogic.addShips(this._ships);
        this._fieldOfShots = shipLogic.createField();
        this._score = 0;
    }

    allShipsDestroyed() {
        return shipLogic.allShipsDestroyed(this._ships);
    }

    restoreFieldOfShots(opponentShips) {
        let restoredFieldOfShots = [];

        for(let y = 0; y < this._fieldOfShots.length; ++y) {
            for(let x = 0; x < this._fieldOfShots[y].length; ++x) {
                if(this._fieldOfShots[y][x] === 1) {
                    restoredFieldOfShots.push({"xCoordinate" : x, "yCoordinate" : y, "typeOfHit" : "noHit"});
                }
            }
        }

        opponentShips.forEach(ship => {
            let isDestroyed = ship.isDestroyed();
            ship.allCoordinates.forEach(coordinate => {
                restoredFieldOfShots.forEach(shot => {
                    if(shot["xCoordinate"] === coordinate.xCoordinate && shot["yCoordinate"] === coordinate.yCoordinate) {
                        shot["typeOfHit"] = isDestroyed ? "destroyed" : "hit";
                    }
                });
            });
        });

        return restoredFieldOfShots;
    }
}
