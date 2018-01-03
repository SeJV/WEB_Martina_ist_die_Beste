const fs = require('fs');

module.exports = class Highscore {
    constructor() {
        this._scores = [];
    }

    get scores() {
        let copyScores = this._scores;
        return copyScores;
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
    }

    readHighscore(path) {
        try {
            let scores = fs.readFileSync(path, 'utf8');
            this._scores = JSON.parse(scores);

            return true;
        } catch(err) {
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
};
