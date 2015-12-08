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
var http = require("http");

// 创建新的车况异常
exports.new = function (req, res) {
    //    obj_id: Number,                //车辆ID
    //    obj_name: String,              //车牌号
    //    car_brand_id: Number,          //品牌ID
    //    car_series: String,            //车型
    //    car_type: String,              //车款
    //    seller_id: Number,             //商户ID
    //    cust_id: Number,               //客户ID
    //    open_id: String,               //微信登录ID
    //    cust_name: String,             //客户名称
    //    device_id: Number,             //设备ID
    //    maintain_last_mileage: Number, //最后保养里程
    //    mileage: Number,               //当前里程
    //    last_arrive: Date,             //最后到店时间
    //    exp_type: Number,              //异常类型 1:保养到期 2:长期未到店 3:故障
    //    exp_reason: String,            //异常原因
    //var obj_id = req.query.obj_id;
    //var obj_name = req.query.obj_name;
    //var car_brand_id = req.query.car_brand_id;
    //var car_series = req.query.car_series;
    //var car_type = req.query.car_type;
    //var seller_id = parseInt(req.query.seller_id);
    //var cust_id = req.query.cust_id;
    //var open_id = req.query.open_id;
    //var cust_name = req.query.cust_name;
    //var device_id = req.query.device_id;
    //var maintain_last_mileage = req.query.maintain_last_mileage;
    //var mileage = req.query.mileage;
    //var last_arrive = new Date(req.query.last_arrive);
    //var exp_type = req.query.exp_type;
    //var exp_reason = req.query.exp_reason;
    var create_json = util.getCreateJson(req.query, "obj_id,obj_name,car_brand_id,car_series,car_type,seller_id,cust_id,open_id,cust_name,device_id,maintain_last_mileage,mileage,last_arrive,exp_type,exp_reason");
    //db.addException(obj_id, obj_name, car_brand_id, car_series, car_type, seller_id, cust_id, cust_name, device_id, maintain_last_mileage, mileage, last_arrive, exp_type, exp_reason, function (err, exception_id) {
    db.create(db.table_name_def.TAB_EXCEPTION, create_json, false, null, null, false, null, null, function (status, exception_id) {
        result = {
            "status_code": define.API_STATUS_OK, //0 成功 >0 失
            "exception_id": exception_id
        };
        res.send(result);
    });
};

// 修改异常信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    //var exception_id = req.query.exception_id;
    //var json = util.getUpdateJson(req.query, "exception_id");
    var update_fields = "exp_type,exp_reason,pushed,push_time";
    var json = util.getQueryAndUpdateJson(req.query, "exception_id", update_fields);
    var query = json.query;
    var update = json.update;

    //db.updateException(exception_id, json, function (row) {
    if(json.has_query){
        db.update(db.table_name_def.TAB_EXCEPTION, query, update, function(status){
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
            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
        };
        res.send(result);
    }

};

// 删除异常信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.delete = function(req, res){
    //var exception_id = req.query.exception_id;
    var json = util.getQueryJson(req.query, "exception_id");
    var query = json.query;

    //db.removeException(exception_id, function (err) {
    if(json.has_query){
        db.remove(db.table_name_def.TAB_EXCEPTION, query, function(status){
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
            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
        };
        res.send(result);
    }

};

// 异常列表
exports.list = function(req, res){
    //seller_id, exp_type, fields, max_id
    //var parent_cust_id = req.query.parent_cust_id;
    //var exp_type = parseInt(req.query.exp_type);
    //var fields = req.query.fields;
    //var arr = fields.split(",");
    //var json = {};
    //for (var i = 0; i < arr.length; i++) {
    //    json[arr[i]] = 1;
    //}
    //var max_id = req.query.max_id;
    //if (typeof max_id == "undefined") {
    //    max_id = 0;
    //} else {
    //    max_id = parseInt(max_id);
    //}
    //db.getExceptionList(parent_cust_id, exp_type, json, max_id, function (docs) {
    var json = util.getQueryJson(req.query, "seller_id,exp_type");
    var query = json.query;
    var page = req.query.page;
    var max_id = util.getID(req.query.max_id);
    var min_id = util.getID(req.query.min_id);
    var fields = req.query.fields;
    var sorts = req.query.sorts;
    var limit = parseInt(req.query.limit);
    //db.getBusinessList(parent_cust_id, status, max_id, query_type, begin_time, end_time, json, function (docs) {
    if(json.has_query) {
        db.list(db.table_name_def.TAB_EXCEPTION, query, fields, sorts, page, min_id, max_id, limit, function (docs) {
            res.send(docs);
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
};

// 统计异常车况
exports.total = function (req, res) {
    //var parent_cust_id = req.query.parent_cust_id;
    //var begin_time = new Date(req.query.begin_time);
    //var end_time = new Date(req.query.end_time);
    //db.getBusinessTotal(parent_cust_id, begin_time, end_time, function (total) {
    //    res.send(total);
    //});
};
