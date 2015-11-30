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
var revise = require("../lib/revise.js");

//获取全局令牌
exports.token = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var app_key = req.query.app_key;
    db.getCustomerByMobileOrMail(account, function (customer) {
        if (customer) {
            if (customer.password == password) {
                db.getApp(app_key, function (app) {
                    if (!app) {
                        result = {
                            "status_code": define.API_STATUS_INVALID_APPKEY  //错误APPkey
                        };
                        res.send(result);
                    } else {
                        var timestamp = new Date();
                        timestamp = Date.parse(timestamp);
                        var access_token = util.encodeAES(app.app_secret + "," + customer.cust_id + "," + app.app_secret + ",bibibaba");
                        db.saveAuthCode(access_token, function (err, valid_time) {
                            result = {
                                "status_code": define.API_STATUS_OK, //0 成功 >0失败
                                "access_token": access_token,
                                "valid_time": valid_time
                            };
                            res.send(result);
                        });
                    }
                });
            } else {
                result = {
                    "status_code": define.API_STATUS_WRONG_PASSWORD  //密码错误
                };
                res.send(result);
            }
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_USER  //用户不存在
            };
            res.send(result);
        }
    });
};

//使用注册用户登陆
exports.login = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var app_key = req.query.app_key;
    db.getCustomerByMobileOrMail(account, function (customer) {
        if (customer) {
            if (customer.password == password) {
                db.getApp(app_key, function (app) {
                    if (!app) {
                        result = {
                            "status_code": define.API_STATUS_INVALID_APPKEY  //错误APPkey
                        };
                        res.send(result);
                    } else {
                        var timestamp = new Date();
                        timestamp = Date.parse(timestamp);
                        var access_token = util.encodeAES(app.app_secret + "," + customer.cust_id + "," + app.app_secret + ",bibibaba");
                        db.saveAuthCode(access_token, function (err, valid_time) {
                            result = {
                                "status_code": define.API_STATUS_OK, //0 成功 >0失败
                                "cust_type": customer.cust_type,
                                "cust_id": customer.cust_id,
                                "cust_name": customer.cust_name,
                                "tree_path": customer.tree_path,
                                "access_token": access_token,
                                "valid_time": valid_time
                            };
                            res.send(result);
                        });
                    }
                });
            } else {
                result = {
                    "status_code":define.API_STATUS_WRONG_PASSWORD  //密码错误
                };
                res.send(result);
            }
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_USER  //用户不存在
            };
            res.send(result);
        }
    });
};

// 用户注册
exports.register = function(req, res){
    var mobile = req.query.mobile;  //手机
    var email = req.query.email;    //邮箱
    var password = req.query.password;  //加密密码
    var valid_type = parseInt(req.query.valid_type);
    var valid_code = req.query.valid_code;

    db.ifValidCodeValid(mobile, email, valid_type, valid_code, function (valid) {
        if(!valid){
            result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        }else{
            db.register(mobile, email, password, function (err, cust_id) {
                if (err) {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "cust_id": cust_id
                    }
                }
                res.send(result);
            });
        }
    });

};

