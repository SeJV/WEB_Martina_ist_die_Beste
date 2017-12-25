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
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
}

function destroyedShips(playerField, opponentsShots){
  destroyedShips = createField();
  for(y = 0; y < 10; y++){
    for(x = 0; x < 10; x++){

    }
  }
}

function hasWon(opponentsField, myShots){
  for(y = 0; y < 10; y++){
    for(x = 0; x < 10; x++){
      if(opponentsField[x][y] == 1 && !myShots[x][y]){
        return false;
      }
    }
  }
  return true;
}

module.exports = {
  createField: createField,
  hasWon:hasWon,

}
