//first demo
//allenrlin@tencent.com

var http_server = require('http');
http_server.createServer(function (req, resp) {
    resp.writeHead(200, {'Content-Type': 'text/plain'});
    resp.end("hello allenrlin");
}).listen(8888);

console.log('Server running at http://127.0.0.1:8888/');
