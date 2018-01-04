module.exports = class Coordinate {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    static equal(lCoordinate, rCoordinate) {
        return lCoordinate.xCoordinate == rCoordinate.xCoordinate && lCoordinate.yCoordinate == rCoordinate.yCoordinate;
    }

    static copy(coordinate){
        return new Coordinate(coordinate.xCoordinate, coordinate.yCoordinate);
    }

    get xCoordinate(){
        return this._x;
    }

    get yCoordinate(){
        return this._y;
    }
};
