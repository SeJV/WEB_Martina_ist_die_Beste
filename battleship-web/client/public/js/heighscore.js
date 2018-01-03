function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

$(document).ready( () => {
    const host = "http://" + window.location.host;

    getJSON(host + '/api/v1/heighscore', (error, data) => {
        if(error) {
            alert(error);
        } else {
            data.forEach(score => {
                addToHighscoreTable(score['_name'], score['_score']);
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
