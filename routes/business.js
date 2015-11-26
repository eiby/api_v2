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
