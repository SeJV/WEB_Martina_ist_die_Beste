const shipLogic = require('./ship-logic');
const Ship = require(__dirname + '/ship');
const Coordinate = require(__dirname + '/coordinate');

const SHIP_CARRIER_SIZE = 5;
const SHIP_BATTLESHIP_SIZE = 4;
const SHIP_CRUISER_SIZE = 3;
const SHIP_SUBMARINE_SIZE = 2;
const TRY_COUNT = 100;


function generateShipPlacement() {
    const shipTypes = [
        SHIP_CARRIER_SIZE, SHIP_BATTLESHIP_SIZE, SHIP_BATTLESHIP_SIZE,
        SHIP_CRUISER_SIZE, SHIP_CRUISER_SIZE, SHIP_CRUISER_SIZE,
        SHIP_SUBMARINE_SIZE, SHIP_SUBMARINE_SIZE, SHIP_SUBMARINE_SIZE,
        SHIP_SUBMARINE_SIZE
    ];
    let ships = [];
    let field = shipLogic.createField();

    while(!tryToGenerateShipPlacement(field, ships, shipTypes.slice()))
    {
        //reset
        ships = [];
        field = shipLogic.createField();
    }

    return ships;
}

function tryToGenerateShipPlacement(field, ships, shipTypes) {
    let shipType = shipTypes.shift();
    if(shipType === undefined) {
        return true;
    }

    let ship = tryToAddShip(field, shipType, TRY_COUNT);
    if(ship.hasCoordinates()) {
        ships.push(ship);
        return tryToGenerateShipPlacement(field, ships, shipTypes);
    } else {
        return false;
    }
}

function tryToAddShip(field, size, tryCount) {
    let ship;

    for(let i = 0; i < tryCount; ++i) {
        let direction = getRandomInt(0, 1);

        if(direction === 0) {
            ship = addShipVertical(field, getRandomInt(0, 10), getRandomInt(0, 10), size);
        } else {
            ship = addShipHorizontal(field, getRandomInt(0, 10), getRandomInt(0, 10), size);
        }
        if(ship.hasCoordinates()) {
            return ship;
        }
    }

    return ship;
}

function addShipVertical(field, startPosX, startPosY, size) {
    let ship = new Ship();

    for(let i = 0; i < size; ++i) {
        if(!isValiedPosition(field, startPosX, startPosY+i)) {
            return ship;
        }
    }

    for(let i = 0; i < size; ++i) {
        field[startPosY+i][startPosX] = 1;
        ship.addCoordinate(new Coordinate(startPosX, startPosY+i));
    }

    return ship;
}

function addShipHorizontal(field, startPosX, startPosY, size) {
    let ship = new Ship();

    for(let i = 0; i < size; ++i) {
        if(!isValiedPosition(field, startPosX+i, startPosY)) {
            return ship;
        }
    }

    for(let i = 0; i < size; ++i) {
        field[startPosY][startPosX + i] = 1;
        ship.addCoordinate(new Coordinate(startPosX + i, startPosY));
    }

    return ship;
}

function isValiedPosition(field, startPosX, startPosY) {
    if(typeof field[startPosY] === 'undefined' ||
     typeof field[startPosY][startPosX] === 'undefined' ||
     field[startPosY][startPosX] === 1) {
        return false;
    }
    if(!checkNearbyFields(field, startPosX, startPosY)) {
        return false;
    }

    return true;
}

function checkNearbyFields(field, posX, posY) {
    return checkNearbyField(field, posX, posY - 1) &&
         checkNearbyField(field, posX, posY + 1) &&
         checkNearbyField(field, posX - 1, posY) &&
         checkNearbyField(field, posX + 1, posY) &&
         checkNearbyField(field, posX + 1, posY + 1) &&
         checkNearbyField(field, posX - 1, posY - 1) &&
         checkNearbyField(field, posX + 1, posY - 1) &&
         checkNearbyField(field, posX - 1, posY + 1);
}

function checkNearbyField(field, posX, posY) {
    if(typeof field[posY] === 'undefined' || typeof field[posY][posX] === 'undefined') {
        return true;
    }

    return field[posY][posX] !== 1;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    generateShipPlacement: generateShipPlacement,
};
