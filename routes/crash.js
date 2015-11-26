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
var define = require("../lib/define.js");

// 新增出错记录
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var app_name = req.body.app_name;
            var version = req.body.version;
            var report = req.body.report;
            var user_name = req.body.user_name;
            db.addCrash(app_name, version, report, user_name, function(err){
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
