      var socket;
      var lastFire;
      $(document).ready(function(){
        socket = io();
        $("#tablePlayer1").html(tabler(1));
        $("#tablePlayer2").html(tabler(2));
        socket.on('fireResult', function(result){
            if(result){
                document.getElementById("enemField"+lastFire[0]+lastFire[1]).style.backgroundColor = "red";
            }
            else{
                document.getElementById("enemField"+lastFire[0]+lastFire[1]).style.backgroundColor = "blue";    
            }
          }); 
          socket.on('fireResultEnemy', function(x,y,result){
            if(result){
                document.getElementById("myField"+x+y).style.backgroundColor = "grey";
            }
            else{
                document.getElementById("myField"+x+y).style.backgroundColor = "blue";    
            }
          }); 
          socket.on('myShips', function(playerField){
            for(x = 0; x<10; x++){
              for(y = 0; y<10; y++){
                if(playerField[y][x]){
                  document.getElementById("myField"+x+y).style.backgroundColor = "black";
                }
              }
            }
          });
        //open_player_name_modal();
      })

      function fire(x,y) {
          lastFire=[x,y];
          socket.emit('fire', x , y);
      };

      function tabler(playerNumber){
        var str = ""
        for(var i = 0; i < 10; i++){
            str += "<tr>"
            for(var j = 0; j < 10 ; j++){
                if(playerNumber==1){
                    str+= "<td class=\"spielfeld"+playerNumber+"\" id= myField"+ i + j + "></td>"        
                }
                else{
                    str+= "<td onclick=\"fire("+i +","+j+")\" class=\"spielfeld"+playerNumber+"\" id= enemField"+ i + j + "></td>"    
                }
            }
            str += "</tr>"
        }
        return str
    }      
        $('#playerName').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    })

    function open_player_name_modal() {
      $('#playerName').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
      })
    }     
      
    function set_player_name() {    
      var player1Element = document.getElementById('player1')
      var player2Element = document.getElementById('player2')

      // We have to reset the form errors with custom validity
      player1Element.setCustomValidity('')
      player2Element.setCustomValidity('')

      if (player1Element.checkValidity() && player2Element.checkValidity()) {
        var player1Name = document.getElementById('player1').value.trim()
        var player2Name = document.getElementById('player2').value.trim()

        if (player1Name.length == 0) {
          player1Element.setCustomValidity('Spieler1 benötigt einen Namen')
        } else if (player2Name.length == 0) {
          player2Element.setCustomValidity('Spieler2 benötigt einen Namen')
        } else if (player1Name === player2Name) {
          player2Element.setCustomValidity('Spieler2 hat den gleichen Namen wie Spieler1')
        } else {
          document.getElementById('player1Label').innerHTML = 'Spieler1: ' + player1Name
          document.getElementById('player2Label').innerHTML = 'Spieler2: ' + player2Name
          $('#playerName').modal('hide')
        }
      }
    }