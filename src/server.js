//http server
//2016-01-01
//allen

var http_server = require('http');
var url_parser = require("url")

function OnRequest(request, response){
    var path = url_parser.parse(request.url).path;

    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("古美路箭道管");
    response.end();
    // ..................................
}

function Start() {
    http_server.createServer(OnRequest).listen(8888);
    console.log('Server running at http://127.0.0.1:8888/');
}

module.exports.start = Start;
