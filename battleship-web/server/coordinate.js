module.exports = class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static equal(lCoordinate, rCoordinate) {
        return lCoordinate.x == rCoordinate.x && lCoordinate.y == rCoordinate.y;
    }
};
