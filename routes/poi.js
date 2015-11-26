/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-29
 * Time: 下午3:33
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var fs = require('fs');
var define = require("../lib/define.js");
var revise = require('../lib/revise.js');

// 新增兴趣点
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var poi_name = req.body.poi_name;
            var cust_id = parseInt(req.body.cust_id);
            var poi_type;
            if(typeof req.body.poi_type == "undefined"){
                poi_type = 0;
            }else{
                poi_type = parseInt(req.body.poi_type);
            }
            var lon = parseFloat(req.body.lon);
            var lat = parseFloat(req.body.lat);
            var xy = revise.googleToGps(lon, lat);
            var remark = req.body.remark;
            if(xy){
                lon = xy.x;
                lat = xy.y;
            }
            var is_geo = req.body.is_geo;
            var width = req.body.width;
            db.addPoi(poi_name, cust_id, poi_type, lon, lat, is_geo, width, remark, function(err, poi_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "poi_id": poi_id
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 编辑兴趣点
exports.edit = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var poi_id = parseInt(req.params.poi_id);
            var poi_name = req.body.poi_name;
            var poi_type;
            if(typeof req.body.poi_type == "undefined"){
                poi_type = 0;
            }else{
                poi_type = parseInt(req.body.poi_type);
            }
            var lon = parseFloat(req.body.lon);
            var lat = parseFloat(req.body.lat);
            var xy = revise.googleToGps(lon, lat);
            if(xy){
                lon = xy.x;
                lat = xy.y;
            }
            var is_geo = parseInt(req.body.is_geo);
            var width = parseInt(req.body.width);
            var remark = req.body.remark;
            db.editPoi(poi_id, poi_name, poi_type, lon, lat, is_geo, width, remark, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
}

// 删除兴趣点
exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var poi_id = req.params.poi_id;
            db.deletePoi(poi_id, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
}

//获取cust_id下的兴趣点列表
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            var is_geo = req.query.is_geo;
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            db.getPoiList(cust_id, is_geo, function(pois){
                var page_pois = db.getPageData(pois, page_no, page_count);
                var rev;
                if(page_pois){
                    for(var i=0; i<page_pois.data.length; i++){
                        if(page_pois.data[i]){
                            rev = revise.gpsToGoogle(page_pois.data[i].lon, page_pois.data[i].lat);
                            page_pois.data[i].rev_lon = rev.x;
                            page_pois.data[i].rev_lat = rev.y;
                        }
                    }
                }
                res.send(page_pois);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
}

// 仅电子围栏搜素有效
exports.search = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id;
            if(typeof req.query.obj_id == "undefined"){
                obj_id = 0;
            }else{
                obj_id = parseInt(req.query.obj_id);
            }
            var poi_id;
            if(typeof req.query.poi_id == "undefined"){
                poi_id = 0;
            }else{
                poi_id = req.query.poi_id;
            }
            db.searchGeoList(obj_id, poi_id, function(pois){
                res.send(pois);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

