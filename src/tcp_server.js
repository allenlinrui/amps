// tcp server
// allen
// 2016-03-01
var TCPSERVER; //server var
var inner_requires; //depen var

var proto_buf;
var net;
var log;

var port = 8080;
var timeout = 10000;    //10 sec

// pb
var pb_builder;
var amps

function OnRequestMsg(socket) {
    var main_req = amps.main_req;
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

// 消息处理
function ProcessMsg(data) {
    
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

// RUN
TCPSERVER.Start = function() {
    var tcp_server = net.createServer();
    tcp_server.listen(port);

    //tcp接收缓冲区
    this.buffer = new Buffer(4094);

    //事件
    this.emitter = new requires.MyEmitter();

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

    //pb builder
    try {
        pb_builder = proto_buf.loadProtoFile("../protocal/main.proto");
        amps = pb_builder.build("amps");
    } catch (err) {
        throw new Error(`[tcp_server] pb error: ${err}`);
    }
}

//重新建立连接
//TCPSERVER.prototype.reconnect = function() {
    //是否ready可用
//    this.is_ready = false; 
    //空闲时间
//    this.idle_timeout = Date.now() + this.pool_options.idle_check_interval; 
    //seq和info的映射map
//    this.seq_info_map = new Map();
    //当前buffer缓存的长度
//    this.buffer_size = 0;  
    //服务器端的状态
//    this.server_state = {
 //       cpu: 0,
 //       socket_num: 0
  //  }; 
    
    
 //   if(this.client) {  //如果有连接，则先destory
  //      this.client.destroy();
  //  }
    
    //重新建立socket
    //TODO
//}

module.exports = function (options) {
    //========= 引入依赖对象 =========
    if(!options.proto_buf) {
        throw new Error("[tcp_server] Options.proto_buf is required");
    }

    if(!options.net) {
        throw new Error("[tcp_server] Options.net is required");
    }

    if(!options.logger) {
        throw new Error("[tcp_server] Options.logger is required");
    }

    inner_requires = options;
    proto_buf = inner_requires.proto_buf_;
    net  = inner_requires.net_;
    log = inner_requires.log4js_;

    return {
        tcp_server : TCPSERVER
    };
}