// TCP连接池
// allen
// 2016-04-10

var tcp_client;
var requires;
var TCPPool;

/**
 * name: 最好使用不同的Name标识不同的连接池
 * options:
 * * * socket_num: 资源池维持的sokect数量
 * * * timeout: 超时时间
 * is_complete: 传入检查包是否完整的方法.如果完整返回{length:包长, seq: 包的序列}，不完整返回null
 */
TCPPool = function (name, options, stat, is_complete) {   
    this.options = {
        name:name,
        stat:stat || {timeout: 0},
        socket_num:options.socket_num || 3,      
        //超时时间，默认200ms
        timeout:options.timeout || 200, 
        //TCP缓冲区大小 默认10K 
        buffer_size:options.buffer_size || 10240,  
        //默认是pack_tcp包头结构
        is_complete:is_complete || requires.pack_tcp.is_complete, 
        //idx
        socket_idx: 0,
        //socket空闲多久后断开重连
        idle_check_interval:options.idle_check_interval || 60*1000,
        //cpu上限到多少时断开链接, 默认85%
        server_max_cpu: options.server_max_cpu || 85,
        //连接数上线多少时断开链接, 默认2000
        server_max_socket_num: options.server_max_socket_num || 2000,
    }
    //连接池数组 
    this.socket_objects = [];   
    //这次的顺序
    this.req_idx = 0;
    //可以认为是空闲的链接维护的req_num
    this.free_req_num = 1; 
   
    //定时检查超时重连
    setInterval(this.idle_check.bind(this), this.options.idle_check_interval);    
    this.ensure_socket_num();  //启动时建立连接
    
    requires.logger.info("Init clinet pool succ.", this.options);  
};


//建立一个新的client  
TCPPool.prototype.create_new_client = function() {
    var client = new tcp_client.TCPClient(this.options.socket_idx++, this);
    
    //如果有异常，导致client弹出删除事件。则删除client.等定时重连补上这个连接
    client.emitter.on('remove', (obj) => {
        obj.client.destroy();
        var idx = this.socket_objects.indexOf(obj);
        requires.logger.error("[TCPPool] remove socket. idx:", obj.idx, "in array idx:", idx);
        if(idx >= 0) {
            this.socket_objects.splice(idx,1);    
        } 
    });
        
    this.socket_objects.push(client);
}

//获取一个空闲的socket
TCPPool.prototype.get_idle_socket = function() {
    if(this.socket_objects.length == 0){
        this.ensure_socket_num(); //没有可用socket，立刻重连一下
        if(this.socket_objects.length == 0) {
            requires.logger.error("[TCPPool] name:", this.options.name, " socket_objects is empty. socket_num:", this.options.socket_num);
            return null;    
        }
    }
    
    //最简单的方式：顺序返回
    var count = this.socket_objects.length;
    while(count-- > 0){
        this.req_idx++;
        if(this.req_idx >= this.socket_objects.length) {
            this.req_idx = this.req_idx%this.socket_objects.length;
        }
        var client = this.socket_objects[this.req_idx]; 
        if(client && client.is_ready) {
            console.log("get_idle_socket: ", client.idx);
            return client;
        }     
    }   
    //都找了一遍都没有可用的 
    requires.logger.error("[TCPPool] name:", this.options.name, " socket_objects no read client. len:", this.socket_objects.length);
    return null;
}

//保证连接数大于等于socket num
TCPPool.prototype.ensure_socket_num = function() {
    if(this.options.socket_num > this.socket_objects.length) {
        var count = this.options.socket_num - this.socket_objects.length;
        while(count > 0) {
            count--;
            this.create_new_client();
        }
    }
}

/**
 * 空闲检查保证连接数
 */
TCPPool.prototype.idle_check = function(){
    var curr_time = Date.now();
    for(var i in this.socket_objects){ //如果长时间空闲则重连
        this.socket_objects[i].interval_check(curr_time);
    }    
    this.ensure_socket_num();  
}

//收发包
TCPPool.prototype.send_recv = function(message, seq) {
    if(!message || !seq){
        return new Promise ((resolve, reject) => { 
            return reject(`[TCPPool send_recv] seq:${seq}, message:${message} should not null.`);
        }); 
    }
    var curr_time = Date.now();
    var socket = this.get_idle_socket();
    if(!socket) {
        return new Promise ((resolve, reject) => { 
            return reject(`[TCPPool send_recv] get_idle_socket fail.`);
        }); 
    }
    return socket.send_recv( curr_time, message, seq);
}

module.exports = function (options) {
    //========= 引入依赖对象 =========
    if(!options.logger) {
        throw new Error("[tcp_pool] Options.logger is required");
    }

    requires = options;
    tcp_client = require('./tcp_client.js')(requires);
    
    return {
        TCPPool:TCPPool
    };
}