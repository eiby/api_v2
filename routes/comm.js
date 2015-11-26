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
var revise = require("../lib/revise.js");

exports.pushMessage = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
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
        } else {
            util.resSendNoRight(res);
        }
    });
};

//极光推送
function _sendJPush(cust_id, msg_type, message, lon, lat, obj_id, reminder_id, callback) {
    var jpushClient = jpush.build({appkey: "51ccb6294c18a0979cc10240", masterSecret: "7de743e26f6a9b71a14b8ac3"});
    db.getNewID("message", function (send_no) {
        var body = {};

        body.alert = message;
        body.platform = "all";

        body.android = {};
        //body.android.alert = message;
        //body.android.title = "叭叭";
        body.android.extras = {
            msg_type: msg_type
        };

        body.ios = {};
        //body.ios.alert = message;
        body.ios.sound = "default";
        body.ios.badge = 1;
        body.ios.extras = {
            msg_type: msg_type
        };

        var jpushOpitons = {};
        jpushOpitons.options = {};
        jpushOpitons.options.sendno = send_no;
        jpushOpitons.options.apns_production = false;

        jpushOpitons.audience = {
            "tag": [cust_id.toString()]
        };
        //信息不为空才发送
        if (message != "") {
            jpushClient.pushNotification(body, jpushOpitons, function (err, result) {
                var send_time = new Date();
                db.addSystemRelation(cust_id, 4, msg_type, message, send_time, function (err) {
                    db.saveNotification(cust_id, msg_type, message, lon, lat, obj_id, reminder_id, send_time);
                });
                callback(result);
            });
        }
        //});
    });
}

//极光推送
function _sendJPushChat(cust_id, cust_name, msg_type, message, url, friend_id, voice_len, lon, lat, address, callback) {
    var jpushClient = jpush.build({appkey: "51ccb6294c18a0979cc10240", masterSecret: "7de743e26f6a9b71a14b8ac3"});
    db.getNewID("message", function (send_no) {
        var body = {};
        var msg = "";
        switch (msg_type) {
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
            msg: msg,
            msg_type: msg_type,
            url: url,
            friend_id: friend_id,
            cust_name: cust_name,
            voice_len: voice_len,
            lon: lon,
            lat: lat,
            address: address
        };

        body.ios = {};
        body.ios.sound = "default";
        body.ios.badge = 1;
        body.ios.extras = {
            msg: msg,
            msg_type: msg_type,
            url: url,
            friend_id: friend_id,
            cust_name: cust_name,
            voice_len: voice_len,
            lon: lon,
            lat: lat,
            address: address
        };

        var jpushOpitons = {};
        jpushOpitons.options = {};
        jpushOpitons.options.sendno = send_no;
        jpushOpitons.options.apns_production = false;

        jpushOpitons.audience = {
            "tag": [cust_id.toString()]
        };
        //信息不为空才发送
        if (msg != "") {
            jpushClient.pushNotification(body, jpushOpitons, function (err, result) {
                callback(err, result);
            });
        } else {
            callback(null, null);
        }
    });
}

exports.sendJPush = _sendJPush;

// 获取验证码并向指定手机发送
exports.validCode = function (req, res) {
    var valid_type = req.query.valid_type;
    var valid_code = req.query.valid_code;
    var mobile = req.query.mobile;
    var email = req.query.email;

    db.ifValidCodeValid(mobile, email, valid_type, valid_code, function (valid) {
        var result = {
            "valid": valid
        };
        res.send(result);
    });
};

