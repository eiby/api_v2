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

// 新增提醒
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, remind_type, obj_id, mileage, remind_way, repeat_type, content, remind_time
            var cust_id = parseInt(req.body.cust_id);
            var remind_type = parseInt(req.body.remind_type);
            var obj_id = parseInt(req.body.obj_id);
            var mileage = parseInt(req.body.mileage);
            var remind_way = parseInt(req.body.remind_way);
            var repeat_type = parseInt(req.body.repeat_type);
            var content = decodeURIComponent(req.body.content);
            var remind_time = new Date(req.body.remind_time);
            db.addReminder(cust_id, remind_type, obj_id, mileage, remind_way, repeat_type, content, remind_time, function(err, reminder_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "reminder_id": reminder_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 修改提醒
exports.edit = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //reminder_id, remind_type, obj_id, mileage, remind_way, repeat_type, content, remind_time
            var reminder_id = parseInt(req.params.reminder_id);
            var remind_type = parseInt(req.body.remind_type);
            var obj_id = parseInt(req.body.obj_id);
            var mileage = parseInt(req.body.mileage);
            var remind_way = parseInt(req.body.remind_way);
            var repeat_type = parseInt(req.body.repeat_type);
            var content = decodeURIComponent(req.body.content);
            var remind_time = new Date(req.body.remind_time);
            db.updateReminder(reminder_id, remind_type, obj_id, mileage, remind_way, repeat_type, content, remind_time, function(row){
                if(row > 0){
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 删除提醒
exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //reminder_id, remind_type, obj_id, mileage, remind_way, repeat_type, content, remind_time
            var reminder_id = req.params.reminder_id;
            db.deleteReminder(reminder_id, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 提醒列表
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getReminderList(cust_id, min_id, max_id, function(docs){
                var obj_ids = [];
                for(var i = 0; i < docs.length; i++){
                    if(docs[i].remind_type == 2 && docs[i].obj_id > 0){
                        obj_ids.push(docs[i].obj_id);
                    }
                }
                db.getVehicles(obj_ids, function(vehicles){
                    for(var i = 0; i < docs.length; i++){
                        for(var j = 0; j < vehicles.length; j++){
                            if(docs[i].remind_type == 2 && docs[i].obj_id > 0 && docs[i].obj_id == vehicles[j].obj_id){
                                docs[i].cur_mileage = parseInt(vehicles[j].active_gps_data.mileage);
                                break;
                            }
                        }
                    }
                    res.send(docs);
                });
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var reminder_id = req.params.reminder_id;
            db.getReminder(reminder_id, function(reminder){
                res.send(reminder);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};