const shiplogic = require('./ship-logic');

const SHIP_CARRIER_SIZE = 5;
const SHIP_BATTLESHIP_SIZE = 4;
const SHIP_CRUISER_SIZE = 3;
const SHIP_SUBMARINE_SIZE = 2;
const TRY_COUNT = 100;

function generateShipPlacement() {
    let field;

    do {
        // rest the field
        field = shiplogic.createField();
    }
    while(!tryToAddShip(field, SHIP_CARRIER_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_BATTLESHIP_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_BATTLESHIP_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_CRUISER_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_CRUISER_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_CRUISER_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_SUBMARINE_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_SUBMARINE_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_SUBMARINE_SIZE, TRY_COUNT) ||
        !tryToAddShip(field, SHIP_SUBMARINE_SIZE, TRY_COUNT));

    return field;
}

function tryToAddShip(field, size, tryCount) {
    for(let i = 0; i < tryCount; ++i) {
        let direction = getRandomInt(0, 1);

        if(direction === 0) {
            if(addShipVertical(field, getRandomInt(0, 10), getRandomInt(0, 10), size)) {
                return true;
            }
        } else {
            if(addShipHorizontal(field, getRandomInt(0, 10), getRandomInt(0, 10), size)) {
                return true;
            }
        }
    }

    return false;
}

function addShipVertical(field, startPosX, startPosY, size) {
    for(let i = 0; i < size; ++i) {
        if(!isValiedPosition(field, startPosX, startPosY+i)) {
            return false;
        }
    }

    for(let i = 0; i < size; ++i) {
        field[startPosY+i][startPosX] = 1;
    }

    return true;
}

function addShipHorizontal(field, startPosX, startPosY, size) {
    for(let i = 0; i < size; ++i) {
        if(!isValiedPosition(field, startPosX+i, startPosY)) {
            return false;
        }
    }

    for(let i = 0; i < size; ++i) {
        field[startPosY][startPosX + i] = 1;
    }

    return true;
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
