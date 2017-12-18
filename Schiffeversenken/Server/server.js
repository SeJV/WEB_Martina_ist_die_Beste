var express = require('express')
var app = express()
const servestatic = require('serve-static')
var router = express.Router();
var path = __dirname + '/public/';
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});
router.get("/",function(req,res){
  res.sendFile(path + "Schiffeversenken.html");
});
app.use(servestatic('public'));
app.use("/",router);
app.listen(3000,function(){
  console.log("Live at Port 3000");
});


