module.exports = class Score {
    constructor(name, score) {
        this._name = name;
        this._score = score;
    }

    get name() {
        let copyName = this._name;
        return copyName;
    }

    get score() {
        let copyScore = this._score;
        return copyScore;
    }

    set score(newScore) {
        this._score = newScore;
    }
}
