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

function allShipsDestroyed(ships){
    let allDestroyed = true;
    ships.forEach(ship=>{
        allDestroyed = allDestroyed && ship.isDestroyed();
    });
    return allDestroyed;
}

module.exports = {
    createField: createField,
    allShipsDestroyed: allShipsDestroyed,
    addShips: addShips,
};
