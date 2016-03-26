/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-1-2
 * Time: 下午4:38
 * test wistorm rest api
 *
 * 除了customer表有一些比较特殊的操作,比如登陆,注册,重置密码之外,
 * 大部分的数据表都具有create,update,delete,list,get五个通用操作, 根据数据表, 传入字段名key及字段值value即可实现相应操作.
 * create接口参数格式:
 *      新增参数: key=value, 比如cust_name=测试&address=测试
 * update接口参数格式:
 *      条件参数: _key=value, 比如_obj_id=1
 *      更新参数: key=value, 比如obj_name=修改
 * delete接口参数格式:
 *      条件参数: key=value, 比如obj_id=1
 * get接口参数格式:
 *      条件参数: key=value, 比如obj_id=1
 *      fields: 返回字段, 格式为key1,key2,key3, 比如cust_id,cust_name
 * list接口参数格式:
 *      查询参数:
 *          一般格式: key=value
 *          模糊搜索: key=^value, 比如obj_name=^粤B1234
 *          比较搜索: key=>value, <value, <=value, >=value
 *          或搜索: key=value1|value2|value3|...|value
 *          时间段: key=begin_time@end_time, 比如create_time=2015-11-01@2015-12-01
 *      fields: 返回字段, 格式为key1,key2,key3, 比如cust_id,cust_name
 *      sorts: 排序字段, 格式为key1,key2,key3, 如果为倒序在字段名称前加-, 比如-key1,key2
 *      page: 分页字段, 一般为数据表的唯一ID
 *      min_id: 本页最小分页ID, 0表示不起作用
 *      max_id: 本页最大分页ID, 0表示不起作用
 *      limit: 返回数量, -1表示不限制返回数量
 *
 * 访问信令access_token:
 *      除了个别接口, 大部分的接口是需要传入access_token, 开发者需要在登录之后保存access_token,
 *      之后在调用其他接口的时候传入, access_token的有效期为24小时, 过期之后需要重新获取.
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
            if(typeof(args[k]) == 'object'){
                string += k + JSON.stringify(newArgs[k]);
            }else{
                string += k + newArgs[k];
            }
        }
    }
    return string;
};

