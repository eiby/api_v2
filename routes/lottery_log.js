/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 16/3/22
 * Time: 下午5:22
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
    list_fields: ""
};
var core_router = new core.core_router(option);

//exports.new = core_router.new();
//exports.update = core_router.update();
//exports.delete = core_router.delete();
exports.list = core_router.list();