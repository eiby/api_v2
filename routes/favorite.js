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
var define = require("../lib/define.js");
var sms = require("../lib/sms.js");
var cust = require("./customer.js");

// 新增收藏
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //name, cust_id, address, tel, lon, lat,
            var cust_id = req.body.cust_id;
            var name = decodeURIComponent(req.body.name);
            var address = decodeURIComponent(req.body.address);
            var tel = req.body.tel;
            var lon = req.body.lon;
            var lat = req.body.lat;
            db.addFavorite(name, cust_id, address, tel, lon, lat, function(err, favorite_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "favorite_id": favorite_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 收藏列表
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getFavoriteList(cust_id, min_id, max_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var favorite_id = req.params.favorite_id;
            db.deleteFavorite(favorite_id, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                }else{
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    };
                    res.send(result);
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 收藏列表
exports.is_collect = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.query.cust_id;
            var names = req.query.names;
            db.favoriteIsCollect(cust_id, names, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};