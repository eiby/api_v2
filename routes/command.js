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
var global_res;
var global_obj_id;
//var get_time = 1;

// 新增指令
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.body.device_id;
            var cmd_type = req.body.cmd_type;
            var params = req.body.params;
            //get_time = 1;
            var param_option = {"params.is_response": false};
            // 更新车辆参数
            db.updateDeviceParamByID(device_id, param_option, function (row) {
                if (row > 0) {
                    console.log("update vehicle reponse to 0 ok.");
                    db.saveCommand(device_id, cmd_type, params, function (err) {
                        if (err) {
                            result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                            };
                            res.send(result);
                        } else {
                            //global_res = res;
                            //global_obj_id = device_id;
                            //setTimeout(getStatus, 1000);
                            var get_time = 1;
                            var func = getStatusFunc(device_id, get_time, res);
                            setTimeout(func, 1000);
                        }
                    });
                } else {
                    console.log("update vehicle reponse to 0 failed.");
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

function getStatus(){
    db.getDevice(global_obj_id, function(device){
        if(device && typeof device.params.is_response != "undefined" && device.params.is_response){
            result = {
                "status_code": define.API_STATUS_OK  //0 成功 >0 失败
            };
            global_res.send(result);
        }else{
            if(get_time <= 10){
                setTimeout(getStatus, 1000);
                get_time++;
            }else{
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                };
                global_res.send(result);
            }
        }
    });
}

// 2015-09-28 获取状态的函数
var getStatusFunc = function(device_id, get_time, res){
    var func = function(){
        db.getDevice(device_id, function(device){
            if(device && typeof device.params.is_response != "undefined" && device.params.is_response){
                result = {
                    "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                };
                res.send(result);
            }else{
                if(get_time <= 10){
                    get_time++;
                    var func = getStatusFunc(device_id, get_time, res);
                    setTimeout(func, 1000);
                }else{
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            }
        });
    };
    return func;
};