// 创建新的客户
exports.new = function (req, res) {
    //    mode: 创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
    //    parent_cust_id: 商户ID, 如果没有默认为0
    //    cust_type: 用户类型 1:车主 2:商户
    //    cust_name: 用户名称
    //    mobile: 手机
    //    obj_name: 车牌号
    //    frame_no: 车架号
    //    car_brand_id: 品牌ID
    //    car_brand: 品牌
    //    car_series_id: 车系ID
    //    car_series: 车系
    //    car_type_id: 车款ID
    //    car_type: 车款
    //    mileage: 行驶里程
    //    if_arrive: 是否到店, 1则需要传入到店类型和备注, 0则不需要
    //    business_type: 业务类型
    //    business_content: 业务内容
    var mode = req.query.mode;
    var parent_cust_id = req.query.parent_cust_id;
    var cust_type = req.query.cust_type;
    var cust_name = req.query.cust_name;
    var mobile = req.query.mobile;
    var obj_name = req.query.obj_name;
    var frame_no = req.query.frame_no;
    var car_brand = req.query.car_brand;
    var car_series = req.query.car_series;
    var car_type = req.query.car_type;
    var car_brand_id = parseInt(req.query.car_brand_id);
    var car_series_id = parseInt(req.query.car_series_id);
    var car_type_id = parseInt(req.query.car_type_id);
    var mileage = parseInt(req.query.mileage);
    var if_arrive = parseInt(req.query.if_arrive);
    var business_type = parseInt(req.query.business_type);
    var business_content = req.query.business_content;

    if (mode == 1) {
        db.addCustomer(cust_type, cust_name, mobile, parent_cust_id, function (err, cust_id) {
            if (err) {
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                };
                res.send(result);
            } else {
                result = {
                    "status_code": define.API_STATUS_OK, //0 成功 >0 失
                    "cust_id": cust_id
                };
                res.send(result);
            }
        });
    } else if (mode == 2) {
        db.addCustomer(cust_type, cust_name, mobile, parent_cust_id, function (err, cust_id) {
            if (err) {
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                };
                res.send(result);
            } else {
                db.addVehicle("", obj_name, cust_id, car_brand, car_series, car_type, car_brand_id, car_series_id,
                    car_type_id, frame_no, mileage, function (err, obj_id) {
                        if (err) {
                            result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                            };
                            res.send(result);
                        } else {
                            // 如果到店,则自动产生到店记录
                            if (if_arrive == 1) {
                                db.addBusiness(cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, function (err, busi_id) {
                                    result = {
                                        "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                        "cust_id": cust_id,
                                        "obj_id": obj_id,
                                        "business_id": busi_id
                                    };
                                    res.send(result);
                                });
                            } else {
                                result = {
                                    "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                    "cust_id": cust_id,
                                    "obj_id": obj_id
                                };
                                res.send(result);
                            }
                        }
                    });

            }
        });
    }
};

// 修改用户信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    var cust_id = req.query.cust_id;
    var json = util.getUpdateJson(req.query, "cust_id");

    db.updateCustomer(cust_id, json, function (row) {
        if (row == 0) {
            result = {
                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            }
        } else {
            result = {
                "status_code": define.API_STATUS_OK  //0 成功 >0 失败
            }
        }
        res.send(result);
    });
};

// 判断用户是否存在
// 参数:
//      query_type: 查询类型
//      value: 查询值
// 返回:
//      exist: 是否存在 true: 是 false: 否
exports.exists = function(req, res){
    var query_type = parseInt(req.query.query_type);
    var value = req.query.value;
    db.exists(query_type, value, function (err, count) {
        if(err){
            var result = {
                "status_code": define.API_STATUS_EXCEPTION,
                "err_msg": "invalid query type"
            };
            res.send(result);
        }else{
            var exist = count > 0;
            var result = {
                "exist": exist
            };
            res.send(result);
        }
    });
};

// 获取用户信息
// 参数:
//      cust_id: 用户ID
//      fields: 需要返回的字段
// 返回:
//      根据fields定义的字段返回
exports.get = function(req, res){
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function(valid){
        if(valid) {
            var s = util.decodeAES(access_token);
            var client_id = parseInt(s.split(",")[1]);
            var cust_id = parseInt(req.query.cust_id);
            if(client_id != cust_id){
                util.resSendNoRight(res);
            }else{
                var fields = req.query.fields;
                var arr = fields.split(",");
                var json = {};
                for (var i = 0; i < arr.length; i++) {
                    json[arr[i]] = 1;
                }
                db.getCustomer(cust_id, json, function (customer) {
                    res.send(customer);
                });
            }
        }else{
            util.resSendNoRight(res);
        }
    });
};

//重置密码
exports.resetPassword = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var valid_type = parseInt(req.query.valid_type);
    var valid_code = req.query.valid_code;

    db.ifValidCodeValid(account, account, valid_type, valid_code, function (valid) {
        if (!valid) {
            var result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        } else {
            db.getCustomerByMobileOrMail(account, function (customer) {
                if (customer) {
                    db.updateCustomerPassword(customer.cust_id, password, function (row) {
                        if (row > 0) {
                            var result = {
                                "status_code": define.API_STATUS_OK  //重置成功
                            };
                            res.send(result);
                        } else {
                            var result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //更新失败
                            };
                            res.send(result);
                        }
                    });
                } else {
                    var result = {
                        "status_code": define.API_STATUS_INVALID_USER  //用户不存在
                    };
                    res.send(result);
                }
            });
        }
    });
};

