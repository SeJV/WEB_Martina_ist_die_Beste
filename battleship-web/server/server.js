const Highscore = require(__dirname + '/highscore');
const highscorePath = __dirname + '/highscore.json';
const Game = require(__dirname + '/game');
const game = new Game();
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const servestatic = require('serve-static');
const router = express.Router();
const config = require('config.json')(__dirname + '/config.dev.json');
const publicDirectory = path.join(__dirname, '/../client/public/');

router.use((req, res, next) => {
    console.log('/' + req.method);
    next();
});

router.get('/', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'battleship.html'));
});

router.get('/api/v1/highscore', (req, res) => {
    let currentHighscore = new Highscore();
    if(currentHighscore.readHighscore(highscorePath)) {
        res.setHeader('Content-Type', 'application/json');
        res.send(currentHighscore.scoresJSON);
    } else {
        res.status(500).send('Failed to read the highscore');
    }
});

app.use(servestatic(publicDirectory));

app.use('/', router);

io.on('connection', socket => {
    if(!game.joinLobby(socket)) {
        socket.emit('onLobbyFull');
    }
});

http.listen(config.server.port, config.server.host, () => {
    console.log('Live at Port ' + config.server.port);
});
