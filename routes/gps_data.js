/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 15/12/11
 * Time: 下午2:54
 * WiStorm Router JS -- Chat module
 * Name:
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var http = require("http");

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

exports.list = function(req, res){
    var json = util.getQueryJson(req.query, "serial,gps_time,rcv_time,air");
    var query = json.query;
    var page = req.query.page;
    var max_id = util.getID(req.query.max_id);
    var min_id = util.getID(req.query.min_id);
    var fields = req.query.fields;
    var sorts = req.query.sorts;
    var limit = parseInt(req.query.limit);
    var now = new Date();
    var table_name = 'gps_data_' + now.format('yyyyMM');
    var unique_id = '_id';
    var schema = db.gps_data;

    if(json.has_query) {
        db.list2(table_name, schema, unique_id, query, fields, sorts, page, min_id, max_id, limit, function (gps_datas) {
            res.send(gps_datas);
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
};