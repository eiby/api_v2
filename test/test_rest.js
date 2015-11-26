/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-1-2
 * Time: 下午4:38
 * To change this template use File | Settings | File Templates.
 */

var url = require("url");
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

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        if (k != 'sign') {
            string += k + newArgs[k];
        }
    }
    return string;
};

// 产生url后面的拼接字符串
var raw2 = function (args) {
    var string = '';
    for (var k in args) {
        string += '&' + k + '=' + args[k];
    }
    string = string.substr(1);
    return string;
};

// 调用API基础数据
function WiStormAPI(app_key, app_secret, format, v, sign_method) {
    this.app_key = app_key;
    this.app_secret = app_secret;
    var timestamp = new Date();
    timestamp = timestamp.format("yyyy-MM-dd hh:mm:ss");
    this.timestamp = timestamp;
    this.format = format;
    this.v = v;
    this.sign_method = sign_method;
    this.method = "";
    this.sign_obj = {
        timestamp: timestamp,            //时间戳yyyy-mm-dd hh:nn:ss
        format: format,                  //返回数据格式
        app_key: app_key,                //app key
        v: v,                            //接口版本
        sign_method: sign_method         //签名方式
    };
}

WiStormAPI.prototype.sign = function () {
    var s = raw(this.sign_obj);
    var sign = util.md5(this.app_secret + s + this.app_secret);
    sign = sign.toUpperCase();
    return sign;
};

