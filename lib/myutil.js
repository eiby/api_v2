/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-22
 * Time: 下午4:10
 * To change this template use File | Settings | File Templates.
 */
var url = require("url");
//var queue = require("./queue.js");
var crypto = require('crypto');
var define = require("./define.js");
var http = require("http");
var algorithm = 'aes-128-ecb';
var key = '78541561566';
var clearEncoding = 'utf8';
var cipherEncoding = 'hex';

exports.getAuthCode = function (username) {
    var d = new Date();
    var d = d.format("yyyyMMdd");
    var auth_code = md5(username + d);
    return auth_code;
};

exports.getServiceEndDate = function () {
    var now = new Date();
    var service_end_date = new Date(now.getFullYear() + 1, now.getMonth(), 1);
    service_end_date = new Date(Date.parse(service_end_date) - (86400000 * 1));
    //console.log(service_end_date.toLocaleDateString());
    return service_end_date;
};

exports.dateAdd = function (src, sec) {
    var date = new Date(Date.parse(src) + sec * 1000);
    return date;
};

exports.dateAddEx = function (interval, number, d) {
    /*
     *   功能:实现VBScript的DateAdd功能.
     *   参数:interval,字符串表达式，表示要添加的时间间隔.
     *   参数:number,数值表达式，表示要添加的时间间隔的个数.
     *   参数:date,时间对象.
     *   返回:新的时间对象.
     *   var   now   =   new   Date();
     *   var   newDate   =   DateAdd( "d ",5,now);
     *---------------   DateAdd(interval,number,date)   -----------------
     */
    var date = new Date(d);
    switch (interval) {
        case "y":
        {
            date.setFullYear(date.getFullYear() + number);
            return date;
        }
        case "q":
        {
            date.setMonth(date.getMonth() + number * 3);
            return date;
        }
        case "m":
        {
            date.setMonth(date.getMonth() + number);
            return date;
        }
        case "w":
        {
            date.setDate(date.getDate() + number * 7);
            return date;
        }
        case "d":
        {
            date.setDate(date.getDate() + number);
            return date;
        }
        case "h":
        {
            date.setHours(date.getHours() + number);
            return date;
        }
        case "n":
        {
            date.setMinutes(date.getMinutes() + number);
            return date;
        }
        case "s":
        {
            date.setSeconds(date.getSeconds() + number);
            return date;
        }
        default:
        {
            date.setDate(date.getDate() + number);
            return date;
        }
    }
};

exports.dateDiff = function (d1, d2) {     //sDate1和sDate2是2004-10-18格式
    var mm = parseInt(Math.abs(d2 - d1) / 1000 / 60);    //把相差的毫秒数转换为分钟
    return mm;
};

exports.inArray = function (array, e) {
    var r = new RegExp(String.fromCharCode(2) + e + String.fromCharCode(2));
    return (r.test(String.fromCharCode(2) + array.join(String.fromCharCode(2)) + String.fromCharCode(2)));
};

function chr2Unicode(str) {
    if ('' != str) {
        var st, t, i;
        st = '';
        for (i = 1; i <= str.length; i++) {
            t = str.charCodeAt(i - 1).toString(16);
            if (t.length < 4)
                while (t.length < 4)
                    t = '0'.concat(t);
            t = t.slice(0, 2).concat(t.slice(2, 4));
            st = st.concat(t);
        }
        return (st.toUpperCase());
    }
    else {
        return ('');
    }
}

var md5 = function (content) {
    var hasher = crypto.createHash("md5");
    hasher.update(content, "utf8");
    return hasher.digest('hex');//hashmsg为加密之后的数据
};

exports.md5 = md5;

/*加密*/
var encodeAES = function(data){
    var cipher = crypto.createCipher(algorithm, key);
    var cipherChunks = [];
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
};

exports.encodeAES = encodeAES;

/*解密*/
var decodeAES = function(data){
    var decipher = crypto.createDecipher(algorithm, key);
    var plainChunks = [];
    plainChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    plainChunks.push(decipher.final(clearEncoding));
    return plainChunks.join('');
};

exports.decodeAES = decodeAES;

exports.ord = function (value) {
    if (value == true) {
        return 1;
    } else {
        return 0;
    }
};

exports.getAlertDesc = function (alert_type) {
//    exports.ALERT_SOS = 0x3001;
//    exports.ALERT_OVERSPEED = 0x3002;
//    exports.ALERT_VIRBRATE = 0x3003;
//    exports.ALERT_MOVE = 0x3004;
//    exports.ALERT_ALARM = 0x3005;
//    exports.ALERT_INVALIDRUN = 0x3006;
//    exports.ALERT_ENTERGEO = 0x3007;
//    exports.ALERT_EXITGEO = 0x3008;
//    exports.ALERT_CUTPOWER = 0x3009;
//    exports.ALERT_LOWPOWER = 0x300A;
//    exports.ALERT_GPSCUT = 0x300B;
//    exports.ALERT_OVERDRIVE = 0x300C;
//    exports.ALERT_INVALIDACC = 0x300D;
//    exports.ALERT_INVALIDDOOR = 0x300E;
    var desc = "";
    switch (alert_type) {
        case define.ALERT_SOS:
            desc = "紧急报警";
            break;
        case define.ALERT_OVERSPEED:
            desc = "超速报警";
            break;
        case define.ALERT_VIRBRATE:
            desc = "震动报警";
            break;
        case define.ALERT_MOVE:
            desc = "位移报警";
            break;
        case define.ALERT_ALARM:
            desc = "防盗器报警";
            break;
        case define.ALERT_INVALIDRUN:
            desc = "非法行驶报警";
            break;
        case define.ALERT_ENTERGEO:
            desc = "进围栏报警";
            break;
        case define.ALERT_EXITGEO:
            desc = "出围栏报警";
            break;
        case define.ALERT_CUTPOWER:
            desc = "剪线报警";
            break;
        case define.ALERT_LOWPOWER:
            desc = "低电压报警";
            break;
        case define.ALERT_GPSCUT:
            desc = "GPS断线报警";
            break;
        case define.ALERT_OVERDRIVE:
            desc = "疲劳驾驶报警";
            break;
        case define.ALERT_INVALIDACC:
            desc = "非法点火报警";
            break;
        case define.ALERT_INVALIDDOOR:
            desc = "非法开门报警";
            break;
    }
    return desc;
};

exports.resSendNoRight = function (res) {
    var result = {
        "status_code": define.API_STATUS_NORIGHT,  //没有授权
        "err_msg": "not authorized."
    };
    res.send(result);
};

exports.resSendCallback = function (res, result, callback) {
    if (callback == "") {
        res.send(result);
    } else {
        res.send(callback + "(" + JSON.stringify(result) + ");");
    }
};

exports.getMobileInfo = function (mobile, callback) {
    var url = "http://apis.juhe.cn/mobile/get?m=" + mobile + "&key=30dfb5f977581c9b3b1652fdd6bfe90e";
    http.get(url, function (res) {
        //console.log("Got response: " + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            var doc = eval("(" + chunk + ")");
            if (doc && doc.result && doc.resultcode != "203") {
                callback(doc.result);
            } else {
                callback({});
            }
        });
        res.on('error', function (e) {
            // TODO: handle error.
            if (callback) {
                callback({});
            }
        });
    });
};

