/**
 * User: Administrator
 * Date: 12-9-29
 * Time: 下午4:58
 * send sms by gateway
 */
var define = require("./define.js");
var xmlreader = require("xmlreader");
var http = require("http");

exports.sendSMSByGateway = function(sim, tpl_id, code, callback){
    _sendSMSByGateway(sim, tpl_id, code, function(obj){
        var result;
        var resultObject = JSON.parse(obj);
        if (resultObject.error_code == 0) {
            result = {
                status_code:define.API_STATUS_OK
            };
        } else {
            result = {
                status_code:define.API_STATUS_EXCEPTION,
                err_msg:resultObject.reason
            };
        }
        callback(result);
    });
};

// 通过短信网关发送验证码
function _sendSMSByGateway(sim, tpl_id, code, callback){
    try{
        // TODO 通过调用沃管车服务器将发送指令写入实际发送服务器
        var path = '/sms/send?key=' + define.SMS_CDKEY +'&dtype=json&mobile=' + sim + '&tpl_id=' + tpl_id + '&tpl_value=%23code%23%3D' + code + '%26%23company%23%3D%E5%8F%AD%E5%8F%AD';
        //path = encodeURI(path);
        var options = {
            host:define.SMS_SERVER_HOST,
            port:define.SMS_SERVER_PORT,
            path:path,
            method:'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function(data) {
                responseString += data;
            });
            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
                if(callback){
                    callback(responseString);
                }
            });
        });

        req.on('error', function(e) {
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        req.end();
    }catch(e){
        var resultObject = {
            status_code: define.API_STATUS_EXCEPTION,
            content:e.toString()
        };
        if(callback){
            callback(resultObject);
        }
    }
}

exports.rcvSMSByGateway = function(callback){
    _rcvSMSByGateway(function(obj){
        var resultObject;
        if(typeof(obj.status_code) == "undefined"){
            resultObject = {
                status_code: define.API_STATUS_OK,
                content: obj.response
            };
        }else{
            resultObject = {
                status_code: define.API_STATUS_EXCEPTION,
                content:obj.content
            };
        }
        callback(resultObject);
    });
};

// 通过短信网关发送短信
function _rcvSMSByGateway(callback){
    try{
        // TODO 通过调用沃管车服务器将发送指令写入实际发送服务器
        var options = {
            host:define.SMS_SERVER_HOST,
            port:define.SMS_SERVER_PORT,
            path:'/sdkproxy/getmo.action?cdkey=' + define.SMS_CDKEY + '&password=' + define.SMS_PASSWORD,
            method:'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function(data) {
                responseString += data;
            });
            res.on('end', function() {
                xmlreader.read(responseString, function(errors, response){
                    if(null !== errors ){
                        console.log(errors)
                        var resultObject = {
                            status_code: define.API_STATUS_EXCEPTION,
                            content:errors
                        };
                        if(callback){
                            callback(resultObject);
                        }
                        return;
                    }else{
                        if(callback){
                            callback(response);
                        }
                    }
                });

            });
        });

        req.on('error', function(e) {
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        req.end();
    }catch(e){
        var resultObject = {
            status_code: define.API_STATUS_EXCEPTION,
            content:e.toString()
        };
        if(callback){
            callback(resultObject);
        }
    }
}

