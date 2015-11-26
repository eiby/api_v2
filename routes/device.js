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
var fs = require('fs');
var lineReader = require('line-reader');

exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            db.getDevice(device_id, function(device){
                //res.send(device);
                // 把地址进行百度纠偏
                var dbs = [];
                var docs = device;
                dbs.push(docs);
                revise.gpsToBaidu(dbs, "active_gps_data", function(rev_docs){
                    if (rev_docs && rev_docs[0]) {
                        docs.active_gps_data.lon = docs.active_gps_data.lon + rev_docs[0].rev_lon - rev_docs[0].lon;
                        docs.active_gps_data.lat = docs.active_gps_data.lat + rev_docs[0].rev_lat - rev_docs[0].lat;
                    }
                    // 判断终端是否在线
                    var now = new Date();
                    docs.is_online = docs.active_gps_data && (now.getTime() - docs.active_gps_data.rcv_time.getTime()) < 6 * 60000;
                    // 判断终端信号强度
                    if(docs.active_gps_data){
                        if(docs.active_gps_data.signal < 10){
                            docs.signal_level = 1;  //信号差
                        }else if(docs.active_gps_data.signal >= 10 && docs.active_gps_data.signal < 22){
                            docs.signal_level = 2; //信号中
                        }else if(docs.active_gps_data.signal > 22){
                            docs.signal_level = 3; //信号优
                        }else{
                            docs.signal_level = 0; //离线
                        }
                    }else{
                        docs.signal_level = 0; //离线
                    }
                    // 判断车辆运行状态
                    if(docs.active_gps_data){
                        if(docs.active_gps_data.uni_alerts.length > 0){
                            docs.device_flag = 3;
                        }else if(inArray(docs.active_gps_data.uni_status, define.STATUS_ACC)){
                            docs.device_flag = 1;
                        }else if(inArray(docs.active_gps_data.uni_status, define.STATUS_FORTIFY)){
                            docs.device_flag = 2;
                        }else{
                            docs.device_flag = 0;
                        }
                    }else{
                        docs.device_flag = 0;
                    }
                    res.send(docs);
                });
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.infoBySerial = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var serial = req.params.serial;
            db.getDeviceBySerial(serial, function(device){
//                res.send(device);
                // 把地址进行百度纠偏
                var dbs = [];
                var docs = device;
                dbs.push(docs);
                revise.gpsToBaidu(dbs, "active_gps_data", function(rev_docs){
                    if (rev_docs && rev_docs[0]) {
                        docs.active_gps_data.lon = docs.active_gps_data.lon + rev_docs[0].rev_lon - rev_docs[0].lon;
                        docs.active_gps_data.lat = docs.active_gps_data.lat + rev_docs[0].rev_lat - rev_docs[0].lat;
                    }
                    // 判断终端是否在线
                    var now = new Date();
                    docs.is_online = docs.active_gps_data && (now.getTime() - docs.active_gps_data.rcv_time.getTime()) < 6 * 60000;
                    // 判断终端信号强度
                    if(docs.active_gps_data){
                        if(docs.active_gps_data.signal < 10){
                            docs.signal_level = 1;  //信号差
                        }else if(docs.active_gps_data.signal >= 10 && docs.active_gps_data.signal < 22){
                            docs.signal_level = 2; //信号中
                        }else if(docs.active_gps_data.signal > 22){
                            docs.signal_level = 3; //信号优
                        }else{
                            docs.signal_level = 0; //离线
                        }
                    }else{
                        docs.signal_level = 0; //离线
                    }
                    // 判断车辆运行状态
                    if(docs.active_gps_data){
                        if(docs.active_gps_data.uni_alerts.length > 0){
                            docs.device_flag = 3;
                        }else if(inArray(docs.active_gps_data.uni_status, define.STATUS_ACC)){
                            docs.device_flag = 1;
                        }else if(inArray(docs.active_gps_data.uni_status, define.STATUS_FORTIFY)){
                            docs.device_flag = 2;
                        }else{
                            docs.device_flag = 0;
                        }
                    }else{
                        docs.device_flag = 0;
                    }
                    res.send(docs);
                });
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
            //device_type, serial, hardware_version, software_version
            var device_type = req.body.device_type;
            var serial = req.body.serial;
            var hardware_version = req.body.hardware_version;
            var software_version = req.body.software_version;

            db.addDevice(device_type, serial, hardware_version, software_version, function (err, device_id) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK, //0 成功 >0 失
                        "device_id":device_id
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//上传图片，大小不能超过500k
//下一步改为阿里云存储
exports.importDevices = function(req, res){
    if (req.files.devices) {
        // 获得文件的临时路径
        var tmp_path = req.files.devices.path;
        // 指定文件上传后的目录 - 示例为"images"目录。
        var target_path = './uploads/' + req.files.devices.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function () {
                //if (err) throw err;
                // 批量导入终端
                _getDeviceFromCsv(target_path, function (devices) {
                    for (var i = 0; i < devices.length; i++) {
                        db.addDevice(0, devices[i].serial, devices[i].sim, "", "", function (err) {
                            if(!err){
                                console.log(err);
                            }
                        });
                    }
                    res.send("已批量导入" + devices.length + "台终端。");
                });
//                obj = {
//                    status_code: define.API_STATUS_OK  //0 成功 >0 失败
//                };
//                res.send(obj);

            });
        });
    } else {
        obj = {
            status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
        };
        res.send(obj);
    }
};

exports.exportDevicesBySerials = function(req, res){
    var dealer_id = parseInt(req.params.dealer_id);
    // 获得文件的临时路径
    var serials = req.body.serials.split(",");

    db.updateDevicesDealer(serials, dealer_id, function (row) {
        if (row == 0) {
            result = {
                "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            };
            res.send(result);
        } else {
            result = {
                "status_code":define.API_STATUS_OK
            };
            res.send(result);
        }
    });
};

exports.exportDevices = function(req, res){
    if (req.files.devices) {
        var dealer_id = parseInt(req.body.dealer_id);
        // 获得文件的临时路径
        var tmp_path = req.files.devices.path;
        // 指定文件上传后的目录 - 示例为"images"目录。
        var target_path = './uploads/' + req.files.devices.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function () {
                //if (err) throw err;
                // 批量导入终端
                _getDeviceFromCsv(target_path, function (devices) {
                    for (var i = 0; i < devices.length; i++) {
                        db.updateDeviceDealer(devices[i].serial, dealer_id, function (err) {
                            if(!err){
                                console.log(err);
                            }
                        });
                    }
                    res.send("已批量发货" + devices.length + "台终端到经销商ID=" + dealer_id);
                });
//                obj = {
//                    status_code: define.API_STATUS_OK  //0 成功 >0 失败
//                };
//                res.send(obj);

            });
        });
    } else {
        obj = {
            status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
        };
        res.send(obj);
    }
};