// 查询违章
//http://v.juhe.cn/wz/query?city=GD_ZQ&hphm=%E7%B2%A4B9548T&hpzl=02&engineno=6192&key=8b596b7292f44285b3aa279a9c72fc7a
//{"resultcode":"200","reason":"查询成功","result":{"province":"GD","city":"GD_ZQ","hphm":"粤B9548T","hpzl":"02","lists":[{"date":"2013-05-03 16:27:00","area":"二广高速2631公里600米","act":"驾驶中型以上载客载货汽车、危险物品运输车辆以外的其他机动车行驶超过规定时速未达20%的","code":"","fen":"3","money":"150","handled":"0"}]}}
exports.getViolation = function (obj_name, city_code, engine_no, frame_no, reg_no, callback) {
    try {
        // http://v.juhe.cn/wz/citys?key=8b596b7292f44285b3aa279a9c72fc7a
        var path = '/wz/query?city=' + city_code + '&hphm=' + obj_name + '&hpzl=02&engineno=' + engine_no + '&classno=' + frame_no + '&registno=' + reg_no + '&key=8b596b7292f44285b3aa279a9c72fc7a';
        var options = {
            host: "v.juhe.cn",
            port: 80,
            path: path,
            method: 'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                responseString = responseString.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
                var resultObject = JSON.parse(responseString);
                if (callback) {
                    callback(resultObject);
                }
            });
        });

        req.on('error', function (e) {
            var resultObject = {
                resultcode: define.API_STATUS_CONNECT_FAIL,
                content: e.toString()
            };
            if (callback) {
                callback(resultObject);
            }
        });
        req.end();
    } catch (e) {
        var resultObject = {
            resultcode: define.API_STATUS_EXCEPTION,
            content: e.toString()
        };
        if (callback) {
            callback(resultObject);
        }
    }
};

function _post(file_url, data, callback) {
    try {
        //var post_data = JSON.stringify(data);
        var post_data = data;
        var headers = {
            //'Content-Type': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        };
        var obj = url.parse(file_url);
        var options = {
            host: obj.hostname,
            port: obj.port,
            path: obj.path,
            method: 'POST',
            headers: headers
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            if (res.statusCode == 200) {
                //console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                var responseString = '';
                res.on('data', function (data) {
                    responseString += data;
                });
                res.on('end', function () {
                    var resultObject = JSON.parse(responseString);
                    if (callback) {
                        callback(resultObject);
                    }
                });
            } else {
                callback(null);
            }
        });

        req.on('error', function (e) {
            // TODO: handle error.
            callback(null);
        });
        // write data to request body
        req.write(post_data);
        req.end();
    } catch (e) {
        callback(null);
    }
}

exports._post = _post;

function _get(file_url, callback) {
    try {
        var obj = url.parse(file_url);
        var options = {
            host: obj.hostname,
            port: parseInt(obj.port),
            path: obj.path,
            method: 'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                try {
                    var resultObject = JSON.parse(responseString);
                    if (callback) {
                        callback(resultObject);
                    }
                } catch (e) {
                    callback(responseString);
                }
            });
        });

        req.on('error', function (e) {
            // TODO: handle error.
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content: e.toString()
            };
            if (callback) {
                callback(resultObject);
            }
        });
        // write data to request body
        //req.write(post_data);
        req.end();
    } catch (e) {
        var resultObject = {
            status_code: define.API_STATUS_EXCEPTION,
            content: e.toString()
        };
        if (callback) {
            callback(resultObject);
        }
    }
}

exports._get = _get;

function _put(file_url, data, callback){
    try{
        var post_data = JSON.stringify(data);
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        };
        var obj = url.parse(file_url);
        var options = {
            host: obj.hostname,
            port: obj.port,
            path: obj.path,
            method:'PUT',
            headers: headers
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
                var resultObject = JSON.parse(responseString);
                if(callback){
                    callback(resultObject);
                }
            });
        });

        req.on('error', function(e) {
            // TODO: handle error.
            var resultObject = {
                status: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        // write data to request body
        req.write(post_data);
        req.end();
    }catch(e){
        var resultObject = {
            status: define.API_STATUS_EXCEPTION,
            content:e.toString()
        };
        if(callback){
            callback(resultObject);
        }
    }
}

exports._put = _put;

function _delete(file_url,  callback){
    try{
        var obj = url.parse(file_url);
        var options = {
            host: obj.hostname,
            port: obj.port,
            path: obj.path,
            method:'DELETE'
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

exports._del = _delete;

// 修改从58获取违章的调用方式 2014-08-18
exports.getViolationFree = function (obj_name, province, city, engine_no, frame_no, reg_no, callback) {
    try {
        // http://v.juhe.cn/wz/citys?key=8b596b7292f44285b3aa279a9c72fc7a
        var info = {};
        var path = "http://weizhang.58.com/m/illegal?mobileid=99000310506246&provincename=" + encodeURIComponent(province) + "&province=&carcityid=" + city + "&license_plate_num=" + obj_name.substr(1, obj_name.length - 1) + "&carprovince_input=" + encodeURIComponent(obj_name.substr(0, 1)) + "&platenum=" + encodeURIComponent(obj_name) + "&enginenum=" + engine_no + "&vin=" + frame_no;
        //var data = 'province=' + province + '&city_pinyin=' + city + '&license_plate_num=' + obj_name.substr(1, obj_name.length - 1) + '&car_province=' +  encodeURIComponent(obj_name.substr(0,1)) + '&engine_num=' + engine_no + '&body_num=' + frame_no;
        //var data = "province=guangdong&city_pinyin=shenzhen&license_plate_num=B9548T&car_province=%E7%B2%A4&engine_num=6192&body_num=019088";
        _get(path, function (obj) {
            //console.log(obj);
            if (obj && obj.option) {
                var result = {
                    money: parseInt(obj.option.count_yuan),
                    fen: parseInt(obj.option.count_fen),
                    infos: []
                };

                for (var i = 0; i < obj.option.infos.length; i++) {
                    var time = obj.option.infos[i].time;
                    time = time.substr(0, 4) + "-" + time.substr(5, 2) + "-" + time.substr(8, 2) + " " + time.substr(15, 5) + ":00";
                    var money = 0;
                    var points = 0;
                    if (obj.option.infos[i].money != undefined && obj.option.infos[i].money != "") {
                        money = parseInt(obj.option.infos[i].money);
                    }
                    if (obj.option.infos[i].points != undefined && obj.option.infos[i].points != "") {
                        points = parseInt(obj.option.infos[i].points);
                    }
                    info = {
                        act: obj.option.infos[i].illegalact,
                        area: obj.option.infos[i].address,
                        points: points,
                        money: money,
                        time: new Date(time),
                        handled: parseInt(obj.option.infos[i].isdeal)
                    };
                    result.infos.push(info);
                }

                callback(result);

            } else {
                callback(null);
            }
        });
    } catch (e) {
        var resultObject = {
            resultcode: define.API_STATUS_EXCEPTION,
            content: e.toString()
        };
        if (callback) {
            callback(resultObject);
        }
    }
};

// 查询天气
//http://v.juhe.cn/weather/index?cityname=%E6%B7%B1%E5%9C%B3&key=f37775ef5795c4279934fdc133bc78b4
//{"resultcode":"200","reason":"查询成功","result":{"province":"GD","city":"GD_ZQ","hphm":"粤B9548T","hpzl":"02","lists":[{"date":"2013-05-03 16:27:00","area":"二广高速2631公里600米","act":"驾驶中型以上载客载货汽车、危险物品运输车辆以外的其他机动车行驶超过规定时速未达20%的","code":"","fen":"3","money":"150","handled":"0"}]}}
exports.getWeather = function (city, callback) {
    try {
        // http://v.juhe.cn/wz/citys?key=8b596b7292f44285b3aa279a9c72fc7a
        var path = '/weather/index?cityname=' + city + '&key=f37775ef5795c4279934fdc133bc78b4';
        var options = {
            host: "v.juhe.cn",
            port: 80,
            path: path,
            method: 'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                responseString = responseString.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
                var resultObject = JSON.parse(responseString);
                if (callback) {
                    callback(resultObject);
                }
            });
        });

        req.on('error', function (e) {
            var resultObject = {
                resultcode: define.API_STATUS_CONNECT_FAIL,
                content: e.toString()
            };
            if (callback) {
                callback(resultObject);
            }
        });
        req.end();
    } catch (e) {
        var resultObject = {
            resultcode: define.API_STATUS_EXCEPTION,
            content: e.toString()
        };
        if (callback) {
            callback(resultObject);
        }
    }
};

exports.getWeatherQuality = function (city, callback) {
    try {
        // http://web.juhe.cn:8080/environment/air/cityair?city=%E4%B8%8A%E6%B5%B7&key=092f47b41d1d106436e3e895ea13b057
        var path = '/environment/air/cityair?city=' + city + '&key=092f47b41d1d106436e3e895ea13b057';
        var options = {
            host: "web.juhe.cn",
            port: 8080,
            path: path,
            method: 'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                responseString = responseString.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
                var resultObject = JSON.parse(responseString);
                if (callback) {
                    callback(resultObject);
                }
            });
        });

        req.on('error', function (e) {
            var resultObject = {
                resultcode: define.API_STATUS_CONNECT_FAIL,
                content: e.toString()
            };
            if (callback) {
                callback(resultObject);
            }
        });
        req.end();
    } catch (e) {
        var resultObject = {
            resultcode: define.API_STATUS_EXCEPTION,
            content: e.toString()
        };
        if (callback) {
            callback(resultObject);
        }
    }
};

