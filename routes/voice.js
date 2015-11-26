/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var fs = require('fs');
var define = require("../lib/define.js");

// 新增语义
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var voice_key = decodeURIComponent(req.body.voice_key);
            var action = req.body.action;
            var search_key = decodeURIComponent(req.body.search_key);
            //voice_key, action, search_key
            db.addVoiceDefine(voice_key, action, search_key, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取语义动作
exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var voice_key = req.params.voice_key;
            db.getVoiceDefine(voice_key, function (voice_define) {
                res.send(voice_define);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

