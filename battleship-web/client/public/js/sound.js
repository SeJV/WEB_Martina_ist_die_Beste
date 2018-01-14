class Sound {
    constructor() {
        this._fireSound = new Audio('sound/fire.mp3');
        this._noHitSound = new Audio('sound/splash.mp3');
        this._hitSound = new Audio('sound/hit.mp3');
        this._endOfGameSound = new Audio('sound/end_of_game.mp3');
    }

    playFireSound() {
        this._play(this._fireSound);
    }

    playNoHitSound() {
        this._play(this._noHitSound);
    }

    playHitSound() {
        this._play(this._hitSound);
    }

    playEndOfGameSound() {
        this._play(this._endOfGameSound);
    }

    _play(sound) {
        if(!sound.paused) {
            sound.currentTime = 0;
        } else {
            sound.play();
        }
    }
}
