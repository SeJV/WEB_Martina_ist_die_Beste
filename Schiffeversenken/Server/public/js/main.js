
      $(document).ready(function(){
        $("#tablePlayer1").html(tabler(1))
        $("#tablePlayer2").html(tabler(2))  
      })
      function tabler(playerNumber){
        var str = ""
        for(var i = 0; i < 10; i++){
            str += "<tr>"
            for(var j = 0; j < 10 ; j++){
                str+= "<td class=\"spielfeld"+playerNumber+"\" id= feld"+ i + j +"></td>"
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