exports.returnDevices = function(req, res){
    if (req.files.devices) {
        // 获得文件的临时路径
        var tmp_path = req.files.devices.path;
        // 指定文件上传后的目录 - 示例为"images"目录。
        var target_path = './uploads/' + req.files.devices.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function () {
                //if (err) throw err;
                // 批量导入终端
                _getDeviceFromCsv(target_path, function (devices) {
                    for (var i = 0; i < devices.length; i++) {
                        db.updateDeviceCustomerBySerial(devices[i].serial, 0, function (err) {
                            if(!err){
                                console.log(err);
                            }
                        });
                    }
                    res.send("已批量解绑" + devices.length + "台终端。");
                });
            });
        });
    } else {
        obj = {
            status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
        };
        res.send(obj);
    }
};

// 解绑终端,供内部使用
exports.unbindDevice = function(req, res){
    var device_id = req.body.device_id;
    db.updateDeviceCustomerBySerial(device_id, 0, function (row) {
        if (row > 0) {
            db.getVehicleBySerial(device_id, function (vehicle) {
                if (vehicle) {
                    db.updateVehicleDevice(vehicle.obj_id, 0, function (row) {
                        res.send("已成功解绑终端" + device_id);
                    });
                } else {
                    res.send("已成功解绑终端" + device_id);
                }
            });
        } else {
            res.send("解绑终端" + device_id + "失败");
        }
    });
};

