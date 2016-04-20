//main
//2016-01-01
//allen

// *********** comm module *********** 
var log4js = require('log4js');
var net = require('net');

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
    var server = require("./tcp_server");
} catch(err) {
    console.log(`require module fail: ${err}`);
    //logger.error(`require module fail: ${err}`);
}

server.Start();