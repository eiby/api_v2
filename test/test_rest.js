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
WiStormAPI.prototype.sso_login = function (login_id, callback) {
    this.sign_obj.method = 'wicare.user.sso_login';
    this.sign_obj.login_id = login_id;
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

var wistorm_api = new WiStormAPI('9410bc1cbfa8f44ee5f8a331ba8dd3fc', '21fb644e20c93b72773bf0f8d0905052', 'json', '1.0', 'md5');

var test_access_token = "7b4681aa7c28761244fa023eb34668d5d92db6db8699cceb0fc328e55da7bb5e";

//商户注册测试, 注册后需要更新成cust_type为2, 并更新cust_name为商户名称
//wistorm_api.register('13316560478', '', 'e10adc3949ba59abbe56e057f20f883e', 1, "5437", function(obj){
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

//商户登陆密码
//wistorm_api.login('13316560478', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    console.log(obj);
//});

//第三方登陆密码
//wistorm_api.sso_login('oudYOuLUYbZYhJo2VifQI8OnMxGM', function (obj) {
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
//wistorm_api.create(2, 1, 1, "测试车主10", "1331121212", "粤C12346", "abcde123456", 1, "奥迪", 1, "奥迪", 1000, "奥迪Q3 2014", 1000, 1, 1, "修车", test_access_token, function(obj){
//    console.log(obj);
//});

//存在测试(已移除), 直接使用获取用户信息即可
//var query_json = {
//    mobile: "13316891158"
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.get(query_json, 'cust_id', obj.access_token, function(obj){
//        console.log(obj);
//    });
//});

//获取用户信息, 授权获取
//var query_json = {
//    cust_id: 1
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
//wistorm_api.createBusiness(1, 3, "测试车主", 1, "奥迪", 1000, 2, "保养", test_access_token, function(obj){
//    console.log(obj);
//});

//更新业务测试, 比如离店, 注意日期要位yyyy-MM-dd hh:mm:ss更新
//var leave_time = new Date();
//leave_time = leave_time.format("yyyy-MM-dd hh:mm:ss");
//var query_json = {
//    business_id: 33
//};
//var update_json = {
//    status: 2, //离店, 必须传obj_id, mileage参数
//    leave_time: leave_time,
//    obj_id: 1,
//    mileage: 1234
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

//var query_json = {
//    seller_id: 1,
//    status: 1,
//    arrive_time: "2015-11-01@2015-12-01"
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getBusinessList(query_json, "business_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content,arrive_time", "arrive_time", "business_id", 0, 0, 10, test_access_token, function (obj) {
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
//    seller_id: 1
//};
//wistorm_api.getToken('13316891158', 'e10adc3949ba59abbe56e057f20f883e', function (obj) {
//    wistorm_api.getVehicleList(query_json, "cust_id,cust_name,obj_id,obj_name,mileage,maintain_last_mileage", "obj_id", "obj_id",
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
//    exp_type: 2
//};
//
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

// 测试微信模板信息发送
var iconv = require('iconv-lite');
function encodeURIComponent_GBK(str)
{
    if(str==null || typeof(str)=='undefined' || str=='')
        return '';

    var a = str.toString().split('');

    for(var i=0; i<a.length; i++) {
        var ai = a[i];
        if( (ai>='0' && ai<='9') || (ai>='A' && ai<='Z') || (ai>='a' && ai<='z') || ai==='.' || ai==='-' || ai==='_') continue;
        var b = iconv.encode(ai, 'gbk');
        var e = ['']; // 注意先放个空字符串，最保证前面有一个%
        for(var j = 0; j<b.length; j++)
            e.push( b.toString('hex', j, j+1).toUpperCase() );
        a[i] = e.join('%');
    }
    return a.join('');
}

var name = encodeURIComponent_GBK("WiCARE汽车环保卫士");
var url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=cTwp2kKIPG7Zp5VHocJfZCCcjbo3vFe7xs6iczK3ffHwFTnV2i0uxdG1uzbe2Iapa2snntA0mF4b9WiZJhxVwLAGSFyc2w0XTcU4NG6t4O8MYReAHAAMF";
var data = {
    "touser": "oudYOuPNivMVcHiE5YlC1JtsVq4E",
    "template_id": "TzlTbXYteI9RPLLrWll6Dz5P6sBB1UUlsY-vs6ucWYE",
    "url": "http://weixin.qq.com/download",
    "data": {
        "name": {
            "value": "WiCARE汽车环保卫士",
            "color": "#173177"
        },
        "remark": {
            "value": "349.00",
            "color": "#173177"
        }
    }
};

util._postssl(url, data, function(obj){
    console.log(obj);
});