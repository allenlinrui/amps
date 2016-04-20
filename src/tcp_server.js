// tcp server
// allen
// 2016-03-01
var proto_buf = require('protobufjs');
var net  = require('net');
var port = 8080;
var timeout = 10000;	//10 sec

//pb builder
try {
    var pb_builder = proto_buf.loadProtoFile("../protocal/main.proto");
    var amps = pb_builder.build("amps");
} catch (err) {
    throw new Error(`[tcp_server] pb error: ${err}`);
}

var main_req = amps.main_req;

function OnRequestMsg(socket) {
    return function (data, flags) {
        if (flags.binary) {
            try {
                // Decode the Message
                var msg = main_req.decode(new buffer(data));
                console.log("Received: "+msg.text);
                
                // Transform the text to upper case
                msg.text = msg.text.toUpperCase();
                
                // Re-encode it and send it back
                socket.send(msg.toBuffer());
                console.log("Sent: "+msg.text);
            } catch (err) {
                console.log("Processing failed:", err);
            }
        } else {
            console.log("Not binary data");
        } //if	
    } // return
}

// Process Data
function OnRequestData(socket) {
    return function (data, flags) {
        if (flags.binary) {
            try {
                // Decode the Message
                var msg = main_req.decode(new buffer(data));
                console.log("Received: "+msg.text);
                
                // Transform the text to upper case
                msg.text = msg.text.toUpperCase();
                
                // Re-encode it and send it back
                socket.send(msg.toBuffer());
                console.log("Sent: "+msg.text);
            } catch (err) {
                console.log("Processing failed:", err);
            }
        } else {
            console.log("Not binary data");
        } //if  
    } // return

    return function (data) {
        console.log("[data]=", data);
        if(data.trim().toLowerCase() === 'quit') {
            this.write("connection over .");
            socket.end();

            //server.close();
        } else {
            socket.write("reviced .");
        }
    } // function
}

// connection
function OnConnect(server) {
    return function (socket) {
        //console.log(arguments);
        console.log('Server has a new connection');

        //var remote_address = socket.address();  //address
        //output connetor info
        console.log("remote ip : " + socket.address().address);

        socket.setEncoding('utf8');
        socket.write("Info, connection succss. ");
        socket.on('data', OnRequestData(socket));
        socket.on('message', OnRequestMsg(socket));
        socket.on('end', function () {
            console.log("socket end.");
        });

        socket.on('timeout', function () {
            socket.write('idle timeout, disconnecting, bye!');
            socket.end();
        });
        //socket.end();
        //tcp_server.close();
    }
}

function Start() {
    var tcp_server = net.createServer();
    tcp_server.listen(port);

    tcp_server.on('listening',
        function () {
            console.log('Server is listening on port', port);
        }
    );

    tcp_server.on('close',
        function () {
            console.log('Server is now closed');
        }
    );

    tcp_server.on('error',
        function (err) {
            console.log('Error occurred:', err.message);
        }
    );

    tcp_server.on('connection', OnConnect(tcp_server));
}

module.exports.Start = Start;