exports.customerVehicleList = function (req, res) {
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = parseInt(req.query.parent_cust_id);

            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }

            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.getVehicleList(parent_cust_id, max_id, json, function (vehicles) {
                res.send(vehicles);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.searchCustomerVehicle = function (req, res) {
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = parseInt(req.query.parent_cust_id);
            var obj_name = req.query.obj_name;
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }
            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.searchCustomerVehicle(parent_cust_id, obj_name, json, max_id, function (vehicles) {
                res.send(vehicles);
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

exports.vehicleListWithActiveGpsData = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerVehicleList2(cust_id, function (vehicles) {
                var dbs = [];
                var docs = vehicles;
                revise.gpsToBaidu(docs, "active_gps_data", function(rev_docs){
                    for (var i = 0; i < docs.length; i++) {
                        if (rev_docs) {
                            for (var j = 0; j < rev_docs.length; j++) {
                                if (rev_docs[j]) {
                                    if (docs[i].active_gps_data.lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && docs[i].active_gps_data.lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                        docs[i].active_gps_data.lon = docs[i].active_gps_data.lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                        docs[i].active_gps_data.lat = docs[i].active_gps_data.lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    res.send(docs);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithDayTotal = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            var day = req.query.day;
            db.getCustomerVehicleDayTotal(cust_id, day, function (trips_total) {
                res.send(trips_total);
            });

        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.sellerDeviceList = function(req, res){
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = req.query.parent_cust_id;
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }
            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.getSellerDeviceList(parent_cust_id, max_id, json, function (devices) {
                var _devices = {
                    total: 0,
                    data: []
                };
                var device_ids = [];
                _devices.total = devices.total;
                for(var i = 0; i < devices.data.length; i++){
                    device_ids.push(devices.data[i].device_id);
                    _devices.data.push(devices.data[i].toJSON());
                }
                db.getVehicleListByDevices(device_ids, function (vehicles) {
                    for (var i = 0; i < _devices.data.length; i++) {
                        _devices.data[i].obj_name = "";
                        _devices.data[i].obj_id = "";
                        _devices.data[i].car_brand_id = 0;
                        _devices.data[i].car_brand = "";
                        _devices.data[i].cust_name = "";
                        for (var j = 0; j < vehicles.length; j++) {
                            if (_devices.data[i].device_id == vehicles[j].device_id) {
                                _devices.data[i].obj_id = vehicles[j].obj_id;
                                _devices.data[i].obj_name = vehicles[j].obj_name;
                                _devices.data[i].car_brand_id = vehicles[j].car_brand_id;
                                _devices.data[i].car_brand = vehicles[j].car_brand;
                                _devices.data[i].cust_name = vehicles[j].cust_name;
                                break;
                            }
                        }
                    }
                    res.send(_devices);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.searchSellerDeviceList = function(req, res){
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = req.query.parent_cust_id;
            var serial = req.query.serial;
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }
            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.searchSellerDeviceList(parent_cust_id, max_id, serial, json, function (devices) {
                var _devices = {
                    total: 0,
                    data: []
                };
                var device_ids = [];
                _devices.total = devices.total;
                for(var i = 0; i < devices.data.length; i++){
                    device_ids.push(devices.data[i].device_id);
                    _devices.data.push(devices.data[i].toJSON());
                }
                db.getVehicleListByDevices(device_ids, function (vehicles) {
                    for (var i = 0; i < _devices.data.length; i++) {
                        _devices.data[i].obj_name = "";
                        _devices.data[i].obj_id = "";
                        _devices.data[i].car_brand_id = 0;
                        _devices.data[i].car_brand = "";
                        _devices.data[i].cust_name = "";
                        for (var j = 0; j < vehicles.length; j++) {
                            if (_devices.data[i].device_id == vehicles[j].device_id) {
                                _devices.data[i].obj_id = vehicles[j].obj_id;
                                _devices.data[i].obj_name = vehicles[j].obj_name;
                                _devices.data[i].car_brand_id = vehicles[j].car_brand_id;
                                _devices.data[i].car_brand = vehicles[j].car_brand;
                                _devices.data[i].cust_name = vehicles[j].cust_name;
                                break;
                            }
                        }
                    }
                    res.send(_devices);
                });
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
            db.searchCustomer(account, function(customer){
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

// 服务器汇总信息
exports.total = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
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
        }else{
            util.resSendNoRight(res);
        }
    });
};



