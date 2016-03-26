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

var option = {
    //创建限制字段
    create_fields: "",
    // 更新,删除查询限制字段
    query_fields: "",
    // 更新限制字段
    update_fields: "",
    //获取列表查询限制字段
    list_fields: "game_id"
};
var core_router = new core.core_router(db.table_name_def.TAB_GAME, option);

//exports.new = core_router.new();
//exports.update = core_router.update();
//exports.delete = core_router.delete();
//exports.list = core_router.list();
//exports.get = core_router.get();

//game_id: String,       //游戏id(由系统随机产生一个唯一编码)
//    open_id: String,       //创建人微信id
//    type: Number,          //1: 拼图 2: 猜图 3: 猜音乐
//    material_url: String,  //素材地址(图片,音乐,视频)
//    answer: [],            //正确答案(如果答案是单值则放在数组第一个元素)
exports.new = function (req, res) {
    var create_json = util.getCreateJson(req.query, "open_id,type,material_url,answer,level");
    var timestamp = Date.parse(new Date());
    var game_id = util.md5(timestamp.toString());
    game_id = game_id.substr(0, 10).toUpperCase();
    create_json.game_id = game_id;
    db.create2(db.table_name_def.TAB_GAME, create_json, false, null, null, false, null, null, function (status) {
        if (status == define.DB_STATUS_OK) {
            result = {
                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                "game_id": game_id
            };
            res.send(result);
        } else {
            result = {
                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            };
            res.send(result);
        }
    });
};

exports.get = function(req, res){
    var game_id = req.query.game_id;
    var query_json = {"game_id": game_id};
    db.get(db.table_name_def.TAB_GAME, query_json, "type,open_id,material_url", function(game){
        res.send(game);
    });
};

exports._get = function(game_id, callback){
    var query_json = {"game_id": game_id};
    db.get(db.table_name_def.TAB_GAME, query_json, "answer,level", function(game){
        callback(game);
    });
};