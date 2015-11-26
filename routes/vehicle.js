/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-20
 * Time: 下午5:50
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var revise = require("../lib/revise.js");
var http = require("http");

//业务服务器接口
exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            db.getVehicleById(obj_id, function(vehicle){
                if(vehicle){
                    db.getCustomer(vehicle.cust_id, function(customer){
                        if(customer){
                            vehicle.cust_name = customer.cust_name;
                        }
                        res.send(vehicle);
                    })
                }else{
                    res.send(null);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.body.cust_id;
            var obj_name = decodeURIComponent(req.body.obj_name);
            var car_brand = decodeURIComponent(req.body.car_brand);
            var car_series = decodeURIComponent(req.body.car_series);
            var car_type = decodeURIComponent(req.body.car_type);
            var car_brand_id = parseInt(req.body.car_brand_id);
            var car_series_id = parseInt(req.body.car_series_id);
            var car_type_id = parseInt(req.body.car_type_id);
            var vio_city_name = decodeURIComponent(req.body.vio_city_name);
            var vio_location = req.body.vio_location;
            var engine_no = req.body.engine_no;
            var frame_no = req.body.frame_no;
            var reg_no = req.body.reg_no;
            var insurance_company = decodeURIComponent(req.body.insurance_company);
            var insurance_date = new Date(req.body.insurance_date);
            var maintain_company = decodeURIComponent(req.body.maintain_company);
            var maintain_last_mileage = parseInt(req.body.maintain_last_mileage);
            var maintain_last_date = new Date(req.body.maintain_last_date);
            var buy_date = new Date(req.body.buy_date);
            var insurance_tel = req.body.insurance_tel;
            var maintain_tel = req.body.maintain_tel;
            var gas_no = req.body.gas_no;

//            obj_name, cust_id, car_brand, car_series, car_type, engine_no, frame_no,
//                insurance_company, insurance_date, annual_inspect_date, maintain_company,
//                maintain_last_mileage, maintain_last_date, maintain_next_mileage, buy_date
            db.addVehicle(obj_name, cust_id, car_brand, car_series, car_type, vio_location, engine_no, frame_no, reg_no,
                insurance_company, insurance_date, maintain_company, maintain_last_mileage, maintain_last_date, buy_date,
                insurance_tel, maintain_tel, gas_no, car_brand_id, car_series_id, car_type_id, vio_city_name, function (err, obj_id) {
                    if (err) {
                        result = {
                            "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        };
                        res.send(result);
                    } else {
                        result = {
                            "status_code":define.API_STATUS_OK, //0 成功 >0 失
                            "obj_id":obj_id
                        };
                        res.send(result);
                    }
                });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.newSimple = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.body.cust_id;
            var obj_name = decodeURIComponent(req.body.obj_name);
            var nick_name = decodeURIComponent(req.body.nick_name);
            var car_brand = decodeURIComponent(req.body.car_brand);
            var car_series = decodeURIComponent(req.body.car_series);
            var car_type = decodeURIComponent(req.body.car_type);
            var car_brand_id = parseInt(req.body.car_brand_id);
            var car_series_id = parseInt(req.body.car_series_id);
            var car_type_id = parseInt(req.body.car_type_id);

            db.addVehicleSimple(nick_name, obj_name, cust_id, car_brand, car_series, car_type, car_brand_id, car_series_id, car_type_id, function (err, obj_id) {
                    if (err) {
                        result = {
                            "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        };
                        res.send(result);
                    } else {
                        result = {
                            "status_code":define.API_STATUS_OK, //0 成功 >0 失
                            "obj_id":obj_id
                        };
                        res.send(result);
                    }
                });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 修改车辆信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    var obj_id = req.query.obj_id;
    var json = util.getUpdateJson(req.query, "obj_id");

    db.updateVehicle(obj_id, json, function (row) {
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

exports.updateVioCity = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            var vio_citys = [];
            if(typeof req.body.vio_citys != "object"){
                vio_citys = eval("(" + req.body.vio_citys + ")");
            }else{
                vio_citys = req.body.vio_citys;
            }
            for(var i = 0; i < vio_citys.length; i++){
                vio_citys[i].province = decodeURIComponent(vio_citys[i].province);
                vio_citys[i].vio_city_name = decodeURIComponent(vio_citys[i].vio_city_name);
            }

            db.updateVehicleVioCity(obj_id, vio_citys,  function (row) {
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

        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.changeCustomer = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = req.params.obj_id;
            var cust_id = req.body.cust_id;
            db.updateVehicleCustomerById(obj_id, cust_id, function(err){
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

exports.updateDevice = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = req.params.obj_id;
            var device_id = req.body.device_id;
            db.updateVehicleDevice(obj_id, device_id, function(row){
                if(row == 0){
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

//如果为解绑，则删除原有device_id下的所有数据
//如果为修改终端，则将原有device_id下的所有数据切换至心的device_id
exports.updateDevice2 = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = parseInt(req.params.obj_id);
            var device_id = parseInt(req.body.device_id);
            var deal_data = parseInt(req.body.deal_data);
            if(deal_data == 1){
                db.getVehicleById(obj_id, function(vehicle){
                    //清除原终端的所有数据
                    if(device_id == 0){
                        db.clearDeviceData(vehicle.device_id);
                    }else{  //将数据移动至新终端
                        db.moveDeviceData(vehicle.device_id, device_id);
                    }
                });
            }else{
                db.updateVehicleDevice(obj_id, device_id, function(row){
                    if(row == 0){
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
            }
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
            var obj_id = req.params.obj_id;
            var annual_inspect_date = new Date(req.body.annual_inspect_date);
            var insurance_date = new Date(req.body.insurance_date);
            var maintain_next_mileage = parseInt(req.body.maintain_next_mileage);

            db.updateVehicleInspectDate(obj_id, annual_inspect_date, insurance_date, maintain_next_mileage, function (row) {
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
            var obj_id = req.params.obj_id;
            db.getVehicleById(obj_id, function(vehicle){
                if(vehicle){
                    //2015-09-01 解除终端设备的用户绑定 by tom
                    db.updateDeviceCustomer(vehicle.device_id, 0, function(){
                        console.log("udpate device_id=" + vehicle.device_id + " to 0");
                    });

                    db.deleteVehicle(obj_id, function(err){
                        if(err){
                            result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                            };
                            res.send(result);
                        }else{
                            // 删除车辆相关的车务提醒
                            db.deleteReminderByObjID(obj_id, function(err){

                            });

                            result = {
                                "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                            };
                            res.send(result);
                        }
                    });
                }else{
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

exports.notification = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            var update_time = new Date(req.query.update_time);
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            var page_no = req.query.page_no;
            var page_count = req.query.page_count;
            var mode = req.query.mode;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            if(mode == "unread"){
                db.getVehicleNotification(obj_id, update_time, min_id, max_id, function(docs){
                    if(max_id > 0){
                        res.send(docs);
                    }else if(min_id > 0){
                        var page_docs = db.getPageData(docs, page_no, page_count);
                        res.send(page_docs);
                    }else{
                        var page_docs = db.getPageData(docs, page_no, page_count);
                        res.send(page_docs);
                    }
                });
            }else{
                db.getVehicleNotificationHistory(obj_id, start_time, end_time, 1000, 0, function(docs){
                    var page_docs = db.getPageData(docs, page_no, page_count);
                    res.send(page_docs);
                });
            }
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.noti_new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            var update_time = new Date(req.query.update_time);
            db.getVehicleNewNoti(obj_id, update_time, function(count){
                var result = {
                    count : count
                };
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.addVioCity = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = req.params.obj_id;
            var province = decodeURIComponent(req.body.province);
            var vio_city_name = decodeURIComponent(req.body.vio_city_name);
            var vio_city_code = req.body.vio_city_code;
            db.addVioCity(obj_id, vio_city_name, vio_city_code, province, function(err){
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

exports.delVioCity = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = req.params.obj_id;
            var vio_city_name = req.params.vio_city_name;
            db.delVioCity(obj_id, vio_city_name, function(err){
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

exports.updateGeofence = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            var geo = req.body.geo;
            if(typeof req.body.geo != "object"){
                geo = eval("(" + req.body.geo + ")");
            }else{
                geo = req.body.geo;
            }
            db.updateVehicleGeofence(obj_id, geo, function(row){
                if(row == 0){
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

exports.deleteGeofence = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var obj_id = parseInt(req.params.obj_id);
            db.deleteVehicleGeofence(obj_id, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};
