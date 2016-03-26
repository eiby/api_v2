/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-20
 * Time: 下午5:50
 * core router module
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var http = require("http");

//option:
//   create_fields: 创建限制字段
//   query_fields: 更新,删除查询限制字段
//   update_fields: 更新限制字段
//   list_fields: 获取列表查询限制字段
var core_router = function(table, option){
    this.table = table;
    this.option = option;
};

// 创建新的记录
core_router.prototype.new = function(){
    var table = this.table;
    var create_fields = this.option.create_fields;
    return function (req, res) {
        if(req.params.table != undefined){
            table = req.params.table;
        }
        var create_json = util.getCreateJson(req.query, create_fields);
        db.create(table, create_json, false, null, null, false, null, null, function (status, id) {
            result = {
                "status_code": define.API_STATUS_OK, //0 成功 >0 失
                "id": id
            };
            res.send(result);
        });
    }
};

// 修改记录
core_router.prototype.update = function(){
    var table = this.table;
    var query_fields = this.option.query_fields;
    var update_fields = this.option.update_fields;
    return function(req, res) {
        if(req.params.table != undefined){
            table = req.params.table;
        }
        var json = util.getQueryAndUpdateJson(req.query, query_fields, update_fields);
        var query = json.query;
        var update = json.update;
        if (json.has_query) {
            db.update(table, query, update, function (status) {
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
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
            };
            res.send(result);
        }
    }

};

// 删除记录
core_router.prototype.delete = function(){
    var table = this.table;
    var query_fields = this.option.query_fields;
    return function(req, res) {
        if(req.params.table != undefined){
            table = req.params.table;
        }
        var json = util.getQueryJson(req.query, query_fields);
        var query = json.query;

        if (json.has_query) {
            db.remove(table, query, function (status) {
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
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
            };
            res.send(result);
        }
    }

};

// 获取列表
core_router.prototype.list = function(){
    var table = this.table;
    var list_fields = this.option.list_fields;
    return function(req, res) {
        if(req.params.table != undefined){
            table = req.params.table;
        }
        var json = util.getQueryJson(req.query, list_fields);
        var query = json.query;
        var page = req.query.page;
        var max_id = util.getID(req.query.max_id);
        var min_id = util.getID(req.query.min_id);
        var fields = req.query.fields;
        var sorts = req.query.sorts;
        var limit = parseInt(req.query.limit);
        if (json.has_query) {
            db.list(table, query, fields, sorts, page, min_id, max_id, limit, function (docs) {
                res.send(docs);
            });
        } else {
            res.send(define.EMPTY_ARRAY);
        }
    }
};

// 获取详细信息
core_router.prototype.get = function(){
    var table = this.table;
    var list_fields = this.option.list_fields;
    return function(req, res) {
        if(req.params.table != undefined){
            table = req.params.table;
        }
        var json = util.getQueryJson(req.query, list_fields);
        var query = json.query;
        var fields = req.query.fields;
        if (json.has_query) {
            db.get(table, query, fields, function (doc) {
                res.send(doc);
            });
        } else {
            res.send(define.EMPTY_ARRAY);
        }
    }
};

exports.core_router = core_router;

var option = {
    // 创建限制字段
    create_fields: "",
    // 更新,删除查询限制字段
    query_fields: "",
    // 更新限制字段
    update_fields: "",
    // 获取列表查询限制字段
    list_fields: ""
};
var core_router = new core_router("", option);

exports.new = core_router.new();
exports.update = core_router.update();
exports.delete = core_router.delete();
exports.list = core_router.list();
exports.get = core_router.get();