// 获取验证码并向指定手机发送
exports.sendSMS = function (req, res) {
    var mobile = req.query.mobile;
    var type = req.query.type;
    var valid_code = parseInt(Math.random() * 7000) + 3000;
    var tpl_id = 2;
    if (type == define.SMSTYPE_BIND_MOBILE) {
        tpl_id = 2;
    } else if (type == define.SMSTYPE_FORGOT_PASSWORD) {
        tpl_id = 7;
    }
    sms.sendSMSByGateway(mobile, tpl_id, valid_code, function (obj) {
        if (obj.status_code == 0) {
            db.saveValidCode(mobile, "", 1, valid_code, function(err){
                if(!err){
                    var result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }else{
                    console.log(obj);
                    result = {
                        "status_code": define.API_STATUS_EXCEPTION,  //0 成功 >0 失败
                        "err_msg": "database error"
                    };
                    res.send(result);
                }
            });
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
exports.sendEmail = function (req, res) {
    var email = req.query.email;
    var type = req.query.type;
    var valid_code = parseInt(Math.random() * 7000) + 3000;
    var message = "您的验证码" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";
    if (type == define.SMSTYPE_BIND_MOBILE) {
        message = "您的验证码" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";
    } else if (type == define.SMSTYPE_FORGOT_PASSWORD) {
        message = "正在找回密码，您的验证码是" + valid_code + "。如非本人操作，请忽略本邮件【叭叭】";
    }
    mailer.sendMail("service_noreply@bibibaba.cn", email, "叭叭校验通知邮件", message, message, function (error, response) {
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

exports.sendChatMsg = function (req, res) {
    //user_id, friend_id, sender_id, receiver_id, type, url, content,
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            var cust_name = decodeURIComponent(req.body.cust_name);
            var friend_id = parseInt(req.body.friend_id);
            var type = parseInt(req.body.type);  //0:文本  1:图片  2:语音 3：文件 4:位置
            var voice_len = parseInt(req.body.voice_len); //语音长度
            var lon = 0;
            var lat = 0;
            if (req.body.lon == undefined) {
                lon = 0;
            } else {
                lon = parseFloat(req.body.lon);
            }
            if (req.body.lat == undefined) {
                lat = 0;
            } else {
                lat = parseFloat(req.body.lat);
            }
            var address = decodeURIComponent(req.body.address);
            var url = req.body.url;
            var content = decodeURIComponent(req.body.content);
            _sendJPushChat(friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, address, function (err, ret) {
                console.log(ret);
                db.sendChatMsg(user_id, friend_id, type, url, content, voice_len, lon, lat, address, function (err, chat_id) {
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
                    res.send(result);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

var _sendChatMsg = function (friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, callback) {
    _sendJPushChat(friend_id, cust_name, type, content, url, user_id, voice_len, lon, lat, "", function (err, ret) {
        console.log(ret);
        db.sendChatMsg(user_id, friend_id, type, url, content, voice_len, lon, lat, "", function (err, chat_id) {
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
exports.getChatMsgList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            //user_id, friend_id, max_id, min_id, update_time,
            var user_id = req.params.cust_id;
            var friend_id = req.query.friend_id;
            var min_id = req.query.min_id;
            if (typeof min_id == "undefined") {
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            }
            var update_time = new Date(req.query.update_time);
            db.getChatMsgList(user_id, friend_id, min_id, max_id, update_time, function (docs) {
                res.send(docs);
                db.clearRelationCount(user_id, friend_id, function (err) {

                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 获取关系列表
exports.getRelationList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            //user_id, friend_id, max_id, min_id, update_time,
            var user_id = req.params.cust_id;
            db.getRelationList(user_id, function (docs) {
                res.send(docs);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 发起好友请求
exports.sendFriendRequest = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
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
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 验证好友请求
exports.authFriendRequest = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.body.friend_id);
            var status = parseInt(req.body.status);
            db.authFriend(user_id, friend_id, status, function (err, request_id) {
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
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 删除好友
exports.deleteFriend = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
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
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 获取我加好友请求
exports.getMyRequestList = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            db.getMyRequestList(user_id, function (docs) {
                res.send(docs);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 获取我加好友请求
exports.getFriendRequestList = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            db.getFriendRequestList(user_id, function (docs) {
                res.send(docs);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 获取好友列表
exports.getFriendList = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            var friend_type = parseInt(req.query.friend_type);
            if (isNaN(friend_type)) {
                friend_type = 1;
            }
            db.getFriendList2(user_id, friend_type, function (docs) {
                res.send(docs);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 发起好友请求
exports.updateFriendRights = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.params.friend_id);
            var rights = [];
            if (typeof req.body.rights != "object") {
                rights = eval("(" + req.body.rights + ")");
            } else {
                rights = req.body.rights;
            }
            db.updateFriendRights(user_id, friend_id, rights, function (err, row) {
                var result;
                if (row == 0) {
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
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 获取我加好友请求
exports.getFriendRights = function (req, res) {
    //user_id, friend_id
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var user_id = parseInt(req.params.cust_id);
            var friend_id = parseInt(req.params.friend_id);
            db.getFriendRights(user_id, friend_id, function (docs) {
                res.send(docs);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 服务器汇总信息
exports.total = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            var total = {
                customer_total: 1,
                vehicle_total: 3,
                unread_message: 4,
                alert_total: 3,
                fault_total: 5,
                overdue_total: 1
            };
            res.send(total);
//            db.getCustomer(cust_id, function(customer){
//                res.send(customer);
//            });
//            db.getFriendList2(cust_id, 1, function(customers){
//                total.customer_total = customers.length;
//                var cust_ids= [];
//                for(var i = 0; i < customers.length; i++){
//                    cust_ids.push(customers[i].friend_id);
//                }
//                db.getCustomerCounter(cust_ids, function(vehicle_total){
//                    total.vehicle_total = vehicle_total;
//                    db.getCustomerNotificationCount()
//                })
//            });
        } else {
            util.resSendNoRight(res);
        }
    });
};