// api 解绑终端,供客户端使用
exports.unbind = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            db.updateDeviceCustomerBySerial(device_id, 0, function (row) {
                if (row > 0) {
                    db.getVehicleBySerial(device_id, function (vehicle) {
                        if (vehicle) {
                            db.updateVehicleDevice(vehicle.obj_id, 0, function (row) {
                                if(row > 0){
                                    result = {
                                        status_code: define.API_STATUS_OK  //0 成功 >0 失败
                                    };
                                }else{
                                    result = {
                                        status_code: define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                                    };
                                }
                                res.send(result);
                            });
                        } else {
                            result = {
                                status_code: define.API_STATUS_OK  //0 成功 >0 失败
                            };
                            res.send(result);
                        }
                    });
                } else {
                    result = {
                        status_code: define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.activeSIM = function(req, res){
    if (req.files.devices) {
        // 获得文件的临时路径
        var tmp_path = req.files.devices.path;
        // 指定文件上传后的目录 - 示例为"images"目录。
        var target_path = './uploads/' + req.files.devices.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function () {
                //if (err) throw err;
                // 批量导入终端
                _getSimFromCsv(target_path, function (devices) {
                    for (var i = 0; i < devices.length; i++) {
                        var stock_time = null;
                        var active_time = null;
                        var end_time = null;
                        if(devices[i].stock_time != ""){
                            stock_time = new Date(devices[i].stock_time);
                        }
                        if(devices[i].active_time != ""){
                            active_time = new Date(devices[i].active_time);
                        }
                        if(devices[i].end_time != ""){
                            end_time = new Date(devices[i].end_time);
                        }
                        db.updateDeviceActiveTime(devices[i].sim, stock_time, active_time, end_time, function (row) {
                            if(row > 0){
                                console.log("更新SIM卡激活时间成功。");
                            }
                        });
                    }
                    res.send("已批量解绑" + devices.length + "台终端。");
                });
            });
        });
    } else {
        obj = {
            status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
        };
        res.send(obj);
    }
};

var _getDeviceFromCsv = function(devices_file_url, callback){
    var devices = [];
    var device;
    lineReader.eachLine(devices_file_url, function(line) {
        //console.log(line);
        data = line.toString().trim().split(",");
        device = {
            "serial": data[1],
            "sim": data[0]
        };
        devices.push(device);
    }).then(function () {
            //console.log("I'm done!!");
            callback(devices);
        }
    );
};

var _getSimFromCsv = function(devices_file_url, callback){
    var devices = [];
    var device;
    lineReader.eachLine(devices_file_url, function(line) {
        //console.log(line);
        data = line.toString().trim().split(",");
        device = {
            "sim": data[0],
            "stock_time": data[1],
            "active_time": data[2],
            "end_time": data[3]
        };
        devices.push(device);
    }).then(function () {
            //console.log("I'm done!!");
            callback(devices);
        }
    );
};

exports.activeGpsData = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var update_time = new Date(req.query.update_time);
            db.getVehicleActiveGpsData(device_id, update_time, function(docs){
                var rev;
//                if (docs && docs.active_gps_data) {
//                    rev = revise.gpsToGoogle(docs.active_gps_data.lon, docs.active_gps_data.lat);
//                    docs.active_gps_data.rev_lon = rev.x;
//                    docs.active_gps_data.rev_lat = rev.y;
//                }
                // 把地址进行百度纠偏
                var dbs = [];
                dbs.push(docs);
                revise.gpsToBaidu(dbs, "active_gps_data", function(rev_docs){
                    if (rev_docs && rev_docs[0]) {
                        docs.active_gps_data.lon = docs.active_gps_data.lon + rev_docs[0].rev_lon - rev_docs[0].lon;
                        docs.active_gps_data.lat = docs.active_gps_data.lat + rev_docs[0].rev_lat - rev_docs[0].lat;
                    }
                    res.send(docs);
                });
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.activeGpsDataBySerial = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var serial = req.params.serial;
            var update_time = new Date(req.query.update_time);
            var jsoncallback = req.query.jsoncallback;
            db.getVehicleActiveGpsDataBySerial(serial, update_time, function(docs){
                //暂时不进行纠偏
                if(jsoncallback != undefined){
                    docs = jsoncallback + "(" + docs.toString() + ");";
                }
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.activeGpsDataBySerials = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var serials;
            try{
                if(typeof req.body.serials != "object"){
                    serials = eval("(" + req.body.serials + ")");
                }else{
                    serials = req.body.serials;
                }
            }catch(e){
                serials = [];
            }
            var update_time = new Date(req.query.update_time);
            db.getVehicleActiveGpsDataBySerials(serials, update_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

var inArray = function (array, e) {
    var r = new RegExp(String.fromCharCode(2) + e + String.fromCharCode(2));
    return (r.test(String.fromCharCode(2) + array.join(String.fromCharCode(2)) + String.fromCharCode(2)));
};

var getValidData = function(docs){
    var valid_data = [];
    var j = 0;
    var acc = false;
    if(docs && docs.length > 0){
        //acc = inArray(docs[0].uni_status, define.STATUS_ACC);
        acc =  inArray(docs[0].uni_status, define.STATUS_ACC) || docs[0].speed > 0;
        valid_data.push(docs[0]);
        for (j = 1; j < docs.length; j++) {
            if(docs[j].speed != undefined){
                if(acc == (inArray(docs[j].uni_status, define.STATUS_ACC) || docs[j].speed > 0)){
                    if(acc){
                        valid_data.push(docs[j]);
                    }
                }else{
                    valid_data.push(docs[j]);
                    acc = inArray(docs[j].uni_status, define.STATUS_ACC) || docs[j].speed > 0;
                }
            }
        }
    }
    return valid_data;
};

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

var getValidAirData = function(docs){
    var valid_data = [];
    var j = 0;
    var time = "";
    if(docs && docs.length > 0){
        //acc = inArray(docs[0].uni_status, define.STATUS_ACC);
        time = docs[j].rcv_time.format("yyyy-MM-dd hh:mm");
        valid_data.push(docs[0]);
        for (j = 1; j < docs.length; j++) {
            if (docs[j].rcv_time.format("yyyy-MM-dd hh:mm") != time) {
                if(docs[j].air > 0){
                    valid_data.push(docs[j]);
                }
                time = docs[j].rcv_time.format("yyyy-MM-dd hh:mm");
            }
        }
    }
    return valid_data;
};

var getValidData2 = function(docs){
    var valid_data = [];
    var j = 0;
    var acc = false;
    var old_lon = 0;
    var old_lat = 0;
    if(docs && docs.length > 0){
        for (j = 1; j < docs.length; j++) {
            if(docs[j].lon != old_lon || docs[j].lat != old_lat){
                valid_data.push(docs[j]);
                old_lon = docs[j].lon;
                old_lat = docs[j].lat;
            }
        }
    }
    return valid_data;
};


exports.gpsDataByMonth = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            var page_no = req.query.page_no;
            var page_count = req.query.page_count;
//            db.getTrackDataListByMonth(device_id, start_time, end_time, 8000, 0, function(docs){
//                if(docs && docs.length > 0){
//                    // 过滤无效及无用的数据
////                    var valid_docs = getValidData2(docs);
//                    valid_docs = docs;
//                    // 获取分页数据
//                    //var page_docs = db.getPageData(valid_docs, 1, 1000);
//
//                    // 把地址进行百度纠偏
//                    // 只返回经纬度
//                    var lonlats = [];
//                    revise.gpsToBaidu(valid_docs, "", function(rev_docs){
//                        for(var i = 0; i < valid_docs.length; i++){
//                            if (rev_docs) {
//                                for (var j = 0; j < rev_docs.length; j++) {
//                                    if(rev_docs[j]){
//                                        if (valid_docs[i].lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && valid_docs[i].lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
//                                            valid_docs[i].lon = valid_docs[i].lon + rev_docs[j].rev_lon - rev_docs[j].lon;
//                                            valid_docs[i].lat = valid_docs[i].lat + rev_docs[j].rev_lat - rev_docs[j].lat;
//                                            break;
//                                        }
//                                    }
//                                }
//                            }
//                            lonlats.push({
//                                lon: valid_docs[i].lon,
//                                lat: valid_docs[i].lat
//                            })
//                        }
//                        res.send(lonlats);
//                    });
//                }else{
                    db.getGpsDataListByMonth(device_id, start_time, end_time, 8000, 0, function(docs){
                        var rev;
                        if(docs){
                            // 过滤无效及无用的数据
                            var valid_docs = getValidData(docs);
                            // 获取分页数据
                            //var page_docs = db.getPageData(valid_docs, 1, 1000);

                            // 把地址进行百度纠偏
                            // 只返回经纬度
                            var lonlats = [];
                            revise.gpsToBaidu(valid_docs, "", function(rev_docs){
                                for(var i = 0; i < valid_docs.length; i++){
                                    if (rev_docs) {
                                        for (var j = 0; j < rev_docs.length; j++) {
                                            if(rev_docs[j]){
                                                if (valid_docs[i].lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && valid_docs[i].lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                                    valid_docs[i].lon = valid_docs[i].lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                                    valid_docs[i].lat = valid_docs[i].lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    lonlats.push({
                                        lon: valid_docs[i].lon,
                                        lat: valid_docs[i].lat
                                    })
                                }
                                res.send(lonlats);
                            });
                        }else{
                            res.send([]);
                        }
                    });
//                }
//            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.airDataByMonth = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            var page_no = req.query.page_no;
            var page_count = req.query.page_count;
            db.getAirDataListByMonth(device_id, start_time, end_time, 8000, 0, function(docs){
                var rev;
                if(docs){
                    // 过滤无效及无用的数据
                    var valid_docs = getValidAirData(docs);
                    res.send(valid_docs);
                }else{
                    res.send([]);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.gpsDataByMonth2 = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            var page_no = req.query.page_no;
            var page_count = req.query.page_count;
            db.getGpsDataListByMonth(device_id, start_time, end_time, 8000, 0, function(docs){
                var rev;
                if(docs){
                    // 过滤无效及无用的数据
                    var valid_docs = getValidData(docs);
//                    var valid_docs = docs;
                    // 获取分页数据
                    var page_docs = db.getPageData(valid_docs, page_no, page_count);

                    // 把地址进行百度纠偏
                    revise.gpsToBaidu(page_docs.data, "", function(rev_docs){
                        for(var i = 0; i < page_docs.data.length; i++){
                            if (rev_docs) {
                                for (var j = 0; j < rev_docs.length; j++) {
                                    if(rev_docs[j]){
                                        if (page_docs.data[i].lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && page_docs.data[i].lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                            page_docs.data[i].lon = page_docs.data[i].lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                            page_docs.data[i].lat = page_docs.data[i].lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        res.send(page_docs);
                    });
                }else{
                    res.send([]);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.gpsDataBySerial = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var serial = req.params.serial;
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getGpsDataListBySerial(serial, start_time, end_time, 8000, 0, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 终端发货时更新sim卡号，服务到期日
//device_id, sim, service_end_date
exports.updateSIM = function(req, res){
    var device_id = req.params.device_id;
    var sim = req.body.sim;
    db.updateDeviceSIM(device_id, sim, function (row) {
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
};

// 更新终端状态
//device_id, status
exports.updateStatus = function(req, res){
    var device_id = req.params.device_id;
    var status = req.body.status;
    db.updateDeviceStatus(device_id, status, function (row) {
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
};

// 终端上线，将已出库状态更新状态为已激活
exports.activateDevice = function(req, res){
    var device_id = req.params.device_id;
    db.activateDevice(device_id, function (row) {
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
};

// 客户购买支付后，将终端调拨到客户名下
exports.changeCustomer = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var device_id = req.params.device_id;
            var cust_id = req.body.cust_id;
            db.updateDeviceCustomer(device_id, cust_id, function(row){
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

exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var device_id = req.params.device_id;
            db.deleteDevice(device_id, function (err, vehicle) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.addEvent = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var serial = req.body.serial;
            var event_type = req.body.event_type;
            var event_status = req.body.event_status;
            var speed = req.body.speed;
            var direct = req.body.direct;
            var gps_flag = req.body.gps_flag;
            var mileage = req.body.mileage;
            var fuel = req.body.fuel;
            var lon = req.body.lon;
            var lat = req.body.lat;
            db.addEvent(serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat, function (err) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK //0 成功 >0 失
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.addFault = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var serial = req.body.serial;
            var fault_code = req.body.fault_code;
            var fault_desc = decodeURIComponent(req.body.fault_desc);
            db.saveDeviceOdbErr(serial, fault_code, fault_desc, function (err) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK //0 成功 >0 失
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.healthExam = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var health_score = 100;
            var device_id = req.params.device_id;
            var brand = req.query.brand;
            if(brand == undefined){
                brand = "未知";
            }
            var if_dpdy_err = false;
            var if_lt_dpdy_err = false;
            var dpdy = 0;
            var lt_dpdy = 0;
            var if_jqmkd_err = false;
            var if_lt_jqmkd_err = false;
            var jqmkd = 0;
            var lt_jqmkd = 0;
            var if_fdjzs_err = false;
            var if_lt_fdjzs_err = false;
            var fdjzs = 0;
            var lt_fdjzs = 0;
            var if_sw_err = false;
            var if_lt_sw_err = false;
            var sw = 0;
            var lt_sw = 0;
            var if_chqwd_err = false;
            var if_lt_chqwd_err = false;
            var chqwd = 0;
            var lt_chqwd = 0;
            var co1_n = 0 , co2_n = 0, co3_n = 0, co4_n = 0, co5_n = 0;
            var co1 = 0 , co2 = 0, co3 = 0, co4 = 0, co5 = 0;
            db.getDevice(device_id, function(device){
                // 故障码
                //health_score = health_score - 5 * device.active_obd_err.length;
                // 获取最近1000条obd数据，计算所有非零数据的平均值
                if(device){
                    db.getDeviceLastOdbData(device.serial, 1000, function(docs){
                        if(docs.length == 0){
                            lt_dpdy = 0;
                            lt_jqmkd = 0;
                            lt_fdjzs = 0;
                            lt_sw = 0;
                            lt_chqwd = 0;
                        }else{
                            // 计算短期值
                            for(var i = 0; i < docs.length; i++){
                                if(i > 100){
                                    break;
                                }
                                // 进气系统
                                if(!isNaN(docs[i].obd_data.jqmkd) && docs[i].obd_data.jqmkd > 0 && docs[i].obd_data.jqmkd < 50){
                                    jqmkd = jqmkd + docs[i].obd_data.jqmkd;
                                    co2_n++;
                                }
                                // 怠速控制系统(怠速发动机转速)
                                if(!isNaN(docs[i].obd_data.fdjzs) && docs[i].obd_data.ss == 0 && docs[i].obd_data.fdjzs > 0 && docs[i].obd_data.fdjzs < 1100){
                                    fdjzs = fdjzs + docs[i].obd_data.fdjzs;
                                    co3_n++;
                                }
                                // 冷却系统
                                if(!isNaN(docs[i].obd_data.sw) && docs[i].obd_data.sw > 0 && docs[i].obd_data.sw < 100){
                                    sw = sw + docs[i].obd_data.sw;
                                    co4_n++;
                                }
                                // 排放系统
                                if(!isNaN(docs[i].obd_data.chqwd) && docs[i].obd_data.chqwd > 0 && docs[i].obd_data.chqwd < 1500){
                                    chqwd = chqwd + docs[i].obd_data.chqwd;
                                    co5_n++;
                                }
                            }
                            jqmkd = jqmkd / co2_n;
                            // 按照标准差方式计算怠速，判断怠速是否不稳
                            var mean = fdjzs / co3_n;
                            fdjzs = mean;
//                            var total = 0;
//                            co3_n = 0;
//                            for(var i = 0; i < docs.length;i++){
//                                if(i > 100){
//                                    break;
//                                }
//                                if(!isNaN(docs[i].obd_data.fdjzs) && docs[i].obd_data.ss == 0 && docs[i].obd_data.fdjzs > 0 && docs[i].obd_data.fdjzs < 1100){
//                                    var deviation = docs[i].obd_data.fdjzs - mean;
//                                    if(deviation > 100) {
//                                        total += deviation * deviation;
//                                        co3_n++;
//                                    }
//                                }
//                            }
//
//                            var stddev = 0;
//                            if(co3_n > 0){
//                              stddev = Math.sqrt(total/co3_n);
//                            }
//                            fdjzs = mean + stddev;
                            sw = sw / co4_n;
                            chqwd = chqwd / co5_n;
                            // 计算长期值
                            for(var i = 0; i < docs.length; i++){
                                // 电源系统
                                if(!isNaN(docs[i].obd_data.dpdy) && docs[i].obd_data.dpdy > 0 && docs[i].obd_data.dpdy < 36){
                                    lt_dpdy = lt_dpdy + docs[i].obd_data.dpdy;
                                    co1++;
                                }
                                // 进气系统
                                if(!isNaN(docs[i].obd_data.jqmkd) && docs[i].obd_data.jqmkd > 0 && docs[i].obd_data.jqmkd < 50){
                                    lt_jqmkd = lt_jqmkd + docs[i].obd_data.jqmkd;
                                    co2++;
                                }
                                // 怠速控制系统(怠速发动机转速)
                                if(!isNaN(docs[i].obd_data.fdjzs) && docs[i].obd_data.fdjzs > 0 && docs[i].obd_data.fdjzs < 1100){
                                    lt_fdjzs = lt_fdjzs + docs[i].obd_data.fdjzs;
                                    co3++;
                                }
                                // 冷却系统
                                if(!isNaN(docs[i].obd_data.sw) && docs[i].obd_data.sw > 0 && docs[i].obd_data.sw < 100){
                                    lt_sw = lt_sw + docs[i].obd_data.sw;
                                    co4++;
                                }
                                // 排放系统
                                if(!isNaN(docs[i].obd_data.chqwd) && docs[i].obd_data.chqwd > 0 && docs[i].obd_data.chqwd < 1500){
                                    lt_chqwd = lt_chqwd + docs[i].obd_data.chqwd;
                                    co5++;
                                }
                            }
                            lt_dpdy = lt_dpdy / co1;
                            lt_jqmkd = lt_jqmkd / co2;
                            lt_fdjzs = lt_fdjzs / co3;
                            lt_sw = lt_sw / co4;
                            lt_chqwd = lt_chqwd / co5;
                        }
                        if(device.active_obd_data != undefined){
                            dpdy = device.active_obd_data.dpdy;
                        }else{
                            dpdy = null;
                        }
                        if_dpdy_err = device.active_obd_data != undefined && (device.active_obd_data.dpdy < 11 || device.active_obd_data.dpdy > 15);
                        if_jqmkd_err = jqmkd != null && jqmkd != 0 && (jqmkd < 12 || jqmkd > 17);
                        if_fdjzs_err = fdjzs != null && fdjzs != 0 && (fdjzs < 600 || fdjzs > 1000);
                        if_sw_err = sw != null && sw != 0 && (sw < 0 || sw > 112);
                        if_chqwd_err = chqwd != null && chqwd != 0 && (chqwd < 300 || chqwd > 800);
                        if_lt_dpdy_err = lt_dpdy != null && lt_dpdy != 0 && (lt_dpdy < 11 || lt_dpdy > 15);
                        if_lt_jqmkd_err = lt_jqmkd != null && lt_jqmkd != 0 && (lt_jqmkd < 12 || lt_jqmkd > 17);
                        if_lt_fdjzs_err = lt_fdjzs != null && lt_fdjzs != 0 && (lt_fdjzs < 600 || lt_fdjzs > 1000);
                        if_lt_sw_err = lt_sw != null && lt_sw != 0 && (lt_sw < 0 || lt_sw > 112);
                        if_lt_chqwd_err = lt_chqwd != null && lt_chqwd != 0 && (lt_chqwd < 300 || lt_chqwd > 800);

                        if(if_dpdy_err || if_lt_dpdy_err){
                            health_score = health_score - 10;
                        }

                        if(if_jqmkd_err || if_lt_jqmkd_err){
                            health_score = health_score - 10;
                        }

                        if(if_fdjzs_err || if_lt_fdjzs_err){
                            health_score = health_score - 10;
                        }

                        if(if_sw_err || if_lt_sw_err){
                            health_score = health_score - 10;
                        }

                        if(if_chqwd_err || if_lt_chqwd_err){
                            health_score = health_score - 10;
                        }

                        db.getObdListByCode(device.active_obd_err, brand, function (docs) {
                            for(var i = 0; i < docs.length; i++){
                                category = docs[i].category;
                                if(category == "车身系统"){
                                    docs[i].level = 3;
                                    health_score = health_score - 5;
                                }else if(category == "辅助输入" || category == "计算机或辅助输出电路" || category == "计算机或辅助输出" || category == "网络通讯系统" || category == "底盘系统"){
                                    docs[i].level = 4;
                                    health_score = health_score - 10;
                                }else{
                                    docs[i].level = 5;
                                    health_score = health_score - 20;
                                }
                            }
                            if(docs == null || docs.length == 0){
                                device.active_obd_err = [];
                            }

                            var data = {
                                serial: device.serial,
                                health_score: health_score,            //健康指数
                                active_obd_err: device.active_obd_err, //故障码
                                dpdy_range: "11-15V",                  //电瓶电压参考范围，
                                if_dpdy_err: if_dpdy_err,              //电瓶电压本次检测是否正常，False显示状态良好，True显示异常
                                dpdy: dpdy,                            //本次电瓶电压
                                if_lt_dpdy_err: if_lt_dpdy_err,        //电瓶电压长期检测是否正常，False显示状态良好，True显示异常
                                lt_dpdy: lt_dpdy,                      //长期电瓶电压
                                dpdy_content: "http://api.bibibaba.cn/help/dpdy",           //电瓶电压背景知识
                                jqmkd_range: "12-17%",                 //节气门开度参考范围
                                if_jqmkd_err: if_jqmkd_err,            //节气门开度本次检测是否正常，False显示状态良好，True显示异常
                                jqmkd: jqmkd,                          //节气门开度本次值
                                if_lt_jqmkd_err: if_lt_jqmkd_err,      //节气门开度长期检测是否正常，False显示状态良好，True显示异常
                                lt_jqmkd: lt_jqmkd,                    //节气门开度长期值
                                jqmkd_content: "http://api.bibibaba.cn/help/jqmkd",                     //节气门开度背景知识
                                fdjzs_range: "600-1000 rpm",           //发动机转速参考范围
                                if_fdjzs_err: if_fdjzs_err,            //发动机转速本次检测是否正常，False显示状态良好，True显示异常
                                fdjzs: fdjzs,                          //发动机转速本次检测值
                                if_lt_fdjzs_err: if_lt_fdjzs_err,      //发动机转速长期检测是否正常，False显示状态良好，True显示异常
                                lt_fdjzs: lt_fdjzs,                    //发动机转速长期检测值
                                fdjzs_content: "http://api.bibibaba.cn/help/fdjzs",                     //发动机转速背景知识
                                sw_range: "0-112°C",                   //水温参考范围
                                if_sw_err: if_sw_err,                  //水温本次检测是否正常，False显示状态良好，True显示异常
                                sw: sw,                                //水温本次检测值
                                if_lt_sw_err: if_lt_sw_err,            //水温长期检测是否正常，False显示状态良好，True显示异常
                                lt_sw: lt_sw,                          //水温长期检测值
                                sw_content: "http://api.bibibaba.cn/help/sw",                          //水温背景知识
                                chqwd_range: "300-800°C",              //三元催化器温度参考范围
                                if_chqwd_err: if_chqwd_err,            //三元催化器温度本次检测是否正常，False显示状态良好，True显示异常
                                chqwd: chqwd,                          //三元催化器温度本次检测值
                                if_lt_chqwd_err: if_lt_chqwd_err,      //三元催化器温度长期检测是否正常，False显示状态良好，True显示异常
                                lt_chqwd: lt_chqwd,                    //三元催化器温度长期检测值
                                chqwd_content: "http://api.bibibaba.cn/help/chqwd"                    //三元催化器温度背景知识
                            };

                            // 更新最后体检数据
                            db.updateLastHealthCheck(data);
                            res.send(data);
                        });
                    });
                }else{
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getOBDData = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var device_id = req.params.device_id;
            var type = parseInt(req.query.type); //1: 电压 2：节气门 3:怠速 4：水温 5：催化器
            var if_err = false;
            var if_lt_err = false;
            var if_rl_err = false;
            var range = "";
            var url = "";

            db.getDevice(device_id, function(device){
                if(device){
                    db.getDeviceOdbDataStat(device.serial, type, function(doc){
                        switch(type){
                            case 1:
                                if(device.active_obd_data != undefined){
                                    doc.real_value = device.active_obd_data.dpdy;
                                }else{
                                    doc.real_value = 0;
                                }
                                if_err = doc.last_trip_value < 11 || doc.last_trip_value > 15;
                                if_lt_err = doc.long_term_value < 11 || doc.long_term_value > 15;
                                if_rl_err = doc.real_value > 0 && (doc.real_value < 11 || doc.real_value > 15);
                                range = "11-15V";
                                url = "http://api.bibibaba.cn/help/dpdy";
                                break;
                            case 2:
                                if(device.active_obd_data != undefined){
                                    doc.real_value = device.active_obd_data.jqmkd;
                                }else{
                                    doc.real_value = 0;
                                }
                                if_err = doc.last_trip_value < 12 || doc.last_trip_value > 17;
                                if_lt_err = doc.long_term_value < 12 || doc.long_term_value > 17;
                                if_rl_err = doc.real_value > 0 && (doc.real_value < 12 || doc.real_value > 17);
                                range = "12-17%";
                                url = "http://api.bibibaba.cn/help/jqmkd";
                                break;
                            case 3:
                                if(device.active_obd_data != undefined){
                                    doc.real_value = device.active_obd_data.fdjzs;
                                }else{
                                    doc.real_value = 0;
                                }
                                if_err = doc.last_trip_value < 600 || doc.last_trip_value > 1000;
                                if_lt_err = doc.long_term_value < 600 || doc.long_term_value > 1000;
                                if_rl_err = doc.real_value > 0 && (doc.real_value < 600 || doc.real_value > 1000);
                                range = "600-1000 rpm";
                                url = "http://api.bibibaba.cn/help/fdjzs";
                                break;
                            case 4:
                                if(device.active_obd_data != undefined){
                                    doc.real_value = device.active_obd_data.sw;
                                }else{
                                    doc.real_value = 0;
                                }
                                if_err = doc.last_trip_value < 0 || doc.last_trip_value > 112;
                                if_lt_err = doc.long_term_value < 0 || doc.long_term_value > 112;
                                if_rl_err = doc.real_value > 0 && (doc.real_value < 0 || doc.real_value > 112);
                                range = "0-112°C";
                                url = "http://api.bibibaba.cn/help/sw";
                                break;
                            case 5:
                                if(device.active_obd_data != undefined){
                                    doc.real_value = device.active_obd_data.chqwd;
                                }else{
                                    doc.real_value = 0;
                                }
                                if_err = doc.last_trip_value < 300 || doc.last_trip_value > 800;
                                if_lt_err = doc.long_term_value < 300 || doc.long_term_value > 800;
                                if_rl_err = doc.real_value > 0 && (doc.real_value < 300 || doc.real_value > 800);
                                range = "300-800°C";
                                url = "http://api.bibibaba.cn/help/chqwd";
                                break;
                            default:
                                break;
                        }
                        doc.if_err = if_err;
                        doc.if_lt_err = if_lt_err;
                        doc.if_rl_err = if_rl_err;
                        doc.range = range;
                        doc.url = url;
                        res.send(doc);
                    });
                }else{
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getOBDDataChart = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var device_id = req.params.device_id;
            var type = parseInt(req.query.type); //1: 电压 2：节气门 3:怠速 4：水温 5：催化器
            var if_err = false;
            var if_lt_err = false;
            var if_rl_err = false;

            db.getDevice(device_id, function(device){
                if(device){
                    db.getDeviceLastOneMonthOdbData(device.serial, type, function(docs){
                        res.send(docs);
                    });
                }else{
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getActiveOBDData = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var device_id = req.params.device_id;
            var type = parseInt(req.query.type); //1: 电压 2：节气门 3:怠速 4：水温 5：催化器
            var if_rl_err = false;
            var doc = {};

            db.getDevice(device_id, function(device){
                if(device){
                    switch (type) {
                        case 1:
                            if (device.active_obd_data != undefined) {
                                doc.real_value = device.active_obd_data.dpdy;
                            } else {
                                doc.real_value = 0;
                            }
                            if_rl_err = doc.real_value > 0 && (doc.real_value < 11 || doc.real_value > 15);
                            break;
                        case 2:
                            if (device.active_obd_data != undefined) {
                                doc.real_value = device.active_obd_data.jqmkd;
                            } else {
                                doc.real_value = 0;
                            }
                            if_rl_err = doc.real_value > 0 && (doc.real_value < 12 || doc.real_value > 17);
                            break;
                        case 3:
                            if (device.active_obd_data != undefined) {
                                doc.real_value = device.active_obd_data.fdjzs;
                            } else {
                                doc.real_value = 0;
                            }
                            if_rl_err = doc.real_value > 0 && (doc.real_value < 600 || doc.real_value > 1000);
                            break;
                        case 4:
                            if (device.active_obd_data != undefined) {
                                doc.real_value = device.active_obd_data.sw;
                            } else {
                                doc.real_value = 0;
                            }
                            if_rl_err = doc.real_value > 0 && (doc.real_value < 0 || doc.real_value > 112);
                            break;
                        case 5:
                            if (device.active_obd_data != undefined) {
                                doc.real_value = device.active_obd_data.chqwd;
                            } else {
                                doc.real_value = 0;
                            }
                            if_rl_err = doc.real_value > 0 && (doc.real_value < 300 || doc.real_value > 800);
                            break;
                        default:
                            break;
                    }
                    doc.if_rl_err = if_rl_err;
                    res.send(doc);
                }else{
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getFaultList = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDeviceOdbErrList(device.serial, min_id, max_id, function (docs) {
                        res.send(docs);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getFaultDesc = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obd_err = [];
            if(typeof req.body.obd_err != "object"){
                obd_err = eval("(" + req.body.obd_err + ")");
            }else{
                obd_err = req.body.obd_err;
            }
            var brand = decodeURIComponent(req.body.brand);
            db.getObdListByCode(obd_err, brand, function (docs) {
                var category = "";
                for(var i = 0; i < docs.length; i++){
                    category = docs[i].category;
                    var s = category.indexOf("（");
                    if(s > -1){
                        docs[i].category = category.substring(0, s) + "故障";
                    }else{
                        docs[i].category = category + "故障";
                    }
                    if(category == "车身系统"){
                        docs[i].level = 3;
                    }else if(category == "辅助输入" || category == "计算机或辅助输出电路" || category == "计算机或辅助输出" || category == "网络通讯系统" || category == "底盘系统"){
                        docs[i].level = 4;
                    }else{
                        docs[i].level = 5;
                    }
                }
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getFaultDescNew = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obd_err = [];
            if(typeof req.body.obd_err != "object"){
                obd_err = eval("(" + req.body.obd_err + ")");
            }else{
                obd_err = req.body.obd_err;
            }
            var brand = decodeURIComponent(req.body.brand);
            db.getObdListByCode(obd_err, brand, function (docs) {
                var category = "";
                var advice = "车辆很健康，请放心行驶。";
                var max_level = 0;
                for(var i = 0; i < docs.length; i++){
                    category = docs[i].category;
                    var s = category.indexOf("（");
                    if(s > -1){
                        docs[i].category = category.substring(0, s) + "故障";
                    }else{
                        docs[i].category = category + "故障";
                    }
                    if(category == "车身系统"){
                        docs[i].level = 3;

                    }else if(category == "辅助输入" || category == "计算机或辅助输出电路" || category == "计算机或辅助输出" || category == "网络通讯系统" || category == "底盘系统"){
                        docs[i].level = 4;
                    }else{
                        docs[i].level = 5;
                    }
                    if(max_level < docs[i].level){
                        max_level = docs[i].level;
                    }
                }
                if(max_level == 3){
                    advice = "车辆发现故障，但您仍可以继续行驶，建议咨询在线专家，然后前往4S店或专修店检查。";
                }else if(max_level == 4){
                    advice = "车辆发现较大故障，建议咨询在线专家，然后尽快到附近的4S店或者汽修店进行检查维修。";
                }else if(max_level == 5){
                    advice = "车辆发现较严重故障，请立即咨询在线专家，尽快确定故障并前往4S店或者就近的汽修店进行检修。";
                }
                var new_docs = {
                    max_level: max_level,
                    advice: advice,
                    data: docs
                };
                res.send(new_docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getAlertList = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getDevice(device_id, function(device){
                if(device){
                    db.getAlertList(device.serial, min_id, max_id, function (docs) {
                        res.send(docs);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getDayTrip = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = parseInt(req.params.device_id);
            var day = req.query.day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDayTrip(device_id, device.serial, day, city, gas_no, function (trips_total) {
                        // 把地址进行百度纠偏
                        revise.gpsToBaidu(trips_total.data, "start_loc", function(rev_docs){
                            for(var i = 0; i < trips_total.data.length; i++){
                                if (rev_docs) {
                                    for (var j = 0; j < rev_docs.length; j++) {
                                        if(rev_docs[j]){
                                            if (trips_total.data[i].start_lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && trips_total.data[i].start_lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                                trips_total.data[i].start_lon = trips_total.data[i].start_lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                                trips_total.data[i].start_lat = trips_total.data[i].start_lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            revise.gpsToBaidu(trips_total.data, "end_loc", function(rev_docs){
                                for(var i = 0; i < trips_total.data.length; i++){
                                    if (rev_docs) {
                                        for (var j = 0; j < rev_docs.length; j++) {
                                            if(rev_docs[j]){
                                                if (trips_total.data[i].end_lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && trips_total.data[i].end_lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                                    trips_total.data[i].end_lon = trips_total.data[i].end_lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                                    trips_total.data[i].end_lat = trips_total.data[i].end_lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                res.send(trips_total);
                            });
                        });
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getMonthTripStat = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var year = parseInt(req.query.year);
            var month = parseInt(req.query.month);
            db.getDevice(device_id, function(device){
                if(device){
                    db.getMonthTripStat(device.serial, year, month, function (docs) {
                        res.send(docs);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getDayTripStat = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.params.device_id;
            var year = parseInt(req.query.year);
            var month = parseInt(req.query.month);
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDayTripStat(device.serial, year, month, function (docs) {
                        res.send(docs);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getDayTotal = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var day = req.query.day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDayTotal(device_id, device.serial, day, city, gas_no, function (trips_total) {
                       res.send(trips_total);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getDayDriveStat = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = parseInt(req.params.device_id);
            var day = req.query.day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDayDriveStat(device_id, device.serial, day, city, gas_no, function (trips_total) {
                        res.send(trips_total);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getDriveStat = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = parseInt(req.params.device_id);
            var start_day = req.query.start_day;
            var end_day = req.query.end_day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            db.getDevice(device_id, function(device){
                if(device){
                    db.getDriveStat(device_id, device.serial, start_day, end_day, city, gas_no, function (trips_total) {
                        res.send(trips_total);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getTotal = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var start_day = req.query.start_day;
            var end_day = req.query.end_day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            db.getDevice(device_id, function(device){
                if(device){
                    db.getTotal(device_id, device.serial, start_day, end_day, city, gas_no, function (trips_total) {
                        if(device.active_obd_data && device.active_obd_data.syyl){
                            if(device.active_obd_data.syyl > 70){
                                device.active_obd_data.syyl = 70;
                            }
                            trips_total.left_distance = parseInt(device.active_obd_data.syyl / parseFloat(trips_total.avg_fuel) * 100);
                        }else{
                            trips_total.left_distance = 0;
                        }
                        res.send(trips_total);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getTotal2 = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var start_day = req.query.start_day;
            var end_day = req.query.end_day;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            var type = req.query.type; //获取数据类型（1：周 2：月）
            db.getDevice(device_id, function(device){
                if(device){
                    db.getTotal2(device_id, device.serial, start_day, end_day, city, gas_no, type, function (trips_total) {
                        if(device.active_obd_data && device.active_obd_data.syyl){
                            if(device.active_obd_data.syyl > 70){
                                device.active_obd_data.syyl = 70;
                            }
                            trips_total.left_distance = parseInt(device.active_obd_data.syyl / parseFloat(trips_total.avg_fuel) * 100);
                        }else{
                            trips_total.left_distance = 0;
                        }
                        res.send(trips_total);
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getFeeDetail = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var device_id = req.params.device_id;
            var city = req.query.city;
            var gas_no = req.query.gas_no;
            var min_id = req.query.min_id;
            var fuel_ratio = 1;
            var displacement = 1.6;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getDevice(device_id, function(device){
                if(device){
                    db.getFeeDetail(device.serial, min_id,  max_id, function (trips) {
                        if(gas_no != undefined && gas_no != ""){
                            if(gas_no == "0#" || gas_no == "0"){
                                gas_no = "fuel0";
                            }else if(gas_no == "90#" || gas_no == "90"){
                                gas_no = "fuel90";
                            }else if(gas_no == "93#(92#)" || gas_no == "93"){
                                gas_no = "fuel93";
                            }else if(gas_no == "97#(95#)" || gas_no == "97"){
                                gas_no = "fuel97";
                            }
                        }else{
                            gas_no = "fuel93";
                        }
                        db.getCarCity(city, function (car_city) {
//                            db.getVehicleByDeviceID(device_id, function (vehicle) {
//                                if (vehicle) {
//                                    db.getTypeByID(vehicle.car_type_id, function(type){
//                                        if(type && type.displacement != undefined){
//                                            displacement = type.displacement;
//                                        }else{
//                                            displacement = 1.6;
//                                        }
//                                        displacement = 1.6;
//                                        db.getSeriesByID(vehicle.car_series_id, function (series) {
//                                            if(series){
//                                                fuel_ratio = series.fuel_ratio;
//                                            }else{
//                                                fuel_ratio = 1;
//                                            }
//                                            for (var i = 0; i < trips.length; i++) {
//                                                trips[i].total_distance = trips[i].total_distance.toFixed(1);
//                                                trips[i].total_fuel = trips[i].total_fuel * fuel_ratio * displacement;
//                                                trips[i].total_fee = (trips[i].total_fuel * parseFloat(car_city.fuel_price[gas_no])).toFixed(1);
//                                                trips[i].avg_fuel = (trips[i].total_fuel / trips[i].total_distance * 100).toFixed(2);
//                                            }
//                                            res.send(trips);
//                                        });
//                                    });
//                                } else {
//                                    fuel_ratio = 1;
//                                    displacement = 1.6;
//                                    for (var i = 0; i < trips.length; i++) {
//                                        trips[i].total_distance = trips[i].total_distance.toFixed(1);
//                                        trips[i].total_fuel = trips[i].total_fuel * fuel_ratio * displacement;
//                                        trips[i].total_fee = (trips[i].total_fuel * parseFloat(car_city.fuel_price[gas_no])).toFixed(1);
//                                        trips[i].avg_fuel = (trips[i].total_fuel / trips[i].total_distance * 100).toFixed(2);
//                                    }
//                                    res.send(trips);
//                                }
//                            });
                            for (var i = 0; i < trips.length; i++) {
                                trips[i].total_distance = trips[i].total_distance.toFixed(1);
                                trips[i].total_fuel = trips[i].total_fuel;
                                trips[i].total_fee = (trips[i].total_fuel * parseFloat(car_city.fuel_price[gas_no])).toFixed(1);
                                trips[i].avg_fuel = (trips[i].avg_fuel).toFixed(2);
                            }
                            res.send(trips);
                        });
                    });
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//月驾驶排行版
exports.getMonthDriveRank = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            db.getMonthDriveRank(function (ranks) {
                res.send(ranks);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//总驾驶排行版
exports.getTotalDriveRank = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            db.getTotalDriveRank(function (ranks) {
                res.send(ranks);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//月油耗排行版-同排量
exports.getMonthFuelRank = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var obj_id = req.query.obj_id;
            var displacement = "1.4";
            db.getMonthFuelRank(displacement, function (trips_total) {
                res.send(trips_total);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//总油耗排行版-同排量
exports.getTotalFuelRank = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, event_type, event_status, speed, direct, gps_flag, mileage, fuel, lon, lat
            var obj_id = req.query.obj_id;
            var displacement = "1.4";
            db.getTotalFuelRank(displacement, function (trips_total) {
                res.send(trips_total);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//删除行程
exports.deleteTrip = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var trip_id = req.params.trip_id;
            db.deleteTrip(trip_id, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

//录入行程实际油耗
exports.updateTrip = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var trip_id = req.params.trip_id;
            var trip_name = decodeURIComponent(req.params.trip_name);
            var act_avg_fuel = parseFloat(req.body.act_avg_fuel);
            db.updateTripActAvgFuel(trip_id, act_avg_fuel, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

//录入行程名称
exports.updateTripName = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var trip_id = req.params.trip_id;
            var trip_name = decodeURIComponent(req.body.trip_name);
            db.updateTripName(trip_id, trip_name, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 车辆加油修正
exports.refuel = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var device_id = req.params.device_id;
            var number = parseInt(req.body.number); //1: 第一次  2: 第二次
            var quantity = parseFloat(req.body.quantity); //加油升数

            db.getDevice(device_id, function(device){
                if(device){
                    // 更新终端加油次数
                    db.updateDeviceRefuel(device_id, number, quantity, device.active_gps_data.mileage, function(row){

                    });
                    // 处理加油算法
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }else{
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 重置加油修正
exports.resetRefuel = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //serial, fault_code, fault_desc
            var device_id = req.params.device_id;

            db.getDevice(device_id, function(device){
                if(device){
                    // 更新终端加油次数
                    db.updateDeviceRefuel(device_id, 1, 0, 0, function(row){
                        db.updateDeviceRefuel(device_id, 2, 0, 0, function(row){
                            // 处理加油算法
                            result = {
                                "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                            };
                            res.send(result);
                        });
                    });
                }else{
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//更新隐身状态
exports.updateStealth = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var device_id = req.params.device_id;
            var stealth_mode = req.body.stealth_mode;
            db.updateDeviceStealth(device_id, stealth_mode, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 更新终端净化模式
exports.setAirMode = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var device_id = req.params.device_id;
            var air_mode = req.body.air_mode;
            var air_time = req.body.air_time;
            var air_duration = req.body.air_duration;
            db.updateDeviceAirMode(device_id, air_mode, air_time, air_duration, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 更新终端净化器速度
exports.setAirSpeed = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var result;
            var device_id = req.params.device_id;
            var air_speed = req.body.air_speed;
            db.updateDeviceAirSpeed(device_id, air_speed, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 将终端调拨到经销商名下
exports.updateDealer = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var serial = req.params.serial;
            var dealer_id = req.params.dealer_id;
            db.updateDeviceDealer(serial, dealer_id, function (row) {
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
