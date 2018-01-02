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

function addShips(field, ships){
    ships.forEach(function(ship){
        ship.allCoordinates().forEach(function(coordinate){
        });
    });
}

function hasWon(opponentsField, myShots){
    for(let y = 0; y < 10; y++){
        for(let x = 0; x < 10; x++){
            if(opponentsField[x][y] == 1 && !myShots[x][y]){
                return false;
            }
        }
    }
    return true;
}

module.exports = {
    createField: createField,
    hasWon: hasWon,
    addShips: addShips,
};
