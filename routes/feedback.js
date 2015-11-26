/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");

// 新增反馈
exports.new = function(req, res){
    var result;
    var content = decodeURIComponent(req.body.content);
    var cust_id = req.body.cust_id;
    var contact = decodeURIComponent(req.body.contact);
    db.addFeedback(cust_id, contact, content, function (err) {
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
};

