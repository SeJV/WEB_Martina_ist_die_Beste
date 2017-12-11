const servestatic = require('serve-static')
const http = require('http')
var path = require('path')
var express = require('express')
var fs = require('fs')
var app = express()

app.use(servestatic(path.join(__dirname,"public")));

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    fs.readFile(".\\public\\Schiffeversenken.html", 
            (err,dara)=>{
            res.writeHead(200, {'Content-Type':'text/html'});
        res.write(data);
        res.end();
    })
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
server.close(port, hostname, ()=>{
    console.log(`Server stopped at http://${hostname}:${port}/`);    
})


