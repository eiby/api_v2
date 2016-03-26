/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 16/1/8
 * Time: 下午1:41
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

// 更新日统计字段加1
exports.inc = function(req, res){
    var update_fields = "air_praise";
    var json = util.getQueryAndUpdateJson(req.query, "day_trip_id", update_fields);
    var query = json.query;
    var update = {"$inc": json.update};

    if(json.has_query){
        db.findAndUpdate2(db.table_name_def.TAB_DAY_TRIP, query, update, function(status){
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