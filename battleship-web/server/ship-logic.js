function createField() {
    return [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
}

function addShips(ships){
    let field = createField();
    ships.forEach(ship=>{
        ship.allCoordinates.forEach(coordinate => {
            field[coordinate.yCoordinate][coordinate.xCoordinate] = 1;
        });
    });
    return field;
}

function hasWon(opponentsShips){
    let hasWon = true;
    opponentsShips.forEach(ship=>{
        hasWon = hasWon && ship.isDestroyed();
    });
    return hasWon;
}

module.exports = {
    createField: createField,
    hasWon: hasWon,
    addShips: addShips,
};
