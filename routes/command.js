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
    var device_id = req.query.device_id;
    var cmd_type = req.query.cmd_type;
    var params = req.query.params;
    params = eval("(" + params + ")");
    // 更新车辆参数
    var query_json = {"device_id": device_id};
    var update_json = {"params.is_response": false};

    //db.updateDeviceParamByID(device_id, param_option, function (row) {
    db.findAndUpdate(db.table_name_def.TAB_DEVICE, query_json, update_json, function(status, device){
        if (status == define.DB_STATUS_OK) {
            console.log("update vehicle reponse to 0 ok.");
            //console.log(vehicle);
            if (device.server_ip == undefined || device.server_ip == "") {
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                };
                res.send(result);
            } else {
                var create_json = util.getCreateJson(req.query, "");
                var table_name = 'command_' + device.server_ip;
                var schema = db.command;
                create_json.device_id = device.serial;
                create_json.cmd_type = cmd_type;
                create_json.mdt_name = device.hardware_version;
                create_json.protocol_ver = device.software_version;
                create_json.send_flag = define.SENDFLAG_READY;
                create_json.send_time = new Date();
                create_json.params = params;
                create_json.server_ip = device.server_ip;
                //db.saveCommand(device_id, cmd_type, params, function (err) {
                db.create3(table_name, schema, "command_id", create_json, false, null, null, false, null, null, function(status){
                    if (status == define.DB_STATUS_FAIL) {
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
            }
        } else {
            console.log("update vehicle reponse to 0 failed.");
            result = {
                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            };
            res.send(result);
        }
    });
};

// 2015-09-28 获取状态的函数
var getStatusFunc = function(device_id, get_time, res){
    var func = function(){
        var query_json = {"device_id": device_id};
        //db.getDevice(device_id, function(device){
        db.get(db.table_name_def.TAB_DEVICE, query_json, "params", function(device){
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
                        "status_code": define.API_STATUS_COMMAND_TIMEOUT,  //0 成功 >0 失败
                        "err_msg": "command timeout."
                    };
                    res.send(result);
                }
            }
        });
    };
    return func;
};