// 产生url后面的拼接字符串
var raw2 = function (args) {
    var string = '';
    for (var k in args) {
        if(typeof(args[k]) == 'object'){
            string += '&' + k + '=' + encodeURIComponent(JSON.stringify(args[k]));
        }else{
            string += '&' + k + '=' + encodeURIComponent(args[k]);
        }
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
    var sign = util.md5(encodeURI(this.app_secret + s + this.app_secret));
    sign = sign.toUpperCase();
    return sign;
};

// 基础数据接口
// 获取品牌列表
// 参数:
//    无
// 返回：
//    列表数据
WiStormAPI.prototype.getBrand = function (callback) {
    this.sign_obj.method = 'wicare.base.car_brands.list';
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取车系列表
// 参数:
//    无
// 返回：
//    列表数据
WiStormAPI.prototype.getSeries = function (pid, callback) {
    this.sign_obj.method = 'wicare.base.car_series.list';
    this.sign_obj.pid = pid;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取车款列表
// 参数:
//    无
// 返回：
//    列表数据
WiStormAPI.prototype.getType = function (pid, callback) {
    this.sign_obj.method = 'wicare.base.car_types.list';
    this.sign_obj.pid = pid;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 注册
// 参数:
//    mobile: 手机(手机或者邮箱选其一)
//    email: 邮箱(手机或者邮箱选其一)
//    password: 加密密码(md5加密)
// 返回：
//    cust_id: 用户id
WiStormAPI.prototype.register = function (mobile, email, password, valid_type, valid_code, callback) {
    this.sign_obj.method = 'wicare.user.register';
    this.sign_obj.mobile = mobile;
    this.sign_obj.email = email;
    this.sign_obj.password = password;
    this.sign_obj.valid_type = valid_type;
    this.sign_obj.valid_code = valid_code;
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

// 第三方登陆测试
// 参数：
//      login_id: 第三方登陆返回的标识ID
// 返回：
//      cust_id: 用户id
//      cust_name: 用户名称
//      access_token: 全局令牌
//      valid_time: 有效时间
WiStormAPI.prototype.sso_login = function (login_id, weixin_appsecret, callback) {
    this.sign_obj.method = 'wicare.user.sso_login';
    this.sign_obj.login_id = login_id;
    this.sign_obj.weixin_appsecret = weixin_appsecret;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 重置密码
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：
//      status_code: 调用状态
WiStormAPI.prototype.resetPassword = function (account, password, valid_type, valid_code, callback) {
    this.sign_obj.method = 'wicare.user.password.reset';
    this.sign_obj.account = account;
    this.sign_obj.password = password;
    this.sign_obj.valid_type = valid_type;
    this.sign_obj.valid_code = valid_code;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取用户列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getUserList = function (query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    this.sign_obj.method = 'wicare.users.list';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建客户信息
//    mode: 创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
//    seller_id: 商户ID, 如果没有默认为0
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
WiStormAPI.prototype.create = function (mode, seller_id, cust_type, cust_name, mobile, obj_name, frame_no, car_brand_id, car_brand, car_series_id, car_series, car_type_id, car_type, mileage, if_arrive, business_type, business_content, access_token, callback) {
    this.sign_obj.method = 'wicare.user.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.mode = mode; //创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
    this.sign_obj.seller_id = seller_id; //商户ID, 如果没有默认为0
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
WiStormAPI.prototype.update = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.user.update';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 绑定客户
// 参数:
//    cust_id: 用户ID
//    customer表里面的除了cust_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.bind = function (query_json, update_json, valid_code, callback) {
    this.sign_obj.method = 'wicare.user.bind';
    this.sign_obj.valid_code = valid_code;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取客户信息
// 参数:
//    cust_id: 用户ID
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.get = function (query_json, fields, access_token, callback) {
    this.sign_obj.method = 'wicare.user.get';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 判断用户是否存在
// 参数:
//    mobile: 手机号
//    cust_name: 用户名
// 返回：
//    返回是否存在
WiStormAPI.prototype.exists = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.user.exists';
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
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

// 获取图片验证码
// 参数:
//    mobile: 手机号码或者open_id
// 返回：
//    status_code: 状态码
//    valid_code_img: 图片html
WiStormAPI.prototype.getPicValidCode = function (mobile, callback) {
    this.sign_obj.method = 'wicare.util.pic_valid_code.get';
    this.sign_obj.mobile = mobile;
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

// 创建车辆信息
// 参数:
//    vehicle表的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.createVehicle = function (create_json, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicle.create';
    this.sign_obj.access_token = access_token;
    for (var key in create_json) {
        this.sign_obj[key] = create_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新车辆信息
// 参数:
//    business表里面的除了business_id, arrive_time之外的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateVehicle = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicle.update';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.obj_id = obj_id;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取车辆信息
// 参数:
//    obj_id: 车辆ID
// 返回:
//    status_code: 状态码
WiStormAPI.prototype.getVehicle = function (query_json, fields, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicle.get';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 删除车辆信息
// 参数:
//    obj_id: 车辆ID
// 返回:
//    status_code: 状态码
WiStormAPI.prototype.deleteVehicle = function (query_json, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicle.delete';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取车辆列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回条数;
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getVehicleList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicles.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 搜索车辆(已移除, 直接使用获取车辆列表的接口)
// 参数:
//    parent_cust_id: 商户ID;
//    obj_name: 搜索的车牌号
//    max_id: 本页最大ID, 获取下页内容时使用
//    fields: 返回字段;
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.searchCustomerVehicle = function (parent_cust_id, obj_name, max_id, fields, access_token, callback) {
    this.sign_obj.method = 'wicare.vehicles.search';
    this.sign_obj.access_token = access_token;
    this.sign_obj.parent_cust_id = parent_cust_id;
    this.sign_obj.access_token = access_token;
    this.sign_obj.obj_name = obj_name;
    this.sign_obj.max_id = max_id;
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新设备信息
// 参数:
//    query_json: 更新条件的字段采用字段名前加_的, 目前只能通过device_id和serial更新数据, 比如通过device_id更新数据, 则条件为"_device_id=1", 比如通过serial更新数据, 则条件为"_serial=56621666610"
//    可更新字段为status,sim,cust_id, 其他字段不可更新
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateDevice = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.device.update';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取设备信息
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getDevice = function (query_json, fields, access_token, callback) {
    this.sign_obj.method = 'wicare.device.get';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取设备列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回条数;
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getDeviceList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.devices.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取地理位置信息
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回条数;
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getLocationList = function (query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    this.sign_obj.method = 'wicare.locations.list';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建发送设备指令
// 参数:
//   device_id: 设备ID;
//   cmd_type: 指令类型;
//   params: 对应参数;
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.createCommand = function (device_id, cmd_type, params, access_token, callback) {
    this.sign_obj.method = 'wicare.command.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.device_id = device_id;
    this.sign_obj.cmd_type = cmd_type;
    this.sign_obj.params = JSON.stringify(params);
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建业务信息
// 参数:
//    seller_id; //商户Id
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
WiStormAPI.prototype.createBusiness = function (seller_id, cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, access_token, callback) {
    this.sign_obj.method = 'wicare.business.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.seller_id = seller_id; //商户Id
    this.sign_obj.cust_id = cust_id; //车主用户ID
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
WiStormAPI.prototype.updateBusiness = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.business.update';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.business_id = business_id;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取业务列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getBusinessList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.business.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取业务统计
// 参数:
//    seller_id: 商户ID;
//    begin_time: 开始时间;
//    end_time: 结束时间;
// 返回：
//    arrive_total: 到店总数
//    leave_total: 离店总数
//    evaluate_total: 评价总数
WiStormAPI.prototype.getBusinessTotal = function (seller_id, begin_time, end_time, access_token, callback) {
    this.sign_obj.method = 'wicare.business.total';
    this.sign_obj.access_token = access_token;
    this.sign_obj.seller_id = seller_id;
    this.sign_obj.begin_time = begin_time;
    this.sign_obj.end_time = end_time;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 产生订单并获取微信支付参数
// 参数:
//    cust_id: 商户Id;
//    open_id: 微信用户OpenID;
//    order_type: 订单类型 1:设备 2:服务费
//    pay_key: String,    //付费对象, 如果为终端,则为终端序列号, 如果为SIM卡费,则为sim卡号
//    product_name: 产品名称;
//    remark: 产品描述;
//    unit_price: 单价;
//    quantity: 数量;
//    total_price: 总价;
// 返回：
//    微信JSAPI支付参数
WiStormAPI.prototype.payWeixin = function (cust_id, open_id, order_type, pay_key, product_name, remark, unit_price, quantity, total_price, callback) {
    this.sign_obj.method = 'wicare.pay.weixin';
    this.sign_obj.cust_id = cust_id;
    this.sign_obj.open_id = open_id;
    this.sign_obj.order_type = order_type;
    this.sign_obj.pay_key = pay_key;
    this.sign_obj.product_name = product_name;
    this.sign_obj.remark = remark;
    this.sign_obj.unit_price = unit_price;
    this.sign_obj.quantity = quantity;
    this.sign_obj.total_price = total_price;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 产生订单并通过微信给客户支付红包
// 参数:
//    cust_id: 商户Id;
//    open_id: 微信用户OpenID;
//    order_type: 订单类型 1:设备 2:服务费 3:红包
//    pay_key: String,    //付费对象, 如果为终端,则为终端序列号, 如果为SIM卡费,则为sim卡号
//    product_name: 产品名称;
//    remark: 产品描述;
//    unit_price: 单价(分);
//    quantity: 数量;
//    total_price: 总价(分);
// 返回：
//    微信JSAPI支付参数
WiStormAPI.prototype.payWeixin2User = function (cust_id, open_id, order_type, pay_key, product_name, remark, unit_price, quantity, total_price, access_token, callback) {
    this.sign_obj.method = 'wicare.pay.weixin2user';
    this.sign_obj.access_token = access_token;
    this.sign_obj.cust_id = cust_id;
    this.sign_obj.open_id = open_id;
    this.sign_obj.order_type = order_type;
    this.sign_obj.pay_key = pay_key;
    this.sign_obj.product_name = product_name;
    this.sign_obj.remark = remark;
    this.sign_obj.unit_price = unit_price;
    this.sign_obj.quantity = quantity;
    this.sign_obj.total_price = total_price;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};


// 创建异常车况(仅供测试, 异常车况由后台服务自动生成)
// 参数:
//    obj_id: Number,                //车辆ID
//    obj_name: String,              //车牌号
//    car_brand_id: Number,          //品牌ID
//    car_series: String,            //车型
//    car_type: String,              //车款
//    seller_id: Number,             //商户ID
//    cust_id: Number,               //客户ID
//    open_id: String,               //微信登录ID
//    cust_name: String,             //客户名称
//    device_id: Number,             //设备ID
//    maintain_last_mileage: Number, //最后保养里程
//    mileage: Number,               //当前里程
//    last_arrive: Date,             //最后到店时间
//    exp_type: Number,              //异常类型 1:保养到期 2:长期未到店 3:故障
//    exp_reason: String,            //异常原因
// 返回：
//    status_code: 状态码
//    exception_id: 新建异常ID
WiStormAPI.prototype.createException = function (obj_id, obj_name, car_brand_id, car_series, car_type, seller_id, cust_id, cust_name, device_id, maintain_last_mileage,
                                                 mileage, last_arrive, exp_type, exp_reason, access_token, callback) {
    this.sign_obj.method = 'wicare.exception.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.obj_id = obj_id; //车牌号
    this.sign_obj.obj_name = obj_name; //车牌号
    this.sign_obj.car_brand_id = car_brand_id; //车牌号
    this.sign_obj.car_series = car_series; //车牌号
    this.sign_obj.car_type = car_type; //车牌号
    this.sign_obj.seller_id = seller_id; //车牌号
    this.sign_obj.cust_id = cust_id; //车牌号
    this.sign_obj.cust_name = cust_name; //车牌号
    this.sign_obj.device_id = device_id; //车主用户ID
    this.sign_obj.maintain_last_mileage = maintain_last_mileage; //用户名称
    this.sign_obj.mileage = mileage; // 行驶里程
    this.sign_obj.last_arrive = last_arrive; // 业务类型
    this.sign_obj.exp_type = exp_type; // 业务内容
    this.sign_obj.exp_reason = exp_reason; // 业务内容
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新异常车况
// 参数:
//    exception_id: 异常Id
//    exception表里面的除了exception_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateException = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.exception.update';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.exception_id = exception_id;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 删除异常车况
// 参数:
//    exception_id: 异常Id
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.deleteException = function (query_json, access_token, callback) {
    this.sign_obj.method = 'wicare.exception.delete';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.exception_id = exception_id;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取商户的异常车况列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getExceptionList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.exceptions.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建提醒提醒设置
// 参数:
//    option_type: Number,   //提醒类别 0:保养到期 1:长时间未到店 2:故障
//    cust_id: Number,       //用户id
//    seller_id: Number,     //商户Id
//    mileage: Number,       //间隔里程，车辆保养以保养里程和保养时间先到者为准
//    duration: Number,      //间隔时间
//    object: String,        //针对目标, 如果为品牌, 则为品牌Id, 可以设置多品牌, 中间用逗号隔开, 如果为车辆, 则为车辆Id, 中间用逗号隔开, 如果为空, 则表示商户下所有车辆
// 返回：
//    status_code: 状态码
//    exception_id: 新建异常ID
WiStormAPI.prototype.createExceptionOption = function (option_type, option_name, cust_id, seller_id, mileage, duration, object, msg_template, access_token, callback) {
    this.sign_obj.method = 'wicare.exception_option.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.option_type = option_type;
    this.sign_obj.option_name = option_name;
    this.sign_obj.cust_id = cust_id;
    this.sign_obj.seller_id = seller_id;
    this.sign_obj.mileage = mileage;
    this.sign_obj.duration = duration;
    this.sign_obj.object = object;
    this.sign_obj.msg_template = msg_template;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新提醒设置
// 参数:
//    option_type: Number,   //提醒类别 0:保养到期 1:长时间未到店 2:故障
//    cust_id: Number,       //用户id
//    seller_id: Number,     //商户Id
//    mileage: Number,       //间隔里程，车辆保养以保养里程和保养时间先到者为准
//    duration: Number,      //间隔时间
//    object: String,        //针对目标, 如果为品牌, 则为品牌Id, 可以设置多品牌, 中间用逗号隔开, 如果为车辆, 则为车辆Id, 中间用逗号隔开, 如果为空, 则表示商户下所有车辆
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateExceptionOption = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.exception_option.update';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 删除异常车况
// 参数:
//    option_id: 提醒Id
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.deleteExceptionOption = function (query_json, access_token, callback) {
    this.sign_obj.method = 'wicare.exception_option.delete';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取商户的提醒设置列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getExceptionOptionList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.exception_options.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建提醒提醒设置
// 参数:
//    user_id: Number,               //用户id
//    cust_name: String,             //发送名称
//    friend_id: Number,             //好友id
//    type: Number,                  //私信类型 0:文本  1:图片  2:语音  3:文件 4:位置
//    url: String,                   //如果图片，或者语音，则需设置该地址
//    content: String,               //文本内容
//    voice_len: Number,             //语音长度
//    lon: Number,                   //发送位置经度
//    lat: Number,                   //发送位置纬度
//    address: String,               //发送位置地址
// 返回：
//    status_code: 状态码
//    exception_id: 新建异常ID
WiStormAPI.prototype.createChat = function (user_id, cust_name, friend_id, type, url, content, voice_len, lon, lat, address, access_token, callback) {
    this.sign_obj.method = 'wicare.chat.create';
    this.sign_obj.access_token = access_token;
    this.sign_obj.user_id = user_id;
    this.sign_obj.cust_name = cust_name;
    this.sign_obj.friend_id = friend_id;
    this.sign_obj.type = type;
    this.sign_obj.url = url;
    this.sign_obj.content = content;
    this.sign_obj.lon = lon;
    this.sign_obj.lat = lat;
    this.sign_obj.address = address;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 更新聊天记录
// 参数:
//    option_type: Number,   //提醒类别 0:保养到期 1:长时间未到店 2:故障
//    cust_id: Number,       //用户id
//    seller_id: Number,     //商户Id
//    mileage: Number,       //间隔里程，车辆保养以保养里程和保养时间先到者为准
//    duration: Number,      //间隔时间
//    object: String,        //针对目标, 如果为品牌, 则为品牌Id, 可以设置多品牌, 中间用逗号隔开, 如果为车辆, 则为车辆Id, 中间用逗号隔开, 如果为空, 则表示商户下所有车辆
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateChat = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.chat.update';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取聊天记录
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getChatList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.chats.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取聊天记录
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getRelationList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.relations.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取里程日曲线或者平均油耗日曲线
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getDayTripList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.day_trips.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 日统计数据字段计数加1
// 参数:
//    day_trip_id: 记录ID
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.incDayTrip = function (query_json, update_json, access_token, callback) {
    this.sign_obj.method = 'wicare.day_trip.inc';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 获取电压曲线及水温曲线
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getDeviceObdDataList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.device_obd_datas.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取设备历史定位数据
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getDeviceGpsDataList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.gps_datas.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取设备历史空气数据
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getDeviceAirDataList = function (query_json, fields, sorts, page, min_id, max_id, limit, access_token, callback) {
    this.sign_obj.method = 'wicare.air_datas.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建崩溃记录
// 参数:
//    bug_report: String, //缺陷记录
//    account: String,    //登陆账号
// 返回：
//    status_code: 状态码
//    id: 新崩溃ID
WiStormAPI.prototype.createCrash = function (bug_report, account, callback) {
    this.sign_obj.method = 'wicare.crash.create';
    this.sign_obj.bug_report = bug_report;
    this.sign_obj.account = account;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取崩溃记录
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    由fields设定的字段
WiStormAPI.prototype.getCrashList = function (query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    this.sign_obj.method = 'wicare.crashes.list';
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取字典表信息
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getDict = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.dict.get';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取空气质量AQI
// 参数:
//    query_json: 查询json;
// 返回：
//    quality: 空气指数AQI
WiStormAPI.prototype.getAQI = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.base.aqi.get';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 微信好友关系更新
// 参数:
//    open_id: String,           //用户open_id
//    name: String,              //用户姓名
//    friend_open_id: String,    //好友open_id
//    friend_name: String,       //好友姓名
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.updateWeixinFriend = function (query_json, update_json, callback) {
    this.sign_obj.method = 'wicare.weixin_friend.update';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
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

// 创建产品信息
// 参数:
//    product表的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.createProduct = function (create_json, access_token, callback) {
    this.sign_obj.method = 'wicare.product.create';
    this.sign_obj.access_token = access_token;
    for (var key in create_json) {
        this.sign_obj[key] = create_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取商品信息
// 参数:
//    product_id: 产品id
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.getProduct = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.product.get';
    //this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取商品信息
// 参数:
//    product_id: 产品id
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.getProduct = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.product.get';
    //this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 抽奖
// 参数:
//    cust_id: 用户id
//    open_id: 微信id
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.drawLottery = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.lottery.draw';
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 领奖
// 参数:
//    code: 奖品识别码
//    open_id: 微信id
//    valid_code: 验证码
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.receiveLottery = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.lottery.receive';
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取用户奖品列表
// 参数:
//    query_json: 查询json;
//    fields: 返回字段
//    sorts: 排序字段,如果倒序,在字段前面加-
//    page: 分页字段
//    min_id: 分页字段的本页最小值
//    max_id: 分页字段的本页最小值
//    limit: 返回数量
// 返回：
//    按fields返回数据列表
WiStormAPI.prototype.getLotteryLogList = function (query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    this.sign_obj.method = 'wicare.lottery_logs.list';
    //this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.page = page;
    this.sign_obj.max_id = max_id;
    this.sign_obj.min_id = min_id;
    this.sign_obj.limit = limit;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 创建游戏信息
// 参数:
//    game表的所有字段
// 返回：
//    status_code: 状态码
WiStormAPI.prototype.createGame = function (create_json, callback) {
    this.sign_obj.method = 'wicare.game.create';
    //this.sign_obj.access_token = access_token;
    for (var key in create_json) {
        this.sign_obj[key] = create_json[key];
    }
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

// 获取游戏信息
// 参数:
//    game_id: 游戏id
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
WiStormAPI.prototype.getGame = function (query_json, fields, callback) {
    this.sign_obj.method = 'wicare.game.get';
    //this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = define.API_URL + "/router/rest?" + params;
    util._get(path, function (obj) {
        callback(obj);
    });
};

var wistorm_api = new WiStormAPI('9410bc1cbfa8f44ee5f8a331ba8dd3fc', '21fb644e20c93b72773bf0f8d0905052', 'json', '1.0', 'md5');

var test_access_token = "f1b3afaf9bbedfcb0ca3f0465a1d2e7e157c1ea55ad8d2dbcaa7083d125d360c403fe6c7ed1ace5c25682eb77a070c90";

//商户注册测试, 注册后需要更新成cust_type为2, 并更新cust_name为商户名称
//wistorm_api.register('13316560479', '', 'e10adc3949ba59abbe56e057f20f883e', 1, "8714", function(obj){
//    console.log(obj);
//});

//更新用户测试
//var query_json = {
//    cust_id: 3
//};
//var update_json = {
//    login_id: "oudYOuLUYbZYhJo2VifQI8OnMxGM"
//};
//wistorm_api.update(query_json, update_json, function(obj){
//    console.log(obj);
//});

//绑定用户测试
//var query_json = {
//    mobile: "13316560478"
//};
//var update_json = {
//    login_id: "oudYOuLUYbZYhJo2VifQI8OnMxGM"
//};
//wistorm_api.bind(query_json, update_json, "5437", function(obj){
//    console.log(obj);
//});

//商户登陆密码
//wistorm_api.login('13316560478', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    console.log(obj);
//});

//第三方登陆密码
//wistorm_api.sso_login('oudYOuJGcVtENIOTJCi8924bTqg0', '5b46bd690a3a740011a0065d43badb24', function (obj) {
//    console.log(obj);
//});

//重置密码
//wistorm_api.resetPassword('13316560478', 'e10adc3949ba59abbe56e057f20f883e', 1, "5437", function (obj) {
//    console.log(obj);
//});

//获取令牌测试
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    console.log(obj);
//});

//新增车主客户测试
//wistorm_api.create(2, 178, 1, "eiby", "13316560478", "粤B9548T", "abcde123456", 8, "大众", 1799, "途安", 12659, "2011 款 1.4 TSI自动5座 智臻版", 45000, 1, 1, "修车", test_access_token, function(obj){
//    console.log(obj);
//});

//存在测试
//var query_json = {
//    mobile: "13316560478"
//};
//wistorm_api.exists(query_json, 'cust_id', function (obj) {
//    console.log(obj);
//});

//获取用户信息, 授权获取
//var query_json = {
//    cust_id: 19
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.get(query_json, 'cust_id,cust_name,remark', obj.access_token, function(obj){
//        console.log(obj);
//    });
//});

//发送校验短信
//wistorm_api.sendSMS("13316560478", define.SMSTYPE_BIND_MOBILE, function(obj){
//    console.log(obj);
//});

//验证校验码
//wistorm_api.validCode("13316560478", "", 1, "5437", function(obj){
//    console.log(obj);
//});

//更新车辆测试, 比如业务状态
//var query_json = {
//    obj_id: 1
//};
//var update_json = {
//    business_status: 2 //离店
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.updateVehicle(query_json, update_json, obj.access_token, function(obj){
//        console.log(obj);
//    });
//});

//新增业务测试
//wistorm_api.createBusiness(178, 177, "eiby", 2964, "粤B9548T", 45000, 2, "保养", test_access_token, function(obj){
//    console.log(obj);
//});

//更新业务测试, 比如离店, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var time = new Date();
//time = time.format("yyyy-MM-dd hh:mm:ss");
//var query_json = {
//    business_id: 121
//};
// 开工
//var update_json = {
//    status: 4,
//    job_start_time: time
//};
// 完工
//var update_json = {
//    status: 2, //完工, 必须传obj_id, mileage参数
//    job_end_time: time,
//    obj_id: 2964,
//    mileage: 170
//};
// 离店
//var update_json = {
//    status: 3,
//    leave_time: time,
//    obj_id: 2964
//};
//wistorm_api.updateBusiness(query_json, update_json, test_access_token, function(obj){
//    console.log(obj);
//});

//更新业务离店状态(移出,直接使用更新业务接口,接口会根据状态自行判断)
//wistorm_api.updateBusinessLeave(13, 1, 0, 1234, function(obj){
//    console.log(obj);
//});

//获取业务列表
//    business_id: Number,        //业务ID
//    cust_id: Number,            //用户id
//    cust_name:String,           //临时字段
//    obj_id: Number,             //车辆id
//    obj_name: String,           //车牌号
//    mileage: Number,            //当时里程
//    business_type: Number,      //业务类型 1:保养 2:维修 3:美容 4:救援
//    business_content: String,   //业务内容
//    status: Number,             //业务状态 1:在店 2:离店
//    arrive_time: Date,          //到店时间
//    leave_time: Date,           //离店时间
//    evaluate_level: Number,     //评价等级 1 - 5
//    env_level: Number,          //环境等级 1 - 5
//    price_level: Number,        //价格等级 1 - 5
//    service_level: Number,      //服务等级 1 - 5
//    evaluate_content: String,   //评价内容
//    evaluate_time: Date         //评价时间

var query_json = {
    business_id: 24
    //status: "3",
    //leave_time: "2016-02-17@2016-02-18"
};
// 首页
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getBusinessList(query_json, "business_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content,arrive_time,status,leave_time", "-leave_time", "leave_time", 0, 0, 20, test_access_token, function (obj) {
//        console.log(obj);
//    });
//});
// 第二页
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getBusinessList(query_json, "business_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content,arrive_time,status,leave_time", "-leave_time", "leave_time", "2016-02-17 16:40:12", 0, 20, test_access_token, function (obj) {
//        console.log(obj);
//    });
//});

//获取业务统计
//可以进行日统计和月统计, 取决与传入的时间段
//wistorm_api.getBusinessTotal(1, "2015-11-01 00:00:00", "2015-12-01 00:00:00", test_access_token, function (obj) {
//    console.log(obj);
//});

//获取车辆品牌列表
//wistorm_api.getBrand(function(obj){
//    console.log(obj);
//});

//获取车系列表
//wistorm_api.getSeries(9, function(obj){
//    console.log(obj);
//});

//获取车款列表
//wistorm_api.getType(2522, function(obj){
//    console.log(obj);
//});

//创建车辆信息
//var create_json = {
//    cust_id: 178,                    //用户id
//    obj_name: "粤B84550",            //车牌号
//    device_id: 0,               //终端id：0 表示没有绑定终端
//    car_brand_id: 0,            //品牌id
//    car_brand: "",               //车辆品牌
//    car_series_id: 0,           //车型id
//    car_series: "",                  //车型
//    car_type_id: 0,                  //车款id
//    car_type: "",                    //车款
//    insurance_company: "",           //保险公司
//    insurance_tel: "",             //保险公司电话
//    insurance_date: "",            //保险到期时间
//    insurance_no: "",              //保险单号
//    maintain_company: "",          //保养4S店
//    maintain_tel: "",              //保养4S店电话
//    mileage: 1234,                 //当前里程，需要动态更新
//    maintain_last_mileage: 1234,   //最后保养里程
//    gas_no: "93#"                   //汽油标号 0#, 90#, 93#(92#), 97#(95#)
//};
//wistorm_api.createVehicle(create_json, test_access_token, function (obj) {
//    console.log(obj);
//});

// 更新车辆信息
//var query_json = {
//    obj_id: 126
//};
//var update_json = {
//    obj_name: "更新测试"
//};
//wistorm_api.updateVehicle(query_json, update_json, test_access_token, function (obj) {
//    console.log(obj);
//});

// 删除车辆信息
//var query_json = {obj_id: 125};
//wistorm_api.deleteVehicle(query_json, test_access_token, function (obj) {
//    console.log(obj);
//});

// 获取车辆信息
//var query_json = {obj_id: 123};
//wistorm_api.getVehicle(query_json, "obj_id,obj_name", test_access_token, function (obj) {
//    console.log(obj);
//});

//获取车辆列表
//    obj_id: Number,                  //车辆id
//    cust_id: Number,                 //用户id
//    cust_name:String,                //临时字段
//    obj_name: String,                //车牌号
//    device_id: Number,               //终端id：0 表示没有绑定终端
//    active_gps_data: {},             //临时字段
//    car_brand_id: Number,            //品牌id
//    car_brand: String,               //车辆品牌
//    car_series_id: Number,           //车型id
//    car_series: String,              //车型
//    car_type_id: Number,             //车款id
//    car_type: String,                //车款
//    engine_no: String,               //发动机号
//    frame_no: String,                //车架号
//    reg_no: String,                  //登记证书
//    insurance_company: String,       //保险公司
//    insurance_tel: String,           //保险公司电话
//    insurance_date: Date,            //保险到期时间
//    insurance_no: String,            //保险单号
//    maintain_company: String,        //保养4S店
//    maintain_tel: String,            //保养4S店电话
//    mileage: Number,                 //当前里程，需要动态更新
//    maintain_last_mileage: Number,   //最后保养里程
//    gas_no: String,                  //汽油标号 0#, 90#, 93#(92#), 97#(95#)
//    fuel_price: Number,              //加油油价
//    buy_date: Date,                  //购车时间
//    business_status: Number,         //业务状态 1:在店 2:离店
//    create_time: Date,               //创建时间
//    update_time: Date,               //更新时间
//    last_arrive_time: Date,          //最后一次到店时间
//    arrive_count: Number,            //到店次数
//    evaluate_count: Number,          //评价次数

//var query_json = {
//    seller_id: 54
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getVehicleList(query_json, "cust_id,cust_name,obj_id,obj_name,mileage,maintain_last_mileage,last_arrive_time", "obj_id", "obj_id",
//        0, 0, 10, obj.access_token, function (obj) {
//        console.log(obj);
//    });
//});

//搜索车辆
//    obj_id: Number,                  //车辆id
//    cust_id: Number,                 //用户id
//    cust_name:String,                //临时字段
//    obj_name: String,                //车牌号
//    device_id: Number,               //终端id：0 表示没有绑定终端
//    active_gps_data: {},             //临时字段
//    car_brand_id: Number,            //品牌id
//    car_brand: String,               //车辆品牌
//    car_series_id: Number,           //车型id
//    car_series: String,              //车型
//    car_type_id: Number,             //车款id
//    car_type: String,                //车款
//    engine_no: String,               //发动机号
//    frame_no: String,                //车架号
//    reg_no: String,                  //登记证书
//    insurance_company: String,       //保险公司
//    insurance_tel: String,           //保险公司电话
//    insurance_date: Date,            //保险到期时间
//    insurance_no: String,            //保险单号
//    maintain_company: String,        //保养4S店
//    maintain_tel: String,            //保养4S店电话
//    mileage: Number,                 //当前里程，需要动态更新
//    maintain_last_mileage: Number,   //最后保养里程
//    gas_no: String,                  //汽油标号 0#, 90#, 93#(92#), 97#(95#)
//    fuel_price: Number,              //加油油价
//    buy_date: Date,                  //购车时间
//    business_status: Number,         //业务状态 1:在店 2:离店
//    create_time: Date,               //创建时间
//    update_time: Date,               //更新时间
//    last_arrive_time: Date,          //最后一次到店时间
//    arrive_count: Number,            //到店次数
//    evaluate_count: Number,          //评价次数
//var query_json = {
//    obj_name: "^粤B12345"
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getVehicleList(query_json, "cust_id,cust_name,obj_id,obj_name,mileage,maintain_last_mileage", "obj_id", "obj_id",
//        0, 0, 10, obj.access_token, function (obj) {
//            console.log(obj);
//        });
//});

//更新设备状态, 比如更改状态
//var query_json = {
//    device_id: 1035
//};
//var query_json = {
//    serial: "56621650887"
//};
//var update_json = {
//    status: 1 //出库
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.updateDevice(query_json, update_json, obj.access_token, function (obj) {
//        console.log(obj);
//    });
//});

//获取设备信息
//    obj_id: Number,                  //车辆id
//    obj_name: String,                //车牌号
//    cust_id: Number,                 //用户id
//    cust_name:String,                //用户名称
//    device_id: Number,               //终端id：0 表示没有绑定终端
//    car_brand_id: Number,            //品牌id
//    car_brand: String,               //车辆品牌
//    serial: String,                  //终端序列号
//    sim: String,                     //终端内置sim卡
//    status: Number,                  //0：未出库 1：已出库 2: 确认收货 3：已激活
//    hardware_version: String,        //硬件版本号
//    software_version: String,        //软件版本号
//    active_time: Date,               //激活时间
//    end_time: Date,                  //到期时间

 //获取设备信息
//var query_json = {
//    device_id: 1613
//};
//wistorm_api.getDevice(query_json, "active_gps_data.air",
//    test_access_token, function (obj) {
//        console.log(obj);
//});

//获取设备列表
//    obj_id: Number,                  //车辆id
//    obj_name: String,                //车牌号
//    cust_id: Number,                 //用户id
//    cust_name:String,                //用户名称
//    device_id: Number,               //终端id：0 表示没有绑定终端
//    car_brand_id: Number,            //品牌id
//    car_brand: String,               //车辆品牌
//    serial: String,                  //终端序列号
//    sim: String,                     //终端内置sim卡
//    status: Number,                  //0：未出库 1：已出库 2: 确认收货 3：已激活
//    hardware_version: String,        //硬件版本号
//    software_version: String,        //软件版本号
//    active_time: Date,               //激活时间
//    end_time: Date,                  //到期时间

// 获取商户ID为1,状态为全部的设备列表
//var query_json = {
//    seller_id: 1,
//    status: 0
//};
// 搜索商户ID为1, 序列号为56621的设备
//var query_json = {
//    seller_id: 1,
//    serial: "^566216"
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getDeviceList(query_json, "seller_id,cust_id,cust_name,obj_id,obj_name,device_id,car_brand_id,car_brand,serial,sim,status",
//        "device_id", "device_id", 0, 0, 10, obj.access_token, function (obj) {
//            console.log(obj);
//        });
//});

// 微信支付接口
// 产生订单并获取微信支付参数
// 参数:
//    cust_id: 商户Id;
//    open_id: 微信用户OpenID;
//    order_type: 订单类型 1:设备 2:服务费
//    pay_key: 付费对象, 如果为终端,则为终端序列号, 如果为SIM卡费,则为sim卡号
//    product_name: 产品名称;
//    remark: 产品描述;
//    unit_price: 单价;
//    quantity: 数量;
//    total_price: 总价;
// 返回：
//    微信JSAPI支付参数
//wistorm_api.payWeixin(1, "oudYOuLUYbZYhJo2VifQI8OnMxGM", 1, "55621854091", "WiCARE汽车环保卫士", "WiCARE汽车环保卫士", 349, 1, 349, function(obj){
//   console.log(obj);
//});

//新增车况测试
//wistorm_api.createException(4, "粤123456", 1, "奥迪", "Q5 2014款", 1, 10, "test", 0, 1234, 2000, "2015-11-01 13:44:00", 1, "保养到期", test_access_token, function(obj){
//    console.log(obj);
//});
//
//wistorm_api.createException(5, "豫32332", 1, "奥迪", "Q5 2014款", 1, 23, "test", 0, 1234, 2000, "2015-11-01 13:44:00", 2, "长时间未到店", test_access_token, function(obj){
//    console.log(obj);
//});
////
//wistorm_api.createException(6, "粤13211323", 1, "奥迪", "Q5 2014款", 1, 24, "test", 0, 1234, 2000, "2015-11-01 13:44:00", 3, "电瓶电压低", test_access_token, function(obj){
//    console.log(obj);
//});

//更新异常车况, 比如已推送, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var push_time = new Date();
//push_time = push_time.format("yyyy-MM-dd hh:mm:ss");
//var query_json = {
//    exception_id: 71
//};
//var update_json = {
//    pushed: 1, //已推送
//    push_time: push_time
//};
//wistorm_api.updateException(query_json, update_json, test_access_token, function(obj){
//    console.log(obj);
//});

//获取异常列表
//    exception_id: Number,          //异常id
//    obj_id: Number,                //车辆ID
//    obj_name: String,              //车牌号
//    car_brand_id: Number,          //品牌ID
//    car_series: String,            //车型
//    car_type: String,              //车款
//    seller_id: Number,             //商户ID
//    cust_id: Number,               //客户ID
//    open_id: String,               //微信登录ID
//    cust_name: String,             //客户名称
//    device_id: Number,             //设备ID
//    maintain_last_mileage: Number, //最后保养里程
//    mileage: Number,               //当前里程
//    last_arrive: Date,             //最后到店时间
//    exp_type: Number,              //异常类型 1:保养到期 2:长期未到店 3:故障
//    exp_reason: String,            //异常原因
//    pushed: Number,                //是否已推送 0:未推送 1:已推送
//    push_time: Date,               //提送时间
//    create_time: Date,             //异常时间
//    update_time: Date              //更新时间
//var query_json = {
//    seller_id: 1,
//    exp_type: 1
//};
//wistorm_api.getExceptionList(query_json, "exception_id,cust_id,cust_name,obj_id,obj_name,mileage,car_brand_id,exp_type,last_arrive,exp_reason",
//    "exception_id", "exception_id", 0, 0, 10, test_access_token, function (obj) {
//    console.log(obj);
//});

//删除异常车况
//var query_json = {
//    exception_id: 20
//};
//wistorm_api.deleteException(query_json, test_access_token, function(obj){
//    console.log(obj);
//});

//新增提醒测试
//wistorm_api.createExceptionOption(1, "保养提醒测试", 0, 1, 5000, 0, "", "亲爱的%用户名称%，你的爱车%车牌号%已保养到期，请到店保养。", test_access_token, function(obj){
//    console.log(obj);
//});
//wistorm_api.createExceptionOption(2, "长时间未到店测试", 0, 1, 0, 15 * 3600, "", "亲爱的%用户名称%，你的爱车%车牌号%已久未到店保养，请及时到店检查。", test_access_token, function(obj){
//    console.log(obj);
//});

//更新提醒, 比如已推送, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var query_json = {
//    option_id: 67
//};
//var update_json = {
//    mileage: 7500
//};
//wistorm_api.updateExceptionOption(query_json, update_json, test_access_token, function(obj){
//    console.log(obj);
//});

//获取提醒列表
//var query_json = {
//    seller_id: 1
//};
//wistorm_api.getExceptionOptionList(query_json, "option_id,option_type,cust_id,seller_id,mileage,duration,object",
//    "option_id", "option_id", 0, 0, 10, test_access_token, function (obj) {
//        console.log(obj);
//    });

//删除提醒
//var query_json = {
//    option_id: 9
//};
//wistorm_api.deleteExceptionOption(query_json, test_access_token, function(obj){
//    console.log(obj);
//});

//新增聊天记录
//wistorm_api.createChat(1, "商户名称", 19, 1, "", "测试信息", 0, 0, 0, "", test_access_token, function(obj){
//    console.log(obj);
//});

//更新聊天记录, 比如已读, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var query_json = {
//    chat_id: 4
//};
//var read_time = new Date();
//read_time = read_time.format("yyyy-MM-dd hh:mm:ss");
//var update_json = {
//    status: 1,
//    read_time: read_time
//};
//wistorm_api.updateChat(query_json, update_json, test_access_token, function(obj){
//    console.log(obj);
//});

//获取聊天记录
//    user_id: Number,               //用户id
//    cust_name: String,             //发送名称
//    friend_id: Number,             //好友id
//    type: Number,                  //私信类型 0:文本  1:图片  2:语音  3:文件 4:位置
//    url: String,                   //如果图片，或者语音，则需设置该地址
//    content: String,               //文本内容
//    voice_len: Number,             //语音长度
//    lon: Number,                   //发送位置经度
//    lat: Number,                   //发送位置纬度
//    address: String,               //发送位置地址
//var query_json = {
//    user_id: 19,
//    friend_id: 1
//};
//wistorm_api.getChatList(query_json, "user_id,friend_id,sender_id,receiver_id,type,url,content,voice_len,lon,lat,address,create_time,read_time",
//    "chat_id", "chat_id", 0, 0, 10, test_access_token, function (obj) {
//        console.log(obj);
//    });

//获取好友关系记录
//    relat_id: Number,              //关系id
//    user_id: Number,               //用户id
//    friend_id: Number,             //好友id
//    friend_type: Number,           //好友类型 4: 通知 99: 私信
//    order_id: Number,              //排序id  4: 通知 99: 私信
//    friend_name: String,           //好友名称
//    sex: Number,                   //好友性别
//    logo: String,                  //好友logo
//    type: Number,                  //最后私信类型 0:文本  1:图片  2:语音  3:文件  4:文件
//    content: String,               //最后私信内容
//    send_time: Date,               //最后私信时间
//    create_time: Date,             //创建时间
//    unread_count: Number,          //未读私信
//    status: Number                 //0：临时好友  1：正式好友
//var query_json = {
//    user_id: 1,
//    friend_id: 19
//};
//wistorm_api.getRelationList(query_json, "relat_id,user_id,friend_id,friend_type,friend_name,sex,logo,content,send_time,create_time,unread_count,status",
//    "relat_id", "relat_id", 0, 0, 10, test_access_token, function (obj) {
//        console.log(obj);
//});

//获取车辆里程曲线和平均油耗曲线
//    serial: String,                        //终端序列号
//    rcv_day: Date,                         //统计日期
//    total_duration: Number,                //每日运行时长
//    total_distance: Number,                //每日里程
//    total_fuel: Number,                    //每日油耗
//    drive_score: Number,                   //驾驶得分
//    safe_score: Number,                    //安全得分
//    eco_score: Number,                     //经济得分
//    env_score: Number,                     //环保得分
//    drive_advice: String,                  //驾驶建议
//    avg_fuel: Number,                      //百公里油耗
//    total_fee: Number,                     //每日花费
//    avg_air: Number                        //平均空气指数
//var query_json = {
//    serial: "56622821412",
//    rcv_day: "2016-01-30@2016-01-31"
//};
//wistorm_api.getDayTripList(query_json, "rcv_day,total_distance,avg_fuel", "day_trip_id", "day_trip_id", 0, 0, -1, test_access_token, function (obj) {
//    console.log(obj);
//});
//var query_json = {
//    rcv_day: "2016-01-25",
//    avg_air: ">0",
//    cust_id: ">0"
//};
//wistorm_api.getDayTripList(query_json, "avg_air", "avg_air", "avg_air", 0, 0, 20, test_access_token, function (obj) {
//    console.log(obj);
//});

//获取电瓶电压曲线和水温曲线
//    obd_data_id: Number
//    serial: String, //serial
//    rcv_time: Date,
//    obd_data: {
    //   dpdy: 5,      //电瓶电压 V
    //   jqmkd: 10,    //节气门开度 %
    //   fdjzs: 750,   //发动机转速 RPM
    //   sw: 10,       //水温  °C
    //   chqwd: 10,    //三元催化器温度 °C
    //   syyl: 40,     //剩余油量 L
    //   hjwd: 30,     //环境温度 °C
    //   dqyl: 100,    //大气压力 kPa
    //   jqyl: 100,    //进气压力 kPa
    //   jqwd: 100,    //进气温度 °C
    //   ryyl: 300,    //燃油压力 kPa
    //   fdjfz: 200,   //发动机负载 %
    //   cqryxz: 100,  //长期燃油修正
    //   dhtqj: 30     //点火角提前 °
//   }
//var query_json = {
//    serial: "56622821412",
//    rcv_time: "2016-01-27@2016-01-31"
//};
//wistorm_api.getDeviceObdDataList(query_json, "rcv_time,obd_data.dpdy,obd_data.sw", "obd_data_id", "obd_data_id", 0, 0, -1, test_access_token, function (obj) {
//    console.log(obj);
//});

//新增崩溃记录
//wistorm_api.createCrash("错误报告", "13316891158", function(obj){
//    console.log(obj);
//});

//获取崩溃记录
//var query_json = {
//};
//wistorm_api.getCrashList(query_json, "crash_id,app_key,bug_report,account,create_time",
//    "crash_id", "crash_id", 0, 0, -1, function (obj) {
//    console.log(obj);
//});

// 创建发送设备指令
// 参数:
//   device_id: 设备ID;
//   cmd_type: 指令类型;
//   params: 对应参数;
// 返回：
//    status_code: 状态码
//wistorm_api.createCommand(1613, define.COMMAND_SWITCH, {switch: 1}, test_access_token, function(obj){
//    console.log(obj);
//});

//点赞
//var query_json = {
//    day_trip_id: 1
//};
//var update_json = {
//    air_praise: 1
//};
//wistorm_api.incDayTrip(query_json, update_json, test_access_token, function (obj) {
//    console.log(obj);
//});

//获取分时空气曲线
//var query_json = {
//    serial: "56622821412",
//    rcv_time: "2016-01-28@2016-01-29",
//    air: ">0"
//};
//wistorm_api.getDeviceGpsDataList(query_json, "rcv_time,air", "gps_data_id", "gps_data_id", 0, 0, -1, test_access_token, function (obj) {
//    console.log(obj);
//});

//获取分时空气曲线
//var query_json = {
//    serial: "56622821412",
//    rcv_time: "2016-01-30@2016-01-31",
//    air: ">0"
//};
//wistorm_api.getDeviceAirDataList(query_json, "rcv_time,air", "rcv_time", "_id", 0, 0, -1, test_access_token, function (obj) {
//    console.log(obj);
//});

// 获取用户列表
//var query_json = {
//    cust_type: 2,
//    mobile: "^133168"
//};
//wistorm_api.getUserList(query_json, "cust_id,cust_name,cust_type,mobile", "cust_id", "cust_id", 0, 0, -1, function (obj) {
//    console.log(obj);
//});

// 平台到微信支付接口
// 产生订单并获取微信支付参数
// 参数:
//    cust_id: 商户Id;
//    open_id: 微信用户OpenID;
//    order_type: 订单类型 1:设备 2:服务费
//    pay_key: 付费对象, 如果为终端,则为终端序列号, 如果为SIM卡费,则为sim卡号
//    product_name: 产品名称;
//    remark: 产品描述;
//    unit_price: 单价;
//    quantity: 数量;
//    total_price: 总价;
// 返回：
//    微信JSAPI支付参数
//wistorm_api.payWeixin2User(1, "oudYOuPNivMVcHiE5YlC1JtsVq4E", 1, "红包", "红包", "红包", 100, 1, 100 , test_access_token, function(obj){
//   console.log(obj);
//});

//获取空气阀值定义数据
//var query_json = {
//    dict_type: 'air_limit'
//};
//wistorm_api.getDict(query_json, "dict_value", function (obj) {
//  console.log(obj);
//});

//获取图片验证码
//wistorm_api.getPicValidCode("13316560478", function(obj){
//    console.log(obj);
//});

//微信好友关系更新
//var query_json = {
//    open_id: "open_id",
//    name: "name",
//    friend_open_id: "friend_open_id",
//    friend_name: "friend_name"
//};
//var update_json = {
//    click_count: 1  //如果不需要点击数增加, 可以设置为0
//};
//wistorm_api.updateWeixinFriend(query_json, update_json, function (obj) {
//    console.log(obj);
//});

// 获取位置列表
//var query_json = {
//    type: 4,
//    city: "北京",
//    lon: 116.652255,
//    lat: 40.322868
//};
//wistorm_api.getLocationList(query_json, "name,address,tel,lon,lat,distance",
//    "-create_time", "create_time", 0, 0, 10, function (obj) {
//        console.log(obj);
//    });

//创建产品信息
var create_json = {
    product_type: 1,                     //商品类别
    status: 0,                           //0: 上架  1: 下架
    product_name: 'WiCARE汽车环保卫士',    //商品名称
    photo: [
        'http://img2.bibibaba.cn/photo/air/IMG_2515.jpg@!wicare',
        'http://img2.bibibaba.cn/photo/air/IMG_2524.jpg@!wicare',
        'http://img2.bibibaba.cn/photo/air/IMG_2527.jpg@!wicare',
        'http://img2.bibibaba.cn/photo/air/IMG_2477.jpg@!wicare',
        'http://img2.bibibaba.cn/photo/air/IMG_3607.jpg@!wicare',
        'http://img2.bibibaba.cn/photo/air/IMG_3621.jpg@!wicare'
    ],
    sku_info: [
        {
            color: '金色',
            model: '',
            price: 668,
            stock: 100
        },
        {
            color: '黑色',
            model: '',
            price: 668,
            stock: 100
        }
    ],
    unit_price: 668,             //标准商品单价
    stock: 200,                  //库存数量
    remark: 'WiCARE汽车环保卫士',  //商品简介
    url: ''                      //商品页面链接
};
//wistorm_api.createProduct(create_json, test_access_token, function (obj) {
//    console.log(obj);
//});

// 获取商品信息
//var query_json = {product_id: 7};
//wistorm_api.getProduct(query_json, "product_type,status,product_name,photo,sku_info,unit_price,stock,remark,url", function (obj) {
//    console.log(obj);
//});

// 抽奖
//var query_json = {cust_id: 177, open_id: "test"};
//wistorm_api.drawLottery(query_json, "", function (obj) {
//    console.log(obj);
//});

//获取图片验证码
//var code = "B602437DCB";
//wistorm_api.getPicValidCode(code, function(obj){
//    console.log(obj);
//});

// 领奖
//var query_json = {open_id: "test", code: "B602437DCB", valid_code: 12};
//wistorm_api.receiveLottery(query_json, "", function (obj) {
//    console.log(obj);
//});

// 获取用户奖品列表
//var query_json = {
//    open_id: "oPdAcs8Hz7VTtKQAYks8qVpI6K40",
//    is_receive: 0
//};
//wistorm_api.getLotteryLogList(query_json, "code,lottery_id", "", "", 0, 0, -1, function (obj) {
//    console.log(obj);
//});

//获取空气阀值定义数据
//var query_json = {
//    city: '深圳'
//};
//wistorm_api.getAQI(query_json, "", function (obj) {
//  console.log(obj);
//});

//创建游戏信息
//var create_json = {
//    type: 1,             //拼图
//    open_id: "test",     //创建人微信id, 系统创建为空
//    material_url: "http://img2.bibibaba.cn/photo/1.png",   //素材地址
//    answer: [1,2,3]      //正确答案
//};
//wistorm_api.createGame(create_json, function (obj) {
//    console.log(obj);
//});

// 获取商品信息
var query_json = {game_id: '422108DC77'};
wistorm_api.getGame(query_json, "type,open_id,material_url,answer", function (obj) {
    console.log(obj);
});





