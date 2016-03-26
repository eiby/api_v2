/*
 * GET home page.
 */
var http = require("http");
var util = require("../lib/myutil.js");
var file = require("./file");
var define = require("../lib/define.js");
var config = require("../lib/config.js");
var db = require("../lib/db.js");

var apiPath = config.api.url;
var map = config.router.map;

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        if(k != 'sign'){
            string += k + newArgs[k];
        }
    }
    return string;
};

// 产生url后面的拼接字符串
var raw2 = function (args) {
    var string = '';
    for (var k in args) {
        if(k != 'sign' && k != 'method' && k != 'timestamp' && k != 'app_key' && k != 'v' && k != 'sign_method'){
            string += '&' + k + '=' + args[k];
        }
    }
    string = string.substr(1);
    return string;
};

// rest入口接口
// 功能: APP Key校验, 签名校验, 流量控制, 日志记录, 版本判断, 缓存控制(memcache), 权限控制, 黑白名单
// app_key: 9410bc1cbfa8f44ee5f8a331ba8dd3fc
// app_secret: 21fb644e20c93b72773bf0f8d0905052
exports.rest = function(req, res){
    var method = req.query.method;        //方法名称
    var timestamp = req.query.timestamp;  //时间戳yyyy-mm-dd hh:nn:ss
    var format = req.query.format;        //返回数据格式
    var app_key = req.query.app_key;      //app key
    var v = req.query.v;                  //接口版本
    var sign = req.query.sign;            //签名
    var sign_method = req.query.sign_method;   //签名方式
    var access_token = req.query.access_token; //access_token
    var fields = req.query.fields;             //需要返回的字段
    // 验证app_key是否正确, 否则返回错误信息
    //db.getApp(app_key, function(app){
    var query_json = {"app_key": app_key};
    db.get(db.table_name_def.TAB_APP, query_json, "app_id,app_secret", function (app) {
       if(!app){
           var resultObject = {
               status_code: define.API_STATUS_INVALID_APPKEY,
               err_msg:"invalid app key"
           };
           res.send(resultObject);
       }else{
           // 获取app_secret
           var app_secret = app.app_secret;
           // 流量控制
           // 日志记录
           // 缓存控制
           // 权限控制
           // 签名验证
           if(sign_method == "md5"){
               var e = app_secret + encodeURI(raw(req.query)) + app_secret;
               var s = util.md5(e);
               s = s.toUpperCase(); //把签名转化为大写
               if(sign == s) {
                   if(v == "1.0"){
                       var map_url = map[method];
                       if(map_url && map_url != undefined && map_url != ""){
                           var params = raw2(req.query);
                           if(method == 'wicare.user.access_token' || method == 'wicare.user.login' || method == "wicare.user.sso_login" || method == "wicare.crash.create"){
                               params = params + "&app_key=" + app_key;
                           }

                           if(method == "wicare.file.upload"){
                               file.upload(req, res);
                           }else{
                               var path = apiPath + map_url + "?" + params;
                               util._get(path, function (obj) {
                                   res.send(obj);
                               });
                           }
                       }else{
                           var resultObject = {
                               status_code: define.API_STATUS_INVALID_METHOD,
                               err_msg:"invalid method"
                           };
                           res.send(resultObject);
                       }
                   }else{
                       var resultObject = {
                           status_code: define.API_STATUS_INVALID_VERSION,
                           err_msg:"invalid version"
                       };
                       res.send(resultObject);
                   }
               }else{
                   var resultObject = {
                       status_code: define.API_STATUS_INVALID_SIGN,
                       err_msg:"invalid sign"
                   };
                   res.send(resultObject);
               }
           }
       }
    });
};