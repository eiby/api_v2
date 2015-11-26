/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-1-2
 * Time: 下午4:38
 * To change this template use File | Settings | File Templates.
 */

var db = require("../lib/db.js");
var define = require("../lib/define.js");
var http = require("http");
var util = require('../lib/myutil.js');

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

//db.addDeveloper("eiby@163.com", "e10adc3949ba59abbe56e057f20f883e", 2, "微车联", function(err, dev_id){
//    console.log(dev_id);
//});

//db.addApp(2, "叭叭商户版", "", function(err, app_id){
//    console.log(app_id);
//});

var crypto = require('crypto');
var algorithm = 'aes-128-ecb';
var key = '78541561566';
var clearEncoding = 'utf8';
var cipherEncoding = 'hex';

/*加密*/
var encodeAES = function(data){
    var cipher = crypto.createCipher(algorithm, key);
    var cipherChunks = [];
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
};

/*解密*/
var decodeAES = function(data){
    var decipher = crypto.createDecipher(algorithm, key);
    var plainChunks = [];
    plainChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    plainChunks.push(decipher.final(clearEncoding));
    return plainChunks.join('');
};

var app_secret = "21fb644e20c93b72773bf0f8d0905052";
var cust_id = 1;
var access_token = encodeAES(app_secret + "," + cust_id +"," + app_secret + ",bibibaba");
console.log(access_token);
var s = decodeAES(access_token);
console.log(s);
var cust_id = s.split(",")[1];
console.log(cust_id);

var e = util.md5("7de743e26f6a9b71a14b8ac3app_key51ccb6294c18a0979cc10240auth_codef67a44b4a3023ddb925620c4da63547fbusiness_contentbusiness_typecar_brandArtegacar_brand_id228car_seriesArtega%20GTcar_series_id4403car_type2015%20%E6%AC%BE%20GT%203.6L%20%E5%8F%8C%E7%A6%BB%E5%90%88%20%E5%9F%BA%E6%9C%AC%E5%9E%8Bcar_type_id113425cust_name123dcust_type1fieldscust_idformatjsonframe_no12312if_arrive0methodwicare.user.createmileage123mobile1234mode1obj_name%E7%B2%A4123parent_cust_id178sign_methodmd5timestamp2015-11-26%2014:59:52v1.07de743e26f6a9b71a14b8ac3");
console.log(e);
