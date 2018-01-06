module.exports = class Player {
    constructor() {
        this._name;
        this._ships;
        this._field;
        this._fieldOfShots;
        this._score = 0;
    }

    setName(name){
        this._name = name;
    }

    setShips(ships){
        this._ships = ships;
    }

    setField(field){
        this._field = field;
    }

    setFieldOfShots(fieldOfShots){
        this._fieldOfShots = fieldOfShots;
    }

    increaseScore(){
        _score++;
    }

    get name(){
        return this._name;
    }
    get ships(){
        return this._ships;
    }
    get field(){
        return this._field;
    }
    get fieldOfShots(){
        return this._fieldOfShots;
    }
    get score(){
        return this._score;
    }
}