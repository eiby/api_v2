/**
 * Module dependencies.
 * WiStorm Open API
 */
var cl = require('cluster');
var numCPUs = require('os').cpus().length;
var express = require('express');
var index = require('./routes/index');
var http = require('http');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 8088);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.compress());
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use('/public', express.staticCache());
app.use('/public', express.static(__dirname + '/public', { maxAge:900000 }));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler());
});

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
//    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 路由接口, 单一入口
// 路由接口可与实际接口分开部署, 也可以和实际接口部署在同一服务器
app.get('/router/rest', index.rest);
app.post('/router/rest', index.rest);

// 创建http服务器
if(process.env.NODE_ENV == "development"){
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
}else{
    if (cl.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cl.fork();
        }
        // As workers come up.
        cl.on('listening', function(worker, address) {
            console.log("A worker with #"+worker.id+" is now connected to " +
                address.address + ":" + address.port);
        });

        cl.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            cl.fork();
        });
    } else {
        // Workers can share any TCP connection
        // In this case its a HTTP server
        http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
    }
}
