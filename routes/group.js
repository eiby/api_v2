/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-20
 * Time: 下午3:56
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var jpush = require("jpush");
var sms = require("../lib/sms.js");
var mailer = require("../lib/mailer.js");

//创建聊天群组
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var group_name = decodeURIComponent(req.body.group_name);

            //cust_name, cust_type, sex, birth, province, city, car_brand, car_series, service_type, qq_login_id, sina_login_id, logo, remark
            db.register(mobile, email, password, cust_name, cust_type, sex, birth, province, city, car_brand, car_series, service_type, qq_login_id, sina_login_id, logo, remark, function (err, cust_id) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK,  //0 成功 >0 失败
                        "cust_id": cust_id
                    }
                }
                _sendChatMsg(cust_id, "叭叭小秘", 0, "您好，我是叭叭小秘，感谢您使用叭叭，以后使用过程中出现任何问题或您有任何建议，都可以通过私信跟我联系！", "", 11, 0, 0, 0, function(obj){
                    console.log(obj);
                });
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.tempId = function(req, res){
    db.getNewID("customer", function(cust_id){
        var result = {
            temp_cust_id: cust_id
        };
        res.send(result);
    });
};

//type 0:注册用户 1:注册车俩 2:修改车辆(obj_id) 3:绑定终端(obj_id) 4:通知 5:问答 6:私信

exports.tips = function(req, res){
    var tips = [];
    var tip = {};
    var auth_code = req.query.auth_code;
    if(auth_code == undefined || auth_code == ""){
        tip = {
            content: "温馨提示：亲，想享受更多贴心功能吗？注册用户吧！",
            type: 0
        };
        tips.push(tip);
        res.send(tips);
    }else {
        db.ifAuthCodeValid(auth_code, function (valid) {
            if (valid) {
                var cust_id = req.params.cust_id;
                // 获取车辆信息
                db.getCustomerVehicleList(cust_id, function(vehicles){
                    if(vehicles){
                        if(vehicles.length > 0 && (vehicles[0].device_id == 0 || vehicles[0].device_id == undefined)) {
                            tip = {
                                content: "温馨提示：亲，您了解您爱车的健康状况吗，请立即绑定终端进行车辆体检吧！",
                                type: 3,
                                obj_id: vehicles[0].obj_id
                            };
                            tips.push(tip);
                        }
                        if(vehicles.length > 0 && (vehicles[0].vio_citys.length == 0 || vehicles[0].frame_no == "" || vehicles[0].reg_no == "")) {
                            tip = {
                                content: "温馨提示：亲，知道您的爱车今天违章了吗？，设置一下，违章情况主动推送！",
                                type: 2,
                                obj_id: vehicles[0].obj_id
                            };
                            tips.push(tip);
                        }
                    }else{
                        tip = {
                            content: "温馨提示：亲，知道您的爱车今天违章了吗？，立即添加爱车，违章情况主动推送！",
                            type: 1
                        };
                        tips.push(tip);

                    }

                    db.getCustomer(cust_id, function(customer){
                        // 获取未读通知
                        if(customer.noti_count > 0){
                            tip = {
                                content: "温馨提示：您有" + customer.noti_count +   "条未读通知。",
                                type: 4
                            };
                            tips.push(tip);
                        }

                        // 获取未读问答
                        if(customer.answer_count > 0){
                            tip = {
                                content: "温馨提示：您有" + customer.answer_count +   "条未读回答。",
                                type: 5
                            };
                            tips.push(tip);
                        }
                        // 获取未读私信
                        if(customer.private_count > 0){
                            tip = {
                                content: "温馨提示：您有" + customer.private_count +   "条未读私信。",
                                type: 6
                            };
                            tips.push(tip);
                        }
                        res.send(tips);
                    })
                });
            } else {
                util.resSendNoRight(res);
            }
        });
    }
};

