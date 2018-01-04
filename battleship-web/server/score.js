module.exports = class Score {
    constructor(name, score) {
        this._name = name;
        this._score = score;
    }

    get name() {
        return this._name;
    }

    get score() {
        return this._score;
    }

    set score(newScore) {
        this._score = newScore;
    }
};
