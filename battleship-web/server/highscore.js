const fs = require('fs');

module.exports = class Highscore {
    constructor() {
        this._scores = [];
    }

    get scores() {
        let scores = this._scores.slice();
        return scores;
    }

    addScore(newScore) {
        let score = this._scores.find(score => { return score.name === newScore.name; });

        if(score === undefined) {
            this._score.push(newScore);
        } else {
            if(score.score < newScore.score) {
                score.score = newScore.score;
            }
        }
        _sort();
    }

    readHighscore(path) {
        try {
            let scores = fs.readFileSync(path, 'utf8');
            this._scores = JSON.parse(scores);
            this._sort()

            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    writeHighscore(path) {
        const data = JSON.stringify(this._scores);
        try {
            fs.writeFileSync(path, data, 'utf8');
            return true;
        } catch(err) {
            return false;
        }
    }

    _sort() {
        this._scores = this._scores.sort( (lScore, rScore) => {
            return rScore._score - lScore._score;
        });
    }
};
