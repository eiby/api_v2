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
var url = require('url');
var http = require('http');

// 新增处理地点
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //type, city, name, address, tel, lon, lat,
            var type = req.body.type;
            var city = decodeURIComponent(req.body.city);
            var name = decodeURIComponent(req.body.name);
            var address = decodeURIComponent(req.body.address);
            var tel = req.body.tel;
            var lon = parseFloat(req.body.lon);
            var lat = parseFloat(req.body.lat);
            db.addLocation(type, city, name, address, tel, lon, lat, function(err, loc_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "loc_id": loc_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 处理地点列表
//北京：交通执法站 车辆管理站 其他：交警大队 车管所
//http://api.map.baidu.com/place/v2/search?&query=%E4%BA%A4%E8%AD%A6%E5%A4%A7%E9%98%9F&location=22.580635,113.963417&radius=10000&output=json&ak=647127add68dd0a3ed1051fd68e78900&page_size=50&page_num=0&scope=2&filter=industry_type:life|sort_name:distance|sort_rule:1
//http://api.map.baidu.com/place/v2/search?ak=647127add68dd0a3ed1051fd68e78900&output=json&query=%E4%BA%A4%E8%AD%A6%E5%A4%A7%E9%98%9F&page_size=10&page_num=0&scope=2&region=%E6%B7%B1%E5%9C%B3&filter=sort_name:distance|sort_rule:0
//exports.list = function(req, res){
//    var auth_code = req.query.auth_code;
//    db.ifAuthCodeValid(auth_code, function(valid){
//        if(valid){
//            var type = req.query.type;
//            var city = req.query.city;
//            var min_id = req.query.min_id;
//            if(typeof  min_id == "undefined"){
//                min_id = 0;
//            }
//            var max_id = req.query.max_id;
//            if(typeof  max_id == "undefined"){
//                max_id = 0;
//            }
//            var cust_id = req.query.cust_id;
//            if(typeof  cust_id == "undefined"){
//                cust_id = 0;
//            }
//            db.getLocationList(type, city, min_id, max_id, function(docs){
//                var names = "";
//                for(var i = 0; i < docs.length; i++){
//                    names = names + docs[i].name + ","
//                }
//                names = names.substr(0, names.length - 1);
//                db.favoriteIsCollect(cust_id, names, function(favorites){
//                    for(var i = 0; i < docs.length; i++){
//                        docs[i].is_collect = 0;
//                        for(var j = 0; j < favorites.length; j++){
//                            if(docs[i].name == favorites[j].name){
//                                docs[i].is_collect = 1;
//                                break;
//                            }
//                        }
//                    }
//                    res.send(docs);
//                });
//            });
//        }else{
//            util.resSendNoRight(res);
//        }
//    });
//};

var locations = {};
locations["1"] = "东莞,中山,云浮,佛山,广州,惠州,揭阳,梅州,汕头,汕尾,江门,河源,深圳,清远,湛江,潮州,珠海,肇庆,茂名,阳江,韶关";  //车辆年检
locations["2"] = "东莞,中山,云浮,佛山,广州,惠州,揭阳,梅州,汕头,汕尾,江门,河源,深圳,清远,湛江,潮州,珠海,肇庆,茂名,阳江,韶关,北京,上海,天津,重庆";  //驾驶证年审换证
locations["3"] = "";  //违章处理地点

exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var type = parseInt(req.query.type);
            var city = req.query.city;
            var lon = req.query.lon;
            if(typeof lon == "undefined"){
                lon = 0;
            }else{
                lon = parseFloat(lon);
            }
            var lat = req.query.lat;
            if(typeof lat == "undefined"){
                lat = 0;
            }else{
                lat = parseFloat(lat);
            }
            var cust_id = req.query.cust_id;
            if(typeof cust_id == "undefined"){
                cust_id = 0;
            }else{
                cust_id = parseInt(cust_id);
            }
            var page_no = req.query.page_no;
            if(typeof page_no == "undefined"){
                page_no = 0;
            }else{
                page_no = parseInt(page_no) - 1;
            }
            var page_count = req.query.page_count;
            if(typeof page_count == "undefined"){
                page_count = 10;
            }else{
                page_count = parseInt(page_count);
            }
            var cust_id = req.query.cust_id;
            if(typeof cust_id == "undefined"){
                cust_id = 0;
            }else{
                cust_id = parseInt(cust_id);
            }
            var query = "";
            switch (type){
                case 1:
                    query = "汽车检测站";
                    break;
                case 2:
                    if(city == "北京"){
                        query = "车辆管理站";
                    }else{
                        query = "车管所";
                    }
                    break;
                case 3:
                    if(city == "北京"){
                        query = "执法站";
                    }else{
                        query = "交警大队";
                    }
                    break;
            }
            if(locations[req.query.type].indexOf(city) > -1){
                db.getLocationList(type, city, lon, lat, 100, function (docs) {
                    var names = "";
                    for (var i = 0; i < docs.length; i++) {
                        names = names + docs[i].name + ","
                    }
                    names = names.substr(0, names.length - 1);
                    db.favoriteIsCollect(cust_id, names, function (favorites) {
                        for (var i = 0; i < docs.length; i++) {
                            docs[i].is_collect = 0;
                            for (var j = 0; j < favorites.length; j++) {
                                if (docs[i].name == favorites[j].name) {
                                    docs[i].is_collect = 1;
                                    break;
                                }
                            }
                        }
                        res.send(docs);
                    });
                });
            }else{
                _getLocationList(query, lon, lat, 10000, city, 0, 100, function(docs){
                    var names = "";
                    for(var i = 0; i < docs.results.length; i++){
                        names = names + docs.results[i].name + ","
                    }
                    names = names.substr(0, names.length - 1);
                    db.favoriteIsCollect(cust_id, names, function(favorites){
                        for(var i = 0; i < docs.results.length; i++){
                            docs.results[i].is_collect = 0;
                            for(var j = 0; j < favorites.length; j++){
                                if(docs.results[i].name == favorites[j].name){
                                    docs.results[i].is_collect = 1;
                                    break;
                                }
                            }
                        }
                        var locs = [];
                        var loc = {};
                        for (var i = 0; i < docs.results.length; i++) {
                            if(docs.results[i].telephone == undefined){
                                tel = "";
                            }else{
                                tel = docs.results[i].telephone;
                            }
                            if(docs.results[i].detail_info == undefined){
                                loc = {
                                    name: docs.results[i].name,
                                    address: docs.results[i].address,
                                    tel: tel,
                                    lon: docs.results[i].location.lng,
                                    lat: docs.results[i].location.lat,
                                    is_collect: docs.results[i].is_collect
                                };
                            }else{
                                loc = {
                                    name: docs.results[i].name,
                                    address: docs.results[i].address,
                                    tel: tel,
                                    lon: docs.results[i].location.lng,
                                    lat: docs.results[i].location.lat,
                                    distance: docs.results[i].detail_info.distance,
                                    is_collect: docs.results[i].is_collect
                                };
                            }
                            locs.push(loc);
                        }
                        res.send(locs);
                    });
                });
            }
        }else{
            util.resSendNoRight(res);
        }
    });
};

