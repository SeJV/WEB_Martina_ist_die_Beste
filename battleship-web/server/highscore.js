const fs = require('fs');
const score = require(__dirname + '/score');

module.exports = class Highscore {
    constructor() {
        this._entries = [];
    }

    get scoresJSON() {
        let entries = [];
        this._entries.forEach(entry => {
            let copy = {};
            copy.name = entry.name;
            copy.score = entry.score;
            entries.push(copy);
        });

        return JSON.stringify(entries);
    }

    addScore(newEntry) {
        let entry = this._entries.find(score => { return score.name === newEntry.name; });

        if(entry === undefined) {
            this._entries.push(newEntry);
        } else {
            if(entry.score < newEntry.score) {
                entry.score = newEntry.score;
            }
        }
        this._sort();
    }

    readHighscore(path) {
        try {
            let entries = fs.readFileSync(path, 'utf8');
            entries = JSON.parse(entries);
            entries.forEach(entry => {
                this.addScore(new score(entry['name'], entry['score']));
            });

            this._sort();

            return true;
        } catch(err) {
            return false;
        }
    }

    writeHighscore(path) {
        const data = JSON.stringify(this._entries);
        try {
            fs.writeFileSync(path, data, 'utf8');
            return true;
        } catch(err) {
            return false;
        }
    }

    _sort() {
        this._entries = this._entries.sort( (lEntry, rEntry) => {
            return rEntry.score - lEntry.score;
        });
    }
};