// 注册
// 参数:
//    mobile: 手机(手机或者邮箱选其一)
//    email: 邮箱(手机或者邮箱选其一)
//    password: 加密密码(md5加密)
// 返回：
//    cust_id: 用户id
WiStormAPI.prototype.register = function (mobile, email, password, callback) {
    this.sign_obj.method = 'wicare.user.register';
    this.sign_obj.mobile = mobile;
    this.sign_obj.email = email;
    this.sign_obj.password = password;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取令牌
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：access_token: 访问令牌
//      valid_time: 有效时间
WiStormAPI.prototype.getToken = function (account, password, callback) {
    this.sign_obj.method = 'wicare.user.access_token';
    this.sign_obj.account = account;
    this.sign_obj.password = password;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 登陆测试
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：auth_code: api调用验证码
//      cust_id: 用户id
WiStormAPI.prototype.login = function (account, password, callback) {
    this.sign_obj.method = 'wicare.user.login';
    this.sign_obj.account = account;
    this.sign_obj.password = password;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建客户信息
//    mode: 创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
//    parent_cust_id: 商户ID, 如果没有默认为0
//    cust_type: 用户类型 1:车主 2:商户
//    cust_name: 用户名称
//    mobile: 手机
//    obj_name: 车牌号
//    frame_no: 车架号
//    car_brand_id: 品牌ID
//    car_brand: 品牌
//    car_series_id: 车系ID
//    car_series: 车系
//    car_type_id: 车款ID
//    car_type: 车款
//    mileage: 行驶里程
//    if_arrive: 是否到店, 1则需要传入到店类型和备注, 0则不需要
//    business_type: 业务类型
//    business_content: 业务内容
WiStormAPI.prototype.create = function (mode, parent_cust_id, cust_type, cust_name, mobile, obj_name, frame_no, car_brand_id, car_brand, car_series_id, car_series, car_type_id, car_type, mileage, if_arrive, business_type, business_content, callback) {
    this.sign_obj.method = 'wicare.user.create';
    this.sign_obj.mode = mode; //创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
    this.sign_obj.parent_cust_id = parent_cust_id; //商户ID, 如果没有默认为0
    this.sign_obj.cust_type = cust_type; //用户类型
    this.sign_obj.cust_name = cust_name; //用户名称
    this.sign_obj.mobile = mobile; // 手机
    this.sign_obj.obj_name = obj_name; //车牌号
    this.sign_obj.frame_no = frame_no; //车架号
    this.sign_obj.car_brand_id = car_brand_id; // 品牌ID
    this.sign_obj.car_brand = car_brand; // 品牌
    this.sign_obj.car_series_id = car_series_id; // 车系ID
    this.sign_obj.car_series = car_series; // 车系
    this.sign_obj.car_type_id = car_type_id; // 车款ID
    this.sign_obj.car_type = car_type; // 车款
    this.sign_obj.mileage = mileage; // 行驶里程
    this.sign_obj.if_arrive = if_arrive; // 是否到店, 1则需要传入业务类型和业务内容, 0则不需要
    this.sign_obj.business_type = business_type; // 业务类型
    this.sign_obj.business_content = business_content; // 业务内容
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新客户信息
// 参数:
//    cust_id: 用户ID
//    customer表里面的除了cust_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.update = function (cust_id, update_json, callback) {
    this.sign_obj.method = 'wicare.user.update';
    this.sign_obj.cust_id = cust_id;
    for (var key in update_json) {
        this.sign_obj[key] = update_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 判断用户是否存在
// 参数:
//      query_type: 查询类型 1: 客户名称  2: 用户名
//      value: 查询值
// 返回:
//      exist: 是否存在 true: 是 false: 否
WiStormAPI.prototype.exists = function (query_type, value, callback) {
    this.sign_obj.method = 'wicare.user.exists';
    this.sign_obj.query_type = query_type;
    this.sign_obj.value = value;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取客户信息
// 参数:
//    cust_id: 用户ID
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.get = function (cust_id, fields, access_token, callback) {
    this.sign_obj.method = 'wicare.user.get';
    this.sign_obj.access_token = access_token;
    this.sign_obj.cust_id = cust_id;
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 发送短信
// 参数:
//    mobile: 手机号码
//    type: 发送短信类型
//      1: 普通校验码信息
//      2: 忘记密码校验信息
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.sendSMS = function (mobile, type, callback) {
    this.sign_obj.method = 'wicare.comm.sms.send';
    this.sign_obj.mobile = mobile;
    this.sign_obj.type = type;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 验证校验码
// 参数:
//    valid_type: 1: 通过手机号  2:通过邮箱
//    valid_code: 收到的验证码
//    mobile: 手机
//    email: 邮箱
// 返回:
//    valid: true 有效 false 无效
WiStormAPI.prototype.validCode = function (mobile, email, valid_type, valid_code, callback) {
    this.sign_obj.method = 'wicare.user.valid_code';
    this.sign_obj.mobile = mobile;
    this.sign_obj.email = email;
    this.sign_obj.valid_type = valid_type;
    this.sign_obj.valid_code = valid_code;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建业务信息
// 参数:
//    cust_id: 车主用户ID
//    cust_name: 车主名称
//    obj_id: 车辆ID
//    obj_name: 车牌号
//    mileage: 行驶里程
//    business_type: 业务类型
//    business_content: 业务内容
// 返回：
//    status_code: 状态码
//    business_id: 新建业务ID
WiStormAPI.prototype.createBusiness = function (cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, callback) {
    this.sign_obj.method = 'wicare.business.create';
    this.sign_obj.cust_id = cust_id; //商户ID, 如果没有默认为0
    this.sign_obj.cust_name = cust_name; //用户名称
    this.sign_obj.obj_id = obj_id; //车牌号
    this.sign_obj.obj_name = obj_name; //车牌号
    this.sign_obj.mileage = mileage; // 行驶里程
    this.sign_obj.business_type = business_type; // 业务类型
    this.sign_obj.business_content = business_content; // 业务内容
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新业务信息
// 参数:
//    business表里面的除了business_id, arrive_time之外的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateBusiness = function (business_id, update_json, callback) {
    this.sign_obj.method = 'wicare.business.update';
    this.sign_obj.business_id = business_id;
    for (var key in update_json) {
        this.sign_obj[key] = update_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

var wistorm_api = new WiStormAPI('9410bc1cbfa8f44ee5f8a331ba8dd3fc', '21fb644e20c93b72773bf0f8d0905052', 'json', '1.0', 'md5');

//商户注册测试, 注册后需要更新成cust_type为2, 并更新cust_name为商户名称
//wistorm_api.register('13316891158', '', 'e10adc3949ba59abbe56e057f20f883e', function(obj){
//    console.log(obj);
//});

//更新用户测试
//var update_json = {
//    cust_type: 2, //商户
//    cust_name: "卓越汽修"
//};
//wistorm_api.update(1, update_json, function(obj){
//    console.log(obj);
//});

//商户登陆测试
//wistorm_api.login('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    console.log(obj);
//});

//获取令牌测试
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    console.log(obj);
//});

//新增车主客户测试
wistorm_api.create(2, 1, 1, "测试车主", "13310000000", "粤B12345", "abcde123456", 1, "奥迪", 1, "奥迪", 1000, "奥迪Q3 2014", 1000, 1, 1, "修车", function(obj){
    console.log(obj);
});

//存在测试
//wistorm_api.exists(define.EXIST_USER_NAME, '13316891158', function(obj){
//   console.log(obj);
//});

//获取用户信息, 授权获取
wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
    wistorm_api.get(1, 'cust_id,cust_name,remark', obj.access_token, function(obj){
        console.log(obj);
    });
});

//发送校验短信
//wistorm_api.sendSMS(13316891158, define.SMSTYPE_BIND_MOBILE, function(obj){
//    console.log(obj);
//});

//验证校验码
//wistorm_api.validCode(13316891158, "", 1, "5276", function(obj){
//    console.log(obj);
//});

//新增业务测试
//wistorm_api.createBusiness(3, "卓越维修", 1, "测试车主", 1000, 1, "修车", function(obj){
//    console.log(obj);
//});

//更新业务测试, 比如离店, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var leave_time = new Date();
//leave_time = leave_time.format("yyyy-MM-dd hh:mm:ss");
//var update_json = {
//    status: 2, //离店
//    leave_time: leave_time
//};
//wistorm_api.updateBusiness(4, update_json, function(obj){
//    console.log(obj);
//});