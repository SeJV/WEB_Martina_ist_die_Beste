function showErrorMsg(msg) {
    let alert = document.getElementById("errorAlert");
    alert.style.visibility = "visible";
    let errorMsg = document.getElementById("errorMsg");
    errorMsg.innerHTML = msg;
    errorMsg.style.visibility = "visible";
}

$(document).ready( () => {
    socket.on('error', error => {
        showErrorMsg("Ein Verbindungsfehler ist aufgetreten");
    });

    socket.on('reconnect_failed', error => {
        showErrorMsg("Bei der Neuverbindung ist ein Fehler aufgetreten");
    });

    socket.on('reconnect_error', error => {
        showErrorMsg("Bei der Neuverbindung ist ein Fehler aufgetreten");
    });

    socket.on('highscore_error', error => {
        showErrorMsg('Der Highscore konnte nicht gespeichert werden');
    })
});
