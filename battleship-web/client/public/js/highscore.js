function getJSON(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        let status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

$(document).ready( () => {
    const host = 'http://' + window.location.host;
    getJSON(host + '/api/v1/highscore', (error, data) => {
        if(error) {
            alert(error);
        } else {
            data.forEach(score => {
                addToHighscoreTable(score['name'], score['score']);
            });
        }
    });
});

function addToHighscoreTable(name, score) {
    let tableRef = document.getElementById('highscoreTable').getElementsByTagName('tbody')[0];
    let newRow   = tableRef.insertRow(tableRef.rows.length);
    newRow.insertCell(0).innerHTML = name;
    newRow.insertCell(1).innerHTML = score;
}
