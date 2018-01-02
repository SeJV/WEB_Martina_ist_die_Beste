const Coordinate = require(__dirname + '/coordinate');

module.exports = class Ship {
    constructor() {
        this.coordinates = [];
        this.hitCoordinates = [];
    }

    addCoordinate(coordinate) {
        this.coordinates.push(coordinate);
    }

    removeCoordinate(coordinate) {
        this.coordinates = this.coordinates.filter(
            (otherCoordinate) => { return !Coordinate.equal(otherCoordinate, coordinate); });
    }

    addHitCoordinate(possibleHit){
        this.coordinates.forEach(coordinate => {
            if(Coordinate.equal(possibleHit, coordinate)){
                this.hitCoordinates.push(Coordinate.copy(possibleHit));
            }
        });
    }

    isDestroyed(){
        return this.coordinates.length <= this.hitCoordinates.length;
    }

    hasCoordinates() {
        return this.coordinates.length > 0;
    }

    get allCoordinates() {
        return this.coordinates;
    }
};
