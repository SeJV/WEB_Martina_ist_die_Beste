let socket;
let lastFire;
$(document).ready(function () {
    socket = io();
    $('#tablePlayer1').html(tabler(1));
    $('#tablePlayer2').html(tabler(2));
    sizeContent();
    $(window).resize(sizeContent);
    socket.on('fireResult', result => {
        if (result) {
            document.getElementById('enemField' + lastFire[0] + lastFire[1]).style.backgroundColor = '#FF5341';
        }
        else {
            document.getElementById('enemField' + lastFire[0] + lastFire[1]).style.backgroundColor = '#81C1E5';
        }
    });
    socket.on('fireResultEnemy', (x, y, result) =>{
        if (result) {
            document.getElementById('myField' + x + y).style.backgroundColor = '#6D9A9A';
        }
        else {
            document.getElementById('myField' + x + y).style.backgroundColor = '#6DB9DA';
        }
    });
    socket.on('myShips', playerField=> {
        for (x = 0; x < 10; x++) {
            for (y = 0; y < 10; y++) {
                if (playerField[y][x]) {
                    document.getElementById('myField' + x + y).style.backgroundColor = '#414B37';
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
    });
    socket.on('lost',highscore=>{
        document.getElementById('myBody').style.backgroundColor = 'red';
        $('#highscore').html('OPPONENTS HIGHSCORE: '+ highscore);
    });
    socket.on('myDestroyedShips', (x,y)=>{
        document.getElementById('myField' + x + y).style.backgroundColor = '#0DEAD0';
    });
    socket.on('opponentDestroyedShips', (x,y)=>{
        document.getElementById('enemField' + x + y).style.backgroundColor = '#0DEAD0';
    });
    socket.on('refreshName', name=>{
        $("#opponentLabel").html(name);
    });
    open_player_name_modal();
});

function fire(x, y) {
    lastFire = [x, y];
    socket.emit('fire', x, y);
}

function tabler(playerNumber) {
    let str = '';
    for (let i = 0; i < 10; i++) {
        str += '<tr>';
        for (let j = 0; j < 10; j++) {
            if (playerNumber == 1) {
                str += '<td class="spielfeld' + playerNumber + '" id= myField' + i + j + '></td>';
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

    //TODO: flexibel machen!

    document.getElementById("tablePlayer1").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important"); 
    document.getElementById("tablePlayer2").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important");
    $("#changePlayername").css("margin-left", marginLeft);
    $(".namesOfPlayer").css("margin-left", marginLeft);
}
