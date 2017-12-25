const Coordinate = require(__dirname + '/coordinate');

module.exports = class Ship {
    constructor() {
        this.coordinates = [];
    }

    addCoordinate(coordinate) {
        this.coordinates.push(coordinate);
    }

    removeCoordinate(coordinate) {
        this.coordinates = this.coordinates.filter(
            (otherCoordinate) => { return !Coordinate.equal(otherCoordinate, coordinate); });
    }

    hasCoordinates() {
        return this.coordinates.length > 0;
    }

    get allCoordinates() {
        return this.coordinates;
    }
};
