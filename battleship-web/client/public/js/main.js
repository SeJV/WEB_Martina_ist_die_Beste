let socket;
let lastFire;
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
            markMyHit(lastFire[0] , lastFire[1]);
        } else {
            markMyNoHit(lastFire[0] , lastFire[1]);
        }
    });
    socket.on('fireResultEnemy', (x, y, isHit) =>{
        if (isHit) {
            markOpponentHit(x,y);
        } else {
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
            $('#myLabel').css('color', 'red');
            $('#opponentLabel').css('color', 'black');
        }
        else {
            $('#myLabel').css('color', 'black');
            $('#opponentLabel').css('color', 'red');
        }
    });
    socket.on('won',highscore => {
        document.getElementById('myBody').style.backgroundColor = 'green';
        $('#highscore').html('DEIN HIGHSCORE: ' + highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('lost',highscore => {
        document.getElementById('myBody').style.backgroundColor = '#BF5FFF';
        $('#highscore').html('GEGNER SEIN HIGHSCORE: '+ highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('myDestroyedShips', (x,y) => {
        markOpponentDestroy(x,y);
    });
    socket.on('opponentDestroyedShips', (x,y) => {
        markMyDestroy(x,y);
    });
    socket.on('refreshName', name => {
        $('#opponentLabel').html(name);
    });

    socket.on('resetField', () => {
        $('#tablePlayer1').html(makeTable(1));
        $('#tablePlayer2').html(makeTable(2));
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
    document.getElementById('enemField' + x + y).style.backgroundColor = '#FF5341';
}

function markMyNoHit(x,y) {
    document.getElementById('enemField' + x + y).style.backgroundColor = '#0ab2bd';
}

function markMyDestroy(x,y) {
    document.getElementById('enemField' + x + y).style.backgroundColor = '#008eb7';
}

function markOpponentHit(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#034044';
}

function markOpponentNoHit(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#0ab2bd';
}

function markOpponentDestroy(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#008eb7';
}

function markMyShips(x,y){
    document.getElementById('myField' + x + y).style.backgroundColor = '#000000';
}

function fire(x, y) {
    lastFire = [x, y];
    socket.emit('fire', x, y);
}

function makeTable(playerNumber, tableID) {
    let table = document.getElementById(tableID);
    let tableBody = document.createElement('tbody');
    table.appendChild(tableBody);
    for (let y = 0; y < 10; ++y) {
        tableRow = document.createElement('tr');
        for (let x = 0; x < 10; ++x) {
            tableData = document.createElement('td');
            tableData.setAttribute('class', 'battleground' + playerNumber);
            if (playerNumber === 1) {
                tableData.setAttribute('id', 'myField' + x + y);
            } else {
                tableData.setAttribute('id', 'enemField' + x + y);
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
    let myLabel = document.getElementById('myLabelInput');
    // We have to reset the form errors with custom validity
    myLabel.setCustomValidity('');

    if (myLabel.checkValidity()) {
        let myLabelName = myLabel.value.trim();
        if (myLabelName.length == 0) {
            myLabel.setCustomValidity('Du brauchst einen Namen');
        } else {
            document.getElementById('myLabel').innerHTML = myLabelName;
            $('#playerName').modal('hide');
            socket.emit('setPlayerName', myLabelName);
        }
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
