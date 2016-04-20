// tcp client  for test
// allen
// 2016-03-01

var net = require('net');
var proto_buf = require('protobufjs');
var client = new net.Socket();

client.setEncoding('utf8');

//pb builder
var pb_builder;
try {
    pb_builder = proto_buf.loadProtoFile("../protocal/main.proto");
} catch (err) {
    throw new Error(`[tcp_server] pb error: ${err}`);
}

client.connect(8080,"localhost", function () {
	console.log("connect ...");
});

client.on("data", function (data) {
	console.log("send data : " + data);
});

client.on("error", function (err) {
	console.log('Error occurred:', err.message);
});

function Main() {
	// input command
	if(process.argv.length !== 3) {
		console.log("usage: node ./demo.js [1:match | 2:room | 3:user]");
		process.exit(0);
	} else {
		switch(process.argv[2]) {
			case '1' :
				console.log("send mock match msg.");
				break;
			case '2' :
				var msg = CreatePbMsg();
				console.log("send mock room msg. pb date = ${msg}");
				console.log(msg);
				client.write(new Buffer(msg.encode().toArrayBuffer()));
				break;
			case '3' :
				console.log("send mock user msg.");
				break;
			default :
				console.log("other");
				process.exit(0);
				break;
		}
	}
} // function
Main();

function CreatePbMsg() {
	var result;
	MainReq = pb_builder.build("amps.MainReq");
	req = new MainReq(
		{
			"req_type" : "DEVICE",
			"room_req" : {
				"type" : "RETRIEVE_BY_ID",
				"room" : [
					{
						"id" : 100,
						"title" : "room_vip",
						"single_mode_with_300" : true,
						"rounds" : 1 
					},{
						"id" : 101,
						"title" : "room_vip",
						"single_mode_with_300" : true,
						"rounds" : 2 						
					}
				]
			}
		}
	);
	return req;
}	

