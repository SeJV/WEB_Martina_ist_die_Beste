class Sound {
    constructor() {
        this._fireSound = new Audio('sound/fire.mp3');
        this._noHitSound = new Audio('sound/splash.mp3');
        this._hitSound = new Audio('sound/hit.mp3');
        this._endOfGameSound = new Audio('sound/end_of_game.mp3');
    }

    playFireSound() {
        this._fireSound.play();
    }

    playNoHitSound() {
        this._noHitSound.play();
    }

    playHitSound() {
        this._hitSound.play();
    }

    playEndOfGameSound() {
        this._endOfGameSound.play();
    }
}