exports.bindQQLogin = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            var qq_login_id = req.body.qq_login_id;
            db.updateCustomerQQLogin(cust_id, qq_login_id, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.bindSinaLogin = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            var sina_login_id = req.body.sina_login_id;
            db.updateCustomerSinaLogin(cust_id, sina_login_id, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerVehicleList(cust_id, function (vehicles) {
                res.send(vehicles);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.deviceList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerDeviceList(cust_id, function (devices) {
                res.send(devices);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            db.getCustomer(cust_id, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.search = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var account = req.query.account;
            db.getCustomerByMobileOrMail(account, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.counter = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            db.getCustomerCounter(cust_id, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.notification = function(req, res){
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
            var msg_type = req.query.msg_type;
            if(typeof  msg_type == "undefined"){
                msg_type = -1;
            }

            db.getCustomerNotification(cust_id, min_id, max_id, msg_type, function (docs) {
                res.send(docs);
                // 将未读通知数更新为0
                db.clearRelationCount(cust_id, 4, function(err){

                });
            });

            // 获取提醒消息时，将未读消息数更新为0
            db.updateCustomerNotiReaded(cust_id, 0, function(row){
                if(row > 0){
                    console.log("update customer noti unread to 0!");
                }
            });


        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.edit = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var id_card_type = req.body.id_card_type;
            var contacts = decodeURIComponent(req.body.contacts);
            var address = decodeURIComponent(req.body.address);
            var tel = req.body.tel;

            db.updateCustomer(cust_id, id_card_type, contacts, address, tel, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.editField = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var field_name = req.body.field_name;
            var field_type = req.body.field_type; //String, Number, Date
            var field_value = decodeURIComponent(req.body.field_value);
            if(field_type == "Date"){
                field_type = new Date(field_value);
            }

            db.updateCustomerField(cust_id, field_name, field_value, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.updateInspectDate = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var annual_inspect_date = new Date(req.body.annual_inspect_date);
            var change_date = new Date(req.body.change_date);

            db.updateCustomerInspectDate(cust_id, annual_inspect_date, change_date, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.updatePush = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var if_vio_noti = req.body.if_vio_noti;
            var if_fault_noti = req.body.if_fault_noti;
            var if_alert_noti = req.body.if_alert_noti;
            var if_event_noti = req.body.if_event_noti;

            db.updateCustomerPush(cust_id, if_vio_noti, if_fault_noti, if_alert_noti, if_event_noti, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cust_id = req.params.cust_id;
            db.deleteCustomer(cust_id, function (err) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getIP = function(req, res){
    result = {
        "ip": req.ip  //0 成功 >0 失败
    };
    res.send(result);
};

exports.restart = function(req, res){
    process.exit(0);
};

exports.pushMessage = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = parseInt(req.query.cust_id);
            var msg_type = parseInt(req.query.msg_type);
            var msg = req.query.msg;
            var lon = parseFloat(req.query.lon);
            var lat = parseFloat(req.query.lat);
            var obj_id = parseInt(req.query.obj_id);
            _sendJPush(cust_id, msg_type, msg, lon, lat, obj_id, 0, function (result) {
                console.log(result);
            });
            result = {
                "status_code": define.API_STATUS_OK  //0 成功 >0 失败
            };
            res.send(result);
        }else{
            util.resSendNoRight(res);
        }
    });
};

//极光推送
function _sendJPush(cust_id, msg_type, message, lon, lat, obj_id, reminder_id, callback){
    var jpushClient = jpush.build({appkey: "51ccb6294c18a0979cc10240", masterSecret: "7de743e26f6a9b71a14b8ac3"});
    db.getNewID("message", function(send_no){
            var body = {};

            body.alert = message;
            body.platform = "all";

            body.android = {};
            //body.android.alert = message;
            //body.android.title = "叭叭";
            body.android.extras = {
                msg_type:msg_type
            };

            body.ios = {};
            //body.ios.alert = message;
            body.ios.sound = "default";
            body.ios.badge = 1;
            body.ios.extras = {
                msg_type:msg_type
            };

            var jpushOpitons = {};
            jpushOpitons.options = {};
            jpushOpitons.options.sendno = send_no;
            jpushOpitons.options.apns_production = false;

            jpushOpitons.audience = {
                "tag" : [cust_id.toString()]
            };
            //信息不为空才发送
            if (message != "") {
                jpushClient.pushNotification(body, jpushOpitons, function (err, result) {
                    var send_time = new Date();
                    db.addSystemRelation(cust_id, 4, msg_type, message, send_time, function(err){
                        db.saveNotification(cust_id, msg_type, message, lon, lat, obj_id, reminder_id, send_time);
                    });
                    callback(result);
                });
            }
        //});
    });
}

//极光推送
function _sendJPushChat(cust_id, cust_name, msg_type, message, url, friend_id, voice_len, lon, lat, address, callback){
    var jpushClient = jpush.build({appkey: "51ccb6294c18a0979cc10240", masterSecret: "7de743e26f6a9b71a14b8ac3"});
    db.getNewID("message", function(send_no){
        var body = {};
        var msg = "";
        switch (msg_type){
            case 0:
                msg = message;
                break;
            case 1:
                msg = "[图片]";
                break;
            case 2:
                msg = "[语音]";
                break;
            case 3:
                msg = "[文件]";
                break;
            case 4:
                msg = "[位置]";
                break;
            default:
                msg = message;
                break;
        }
//        body.alert = msg;
        body.alert = "";
        body.platform = "all";

        body.android = {};
        body.android.extras = {
            msg:msg,
            msg_type:msg_type,
            url: url,
            friend_id: friend_id,
            cust_name: cust_name,
            voice_len: voice_len,
            lon:lon,
            lat:lat,
            address:address
        };

        body.ios = {};
        body.ios.sound = "default";
        body.ios.badge = 1;
        body.ios.extras = {
            msg:msg,
            msg_type:msg_type,
            url: url,
            friend_id: friend_id,
            cust_name: cust_name,
            voice_len: voice_len,
            lon:lon,
            lat:lat,
            address:address
        };

        var jpushOpitons = {};
        jpushOpitons.options = {};
        jpushOpitons.options.sendno = send_no;
        jpushOpitons.options.apns_production = false;

        jpushOpitons.audience = {
            "tag" : [cust_id.toString()]
        };
        //信息不为空才发送
        if (msg != "") {
            jpushClient.pushNotification(body, jpushOpitons, function (err, result) {
                callback(err, result);
            });
        }else{
            callback(null, null);
        }
    });
}

exports.sendJPush = _sendJPush;

// 获取验证码并向指定手机发送
exports.getValidCodeAndSendSMS = function(req, res){
    var mobile = req.query.mobile;
    var type = req.query.type;
    var valid_code = parseInt(Math.random() * 7000) + 3000;
    var tpl_id = 2;
    if(type == define.SMSTYPE_BIND_MOBILE){
        tpl_id = 2;
    }else if(type == define.SMSTYPE_FORGOT_PASSWORD){
        tpl_id = 7;
    }
    sms.sendSMSByGateway(mobile, tpl_id, valid_code, function (obj) {
        if (obj.status_code == 0) {
            db.saveMessage(0, mobile, "", "验证码：" + valid_code, 0, 2, "", 0);
            var result = {
                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                "valid_code": valid_code
            };
            res.send(result);
        } else {
            console.log(obj);
            result = {
                "status_code": define.API_STATUS_EXCEPTION,  //0 成功 >0 失败
                "err_msg": obj.err_msg
            };
            res.send(result);
        }
    });
};

// 获取验证码并向指定Email发送
exports.getValidCodeAndSendEmail = function(req, res){
    var email = req.query.email;
    var type = req.query.type;
    var valid_code = parseInt(Math.random() * 7000) + 3000;
    var message = "您的验证码" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";
    if(type == define.SMSTYPE_BIND_MOBILE){
        message = "您的验证码" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";
    }else if(type == define.SMSTYPE_FORGOT_PASSWORD){
        message = "正在找回密码，您的验证码是" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";;
    }
    mailer.sendMail("service_noreply@wisegps.cn", email, "叭叭校验通知邮件", message, message, function (error, response) {
        if (!error) {
            db.saveMessage(0, email, "", "验证码：" + valid_code, 0, 2, "", 0);
            var result = {
                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                "valid_code": valid_code
            };
            res.send(result);
        } else {
            result = {
                "status_code": define.API_STATUS_EXCEPTION,  //0 成功 >0 失败
                "err_msg": response
            };
            res.send(result);
        }
    });
};

exports.exists = function(req, res){
    var query_type = parseInt(req.query.query_type);
    var value = req.query.value;
    db.exists(query_type, value, function (err, count) {
        var exist = count > 0;
        var result = {
            "exist": exist
        };
        res.send(result);
    });
};

exports.sendChatMsg = function(req, res){
    //user_id, friend_id, sender_id, receiver_id, type, url, content,
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            var cust_name = decodeURIComponent(req.body.cust_name);
            var friend_id = parseInt(req.body.friend_id);
            var type = parseInt(req.body.type);  //0:文本  1:图片  2:语音 3：文件 4:位置
            var voice_len = parseInt(req.body.voice_len); //语音长度
            var lon = 0;
            var lat = 0;
            if(req.body.lon == undefined){
                lon = 0;
            }else {
                lon = parseFloat(req.body.lon);
            }
            if(req.body.lat == undefined){
                lat = 0;
            }else{
                lat = parseFloat(req.body.lat);
            }
            var address = decodeURIComponent(req.body.address);
            var url = req.body.url;
            var content = decodeURIComponent(req.body.content);
            _sendJPushChat(friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, address, function (err, ret) {
                console.log(ret);
                db.sendChatMsg(user_id, friend_id, type, url, content, voice_len, lon, lat, address, function(err, chat_id){
                    var result;
                    if(err){
                        result = {
                            "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        };
                    }else{
                        result = {
                            "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                            "chat_id": chat_id
                        };
                    }
                    res.send(result);
                });
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

var _sendChatMsg = function(friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, callback) {
    _sendJPushChat(friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, function (err, ret) {
        console.log(ret);
        db.sendChatMsg(user_id, friend_id, type, url, content, voice_len, lon, lat, function (err, chat_id) {
            var result;
            if (err) {
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                };
            } else {
                result = {
                    "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                    "chat_id": chat_id
                };
            }
            callback(result);
        });
    });
};

exports._sendChatMsg = _sendChatMsg;

// 获取私信列表
exports.getChatMsgList = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //user_id, friend_id, max_id, min_id, update_time,
            var user_id = req.params.cust_id;
            var friend_id = req.query.friend_id;
            var min_id = req.query.min_id;
            if(typeof min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof max_id == "undefined"){
                max_id = 0;
            }
            var update_time = new Date(req.query.update_time);
            db.getChatMsgList(user_id, friend_id, min_id, max_id, update_time, function(docs){
                res.send(docs);
                db.clearRelationCount(user_id, friend_id, function(err){

                });
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取关系列表
exports.getRelationList = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //user_id, friend_id, max_id, min_id, update_time,
            var user_id = req.params.cust_id;
            db.getRelationList(user_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 发起好友请求
exports.sendFriendRequest = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.body.friend_id);
            var cust_name = decodeURIComponent(req.body.cust_name);
            db.addFriendRequest(user_id, friend_id, cust_name, function (err, request_id) {
                var result;
                if (err) {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                } else {
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "request_id": request_id
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 验证好友请求
exports.authFriendRequest = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.body.friend_id);
            var status = parseInt(req.body.status);
            db.authFriend(user_id, friend_id, status, function(err, request_id){
                var result;
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "request_id": request_id
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 删除好友
exports.deleteFriend = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.params.friend_id);
            db.deleteFriend(user_id, friend_id, function (err) {
                var result;
                if (err) {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                } else {
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};


// 获取我加好友请求
exports.getMyRequestList = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            db.getMyRequestList(user_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取我加好友请求
exports.getFriendRequestList = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            db.getFriendRequestList(user_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取我加好友请求
exports.getFriendList = function(req, res){
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_id = parseInt(req.params.cust_id);
            db.getFriendList(user_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