exports.pad = function (num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
};

var cities_form_data = [{
    "body_length": 0,
    "city_id": 1,
    "city_name": "\u5317\u4eac",
    "city_pinyin": "beijing",
    "engine_length": -1,
    "province_name": "\u5317\u4eac",
    "province_pinyin": "beijing"
}, {
    "body_length": 0,
    "city_id": 2,
    "city_name": "\u4e0a\u6d77",
    "city_pinyin": "shanghai",
    "engine_length": -1,
    "province_name": "\u4e0a\u6d77",
    "province_pinyin": "shanghai"
}, {
    "body_length": 6,
    "city_id": 3,
    "city_name": "\u5e7f\u5dde",
    "city_pinyin": "guangzhou",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 4,
    "city_name": "\u6df1\u5733",
    "city_pinyin": "shenzhen",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 5,
    "city_name": "\u4e1c\u839e",
    "city_pinyin": "dongguan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 7,
    "city_name": "\u4f5b\u5c71",
    "city_pinyin": "foshan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 8,
    "city_name": "\u91cd\u5e86",
    "city_pinyin": "chongqing",
    "engine_length": 0,
    "province_name": "\u91cd\u5e86",
    "province_pinyin": "chongqing"
}, {
    "body_length": 6,
    "city_id": 9,
    "city_name": "\u676d\u5dde",
    "city_pinyin": "hangzhou",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 6,
    "city_id": 10,
    "city_name": "\u4e2d\u5c71",
    "city_pinyin": "zhongshan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 0,
    "city_id": 11,
    "city_name": "\u5357\u4eac",
    "city_pinyin": "nanjing",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 5,
    "city_id": 12,
    "city_name": "\u6b66\u6c49",
    "city_pinyin": "wuhan",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 0,
    "city_id": 14,
    "city_name": "\u65e0\u9521",
    "city_pinyin": "wuxi",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 6,
    "city_id": 15,
    "city_name": "\u5b81\u6ce2",
    "city_pinyin": "ningbo",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 0,
    "city_id": 17,
    "city_name": "\u5e38\u5dde",
    "city_pinyin": "changzhou",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 18,
    "city_name": "\u90d1\u5dde",
    "city_pinyin": "zhengzhou",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 0,
    "city_id": 20,
    "city_name": "\u897f\u5b89",
    "city_pinyin": "xian",
    "engine_length": -1,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": 4,
    "city_id": 21,
    "city_name": "\u6c88\u9633",
    "city_pinyin": "shenyang",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 6,
    "city_id": 22,
    "city_name": "\u6c55\u5934",
    "city_pinyin": "shantou",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": -1,
    "city_id": 23,
    "city_name": "\u6d4e\u5357",
    "city_pinyin": "jinan",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 24,
    "city_name": "\u9752\u5c9b",
    "city_pinyin": "qingdao",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 25,
    "city_name": "\u77f3\u5bb6\u5e84",
    "city_pinyin": "shijiazhuang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 0,
    "city_id": 26,
    "city_name": "\u957f\u6c99",
    "city_pinyin": "changsha",
    "engine_length": 5,
    "province_name": "\u6e56\u5357",
    "province_pinyin": "hunan"
}, {
    "body_length": 3,
    "city_id": 27,
    "city_name": "\u4e49\u4e4c",
    "city_pinyin": "yiwu",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": -1,
    "city_id": 28,
    "city_name": "\u54c8\u5c14\u6ee8",
    "city_pinyin": "haerbin",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 29,
    "city_name": "\u73e0\u6d77",
    "city_pinyin": "zhuhai",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 30,
    "city_name": "\u798f\u5dde",
    "city_pinyin": "fu1zhou",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 4,
    "city_id": 31,
    "city_name": "\u53a6\u95e8",
    "city_pinyin": "shamen",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 6,
    "city_id": 32,
    "city_name": "\u53f0\u5dde",
    "city_pinyin": "tai1zhou",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 6,
    "city_id": 33,
    "city_name": "\u6148\u6eaa",
    "city_pinyin": "cixi",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 34,
    "city_name": "\u5927\u8fde",
    "city_pinyin": "dalian",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 4,
    "city_id": 35,
    "city_name": "\u6cc9\u5dde",
    "city_pinyin": "quanzhou",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 6,
    "city_id": 36,
    "city_name": "\u6c5f\u95e8",
    "city_pinyin": "jiangmen",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 38,
    "city_name": "\u957f\u6625",
    "city_pinyin": "changchun",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 4,
    "city_id": 40,
    "city_name": "\u6606\u660e",
    "city_pinyin": "kunming",
    "engine_length": 4,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 41,
    "city_name": "\u4f59\u59da",
    "city_pinyin": "yuyao",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 3,
    "city_id": 42,
    "city_name": "\u6c38\u5eb7",
    "city_pinyin": "yongkang",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 0,
    "city_id": 45,
    "city_name": "\u6c5f\u9634",
    "city_pinyin": "jiangyin",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 46,
    "city_name": "\u7ecd\u5174\u53bf",
    "city_pinyin": "shaoxingxian",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 47,
    "city_name": "\u5409\u6797",
    "city_pinyin": "jilin",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 6,
    "city_id": 48,
    "city_name": "\u63ed\u9633",
    "city_pinyin": "jieyang",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 50,
    "city_name": "\u626c\u5dde",
    "city_pinyin": "yangzhou",
    "engine_length": 0,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 6,
    "city_id": 51,
    "city_name": "\u60e0\u5dde",
    "city_pinyin": "huizhou",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 53,
    "city_name": "\u592a\u539f",
    "city_pinyin": "taiyuan",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 4,
    "city_id": 54,
    "city_name": "\u70df\u53f0",
    "city_pinyin": "yantai",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 55,
    "city_name": "\u5609\u5174",
    "city_pinyin": "jiaxing",
    "engine_length": -1,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": -1,
    "city_id": 56,
    "city_name": "\u65b0\u4e61",
    "city_pinyin": "xinxiang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 6,
    "city_id": 58,
    "city_name": "\u6dc4\u535a",
    "city_pinyin": "zibo",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 0,
    "city_id": 59,
    "city_name": "\u5357\u901a",
    "city_pinyin": "nantong",
    "engine_length": 4,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 4,
    "city_id": 60,
    "city_name": "\u6d77\u53e3",
    "city_pinyin": "haikou",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 3,
    "city_id": 61,
    "city_name": "\u91d1\u534e",
    "city_pinyin": "jinhua",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 0,
    "city_id": 62,
    "city_name": "\u5b9c\u5174",
    "city_pinyin": "yixing",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 0,
    "city_id": 64,
    "city_name": "\u76d0\u57ce",
    "city_pinyin": "yancheng",
    "engine_length": 4,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 68,
    "city_name": "\u6f4d\u574a",
    "city_pinyin": "weifang",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 69,
    "city_name": "\u9547\u6c5f",
    "city_pinyin": "zhenjiang",
    "engine_length": 0,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 70,
    "city_name": "\u7ecd\u5174",
    "city_pinyin": "shaoxing",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 71,
    "city_name": "\u5510\u5c71",
    "city_pinyin": "tangshan",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 0,
    "city_id": 72,
    "city_name": "\u8fde\u4e91\u6e2f",
    "city_pinyin": "lianyungang",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 6,
    "city_id": 74,
    "city_name": "\u6cf0\u5b89",
    "city_pinyin": "taian",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 75,
    "city_name": "\u4fdd\u5b9a",
    "city_pinyin": "baoding",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 0,
    "city_id": 77,
    "city_name": "\u8d35\u9633",
    "city_pinyin": "guiyang",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 6,
    "city_id": 83,
    "city_name": "\u4e4c\u9c81\u6728\u9f50",
    "city_pinyin": "wulumuqi",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": -1,
    "city_id": 84,
    "city_name": "\u5170\u5dde",
    "city_pinyin": "lanzhou",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 4,
    "city_id": 85,
    "city_name": "\u664b\u6c5f",
    "city_pinyin": "jinjiang",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": -1,
    "city_id": 86,
    "city_name": "\u5de9\u4e49",
    "city_pinyin": "gongyi",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 6,
    "city_id": 87,
    "city_name": "\u547c\u548c\u6d69\u7279",
    "city_pinyin": "huhehaote",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 88,
    "city_name": "\u6d4e\u5b81",
    "city_pinyin": "jining",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 89,
    "city_name": "\u5305\u5934",
    "city_pinyin": "baotou",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 91,
    "city_name": "\u6f6e\u5dde",
    "city_pinyin": "chaozhou",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 92,
    "city_name": "\u90af\u90f8",
    "city_pinyin": "handan",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 93,
    "city_name": "\u5174\u5b89",
    "city_pinyin": "xingan",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 4,
    "city_id": 94,
    "city_name": "\u6ca7\u5dde",
    "city_pinyin": "cangzhou",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 95,
    "city_name": "\u6e29\u5cad",
    "city_pinyin": "wenling",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 97,
    "city_name": "\u978d\u5c71",
    "city_pinyin": "anshan",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 4,
    "city_id": 98,
    "city_name": "\u77f3\u72ee",
    "city_pinyin": "shishi",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": -1,
    "city_id": 99,
    "city_name": "\u6850\u4e61",
    "city_pinyin": "tongxiang",
    "engine_length": -1,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": -1,
    "city_id": 100,
    "city_name": "\u6d77\u5b81",
    "city_pinyin": "haining",
    "engine_length": -1,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 101,
    "city_name": "\u5eca\u574a",
    "city_pinyin": "langfang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 102,
    "city_name": "\u8087\u5e86",
    "city_pinyin": "zhaoqing",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": -1,
    "city_id": 103,
    "city_name": "\u8bf8\u66a8",
    "city_pinyin": "zhuji",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 104,
    "city_name": "\u627f\u5fb7",
    "city_pinyin": "chengde",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 105,
    "city_name": "\u4e1c\u8425",
    "city_pinyin": "dongying",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 106,
    "city_name": "\u8386\u7530",
    "city_pinyin": "futian",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 4,
    "city_id": 107,
    "city_name": "\u6f33\u5dde",
    "city_pinyin": "zhangzhou",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 0,
    "city_id": 108,
    "city_name": "\u4e39\u4e1c",
    "city_pinyin": "dandong",
    "engine_length": 3,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 6,
    "city_id": 110,
    "city_name": "\u6c5f\u90fd",
    "city_pinyin": "jiangdou",
    "engine_length": 0,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 6,
    "city_id": 111,
    "city_name": "\u9633\u6c5f",
    "city_pinyin": "yangjiang",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 0,
    "city_id": 112,
    "city_name": "\u897f\u5b81",
    "city_pinyin": "xining",
    "engine_length": 0,
    "province_name": "\u9752\u6d77",
    "province_pinyin": "qinghai"
}, {
    "body_length": 5,
    "city_id": 114,
    "city_name": "\u5b9c\u660c",
    "city_pinyin": "yichang",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 6,
    "city_id": 115,
    "city_name": "\u7126\u4f5c",
    "city_pinyin": "jiaozuo",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 6,
    "city_id": 116,
    "city_name": "\u804a\u57ce",
    "city_pinyin": "liaocheng",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 117,
    "city_name": "\u4e39\u9633",
    "city_pinyin": "danyang",
    "engine_length": 0,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 120,
    "city_name": "\u5927\u5e86",
    "city_pinyin": "daqing",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 121,
    "city_name": "\u6e5b\u6c5f",
    "city_pinyin": "zhanjiang",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 122,
    "city_name": "\u79e6\u7687\u5c9b",
    "city_pinyin": "qinhuangdao",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 123,
    "city_name": "\u6ed5\u5dde",
    "city_pinyin": "tengzhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 124,
    "city_name": "\u65e5\u7167",
    "city_pinyin": "rizhao",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 125,
    "city_name": "\u5b9d\u9e21",
    "city_pinyin": "baoji",
    "engine_length": 0,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": 6,
    "city_id": 127,
    "city_name": "\u7389\u73af\u53bf",
    "city_pinyin": "yuhuanxian",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": -1,
    "city_id": 128,
    "city_name": "\u4e0a\u865e",
    "city_pinyin": "shangyu",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 6,
    "city_id": 130,
    "city_name": "\u5fb7\u5dde",
    "city_pinyin": "dezhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 133,
    "city_name": "\u6e56\u5dde",
    "city_pinyin": "huzhou",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 134,
    "city_name": "\u90a2\u53f0",
    "city_pinyin": "xingtai",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 4,
    "city_id": 137,
    "city_name": "\u8861\u6c34",
    "city_pinyin": "hengshui",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 138,
    "city_name": "\u94f6\u5ddd",
    "city_pinyin": "yinchuan",
    "engine_length": 0,
    "province_name": "\u5b81\u590f",
    "province_pinyin": "ningxia"
}, {
    "body_length": 5,
    "city_id": 140,
    "city_name": "\u8346\u5dde",
    "city_pinyin": "jingzhou",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 6,
    "city_id": 141,
    "city_name": "\u51c6\u683c\u5c14",
    "city_pinyin": "zhungeer",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": -1,
    "city_id": 142,
    "city_name": "\u5f00\u5c01",
    "city_pinyin": "kaifeng",
    "engine_length": -1,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 0,
    "city_id": 144,
    "city_name": "\u682a\u6d32",
    "city_pinyin": "zhuzhou",
    "engine_length": 4,
    "province_name": "\u6e56\u5357",
    "province_pinyin": "hunan"
}, {
    "body_length": 6,
    "city_id": 145,
    "city_name": "\u97f6\u5173",
    "city_pinyin": "shaoguan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 146,
    "city_name": "\u4e3d\u6c34",
    "city_pinyin": "lishui",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 5,
    "city_id": 147,
    "city_name": "\u8944\u6a0a",
    "city_pinyin": "xiangfan",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 150,
    "city_name": "\u83b1\u5dde",
    "city_pinyin": "laizhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 152,
    "city_name": "\u8302\u540d",
    "city_pinyin": "maoming",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 156,
    "city_name": "\u821f\u5c71",
    "city_pinyin": "zhoushan",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 158,
    "city_name": "\u7389\u6eaa",
    "city_pinyin": "yuxi",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 159,
    "city_name": "\u83b1\u829c",
    "city_pinyin": "laiwu",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 161,
    "city_name": "\u6e05\u8fdc",
    "city_pinyin": "qingyuan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 162,
    "city_name": "\u67a3\u5e84",
    "city_pinyin": "zaozhuang",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 0,
    "city_id": 163,
    "city_name": "\u6ea7\u9633",
    "city_pinyin": "liyang",
    "engine_length": 6,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": -1,
    "city_id": 164,
    "city_name": "\u4f73\u6728\u65af",
    "city_pinyin": "jiamusi",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 166,
    "city_name": "\u6885\u5dde",
    "city_pinyin": "meizhou",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 168,
    "city_name": "\u5357\u5b89",
    "city_pinyin": "nanan",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 6,
    "city_id": 171,
    "city_name": "\u9526\u5dde",
    "city_pinyin": "jinzhou",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 6,
    "city_id": 172,
    "city_name": "\u8d64\u5cf0",
    "city_pinyin": "chifeng",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 176,
    "city_name": "\u83cf\u6cfd",
    "city_pinyin": "heze",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 0,
    "city_id": 177,
    "city_name": "\u6fee\u9633",
    "city_pinyin": "puyang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 4,
    "city_id": 178,
    "city_name": "\u629a\u987a",
    "city_pinyin": "fushun",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 5,
    "city_id": 179,
    "city_name": "\u9ec4\u5188",
    "city_pinyin": "huanggang",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": -1,
    "city_id": 181,
    "city_name": "\u7261\u4e39\u6c5f",
    "city_pinyin": "mudanjiang",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 183,
    "city_name": "\u6ee8\u5dde",
    "city_pinyin": "binzhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 5,
    "city_id": 184,
    "city_name": "\u5341\u5830",
    "city_pinyin": "shiyan",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 5,
    "city_id": 185,
    "city_name": "\u9ec4\u77f3",
    "city_pinyin": "huangshi",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 186,
    "city_name": "\u4e09\u660e",
    "city_pinyin": "sanming",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 6,
    "city_id": 188,
    "city_name": "\u5e73\u9876\u5c71",
    "city_pinyin": "pingdingshan",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 4,
    "city_id": 189,
    "city_name": "\u4e09\u4e9a",
    "city_pinyin": "sanya",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 6,
    "city_id": 190,
    "city_name": "\u5434\u5fe0",
    "city_pinyin": "wuzhong",
    "engine_length": 0,
    "province_name": "\u5b81\u590f",
    "province_pinyin": "ningxia"
}, {
    "body_length": 0,
    "city_id": 191,
    "city_name": "\u6d77\u95e8",
    "city_pinyin": "haimen",
    "engine_length": 4,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 4,
    "city_id": 192,
    "city_name": "\u9f99\u5ca9",
    "city_pinyin": "longyan",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 4,
    "city_id": 193,
    "city_name": "\u5f20\u5bb6\u53e3",
    "city_pinyin": "zhangjiakou",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 194,
    "city_name": "\u5927\u540c",
    "city_pinyin": "datong",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 6,
    "city_id": 195,
    "city_name": "\u6cb3\u6e90",
    "city_pinyin": "heyuan",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 6,
    "city_id": 196,
    "city_name": "\u4e34\u6d77",
    "city_pinyin": "linhai",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 197,
    "city_name": "\u76ca\u9633",
    "city_pinyin": "yiyang",
    "engine_length": 4,
    "province_name": "\u6e56\u5357",
    "province_pinyin": "hunan"
}, {
    "body_length": -1,
    "city_id": 198,
    "city_name": "\u8bf8\u57ce",
    "city_pinyin": "zhucheng",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 199,
    "city_name": "\u5546\u4e18",
    "city_pinyin": "shangqiu",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": -1,
    "city_id": 200,
    "city_name": "\u5e73\u6e56",
    "city_pinyin": "pinghu",
    "engine_length": -1,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 201,
    "city_name": "\u8fbd\u9633",
    "city_pinyin": "liaoyang",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": -1,
    "city_id": 204,
    "city_name": "\u9152\u6cc9",
    "city_pinyin": "jiuquan",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 4,
    "city_id": 207,
    "city_name": "\u4fdd\u5c71",
    "city_pinyin": "baoshan",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 0,
    "city_id": 208,
    "city_name": "\u542f\u4e1c",
    "city_pinyin": "qidong",
    "engine_length": 4,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 0,
    "city_id": 209,
    "city_name": "\u5b89\u5eb7",
    "city_pinyin": "ankang",
    "engine_length": -1,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": -1,
    "city_id": 210,
    "city_name": "\u9f50\u9f50\u54c8\u5c14",
    "city_pinyin": "qiqihaer",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 5,
    "city_id": 212,
    "city_name": "\u968f\u5dde",
    "city_pinyin": "suizhou",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 0,
    "city_id": 213,
    "city_name": "\u54b8\u9633",
    "city_pinyin": "xianyang",
    "engine_length": -1,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": 0,
    "city_id": 215,
    "city_name": "\u901a\u5dde",
    "city_pinyin": "tongzhou",
    "engine_length": 4,
    "province_name": "\u6c5f\u82cf",
    "province_pinyin": "jiangsu"
}, {
    "body_length": 4,
    "city_id": 218,
    "city_name": "\u84ec\u83b1",
    "city_pinyin": "penglai",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 219,
    "city_name": "\u8fd0\u57ce",
    "city_pinyin": "yuncheng",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 4,
    "city_id": 220,
    "city_name": "\u5357\u5e73",
    "city_pinyin": "nanping",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 4,
    "city_id": 221,
    "city_name": "\u4efb\u4e18",
    "city_pinyin": "renqiu",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 223,
    "city_name": "\u957f\u6cbb",
    "city_pinyin": "changzhi",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 0,
    "city_id": 224,
    "city_name": "\u9075\u4e49",
    "city_pinyin": "zunyi",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 6,
    "city_id": 226,
    "city_name": "\u4e34\u6c7e",
    "city_pinyin": "linfen",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 0,
    "city_id": 227,
    "city_name": "\u4fe1\u9633",
    "city_pinyin": "xinyang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 5,
    "city_id": 229,
    "city_name": "\u8346\u95e8",
    "city_pinyin": "jingmen",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 6,
    "city_id": 230,
    "city_name": "\u664b\u57ce",
    "city_pinyin": "jincheng",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 4,
    "city_id": 231,
    "city_name": "\u5b81\u5fb7",
    "city_pinyin": "ningde",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 6,
    "city_id": 232,
    "city_name": "\u589e\u57ce",
    "city_pinyin": "zengcheng",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": -1,
    "city_id": 234,
    "city_name": "\u4e09\u95e8\u5ce1",
    "city_pinyin": "sanmenxia",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 0,
    "city_id": 236,
    "city_name": "\u8bb8\u660c",
    "city_pinyin": "xuchang",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 4,
    "city_id": 243,
    "city_name": "\u9f99\u53e3",
    "city_pinyin": "longkou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 244,
    "city_name": "\u9633\u6cc9",
    "city_pinyin": "yangquan",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 6,
    "city_id": 247,
    "city_name": "\u9521\u6797\u90ed\u52d2",
    "city_pinyin": "xilinguole",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 249,
    "city_name": "\u963f\u62c9\u5584",
    "city_pinyin": "alashan",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": -1,
    "city_id": 252,
    "city_name": "\u5bff\u5149",
    "city_pinyin": "shouguang",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 256,
    "city_name": "\u5468\u53e3",
    "city_pinyin": "zhoukou",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 6,
    "city_id": 257,
    "city_name": "\u901a\u8fbd",
    "city_pinyin": "tongliao",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 4,
    "city_id": 258,
    "city_name": "\u66f2\u9756",
    "city_pinyin": "qujing",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": -1,
    "city_id": 259,
    "city_name": "\u7ae0\u4e18",
    "city_pinyin": "zhangqiu",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 261,
    "city_name": "\u4e91\u6d6e",
    "city_pinyin": "yunfu",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 4,
    "city_id": 263,
    "city_name": "\u7ea2\u6cb3",
    "city_pinyin": "honghe",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 0,
    "city_id": 264,
    "city_name": "\u6bd5\u8282",
    "city_pinyin": "bijie",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 4,
    "city_id": 265,
    "city_name": "\u80f6\u5dde",
    "city_pinyin": "jiaozhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 0,
    "city_id": 266,
    "city_name": "\u94c1\u5cad",
    "city_pinyin": "tieling",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 5,
    "city_id": 268,
    "city_name": "\u5b5d\u611f",
    "city_pinyin": "xiaogan",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 271,
    "city_name": "\u798f\u6e05",
    "city_pinyin": "fuqing",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 4,
    "city_id": 273,
    "city_name": "\u56db\u5e73",
    "city_pinyin": "siping",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 6,
    "city_id": 274,
    "city_name": "\u6c55\u5c3e",
    "city_pinyin": "shanwei",
    "engine_length": 4,
    "province_name": "\u5e7f\u4e1c",
    "province_pinyin": "guangdong"
}, {
    "body_length": 0,
    "city_id": 275,
    "city_name": "\u961c\u65b0",
    "city_pinyin": "fuxin",
    "engine_length": -1,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": -1,
    "city_id": 277,
    "city_name": "\u5929\u6c34",
    "city_pinyin": "tianshui",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": -1,
    "city_id": 278,
    "city_name": "\u846b\u82a6\u5c9b",
    "city_pinyin": "huludao",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 0,
    "city_id": 279,
    "city_name": "\u671d\u9633",
    "city_pinyin": "zhaoyang",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 5,
    "city_id": 280,
    "city_name": "\u9a7b\u9a6c\u5e97",
    "city_pinyin": "zhumadian",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}, {
    "body_length": 5,
    "city_id": 281,
    "city_name": "\u9102\u5dde",
    "city_pinyin": "ezhou",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 0,
    "city_id": 282,
    "city_name": "\u6c49\u4e2d",
    "city_pinyin": "hanzhong",
    "engine_length": -1,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": -1,
    "city_id": 283,
    "city_name": "\u9e21\u897f",
    "city_pinyin": "jixi",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 4,
    "city_id": 284,
    "city_name": "\u76d8\u9526",
    "city_pinyin": "panjin",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 6,
    "city_id": 286,
    "city_name": "\u6e2d\u5357",
    "city_pinyin": "weinan",
    "engine_length": 0,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": 6,
    "city_id": 290,
    "city_name": "\u9102\u5c14\u591a\u65af",
    "city_pinyin": "eerduosi",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 4,
    "city_id": 292,
    "city_name": "\u901a\u5316",
    "city_pinyin": "tonghua",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 6,
    "city_id": 293,
    "city_name": "\u5df4\u97f3\u90ed\u695e",
    "city_pinyin": "bayinguoleng",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 294,
    "city_name": "\u5ffb\u5dde",
    "city_pinyin": "xinzhou",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": 6,
    "city_id": 295,
    "city_name": "\u664b\u4e2d",
    "city_pinyin": "jinzhong",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": -1,
    "city_id": 296,
    "city_name": "\u4f0a\u6625",
    "city_pinyin": "yichun_h",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 297,
    "city_name": "\u4f0a\u7281",
    "city_pinyin": "yili",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 299,
    "city_name": "\u4e4c\u5170\u5bdf\u5e03",
    "city_pinyin": "wulanchabu",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 300,
    "city_name": "\u77f3\u5634\u5c71",
    "city_pinyin": "shizuishan",
    "engine_length": 0,
    "province_name": "\u5b81\u590f",
    "province_pinyin": "ningxia"
}, {
    "body_length": 4,
    "city_id": 302,
    "city_name": "\u5e73\u5ea6",
    "city_pinyin": "pingdu",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 303,
    "city_name": "\u5f20\u6396",
    "city_pinyin": "zhangye",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 4,
    "city_id": 304,
    "city_name": "\u767d\u5c71",
    "city_pinyin": "baishan",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 4,
    "city_id": 305,
    "city_name": "\u60e0\u5b89\u53bf",
    "city_pinyin": "huianxian",
    "engine_length": 0,
    "province_name": "\u798f\u5efa",
    "province_pinyin": "fujian"
}, {
    "body_length": 0,
    "city_id": 306,
    "city_name": "\u9ed4\u4e1c\u5357",
    "city_pinyin": "qiandongnan",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 0,
    "city_id": 307,
    "city_name": "\u516d\u76d8\u6c34",
    "city_pinyin": "liupanshui",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 4,
    "city_id": 309,
    "city_name": "\u8fbd\u6e90",
    "city_pinyin": "liaoyuan",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 0,
    "city_id": 310,
    "city_name": "\u5ef6\u5b89",
    "city_pinyin": "yanan",
    "engine_length": -1,
    "province_name": "\u9655\u897f",
    "province_pinyin": "shan3xi"
}, {
    "body_length": 5,
    "city_id": 312,
    "city_name": "\u54b8\u5b81",
    "city_pinyin": "xianning",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 313,
    "city_name": "\u4e3d\u6c5f",
    "city_pinyin": "lijiang",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 4,
    "city_id": 314,
    "city_name": "\u62db\u8fdc",
    "city_pinyin": "zhaoyuan",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 315,
    "city_name": "\u957f\u5174\u53bf",
    "city_pinyin": "changxingxian",
    "engine_length": 0,
    "province_name": "\u6d59\u6c5f",
    "province_pinyin": "zhejiang"
}, {
    "body_length": 4,
    "city_id": 316,
    "city_name": "\u677e\u539f",
    "city_pinyin": "songyuan",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": -1,
    "city_id": 318,
    "city_name": "\u9ed1\u6cb3",
    "city_pinyin": "heihe",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 4,
    "city_id": 320,
    "city_name": "\u767d\u57ce",
    "city_pinyin": "baicheng",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": -1,
    "city_id": 321,
    "city_name": "\u9e64\u5c97",
    "city_pinyin": "hegang",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 0,
    "city_id": 323,
    "city_name": "\u5b89\u987a",
    "city_pinyin": "anshun",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 6,
    "city_id": 325,
    "city_name": "\u6714\u5dde",
    "city_pinyin": "shuozhou",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": -1,
    "city_id": 326,
    "city_name": "\u7ee5\u5316",
    "city_pinyin": "suihua",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": -1,
    "city_id": 327,
    "city_name": "\u767d\u94f6",
    "city_pinyin": "baiyin",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 6,
    "city_id": 328,
    "city_name": "\u514b\u62c9\u739b\u4f9d",
    "city_pinyin": "kelamayi",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 329,
    "city_name": "\u90b9\u57ce",
    "city_pinyin": "zoucheng",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 6,
    "city_id": 330,
    "city_name": "\u5156\u5dde",
    "city_pinyin": "yanzhou",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 331,
    "city_name": "\u53cc\u9e2d\u5c71",
    "city_pinyin": "shuangyashan",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 4,
    "city_id": 332,
    "city_name": "\u74e6\u623f\u5e97",
    "city_pinyin": "wafangdian",
    "engine_length": 0,
    "province_name": "\u8fbd\u5b81",
    "province_pinyin": "liaoning"
}, {
    "body_length": 4,
    "city_id": 333,
    "city_name": "\u662d\u901a",
    "city_pinyin": "zhaotong",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 336,
    "city_name": "\u547c\u4f26\u8d1d\u5c14",
    "city_pinyin": "hulunbeier",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": -1,
    "city_id": 337,
    "city_name": "\u5e86\u9633",
    "city_pinyin": "qingyang",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 6,
    "city_id": 341,
    "city_name": "\u90b9\u5e73\u53bf",
    "city_pinyin": "zoupingxian",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": -1,
    "city_id": 342,
    "city_name": "\u5609\u5cea\u5173",
    "city_pinyin": "jiayuguan",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": -1,
    "city_id": 343,
    "city_name": "\u6b66\u5a01",
    "city_pinyin": "wuwei",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 6,
    "city_id": 344,
    "city_name": "\u65b0\u6cf0",
    "city_pinyin": "xintai",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 0,
    "city_id": 345,
    "city_name": "\u94dc\u4ec1",
    "city_pinyin": "tongren",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": -1,
    "city_id": 346,
    "city_name": "\u4e03\u53f0\u6cb3",
    "city_pinyin": "qitaihe",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 347,
    "city_name": "\u80a5\u57ce",
    "city_pinyin": "feicheng",
    "engine_length": 0,
    "province_name": "\u5c71\u4e1c",
    "province_pinyin": "shandong"
}, {
    "body_length": 4,
    "city_id": 348,
    "city_name": "\u9075\u5316",
    "city_pinyin": "zunhua",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": -1,
    "city_id": 351,
    "city_name": "\u5e73\u51c9",
    "city_pinyin": "pingliang",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": -1,
    "city_id": 353,
    "city_name": "\u91d1\u660c",
    "city_pinyin": "jinchang",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 4,
    "city_id": 354,
    "city_name": "\u5ef6\u8fb9",
    "city_pinyin": "yanbian",
    "engine_length": 0,
    "province_name": "\u5409\u6797",
    "province_pinyin": "jilin"
}, {
    "body_length": 6,
    "city_id": 355,
    "city_name": "\u963f\u514b\u82cf",
    "city_pinyin": "akesu",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 358,
    "city_name": "\u5580\u4ec0",
    "city_pinyin": "kashi",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 360,
    "city_name": "\u8fc1\u5b89",
    "city_pinyin": "qianan",
    "engine_length": 0,
    "province_name": "\u6cb3\u5317",
    "province_pinyin": "hebei"
}, {
    "body_length": 6,
    "city_id": 361,
    "city_name": "\u54c8\u5bc6",
    "city_pinyin": "hami",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 363,
    "city_name": "\u666e\u6d31",
    "city_pinyin": "puer",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 4,
    "city_id": 364,
    "city_name": "\u4e34\u6ca7",
    "city_pinyin": "lincang",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 365,
    "city_name": "\u56fa\u539f",
    "city_pinyin": "guyuan",
    "engine_length": 0,
    "province_name": "\u5b81\u590f",
    "province_pinyin": "ningxia"
}, {
    "body_length": 6,
    "city_id": 367,
    "city_name": "\u548c\u7530",
    "city_pinyin": "hetian",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 368,
    "city_name": "\u660c\u5409",
    "city_pinyin": "changji",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 369,
    "city_name": "\u5410\u9c81\u756a",
    "city_pinyin": "tulufan",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 370,
    "city_name": "\u5927\u7406",
    "city_pinyin": "dali",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 371,
    "city_name": "\u963f\u52d2\u6cf0",
    "city_pinyin": "aletai",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 372,
    "city_name": "\u5854\u57ce",
    "city_pinyin": "tacheng",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": -1,
    "city_id": 377,
    "city_name": "\u90a3\u66f2",
    "city_pinyin": "naqu",
    "engine_length": 0,
    "province_name": "\u897f\u85cf",
    "province_pinyin": "xizang"
}, {
    "body_length": 5,
    "city_id": 378,
    "city_name": "\u6069\u65bd",
    "city_pinyin": "enshi",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 6,
    "city_id": 379,
    "city_name": "\u5df4\u5f66\u6dd6\u5c14",
    "city_pinyin": "bayannaoer",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 4,
    "city_id": 381,
    "city_name": "\u8fea\u5e86",
    "city_pinyin": "diqing",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 0,
    "city_id": 382,
    "city_name": "\u9ed4\u5357",
    "city_pinyin": "qiannan",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 4,
    "city_id": 383,
    "city_name": "\u695a\u96c4",
    "city_pinyin": "chuxiong",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 4,
    "city_id": 384,
    "city_name": "\u897f\u53cc\u7248\u7eb3",
    "city_pinyin": "xishuangbanna",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": -1,
    "city_id": 385,
    "city_name": "\u7518\u5357",
    "city_pinyin": "gannan",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 4,
    "city_id": 387,
    "city_name": "\u6587\u5c71",
    "city_pinyin": "wenshan",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": -1,
    "city_id": 388,
    "city_name": "\u4e34\u590f",
    "city_pinyin": "linxia",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 0,
    "city_id": 389,
    "city_name": "\u9ed4\u897f\u5357",
    "city_pinyin": "qianxinan",
    "engine_length": 6,
    "province_name": "\u8d35\u5dde",
    "province_pinyin": "guizhou"
}, {
    "body_length": 4,
    "city_id": 390,
    "city_name": "\u5fb7\u5b8f",
    "city_pinyin": "dehong",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 391,
    "city_name": "\u535a\u5c14\u5854\u62c9",
    "city_pinyin": "boertala",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 392,
    "city_name": "\u6012\u6c5f",
    "city_pinyin": "nujiang",
    "engine_length": 0,
    "province_name": "\u4e91\u5357",
    "province_pinyin": "yunnan"
}, {
    "body_length": 6,
    "city_id": 397,
    "city_name": "\u514b\u5b5c\u52d2\u82cf",
    "city_pinyin": "kezilesu",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 6,
    "city_id": 401,
    "city_name": "\u4e4c\u6d77",
    "city_pinyin": "wuhai",
    "engine_length": 0,
    "province_name": "\u5185\u8499\u53e4",
    "province_pinyin": "neimenggu"
}, {
    "body_length": 6,
    "city_id": 402,
    "city_name": "\u5415\u6881",
    "city_pinyin": "lvliang",
    "engine_length": 0,
    "province_name": "\u5c71\u897f",
    "province_pinyin": "shan1xi"
}, {
    "body_length": -1,
    "city_id": 403,
    "city_name": "\u9647\u5357",
    "city_pinyin": "longnan",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": -1,
    "city_id": 404,
    "city_name": "\u5b9a\u897f",
    "city_pinyin": "dingxi",
    "engine_length": 0,
    "province_name": "\u7518\u8083",
    "province_pinyin": "gansu"
}, {
    "body_length": 6,
    "city_id": 405,
    "city_name": "\u77f3\u6cb3\u5b50",
    "city_pinyin": "shihezi",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 406,
    "city_name": "\u9675\u6c34",
    "city_pinyin": "lingshui",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 6,
    "city_id": 407,
    "city_name": "\u963f\u62c9\u5c14",
    "city_pinyin": "alaer",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 5,
    "city_id": 408,
    "city_name": "\u795e\u519c\u67b6",
    "city_pinyin": "shennongjia",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 409,
    "city_name": "\u767d\u6c99",
    "city_pinyin": "baisha",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 410,
    "city_name": "\u743c\u6d77",
    "city_pinyin": "qionghai",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 411,
    "city_name": "\u743c\u4e2d",
    "city_pinyin": "qiongzhong",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 412,
    "city_name": "\u6f84\u8fc8\u53bf",
    "city_pinyin": "chengmaixian",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 5,
    "city_id": 413,
    "city_name": "\u6f5c\u6c5f",
    "city_pinyin": "qianjiang",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 414,
    "city_name": "\u660c\u6c5f",
    "city_pinyin": "changjiang",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 415,
    "city_name": "\u6587\u660c",
    "city_pinyin": "wenchang",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 416,
    "city_name": "\u5c6f\u660c\u53bf",
    "city_pinyin": "tunchangxian",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 417,
    "city_name": "\u5b9a\u5b89\u53bf",
    "city_pinyin": "dinganxian",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 5,
    "city_id": 418,
    "city_name": "\u5929\u95e8",
    "city_pinyin": "tianmen",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": -1,
    "city_id": 419,
    "city_name": "\u5927\u5174\u5b89\u5cad",
    "city_pinyin": "daxinganling",
    "engine_length": 0,
    "province_name": "\u9ed1\u9f99\u6c5f",
    "province_pinyin": "heilongjiang"
}, {
    "body_length": 6,
    "city_id": 420,
    "city_name": "\u56fe\u6728\u8212\u514b",
    "city_pinyin": "tumushuke",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 421,
    "city_name": "\u510b\u5dde",
    "city_pinyin": "danzhou",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 422,
    "city_name": "\u4fdd\u4ead",
    "city_pinyin": "baoting",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 5,
    "city_id": 423,
    "city_name": "\u4ed9\u6843",
    "city_pinyin": "xiantao",
    "engine_length": 0,
    "province_name": "\u6e56\u5317",
    "province_pinyin": "hubei"
}, {
    "body_length": 4,
    "city_id": 424,
    "city_name": "\u4e94\u6307\u5c71",
    "city_pinyin": "wuzhishan",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 6,
    "city_id": 425,
    "city_name": "\u4e94\u5bb6\u6e20",
    "city_pinyin": "wujiaqu",
    "engine_length": 0,
    "province_name": "\u65b0\u7586",
    "province_pinyin": "xinjiang"
}, {
    "body_length": 4,
    "city_id": 426,
    "city_name": "\u4e50\u4e1c",
    "city_pinyin": "ledong",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 427,
    "city_name": "\u4e34\u9ad8\u53bf",
    "city_pinyin": "lingaoxian",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 428,
    "city_name": "\u4e1c\u65b9",
    "city_pinyin": "dongfang",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 4,
    "city_id": 429,
    "city_name": "\u4e07\u5b81",
    "city_pinyin": "wanning",
    "engine_length": 0,
    "province_name": "\u6d77\u5357",
    "province_pinyin": "hainan"
}, {
    "body_length": 6,
    "city_id": 430,
    "city_name": "\u4e2d\u536b",
    "city_pinyin": "zhongwei",
    "engine_length": 0,
    "province_name": "\u5b81\u590f",
    "province_pinyin": "ningxia"
}, {
    "body_length": -1,
    "city_id": 431,
    "city_name": "\u6d4e\u6e90",
    "city_pinyin": "jiyuan",
    "engine_length": 0,
    "province_name": "\u6cb3\u5357",
    "province_pinyin": "henan"
}];

