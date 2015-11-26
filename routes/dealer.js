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
var http = require("http");
var sms = require("../lib/sms.js");
var fs = require('fs');
var revise = require("../lib/revise.js");
var nodeExcel = require('excel-export');

exports.login = function (req, res) {
    var username = req.query.username;
    var password = req.query.password;
    db.getDealerByUserName(username, function (dealer) {
        if (dealer) {
            if (dealer.password == password) {
                var now = new Date();
                var time_stamp = Date.parse(now);
                var auth_code = util.md5(username + "," + time_stamp);
                db.saveAuthCode(auth_code, function (err) {
                    result = {
                        "status_code":define.API_STATUS_OK, //0 成功 >0失败
                        "auth_code":auth_code,
                        "dealer_id":dealer.dealer_id
                    };
                    res.send(result);
                });
            } else {
                result = {
                    "status_code":define.API_STATUS_WRONG_PASSWORD  //密码错误
                };
                res.send(result);
            }
        } else {
            result = {
                "status_code":define.API_STATUS_INVALID_USER  //用户不存在
            };
            res.send(result);
        }
    });
};

exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var dealer_id = req.params.dealer_id;
            var tree_path = req.query.tree_path;
            var level = req.query.level;
            var key = req.query.key;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            db.getDealerListByKey(dealer_id, tree_path, level, key, function(dealers){
                var page_dealers = db.getPageData(dealers, page_no, page_count);
                res.send(page_dealers);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.deviceList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var key = req.query.key;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            db.getDealerDeviceList(dealer_id, key, function (devices) {
//                res.send(devices);
                var page_devices = db.getPageData(devices, page_no, page_count);
                var device_ids = [];
                for(var i = 0; i < page_devices.data.length; i++){
                    device_ids.push(page_devices.data[i].device_id);
                }
                db.getVehicleListByDevices(device_ids, function(vehicles){
                    for(var i = 0; i < page_devices.data.length; i++){
                        page_devices.data[i].nick_name = "";
                        page_devices.data[i].car_brand = "";
                        page_devices.data[i].cust_name = "";
                        for(var j= 0; j < vehicles.length; j++){
                            if(page_devices.data[i].device_id == vehicles[j].device_id){
                                page_devices.data[i].nick_name = vehicles[j].nick_name;
                                page_devices.data[i].car_brand = vehicles[j].car_brand;
                                page_devices.data[i].cust_name = vehicles[j].cust_name;
                                break;
                            }
                        }
                    }
                    var docs = page_devices;
                    revise.gpsToBaidu(docs.data, "active_gps_data", function(rev_docs){
                        for (var i = 0; i < docs.data.length; i++) {
                            if (rev_docs) {
                                for (var j = 0; j < rev_docs.length; j++) {
                                    if (rev_docs[j]) {
                                        if (docs.data[i].active_gps_data != undefined && docs.data[i].active_gps_data.lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && docs.data[i].active_gps_data.lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                            docs.data[i].active_gps_data.lon = docs.data[i].active_gps_data.lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                            docs.data[i].active_gps_data.lat = docs.data[i].active_gps_data.lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        res.send(docs);
                    });
//                    res.send(page_devices);
                });
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
            var dealer_id = req.params.dealer_id;
            db.getDealer(dealer_id, function(dealer){
                res.send(dealer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.infoByUserName = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_name = req.params.user_name;
            db.getDealerByUserName(user_name, function(dealer){
                res.send(dealer);
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
            var key = req.query.key;
            db.getDealerByName(key, function(dealers){
                res.send(dealers);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.updatePassword = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var user_name = req.body.user_name;
            var old_pass = req.body.old_password;
            var new_pass = req.body.new_password;
            db.updateDealererUserPass(user_name, old_pass, new_pass, function (row) {
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

exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var dealer_name = decodeURIComponent(req.body.dealer_name);
            var dealer_type = req.body.dealer_type;
            var parent_id = parseInt(req.body.parent_id);
            var contacter = decodeURIComponent(req.body.contacter);
            var contacter_tel = req.body.contacter_tel;
            var mobile = req.body.mobile;
            var email = req.body.email;
            var user_name = req.body.user_name;
            var password = req.body.password;
            var country = decodeURIComponent(req.body.country);
            var province = decodeURIComponent(req.body.province);
            var city = decodeURIComponent(req.body.city);
            var parent_tree_path = req.body.tree_path;
            var parent_level = parseInt(req.body.level);
            var create_user_id = req.body.create_user_id;
            db.addDealer(dealer_name, dealer_type, parent_id, parent_tree_path, parent_level,
                email, mobile, user_name, password, country, province, city, contacter, contacter_tel, create_user_id, function (err, dealer_id){
                if (err) {
                    console.log(err);
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK,  //0 成功 >0 失败
                        "dealer_id": dealer_id
                    }
                }
                res.send(result);
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
            var dealer_id = req.params.dealer_id;
            var dealer_name = decodeURIComponent(req.body.dealer_name);
            var dealer_type = req.body.dealer_type;
            var contacter = decodeURIComponent(req.body.contacter);
            var contacter_tel = req.body.contacter_tel;
            var email = req.body.email;
            var mobile = req.body.mobile;
            var country = decodeURIComponent(req.body.country);
            var province = decodeURIComponent(req.body.province);
            var city = decodeURIComponent(req.body.city);
            var update_user_id = req.body.update_user_id;
            db.updateDealer(dealer_id, dealer_name, dealer_type, email, mobile, country, province, city, contacter,
                contacter_tel, update_user_id, function (row) {
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

exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var dealer_id = req.params.dealer_id;
            db.delDealer(dealer_id, function(err){
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

exports.vehicleListWithActiveGpsData = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var update_time = new Date(req.query.update_time);
            var key = req.query.key;
            var if_odb_err = parseInt(req.query.if_odb_err);
            db.getDealerVehicleList(dealer_id, key, update_time, if_odb_err, function (vehicles) {
                var dbs = [];
                var docs = db.getPageData(vehicles, page_no, page_count);
                revise.gpsToBaidu(docs.data, "active_gps_data", function(rev_docs){
                    for (var i = 0; i < docs.data.length; i++) {
                        if (rev_docs) {
                            for (var j = 0; j < rev_docs.length; j++) {
                                if (rev_docs[j]) {
                                    if (docs.data[i].active_gps_data != undefined && docs.data[i].active_gps_data.lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && docs.data[i].active_gps_data.lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                        docs.data[i].active_gps_data.lon = docs.data[i].active_gps_data.lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                        docs.data[i].active_gps_data.lat = docs.data[i].active_gps_data.lat + rev_docs[j].rev_lat - rev_docs[j].lat;
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

exports.vehicleListWithActiveGpsDataExport = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var update_time = new Date(req.query.update_time);
            var key = req.query.key;
            var if_odb_err = parseInt(req.query.if_odb_err);
            db.getDealerVehicleList(dealer_id, key, update_time, if_odb_err, function (vehicles) {
                var rows = [];
                var row = [];
                for(var k = 0; k < vehicles.length; k++){
                    var mileage = "";
                    if(vehicles[k].active_gps_data != undefined){
                        mileage = vehicles[k].active_gps_data.mileage;
                    }
                    var dpdy = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.dpdy)){
                        dpdy = vehicles[k].active_obd_data.dpdy;
                    }
                    var jqmkd = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.jqmkd)){
                        jqmkd = vehicles[k].active_obd_data.jqmkd;
                    }
                    var fdjzs = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.fdjzs)){
                        fdjzs = vehicles[k].active_obd_data.fdjzs;
                    }
                    var sw = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.sw)){
                        sw = vehicles[k].active_obd_data.sw;
                    }
                    var chqwd = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.chqwd)){
                        chqwd = vehicles[k].active_obd_data.chqwd;
                    }
                    var jqyl = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.jqyl)){
                        jqyl = vehicles[k].active_obd_data.jqyl;
                    }
                    var jqwd = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.jqwd)){
                        jqwd = vehicles[k].active_obd_data.jqwd;
                    }
                    var ryyl = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.ryyl)){
                        ryyl = vehicles[k].active_obd_data.ryyl;
                    }
                    var dhtqj = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.dhtqj)){
                        dhtqj = vehicles[k].active_obd_data.dhtqj;
                    }
                    var fdjfz = "";
                    if(vehicles[k].active_obd_data != undefined && !isNaN(vehicles[k].active_obd_data.fdjfz)){
                        fdjfz = vehicles[k].active_obd_data.fdjfz;
                    }
                    var obd_err = "";
                    if (vehicles[k].active_obd_err != undefined) {
                        obd_err = vehicles[k].active_obd_err.toString();
                    }
                    row = [vehicles[k].nick_name, vehicles[k].car_brand, mileage, dpdy, jqmkd, fdjzs, sw, chqwd, jqyl, jqwd, ryyl, dhtqj, fdjfz, obd_err];
                    rows.push(row);
                }
                var conf ={};
                conf.cols = [
                    {caption:'车辆名称', type:'string'},
                    {caption:'车型', type:'string'},
                    {caption:'累计里程', type:'string'},
                    {caption:'电瓶电压', type:'string'},
                    {caption:'节气门开度', type:'string'},
                    {caption:'发动机转速', type:'string'},
                    {caption:'水温', type:'string'},
                    {caption:'催化器温度', type:'string'},
                    {caption:'进气压力', type:'string'},
                    {caption:'进气温度', type:'string'},
                    {caption:'燃油压力', type:'string'},
                    {caption:'点火提前角', type:'string'},
                    {caption:'发动机负载', type:'string'},
                    {caption:'故障码', type:'string'}
                ];
                conf.rows = rows;
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=vehicleStat.xlsx");
                res.end(result, 'binary');
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
            var dealer_id = req.params.dealer_id;
            var day = req.query.day;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var key = req.query.key;
            db.getDealerVehicleDayTotal(dealer_id, day, key, function (trips_total) {
                var page_trips_total = db.getPageData(trips_total, page_no, page_count);
                res.send(page_trips_total);
            });

        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithDayTotalExport = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var day = req.query.day;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var key = req.query.key;
            db.getDealerVehicleDayTotal(dealer_id, day, key, function (trips_total) {
                var rows = [];
                var row = [];
                for(var k = 0; k < trips_total.length; k++){
                    row = [trips_total[k].nick_name, trips_total[k].car_brand, trips_total[k].total_duration, trips_total[k].total_distance, trips_total[k].avg_fuel, trips_total[k].quick_accel, trips_total[k].quick_break, trips_total[k].quick_reflexes];
                    rows.push(row);
                }
                var conf ={};
                conf.cols = [
                    {caption:'车辆名称', type:'string'},
                    {caption:'车型', type:'string'},
                    {caption:'行驶里程', type:'string'},
                    {caption:'行驶时间', type:'string'},
                    {caption:'平均油耗', type:'string'},
                    {caption:'急加速', type:'string'},
                    {caption:'急刹车', type:'string'},
                    {caption:'急转弯', type:'string'}
                ];
                conf.rows = rows;
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + day + ".xlsx");
                res.end(result, 'binary');
            });

        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithViolation = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var day = req.query.day;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var key = req.query.key;
            db.getDealerVehicleViolation(dealer_id, day, key, function (violations) {
                var page_violations = db.getPageData(violations, page_no, page_count);
                res.send(page_violations);
            });

        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithViolationExport = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var dealer_id = req.params.dealer_id;
            var day = req.query.day;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            var key = req.query.key;
            db.getDealerVehicleViolation(dealer_id, day, key, function (violations) {
                var rows = [];
                var row = [];
                for(var k = 0; k < violations.length; k++){
                    row = [violations[k].obj_name, violations[k].action, violations[k].location, violations[k].vio_time.format("yyyy-MM-dd hh:mm:ss"), violations[k].fine, violations[k].score, violations[k].status];
                    rows.push(row);
                }
                var conf = {};
                conf.cols = [
                    {caption:'车牌号', type:'string'},
                    {caption:'违章行为', type:'string'},
                    {caption:'违章地点', type:'string'},
                    {caption:'违章时间', type:'string'},
                    {caption:'罚款', type:'string'},
                    {caption:'扣分', type:'string'},
                    {caption:'已处理', type:'string'}
                ];
                conf.rows = rows;
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=violation.xlsx");
                res.end(result, 'binary');
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};