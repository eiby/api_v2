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
var core = require("./core.js");
var http = require("http");

var option = {
    //创建限制字段
    create_fields: "obj_id,obj_name,car_brand_id,car_series,car_type,seller_id,cust_id,open_id,cust_name,device_id,maintain_last_mileage,mileage,last_arrive,exp_type,exp_reason",
    // 更新,删除查询限制字段
    query_fields: "exception_id",
    // 更新限制字段
    update_fields: "exp_type,exp_reason,pushed,push_time",
    //获取列表查询限制字段
    list_fields: "seller_id,obj_id,obj_name,exp_type"
};
var core_router = new core.core_router(db.table_name_def.TAB_EXCEPTION, option);

exports.new = core_router.new();
exports.update = core_router.update();
exports.delete = core_router.delete();
exports.list = core_router.list();
exports.get = core_router.get();

//// 创建新的车况异常
//exports.new = function (req, res) {
//    var create_json = util.getCreateJson(req.query, "obj_id,obj_name,car_brand_id,car_series,car_type,seller_id,cust_id,open_id,cust_name,device_id,maintain_last_mileage,mileage,last_arrive,exp_type,exp_reason");
//    db.create(db.table_name_def.TAB_EXCEPTION, create_json, false, null, null, false, null, null, function (status, exception_id) {
//        result = {
//            "status_code": define.API_STATUS_OK, //0 成功 >0 失
//            "exception_id": exception_id
//        };
//        res.send(result);
//    });
//};
//
//// 修改异常信息
//// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
//exports.update = function(req, res){
//    var update_fields = "exp_type,exp_reason,pushed,push_time";
//    var json = util.getQueryAndUpdateJson(req.query, "exception_id", update_fields);
//    var query = json.query;
//    var update = json.update;
//
//    if(json.has_query){
//        db.update(db.table_name_def.TAB_EXCEPTION, query, update, function(status){
//            if (status == define.DB_STATUS_FAIL) {
//                result = {
//                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
//                }
//            } else {
//                result = {
//                    "status_code": define.API_STATUS_OK  //0 成功 >0 失败
//                }
//            }
//            res.send(result);
//        });
//    }else{
//        result = {
//            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
//        };
//        res.send(result);
//    }
//
//};
//
//// 删除异常信息
//// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
//exports.delete = function(req, res){
//    var json = util.getQueryJson(req.query, "exception_id");
//    var query = json.query;
//
//    if(json.has_query){
//        db.remove(db.table_name_def.TAB_EXCEPTION, query, function(status){
//            if (status == define.DB_STATUS_FAIL) {
//                result = {
//                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
//                }
//            } else {
//                result = {
//                    "status_code": define.API_STATUS_OK  //0 成功 >0 失败
//                }
//            }
//            res.send(result);
//        });
//    }else{
//        result = {
//            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
//        };
//        res.send(result);
//    }
//
//};
//
//// 异常列表
//exports.list = function(req, res){
//    var json = util.getQueryJson(req.query, "seller_id,exp_type");
//    var query = json.query;
//    var page = req.query.page;
//    var max_id = util.getID(req.query.max_id);
//    var min_id = util.getID(req.query.min_id);
//    var fields = req.query.fields;
//    var sorts = req.query.sorts;
//    var limit = parseInt(req.query.limit);
//    if(json.has_query) {
//        db.list(db.table_name_def.TAB_EXCEPTION, query, fields, sorts, page, min_id, max_id, limit, function (docs) {
//            res.send(docs);
//        });
//    }else{
//        res.send(define.EMPTY_ARRAY);
//    }
//};
