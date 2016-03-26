/**
 * Created by 1 on 16/3/24.
 * game websocket server
 */
var cl = require('cluster');
var numCPUs = require('os').cpus().length;
var game = require('./routes/game');
var game_log = require('./routes/game_log');
var define = require('./lib/define');
var customer = require('./routes/customer');
var webSocketServer = require('websocket').server;
var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

//设备及微信用户列表
var users = [];
var games = [];

// all environments
app.set('port', process.env.PORT || 8081);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('ogs'));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// 创建及监听WebSocket Server
var createWxServer = function(port){
    var server = http.createServer(app);
    /**
     * WebSocket server
     */
    var wsServer = new webSocketServer({
        // WebSocket server is tied to a HTTP server. WebSocket request is just
        // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
        httpServer: server
    });

    //This callback function is called every time someone
    //tries to connect to the WebSocket server
    wsServer.on('request', function(request) {
        console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

        // accept connection - you should check 'request.origin' to make sure that
        // client is connecting from your website
        // (http://en.wikipedia.org/wiki/Same_origin_policy)
        var connection = request.accept(null, request.origin);

        // user sent some message
        connection.on('message', function(message) {
            console.log(message);
            var obj = message.utf8Data;
            obj = JSON.parse(obj);
            var msg_id = obj._msgId;
            if(obj.type == 'LOGIN'){ //登陆
                connection.open_id = obj.open_id;
                connection.game_id = obj.game_id;
                connection.name = obj.name;
                connection.logo = obj.logo;
                users[connection.open_id] = connection;
                console.log((new Date()) + " Peer " + this.open_id + " connected.");
                var g = games[obj.game_id];
                if(!g){ //如果当前游戏没有创建, 则创建游戏, 并加入首个用户
                    game._get(obj.game_id, function(doc){
                        if(doc){
                            var ranks = [];
                            ranks.push(connection);
                            games[doc.game_id] = {
                                answer: doc.answer,   //游戏正确答案
                                level: doc.level,     //游戏难度
                                ranks: ranks,         //游戏通讯列表
                                cur_ranks: []         //当前游戏排名
                            };
                        }
                    });
                }else{
                    var exists = false;
                    for(var i = 0; i < g.ranks.length; i++){
                        if(g.ranks[i].open_id == obj.open_id){
                            g.ranks[i] = connection;
                            exists = true;
                            break;
                        }
                    }
                    if(!exists){
                        g.ranks.push(connection);
                    }
                }
                //记录开始游戏日志
                game_log._new(obj.game_id, obj.open_id, function(status){
                    console.log("add game log.");
                });
                //回复OK
                var resp = {
                    _msgId: msg_id,
                    status: "OK"
                };
                connection.sendUTF(JSON.stringify(resp));
            }else if(obj.type == 'PIECE_CHANGE'){
                var resp = {};
                var user = users[connection.open_id];
                if(user){
                    // 对比正确答案,返回完成度
                    var g = games[connection.game_id];
                    var pieces = obj.pieces;
                    var correct = true;
                    var count = 0;
                    var completion = 0;
                    if(g){
                        for(var i = 0; i < g.answer.length; i++){
                            if(g.answer[i] != pieces[i]){
                                correct = false;
                            }else{
                                count++;
                            }
                        }
                        if(g.answer.length > 0){
                            completion = parseInt(count / g.answer.length * 100);
                        }
                        connection.completion = completion;
                        console.log('open_id: ' + connection.open_id + ', completion: '  + completion);
                        // 如果完成, 根据难度新增微豆并回复
                        if(completion == 100){
                            var add_wi_dou = g.level * g.level;
                            customer.updateWiDou(connection.open_id, add_wi_dou, function(status, total_wi_dou){
                                if(status == define.DB_STATUS_OK){
                                    resp = {
                                        _msgId: msg_id,
                                        status: 'OK',
                                        completion: completion,
                                        add_wi_dou: add_wi_dou,
                                        total_wi_dou: total_wi_dou
                                    };
                                    console.log(resp);
                                    connection.sendUTF(JSON.stringify(resp));
                                }else{
                                    resp = {
                                        _msgId: msg_id,
                                        status: 'FAIL'
                                    };
                                    console.log(resp);
                                    connection.sendUTF(JSON.stringify(resp));
                                }
                            });
                            //记录游戏结束日志
                            var now = new Date();
                            game_log._update(connection.game_id, connection.open_id, add_wi_dou, now, function(status, id){
                                console.log("update game log.");
                            });
                        }else{
                            resp = {
                                _msgId: msg_id,
                                status: 'OK',
                                completion: completion
                            };
                            console.log(resp);
                            connection.sendUTF(JSON.stringify(resp));
                        }
                    }else{
                        resp = {
                            _msgId: msg_id,
                            status: 'FAIL'
                        };
                        console.log(resp);
                        connection.sendUTF(JSON.stringify(resp));
                    }
                }else{
                    resp = {
                        _msgId: msg_id,
                        status: 'FAIL'
                    };
                    console.log(resp);
                    connection.sendUTF(JSON.stringify(resp));
                }
            }
        });

        // user disconnected
        connection.on('close', function(connection) {
            console.log((new Date()) + " Peer "
                + this.open_id + " disconnected.");
            users[this.open_id] = null;
        });

    });

    server.listen(port, function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
};

if(process.env.NODE_ENV == "development"){
    createWxServer(app.get("port"));
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
        createWxServer(app.get("port"));
    }
}

//向所有用户发送游戏排名
setInterval(function(){
    for(var game_id in games){
        var func = broadRank(game_id);
        func();
    }
}, 5000);

var broadRank = function(game_id){
    var game_id = game_id;
    return function(){
        var game = games[game_id];
        var ranks = game.ranks;
        var name = '';
        var logo = '';
        var completion = 0;
        ranks.sort(by("completion"));
        var send_ranks = [];
        for(var i = ranks.length - 1; i >= 0; i--){
            if(i > 5){
                break;
            }
            if(ranks[i].completion != undefined){
                completion = ranks[i].completion;
            }
            if(completion > 0){
                if(ranks[i].name != undefined){
                    name = ranks[i].name;
                }
                if(ranks[i].logo != undefined){
                    logo = ranks[i].logo;
                }
                var rank = {
                    open_id: ranks[i].open_id,
                    name: name,
                    logo: logo,
                    completion: completion
                };
                send_ranks.push(rank);
            }
        }
        var is_change = false;
        is_change = game.cur_ranks.length != send_ranks.length;
        if(!is_change){
            for(var i = 0; i < send_ranks.length; i++){
                if(send_ranks[i].open_id != game.cur_ranks[i].open_id || send_ranks[i].completion != game.cur_ranks[i].completion){
                    is_change = true;
                    break;
                }
            }
        }
        if(is_change){
            game.cur_ranks = send_ranks;
            var completion = {
                type: 'FINISH',
                ranks: send_ranks
            };
            console.log(completion);
            for(var i = 0; i < ranks.length; i++){
                if (ranks[i].connected){
                    ranks[i].sendUTF(JSON.stringify(completion));
                }
            }
        }
    };
};

var by = function (name) {
    return function (o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a == b) {
                return 0;
            }
            if (typeof a == typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            throw("error");
        }
    }
};

