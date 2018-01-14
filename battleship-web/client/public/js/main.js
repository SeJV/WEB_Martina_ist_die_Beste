let socket;
let lastFire;
let sound = new Sound();

$(document).ready(() => {
    if(!socket) {
        socket = io();
        initSocket();
    }
    makeTable(1, 'tablePlayer1');
    makeTable(2, 'tablePlayer2');
    sizeContent();
    openPlayerNameModal();
});

$(window).resize(sizeContent);

function initSocket() {
    socket.on('fireResult', isHit => {
        if (isHit) {
            sound.playHitSound();
            markMyHit(lastFire[0] , lastFire[1]);
        } else {
            sound.playFireSound();
            setTimeout( () => {
                sound.playNoHitSound();
            }, 1000);
            markMyNoHit(lastFire[0] , lastFire[1]);
        }
    });

    socket.on('fireResultEnemy', (x, y, isHit) =>{
        if (isHit) {
            sound.playHitSound();
            markOpponentHit(x,y);
        } else {
            sound.playFireSound();
            setTimeout( () => {
                sound.playNoHitSound();
            }, 1000);
            markOpponentNoHit(x,y);
        }
    });

    socket.on('myShips', playerField => {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (playerField[y][x]) {
                    markMyShips(x,y);
                }
            }
        }
    });

    socket.on('playerTurn', isYourTurn => {
        if (isYourTurn) {
            $('#currentName').css('color', 'red');
            $('#opponentName').css('color', 'black');
        }
        else {
            $('#currentName').css('color', 'black');
            $('#opponentName').css('color', 'red');
        }
    });

    socket.on('won',highscore => {
        sound.playEndOfGameSound();
        document.getElementById('myBody').style.backgroundColor = 'green';
        $('#highscore').html('DEIN HIGHSCORE: ' + highscore);
        $('#resetGame').css('visibility', 'visible');
    });

    socket.on('lost',highscore => {
        sound.playEndOfGameSound();
        document.getElementById('myBody').style.backgroundColor = '#BF5FFF';
        $('#highscore').html('GEGNER SEIN HIGHSCORE: '+ highscore);
        $('#resetGame').css('visibility', 'visible');
    });

    socket.on('myDestroyedShips', (x,y) => {
        sound.playHitSound();
        markOpponentDestroy(x,y);
    });

    socket.on('opponentDestroyedShips', (x,y) => {
        sound.playHitSound();
        markMyDestroy(x,y);
    });

    socket.on('refreshName', name => {
        $('#opponentName').html(name);
    });

    socket.on('resetField', () => {
        makeTable(1, 'tablePlayer1');
        makeTable(2, 'tablePlayer2');
        document.getElementById('myBody').style.backgroundColor = 'white';
        $('#highscore').html('');
        $('#resetGame').css('visibility', 'hidden');
    });

    socket.on('rejoinGame', (myShots, opponentShots) => {
        myShots.forEach(shot => {
            if(shot['typeOfHit'] === 'noHit') {
                markMyNoHit(shot['xCoordinate'], shot['yCoordinate']);
            } else if(shot['typeOfHit'] === 'hit') {
                markMyHit(shot['xCoordinate'], shot['yCoordinate']);
            } else if(shot['typeOfHit'] === 'destroyed'){
                markMyDestroy(shot['xCoordinate'], shot['yCoordinate']);
            }
        });

        opponentShots.forEach(shot => {
            if(shot['typeOfHit'] === 'noHit') {
                markOpponentNoHit(shot['xCoordinate'], shot['yCoordinate']);
            } else if(shot['typeOfHit'] === 'hit') {
                markOpponentHit(shot['xCoordinate'], shot['yCoordinate']);
            } else if(shot['typeOfHit'] === 'destroyed'){
                markOpponentDestroy(shot['xCoordinate'], shot['yCoordinate']);
            }
        });
    });

    socket.on('fullLobby', () => {
        window.location.href = 'http://' + window.location.host + '/full_lobby.html';
    });
}

function markMyHit(x,y) {
    document.getElementById('enemField' + x + y).className = 'hit';
}

function markMyNoHit(x,y) {
    document.getElementById('enemField' + x + y).className = 'noHit';
}

function markMyDestroy(x,y) {
    document.getElementById('enemField' + x + y).className = 'destroy';
}

function markOpponentHit(x,y) {
    document.getElementById('myField' + x + y).className = 'hit';
}

function markOpponentNoHit(x,y) {
    document.getElementById('myField' + x + y).className = 'noHit';
}

function markOpponentDestroy(x,y) {
    document.getElementById('myField' + x + y).className = 'destroy';
}

function markMyShips(x,y){
    document.getElementById('myField' + x + y).className = 'ship';
}

function fire(x, y) {
    lastFire = [x, y];
    socket.emit('fire', x, y);
}

function makeTable(playerNumber, tableID) {
    $('#' + tableID).html('');
    let table = document.getElementById(tableID);
    let tableBody = document.createElement('tbody');
    table.appendChild(tableBody);

    for (let y = 0; y < 10; ++y) {
        tableRow = document.createElement('tr');
        for (let x = 0; x < 10; ++x) {
            tableData = document.createElement('td');
            tableData.className = 'default';
            if (playerNumber === 1) {
                tableData.id = 'myField' + x + y;
            } else {
                tableData.id = 'enemField' + x + y;
                tableData.setAttribute('onclick', 'fire(' + x + ',' + y + ')');
            }
            tableRow.appendChild(tableData);
        }
        tableBody.appendChild(tableRow);
    }
}


$('#playerName').modal({
    show: true,
    keyboard: false,
    backdrop: 'static'
});

function openPlayerNameModal() {
    $('#playerName').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    });
}

function resetTheGame(){
    socket.emit('restart');
}

function setPlayerName() {
    let myLabel = document.getElementById('myNameInput');
    let myLabelName = myLabel.value.trim();

    if (myLabelName.length == 0) {
        myLabel.style.borderColor = '#f00';
    } else {
        myLabel.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        $('#playerName').modal('hide');
        document.getElementById('currentName').innerText = myLabelName;
        socket.emit('setPlayerName', myLabelName);
    }
}

function sizeContent() {
    let newHeight = $('html').height()*0.35 + 'px';

    document.getElementById('tablePlayer1').setAttribute('style','width: ' + newHeight + '!important');
    document.getElementById('tablePlayer2').setAttribute('style','width: ' + newHeight + '!important');

    let tableWidth = $('.table-bordered').width();
    let marginLeft = ($('html').width()*0.5 - tableWidth*0.5) + 'px';
    $('#changePlayername').css('margin-left', marginLeft);
    $('.namesOfPlayer').css('margin-left', marginLeft);
}