exports.getCityCode = function (city) {
    var result = null;
    for (var i = 0; i < cities_form_data.length; i++) {
        if (cities_form_data[i].city_name == city) {
            result = cities_form_data[i];
            break;
        }
    }
    return result;
};


//用户字段类型
var stringFields = "";
var numberFiels = "";
var booleanFiels = "";
var dateFields = "create_time,update_time,birth,annual_inspect_date,change_date,";
var arrayFields = "photo,";
function getFieldType(field_name){
    if(dateFields.indexOf(field_name + ",") > -1){
        return "date"
    }else if(stringFields.indexOf(field_name + ",") > -1){
        return "string"
    }else if(numberFiels.indexOf(field_name + ",") > -1){
        return "number"
    }else if(booleanFiels.indexOf(field_name + ",") > -1){
        return "boolean"
    }else if(arrayFields.indexOf(field_name + ",") > -1){
        return "array"
    }
}

exports.getUpdateJson = function(query, ignore_fields){
    var json = {};
    var ignore_fields = ignore_fields + ",";
    for(var key in query){
        if(key != "fields" && key != "format" && ignore_fields.indexOf(key + ",") == -1){
            if(getFieldType(key) == "date"){
                json[key] = new Date(query[key]);
            }if(getFieldType(key) == "array"){
                json[key] = JSON.parse(query[key]);
            }else{
                json[key] = query[key]
            }
        }
    }
    return json;
};

// 数组去重
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}

exports.unique = unique;