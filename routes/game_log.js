/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 16/3/25
 * Time: 上午10:42
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

//    game_id: String,       //游戏id(由系统随机产生一个唯一编码)
//    open_id: String,       //玩家微信id
//    completion: Number,    //完成度
//    add_wi_dou: Number,    //新增微豆
exports._new = function (game_id, open_id, callback) {
    var query_json = {
        game_id: game_id,
        open_id: open_id
    };
    var now = new Date();
    var update_json = {"completion": 0, "create_time": now};

    db.findAndUpdate(db.table_name_def.TAB_GAME_LOG, query_json, update_json, callback);
};

exports._update = function (game_id, open_id, add_wi_dou, finish_time, callback) {
    var query_json = {
        game_id: game_id,
        open_id: open_id
    };
    var update_json = {"add_wi_dou": add_wi_dou, "finish_time": finish_time, "completion": 100};

    db.update(db.table_name_def.TAB_GAME_LOG, query_json, update_json, callback);
};