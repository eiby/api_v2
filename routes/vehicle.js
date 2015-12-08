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

// 修改车辆信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    //    cust_id: Number,                 //用户id
    //    obj_name: String,                //车牌号
    //    nick_name: String,               //车辆名称
    //    device_id: Number,               //终端id：0 表示没有绑定终端
    //    car_brand_id: Number,            //品牌id
    //    car_brand: String,               //车辆品牌
    //    car_series_id: Number,           //车型id
    //    car_series: String,              //车型
    //    car_type_id: Number,             //车款id
    //    car_type: String,                //车款
    //    engine_no: String,               //发动机号
    //    frame_no: String,                //车架号
    //    reg_no: String,                  //登记证书
    //    insurance_company: String,       //保险公司
    //    insurance_tel: String,           //保险公司电话
    //    insurance_date: Date,            //保险到期时间
    //    insurance_no: String,            //保险单号
    //    annual_inspect_date: Date,       //车辆年检日期
    //    maintain_company: String,        //保养4S店
    //    maintain_tel: String,            //保养4S店电话
    //    mileage: Number,                 //当前里程，需要动态更新
    //    maintain_last_mileage: Number,   //最后保养里程
    //    maintain_last_date: Date,        //最后保养时间
    //    gas_no: String,                  //汽油标号 0#, 90#, 93#(92#), 97#(95#)
    //    fuel_price: Number,              //加油油价
    //    buy_date: Date,                  //购车时间
    //    business_status: Number,         //业务状态 1:在店 2:离店
    //    last_arrive_time: Date,          //最后一次到店时间
    //    geofence: {                      //围栏
    //    //        geo_type: 0,       //0: 进出报警 1:驶入报警 2:驶出报警
    //    //        lon: 112,
    //    //        lat: 22,
    //    //        width: 1000
    //},
    //    vio_citys: [                     //违章城市
    //    //{ vio_city_name: '深圳', vio_location: '0755' }
    //]
    var update_fields = "cust_id,obj_name,nick_name,device_id,car_brand_id,car_brand,car_series_id,car_series,car_type_id,car_type,engine_no,frame_no," +
        "reg_no,insurance_company,insurance_tel,insurance_date,insurance_no,annual_inspect_date,maintain_company,maintain_tel,mileage,maintain_last_mileage," +
        "maintain_last_date,gas_no,fuel_price,buy_date,business_status,last_arrive_time,geofence,vio_citys";
    var json = util.getQueryAndUpdateJson(req.query, "obj_id", update_fields);
    var query = json.query;
    var update = json.update;

    //db.updateVehicle(obj_id, json, function (row) {
    if(json.has_query) {
        db.update(db.table_name_def.TAB_VEHICLE, query, update, function (status) {
            if (status == define.DB_STATUS_FAIL) {
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
    }else{
        result = {
            "status_code": define.API_STATUS_INVALID_PARAM,  //0 成功 >0 失败
            "err_msg": "invalid param"
        };
        res.send(result);
    }
};

exports.list = function (req, res) {
    var json = util.getQueryJson(req.query, "seller_id,cust_id,obj_id,obj_name");
    var query = json.query;
    var page = req.query.page;
    var max_id = util.getID(req.query.max_id);
    var min_id = util.getID(req.query.min_id);
    var fields = req.query.fields;
    var sorts = req.query.sorts;
    var limit = parseInt(req.query.limit);
    //db.getVehicleList(parent_cust_id, max_id, json, function (vehicles) {
    if(json.has_query) {
        db.list(db.table_name_def.TAB_VEHICLE, query, fields, sorts, page, min_id, max_id, limit, function (vehicles) {
            res.send(vehicles);
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
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
