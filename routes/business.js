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

// 创建新的业务
exports.new = function (req, res) {
    //    cust_id: 车主用户ID
    //    cust_name: 车主名称
    //    obj_id: 车辆ID
    //    obj_name: 车牌号
    //    mileage: 行驶里程
    //    business_type: 业务类型
    //    business_content: 业务内容
    var cust_id = req.query.cust_id;
    var cust_name = req.query.cust_name;
    var obj_id = req.query.obj_id;
    var obj_name = req.query.obj_name;
    var mileage = parseInt(req.query.mileage);
    var business_type = parseInt(req.query.business_type);
    var business_content = req.query.business_content;

    db.addBusiness(cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, function (err, busi_id) {
        result = {
            "status_code": define.API_STATUS_OK, //0 成功 >0 失
            "business_id": busi_id
        };
        res.send(result);
    });
};

// 修改车辆信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    var business_id = req.query.business_id;
    var json = util.getUpdateJson(req.query, "business_id");

    db.updateBusiness(business_id, json, function (row) {
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

// 业务列表
exports.list = function(req, res){
    var access_token = req.query.access_token;
    var parent_cust_id = req.query.parent_cust_id;
    var status = parseInt(req.query.status);
    var query_type = parseInt(req.query.query_type);
    var begin_time = new Date(req.query.begin_time);
    var end_time = new Date(req.query.end_time);
    var fields = req.query.fields;
    var arr = fields.split(",");
    var json = {};
    for (var i = 0; i < arr.length; i++) {
        json[arr[i]] = 1;
    }

    var max_id = req.query.max_id;
    if (typeof max_id == "undefined") {
        max_id = 0;
    } else {
        max_id = parseInt(max_id);
    }
    db.getBusinessList(parent_cust_id, status, max_id, query_type, begin_time, end_time, json, function (docs) {
        res.send(docs);
    });
};

exports.total = function (req, res) {
    var parent_cust_id = req.query.parent_cust_id;
    var begin_time = new Date(req.query.begin_time);
    var end_time = new Date(req.query.end_time);
    db.getBusinessTotal(parent_cust_id, begin_time, end_time, function (total) {
        res.send(total);
    });
};
