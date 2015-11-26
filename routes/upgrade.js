/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-29
 * Time: 下午3:33
 * To change this template use File | Settings | File Templates.
 */
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

// 新增升级记录
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            // 新增预注册表
            var platform = req.query.platform;
            var app_name = req.query.app_name;
            var app_path = req.query.app_path;
            var version = parseFloat(req.query.version);
            var content = req.query.content;
            db.addUpgrade(platform, app_name, app_path, version, content, function(err){
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

// 获取升级信息
exports.delVesion = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var platform = req.params.platform;
            var app_name = req.params.app_name;
            var version = parseFloat(req.params.version);
            db.delVersion(platform, app_name, version, function (err) {
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

// 获取升级信息
exports.info = function(req, res){
    var platform = req.params.platform;
    var app_name = req.params.app_name;
    db.getUpgrade(platform, app_name, function (upgrade) {
        res.send(upgrade);
    });
};

