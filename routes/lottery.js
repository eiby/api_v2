/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 16/3/22
 * Time: 上午9:11
 * WiStorm Router JS
 * Name:
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var core = require("./core.js");
var http = require("http");

//var option = {
//    //创建限制字段
//    create_fields: "",
//    // 更新,删除查询限制字段
//    query_fields: "",
//    // 更新限制字段
//    update_fields: "",
//    //获取列表查询限制字段
//    list_fields: ""
//};
//var core_router = new core.core_router(option);
//
//exports.new = core_router.new();
//exports.update = core_router.update();
//exports.delete = core_router.delete();
//exports.list = core_router.list();

exports.draw = function(req, res){
    var cust_id = parseInt(req.query.cust_id);
    var open_id = req.query.open_id;
    var query = {"sum": {"$gt": 0}, "is_disable": 0};
    var fields = "name,type,probability,remark,content,msg";
    var sorts = "probability";
    var page = "";

    db.list(db.table_name_def.TAB_LOTTERY, query, fields, sorts, page, 0, 0, -1, function (docs) {
        var p = Math.random() * 10000;
        var w = 0;
        var doc = null;
        for(var i = 0; i < docs.data.length; i++){
            w = w + docs.data[i].probability;
            if(p < w){
                doc = docs.data[i];
                break;
            }
        }
        if(doc && doc.type <= 6){
            // 注册用户, 判断用户名是否存在, 如果存在, 返回提醒信息
            var d = new Date();
            var d = d.format("yyyyMMddhhmmss");
            var code = util.md5(open_id + d);
            var code = code.substr(1, 10).toUpperCase();
            var value = 0;
            var msg = "";
            if(doc.type <= 2){
                var range = doc.content.split(",");
                var s = parseInt(range[0]);
                var e = parseInt(range[1]);
                value = parseInt(Math.random() * s + (e - s));
                msg = doc.msg.replace("%d", value);
            }else{
                msg = doc.msg;
            }
            var create_json = {
                cust_id: cust_id,           //用户id
                open_id: open_id,           //微信id
                is_win: 1,                  //是否抽中 1:抽中 0:未抽中
                is_receive: 0,
                lottery_id: doc.lottery_id, //奖品id
                code: code,                 //奖品识别码(对于任一奖品id有唯一标识)
                value: value                //数值
            };
            var is_judge_exists = false;
            var exists_query = {};
            db.create(db.table_name_def.TAB_LOTTERY_LOG, create_json, is_judge_exists, exists_query, "cust_id", false, null, null, function(status, id){
                if (status == define.DB_STATUS_OK) {
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "log_id": id,
                        "code": code,
                        "value": value,
                        "name": doc.name,
                        "type": doc.type,
                        "msg": msg
                    };
                } else {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }
                res.send(result);

            });
        }else{
            result = {
                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                "type": 7,
                "msg": "很不幸，未中奖，奖品已离你一步之遥！"
            };
            res.send(result);
        }
    });
};

exports.receive = function(req, res){
    var open_id = req.query.open_id;
    var code = req.query.code;
    var valid_code = req.query.valid_code;
    var now = new Date();
    var query_json = {'mobile': code, 'valid_code': valid_code, 'valid_time': {'$gte': now}};
    db.get(db.table_name_def.TAB_VALID_CODE, query_json, "valid_code", function(valid_code) {
        if (!valid_code) {
            result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        } else {
            query_json = {'open_id': open_id, 'code': code, 'is_receive': 0};
            var update_json = {'is_receive': 1};
            db.findAndUpdate(db.table_name_def.TAB_LOTTERY_LOG, query_json, update_json, function(status){
                if(status == define.DB_STATUS_OK){
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "code": code
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR,  //0 成功 >0 失败
                        "err_msg": "database error"
                    };
                }
                res.send(result);
            });
        }
    });
};