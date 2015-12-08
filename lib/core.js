/**
 * User: Tom
 * Date: 13-12-30
 * Time: 下午3:04
 * db core module
 */
//connect to DB
var mongoose = require('mongoose');
var config = require("./config.js");
var define = require("./define.js");
var util = require("./myutil.js");

// 创建数据库链接
var dbPath = config.mongo.url;
console.log(dbPath);
var db = mongoose.connect(dbPath, {read_secondary:true});

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

// Define Model
var Schema = mongoose.Schema;

// 自增ID生成器
var idg = new Schema({
    model_name: { type: String },
    current_id: { type: Number, default: 1 }
});
var m_idg = mongoose.model('idg', idg);

// 获得一个自增ID的方法
var getNewID = function (modelName, callback) {
    m_idg.findOneAndUpdate({'model_name': modelName}, {'$inc': {'current_id': 1}}, {'upsert': true}, function (err, doc) {
        callback(parseInt(doc.current_id));
    });
};
exports.getNewID = getNewID;

// 新增数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// create_json: 新增数据
// is_judge_exists: 是否判断数据存在
// exists_query: 判断存在的条件
// exists_fields: 判断存在之后返回的字段
// is_exists_update: 如果存在是否更新数据
// update_json: 更新的数据
exports._create = function (table_name, table_schema, unique_id, create_json, is_judge_exists, exists_query, exists_fields,
                         is_exists_update, update_query, update_json, callback) {
    var m_table = mongoose.model(table_name, table_schema);
    if(is_judge_exists){
        m_table.findOne(exists_query, exists_fields, function(err, data){
            if(data){
                if(is_exists_update){
                    m_table.update(update_query, {"$set": update_json}, function (err, row, raw) {
                        if(err){
                            callback(define.DB_STATUS_FAIL, data[unique_id]);
                        }else{
                            callback(define.DB_STATUS_EXISTS, data[unique_id]);
                        }
                    });
                }else{
                    callback(define.DB_STATUS_EXISTS, data[unique_id]);
                }
            }else{
                getNewID(table_name, function (id) {
                    create_json[unique_id] = id;
                    create_json["create_time"] = new Date();
                    create_json["update_time"] = new Date();
                    var i_table = new m_table(create_json);
                    i_table.save(function (err) {
                        if(err){
                            callback(define.DB_STATUS_FAIL);
                        }else{
                            callback(define.DB_STATUS_OK, id);
                        }
                    });
                });
            }
        });
    }else{
        getNewID(table_name, function (id) {
            create_json[unique_id] = id;
            create_json["create_time"] = new Date();
            create_json["update_time"] = new Date();
            var i_table = new m_table(create_json);
            i_table.save(function (err) {
                if(err){
                    callback(define.DB_STATUS_FAIL);
                }else{
                    callback(define.DB_STATUS_OK, id);
                }
            });
        });
    }
};

// 更新数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 更新条件
// update_json: 更新的数据
exports._update = function (table_name, table_schema, unique_id, query_json, update_json, callback) {
    var update_time = new Date();
    update_json.update_time = update_time;
    var m_table = mongoose.model(table_name, table_schema);
    m_table.update(query_json, {"$set": update_json}, function (err, row, raw) {
        if(row > 0){
            callback(define.DB_STATUS_OK);
        }else{
            callback(define.DB_STATUS_FAIL);
        }
    });
};

// 获取更新数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 更新条件
// update_json: 更新的数据
exports._findAndUpdate = function (table_name, table_schema, unique_id, query_json, update_json, callback) {
    var m_table = mongoose.model(table_name, table_schema);
    m_table.findOneAndUpdate(query_json, {'$set': update_json}, {'upsert': true}, function (err, doc) {
        if(err){
            callback(define.DB_STATUS_FAIL);
        }else{
            callback(define.DB_STATUS_OK, doc);
        }
    });
};

// 删除数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 删除条件
exports._remove = function (table_name, table_schema, unique_id, query_json, callback) {
    var m_table = mongoose.model(table_name, table_schema);
    m_table.remove(query_json, function (err) {
        if(err){
            callback(define.DB_STATUS_FAIL);

        }else{
            callback(define.DB_STATUS_OK);
        }
    });
};

// 获取单个数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 获取条件
exports._get = function (table_name, table_schema, unique_id, query_json, fields, callback) {
    // 默认必须有device_id
    fields[unique_id] = 1;
    var m_table = mongoose.model(table_name, table_schema);
    m_table.findOne(query_json, fields, function (err, data) {
        callback(data);
    });
};

// 获取统计数据
// table_name: 表名
// table_schema: 表结构对象
// query_json: 获取条件
exports._count = function (table_name, table_schema, query_json, callback) {
    var m_table = mongoose.model(table_name, table_schema);
    m_table.count(query_json, function (err, count) {
        callback(count);
    });
};

// 获取列表数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 获取条件
// fields: 返回字段
// sorts: 排序字段,如果倒序,在字段前面加-
// page: 分页字段
// min_id: 分页字段的本页最小值
// max_id: 分页字段的本页最小值
// limit: 返回条数;
exports._list = function(table_name, table_schema, unique_id, query_json, fields, sorts, page, min_id, max_id, limit, callback){
    var normal_query = query_json;
    var pre_query = util.clone(query_json);
    var next_query = util.clone(query_json);

    // 默认必须有device_id
    fields[unique_id] = 1;

    if(page != ""){
        pre_query[page] = {
            "$lt": min_id
        };
        next_query[page] = {
            "$gt": max_id
        };
    }
    var m_table = mongoose.model(table_name, table_schema);
    m_table.count(normal_query, function (err, count) {
        var option = {};
        if (limit == -1){
            option = {"sort": sorts};
        }else{
            option = {"sort": sorts, "limit": limit};
        }
        if (min_id > 0) {
            m_table.find(pre_query, fields, option, function (err, datas) {
                var result = {
                    total: count,
                    data: datas
                };
                callback(result);
            });
        } else if (max_id > 0) {
            m_table.find(next_query, fields, option, function (err, datas) {
                var result = {
                    total: count,
                    data: datas
                };
                callback(result);
            });
        } else {
            m_table.find(normal_query, fields, option, function (err, datas) {
                var result = {
                    total: count,
                    data: datas
                };
                callback(result);
            });
        }
    });
};