module.exports = class Score {
    constructor(name, score) {
        this._name = name;
        this._score = score;
    }

    get name() {
        let name =  this._name;
        return name;
    }

    get score() {
        let score = this._score;
        return score;
    }

    set score(newScore) {

        this._score = newScore;
    }
};
