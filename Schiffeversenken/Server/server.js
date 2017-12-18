var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
const servestatic = require('serve-static')
var router = express.Router();
var path = __dirname + '/public/';
var player1;
var player2;

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "Schiffeversenken.html");
});

app.use(servestatic('public'));

app.use("/",router);

io.on('connection', function(socket){
    console.log('a user connected');
    if(!player1){
        player1 = socket;
        player1.on('disconnect', function(){
            console.log("Player1 disconnected");
            player1 = undefined;
        })
        player1.on('fire', function(x,y){
            if(player1 && player2){
                player1.emit('fireResult', true);
                player2.emit('fireResultEnemy',x ,y ,true);
            }
        })
    }
    else if(!player2){
        player2 = socket;
        player2.on('disconnect', function(){
            console.log("Player2 disconnected");
            player2 = undefined;
        })
        player2.on('fire', function(x,y){
            if(player1 && player2){
                player1.emit('fireResultEnemy',x ,y ,true);
                player2.emit('fireResult', true);
            }
        })
    }
  });

http.listen(3000,function(){
  console.log("Live at Port 3000");
});  

