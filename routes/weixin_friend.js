/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 16/3/17
 * Time: 上午10:01
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

// 微信好友关系表
//var weixin_friend = new Schema({
//    open_id: String,           //用户open_id
//    name: String,              //用户姓名
//    friend_open_id: String,    //好友open_id
//    friend_name: String,       //好友姓名
//    click_count: Number,       //阅读次数
//    create_time: Date,         //时间
//    update_time: Date          //更新时间
//});

exports.update = function(req, res){
    var update_fields = "click_count";
    var json = util.getQueryAndUpdateJson(req.query, "open_id,friend_open_id", update_fields);
    var name = req.query.name;
    var friend_name = req.query.friend_name;
    var click_count = parseInt(req.query.click_count);
    var query = json.query;
    var update = {"$inc": {"click_count": click_count}, "$set": {"name": name, "friend_name": friend_name}};

    if(json.has_query){
        db.findAndUpdate2(db.table_name_def.TAB_WEIXIN_FRIEND, query, update, function(status){
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