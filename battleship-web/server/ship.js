const coordinate = require(__dirname + '/coordinate');

module.exports = class Ship {
    constructor() {
        this._coordinates = [];
        this._hitCoordinates = [];
    }

    addCoordinate(coordinate) {
        this._coordinates.push(coordinate);
    }

    removeCoordinate(coordinate) {
        this._coordinates = this._coordinates.filter(
            (otherCoordinate) => { return !coordinate.equal(otherCoordinate, coordinate); });
    }

    addHitCoordinate(possibleHit){
        this._coordinates.forEach(coordinate => {
            if(coordinate.equal(possibleHit, coordinate)){
                this._hitCoordinates.push(coordinate.copy(possibleHit));
            }
        });
    }

    isDestroyed(){
        return this._coordinates.length <= this._hitCoordinates.length;
    }

    hasCoordinates() {
        return this._coordinates.length > 0;
    }

    get allCoordinates() {
        return this._coordinates;
    }
};
