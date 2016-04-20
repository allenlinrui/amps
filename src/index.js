//main
//2016-01-01
//allen

// *********** comm module *********** 
var log4js = require('log4js');
var proto_buf = require('protobufjs');
var net = require('net');

// 通用全局变量(用于后续的依赖注入)
var requires = {
    net_ : net,
    log4js_ : log4js,
    proto_buf_ : proto_buf
}

// *********** 日志定义 *********** 
//根据运行环境读取Release/Debug配置
//if (process.env.debug == 1) {
//    config = config.debug;
//} else {
//   config = config.release;
//}
//log4js.configure(config.logger);
//var logger = log4js.getLogger("server_log");
//logger.setLevel('DEBUG');



// load useful module
try {
    //var config = require("./etc/config.json");
    var tcp_server = require("./tcp_server")(requires);
    tcp_server.Start;
} catch(err) {
    console.log(`require module fail: ${err}`);
    //logger.error(`require module fail: ${err}`);
}