//http://api.map.baidu.com/place/v2/search?&query=%E4%BA%A4%E8%AD%A6%E5%A4%A7%E9%98%9F&location=22.580635,113.963417&radius=10000&output=json&ak=647127add68dd0a3ed1051fd68e78900&page_size=10&page_num=0&scope=2&filter=industry_type:life|sort_name:distance|sort_rule:1
//http://api.map.baidu.com/place/v2/search?ak=647127add68dd0a3ed1051fd68e78900&output=json&query=%E4%BA%A4%E8%AD%A6%E5%A4%A7%E9%98%9F&page_size=10&page_num=0&scope=2&region=%E6%B7%B1%E5%9C%B3&filter=sort_name:distance|sort_rule:0
function _getLocationList(query, lon, lat, radius, city, page_no, page_count, callback){
    try{
        var file_url = "";
        if(lon == 0 && lat == 0){
            file_url = "http://api.map.baidu.com/place/v2/search?&query=" + query + "&region=" + city + "&radius=" + radius + "&output=json&ak=647127add68dd0a3ed1051fd68e78900&page_size=" + page_count + "&page_num=" + page_no + "&scope=2&filter=sort_name:distance|sort_rule:1";
        }else{
            file_url = "http://api.map.baidu.com/place/v2/search?&query=" + query + "&location=" + lat.toFixed(6) + "," + lon.toFixed(6) + "&radius=" + radius + "&output=json&ak=647127add68dd0a3ed1051fd68e78900&page_size=" + page_count + "&page_num=" + page_no + "&scope=2&filter=sort_name:distance|sort_rule:1";
        }
        var options = {
            host: url.parse(file_url).hostname,
            port: 80,
            path: url.parse(file_url).path,
            method:'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function(data) {
                responseString += data;
            });
            res.on('end', function() {
                responseString = responseString.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
                var resultObject = JSON.parse(responseString);
                if(callback){
                    callback(resultObject);
                }
            });
        });

        req.on('error', function(e) {
            // TODO: handle error.
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        // write data to request body
        //req.write(post_data);
        req.end();
    }catch(e){
        var resultObject = {
            status_code: define.API_STATUS_EXCEPTION,
            content:e.toString()
        };
        if(callback){
            callback(resultObject);
        }
    }
}