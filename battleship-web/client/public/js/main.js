let socket;
let lastFire;
$(document).ready(function () {
    socket = io();
    $('#tablePlayer1').html(makeTable(1));
    $('#tablePlayer2').html(makeTable(2));
    sizeContent();
    socket.on('fireResult', result => {
        if (result) {
            document.getElementById('enemField' + lastFire[0] + lastFire[1]).style.backgroundColor = '#FF5341';
        }
        else {
            document.getElementById('enemField' + lastFire[0] + lastFire[1]).style.backgroundColor = '#0ab2bd';
        }
    });
    socket.on('fireResultEnemy', (x, y, result) =>{
        if (result) {
            document.getElementById('myField' + x + y).style.backgroundColor = '#034044';
        }
        else {
            document.getElementById('myField' + x + y).style.backgroundColor = '#0ab2bd';
        }
    });
    socket.on('myShips', playerField=> {
        for (x = 0; x < 10; x++) {
            for (y = 0; y < 10; y++) {
                if (playerField[y][x]) {
                    document.getElementById('myField' + x + y).style.backgroundColor = '#000000';
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
    socket.on('won',highscore=>{
        document.getElementById('myBody').style.backgroundColor = 'green';
        $('#highscore').html('YOUR HIGHSCORE: ' + highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('lost',highscore=>{
        document.getElementById('myBody').style.backgroundColor = 'red';
        $('#highscore').html('OPPONENTS HIGHSCORE: '+ highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('myDestroyedShips', (x,y)=>{
        document.getElementById('myField' + x + y).style.backgroundColor = '#008eb7';
    });
    socket.on('opponentDestroyedShips', (x,y)=>{
        document.getElementById('enemField' + x + y).style.backgroundColor = '#008eb7';
    });
    socket.on('refreshName', name=>{
        $("#opponentLabel").html(name);
    });
    socket.on('resetField', ()=>{
        $('#tablePlayer1').html(makeTable(1));
        $('#tablePlayer2').html(makeTable(2));
        document.getElementById('myBody').style.backgroundColor = 'white';
        $('#highscore').html('');
        $('#resetGame').css('visibility', 'hidden');
    });
    open_player_name_modal();
});

function fire(x, y) {
    lastFire = [x, y];
    socket.emit('fire', x, y);
}

function makeTable(playerNumber) {
    let str = '';
    for (let i = 0; i < 10; i++) {
        str += '<tr>';
        for (let j = 0; j < 10; j++) {
            if (playerNumber == 1) {
                str += '<td ondrop="drop(event)" ondragover="allowDrop(event)" class="spielfeld' + playerNumber + '" id= myField' + i + j + '></td>';
            }
            else {
                str += '<td onclick="fire(' + i + ',' + j + ')" class="spielfeld' + playerNumber + '" id= enemField' + i + j + '></td>';
            }
        }
        str += '</tr>';
    }
    return str;
}

$('#playerName').modal({
    show: true,
    keyboard: false,
    backdrop: 'static'
});

function open_player_name_modal() {
    $('#playerName').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    });
}

function reset_the_game(){
    socket.emit('restart');
}

function set_player_name() {
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
    let newHeight = $("html").height()*0.8 + "px";
    $(".wrapper").css("height", newHeight);
    let marginLeft = ($("html").width()*0.5 - $(".table-bordered").height()*0.5) + "px";

    document.getElementById("tablePlayer1").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important"); 
    document.getElementById("tablePlayer2").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important");
    $("#changePlayername").css("margin-left", marginLeft);
    $(".namesOfPlayer").css("margin-left", marginLeft);
}

//Drag and Drop:

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    //data: id of DropItem
    var data = ev.dataTransfer.getData("text");
    //ev.target: ziel des Drops
    $("#" + ev.target.id).css('background-color', 'blue');
}