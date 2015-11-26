/**
 * User: Tom
 * Date: 13-12-30
 * Time: 下午3:04
 * WiStrom rest db module
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

// 客户数据
var customer = new Schema({
    cust_id: Number,
    login_id: String,          //第三方登录返回的标识ID
    cust_name: String,         //用户昵称
    cust_type: Number,         //用户类型 0: 无车 1: 车主 2：服务商
    service_type: Number,      //服务商类型（0 销售，1 售后，2 保险，3 理赔，4 代办，5 维修，6 保养）
    car_brand: String,         //车辆品牌
    car_series: String,        //车型
    mobile: String,            //登陆手机
    email: String,             //邮箱地址
    password: String,          //登陆密码
    parent_cust_id: Number,    //父用户ID
    province: String,          //省份
    city: String,              //城市
    loc: {},                   //经纬度
    logo: String,              //车主头像
    photo: [],                 //店铺照片
    remark: String,            //用户简介
    sex: Number,               //性别
    birth: Date,               //生日
    contacts: String,          //联系人
    address: String,           //联系地址
    tel: String,               //联系电话
    id_card_type: String,      //驾照类型
    annual_inspect_date: Date, //驾照年审
    change_date: Date,         //换证日期
    balance: Number,           //账户余额，仅用于返还现金，暂时不支持充值
    create_time: Date,         //创建时间
    update_time: Date          //更新时间
});
var m_customer = mongoose.model('customer', customer);
exports.customer = m_customer;

var getCustName = function (cust_id, customers) {
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].cust_id == cust_id) {
            return customers[i].cust_name;
        }
    }
};

exports.getAllCustomer = function(callback){
    m_customer.find({}, {"cust_id": 1}, function(err, customers){
        callback(customers);
    });
};

exports.getCustomerByLoginID = function (login_id, callback) {
    m_customer.findOne({'qq_login_id': login_id}, function (err, customer) {
        if (customer) {
            callback(customer);
        } else {
            m_customer.findOne({'sina_login_id': login_id}, function (err, customer) {
                callback(customer);
            });
        }
    });
};

exports.getCustomerByMobileOrMail = function (account, callback) {
    m_customer.findOne({'mobile': account}, function (err, customer) {
        if (customer) {
            callback(customer);
        } else {
            m_customer.findOne({'email': account}, function (err, customer) {
                callback(customer);
            });
        }
    });
};

exports.searchCustomer = function (key, callback) {
    m_customer.findOne({'mobile': key}, function (err, customer) {
        if (customer) {
            callback(customer);
        } else {
            m_customer.findOne({'email': key}, function (err, customer) {
                if(customer) {
                    callback(customer);
                }else{
                    m_customer.findOne({'cust_name': key}, function (err, customer) {
                        if(customer){
                            callback(customer);
                        }else{
                            m_customer.find({'cust_name': {$regex: key}, "cust_type": 2}, function (err, customers) {
                                callback(customers);
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.getCustomer = function (cust_id, fields, callback) {
    m_customer.findOne({'cust_id': cust_id}, fields, function (err, customer) {
        callback(customer);
    });
};

exports.deleteCustomer = function (cust_id, callback) {
    m_customer.remove({ 'cust_id': cust_id }, function (err) {
        callback(err);
    });
};

// 商户通过商户系统新增客户
exports.addCustomer = function (cust_type, cust_name, mobile, parent_cust_id, callback) {
    m_customer.findOne({"parent_cust_id": parent_cust_id, "mobile": mobile}, {"cust_id": 1}, function(err, customer){
        if(customer){
            m_customer.update({"parent_cust_id": parent_cust_id, "mobile": mobile}, {"$set": {"cust_name": cust_name}}, function (err, row, raw) {
                callback(err, customer.cust_id);
            });
        }else{
            getNewID("customer", function (new_cust_id) {
                var i_customer = new m_customer();
                i_customer.cust_id = new_cust_id;
                i_customer.cust_type = cust_type;
                i_customer.cust_name = cust_name;
                i_customer.cust_type = 1; //1: 车主 2：服务商
                i_customer.parent_cust_id = parent_cust_id;
                i_customer.id_card_type = "B";
                i_customer.balance = 0;
                i_customer.mobile = mobile;
                i_customer.password = util.md5(mobile.substr(mobile.length - 6, 6)); //默认密码为手机号后6位
                i_customer.create_time = new Date();
                i_customer.update_time = new Date();
                i_customer.save(function (err) {
                    if (callback) {
                        callback(err, new_cust_id);
                    }
                });
            });
        }
    });
};

exports.register = function (mobile, email, password, callback) {
    getNewID("customer", function (new_cust_id) {
        var i_customer = new m_customer();
        i_customer.cust_id = new_cust_id;
        i_customer.mobile = mobile;
        i_customer.email = email;
        i_customer.password = password;
        i_customer.balance = 0;
        i_customer.create_time = new Date();
        i_customer.update_time = new Date();
        i_customer.save(function (err) {
            if (callback) {
                callback(err, new_cust_id);
            }
        });
    });
};

// 更新客户信息
exports.updateCustomer = function (cust_id, json, callback) {
    var update_time = new Date();
    json.update_time = update_time;
    m_customer.update({'cust_id': cust_id}, {"$set": json}, function (err, row, raw) {
        callback(row);
    });
};

// 更新计数器
exports.incCustomerCount = function (cust_id, count_field) {
    // 更新用户通知计数
    var update_json = '{"$inc":{"' + count_field + '":1}}';
    update_json = JSON.parse(update_json);
    m_customer.findOneAndUpdate({"cust_id": cust_id}, update_json, function (err) {
        if (err) {
            console.log(err);
        }
    });
};

// 更新驾照年检日期
exports.updateCustomerInspectDate = function (cust_id, annual_inspect_date, change_date, callback) {
    var update_time = new Date();
    m_customer.update({'cust_id': cust_id}, {"$set": {"annual_inspect_date": annual_inspect_date, "change_date": change_date,
        "update_time": update_time}}, function (err, row, raw) {
        callback(row);
    });
};

// 更新用户推送设置
exports.updateCustomerPush = function (cust_id, if_vio_noti, if_fault_noti, if_alert_noti, if_event_noti, callback) {
    var update_time = new Date();
    m_customer.update({'cust_id': cust_id}, {"$set": {"if_vio_noti": if_vio_noti, "if_fault_noti": if_fault_noti, "if_alert_noti": if_alert_noti, "if_event_noti": if_event_noti, "update_time": update_time}}, function (err, row, raw) {
        callback(row);
    });
};

// 初始登录同步用户资料
exports.updateCustomerByLoginID = function (login_id, cust_name, logo, remark, callback) {
    var update_time = new Date();
    m_customer.update({'qq_login_id': login_id}, {"$set": {"cust_name": cust_name, "logo": logo, "remark": remark, "update_time": update_time}}, function (err, row, raw) {
        if (row > 0) {
            callback(row);
        } else {
            m_customer.update({'sina_login_id': login_id}, {"$set": {"cust_name": cust_name, "logo": logo, "remark": remark, "update_time": update_time}}, function (err, row, raw) {
                callback(row);
            });
        }
    });
};

// 收藏博文
exports.updateCustomerBlogCollection = function (cust_id, blog_id, callback) {
    var update_time = new Date();
    m_customer.update({'cust_id': cust_id}, {"$addToSet": {"col_blog_ids": blog_id}}, function (err, row, raw) {
        callback(row);
    });
};

// 获取驾照年审到期记录
exports.getCustomerInspectTimeout = function (update_time, callback) {
    var now_time = new Date(Date.parse(update_time) - (86400000 * 1));
    m_customer.find({"annual_inspect_date": {"$gt": now_time, "$lt": update_time}}, {"cust_id": 1, "if_event_noti": 1}, function (err, customers) {
        callback(customers);
    });
};

// 获取驾照换证到期记录
exports.getCustomerChangeTimeout = function (update_time, callback) {
    var now_time = new Date(Date.parse(update_time) - (86400000 * 1));
    m_customer.find({"change_date": {"$gt": now_time, "$lt": update_time}}, {"cust_id": 1, "if_event_noti": 1}, function (err, customers) {
        callback(customers);
    });
};

// 判断用户是否存在
exports.exists = function (query_type, value, callback) {
    switch (query_type) {
        case define.EXIST_CUST_NAME:
            m_customer.findOne({'cust_name': value}).count(callback);
            break;
        case define.EXIST_USER_NAME:
            m_customer.findOne({'mobile': value}).count(function (err, count) {
                if (count == 0) {
                    m_customer.findOne({'email': value}).count(callback);
                } else {
                    callback(err, count);
                }
            });
            break;
    }
};

// 客户数据
var valid_code = new Schema({
    mobile: String,            //登陆手机
    email: String,             //邮箱地址
    valid_code: String,        //校验码
    valid_time: Date           //有效期
});
var m_valid_code = mongoose.model('valid_code', valid_code);
exports.valid_code = m_valid_code;

exports.saveValidCode = function (mobile, email, valid_type, valid_code, callback) {
    var valid_time = new Date();
    var d = valid_time.getTime() + 5 * 60 * 1000;  //5分钟有效期
    valid_time = new Date(d);
    if(valid_type == 1){
        m_valid_code.findOneAndUpdate({'mobile': mobile}, {'$set': {'valid_code': valid_code, 'valid_time': valid_time}}, {'upsert': true}, function (err) {
            callback(err);
        });
    }else if(valid_type == 2){
        m_valid_code.findOneAndUpdate({'email': email}, {'$set': {'valid_code': valid_code, 'valid_time': valid_time}}, {'upsert': true}, function (err) {
            callback(err);
        });
    }
};

exports.ifValidCodeValid = function (mobile, email, valid_type, valid_code, callback) {
    var now = new Date();
    if(valid_type == 1){
        m_valid_code.findOne({'mobile': mobile, 'valid_code': valid_code, 'valid_time': {'$gte': now}}, function (err, auth) {
            if (auth) {
                callback(true);
            } else {
                callback(false)
            }
        });
    }else if(valid_type == 2){
        m_valid_code.findOne({'email': email, 'valid_code': valid_code, 'valid_time': {'$gte': now}}, function (err, auth) {
            if (auth) {
                callback(true);
            } else {
                callback(false)
            }
        });
    }
};


// 车辆数据
var vehicle = new Schema({
    obj_id: Number,   //车辆id
    cust_id: Number,  //用户id
    cust_name:String, //临时字段
    obj_name: String, //车牌号
    nick_name: String, //车辆名称
    device_id: Number, //终端id：0 表示没有绑定终端
    active_gps_data: {},
    car_brand_id: Number, //品牌id
    car_brand: String, //车辆品牌
    car_series_id: Number, //车型id
    car_series: String, //车型
    car_type_id: Number, //车款id
    car_type: String,   //车款
    vio_city_name: String, //违章城市名称
    vio_location: String, //违章城市代码
    engine_no: String,  //发动机号
    frame_no: String,   //车架号
    reg_no: String,     //登记证书
    last_query: Date,   //最后查询时间，用于控制用户查询周期，vip一天一次，免费用户七天一次。
    insurance_company: String, //保险公司
    insurance_tel: String,     //保险公司电话
    insurance_date: Date,      //保险到期时间
    insurance_no: String,      //保险单号
    annual_inspect_date: Date, //车辆年检日期
    maintain_company: String,  //保养4S店
    maintain_tel: String,      //保养4S店电话
    maintain_last_mileage: Number,  //最后保养里程
    maintain_last_date: Date,   //最后保养时间
    maintain_next_mileage: Number, //下次保养里程
    mileage: Number,           //当前里程，需要动态更新
    gas_no: String,            //汽油标号 0#, 90#, 93#(92#), 97#(95#)
    fuel_ratio: Number,        //油耗修正系数(直接原始数据*该系数得到实际油耗)
    fuel_price: Number,        //加油油价
    buy_date: Date,            //购车时间
    create_time: Date,         //创建时间
    update_time: Date,         //更新时间
    fault_count: Number,       //最新故障计数
    alert_count: Number,       //最新报警计数
    event_count: Number,       //车务提醒计数
    vio_count: Number,         //最新违章计数
//    var geo = {
//        geo_type: 0, //0: 进出报警 1:驶入报警 2:驶出报警
//        lon: 112,
//        lat: 22,
//        width: 1000
//    };
    geofence: {},             //围栏
    //{ vio_city_name: '深圳', vio_location: '0755' }
    vio_citys: []            //违章城市
});

var m_vehicle = mongoose.model('vehicle', vehicle);
exports.vehicle = m_vehicle;

//    obj_id:Number,   //车辆id
//    cust_id:Number,  //用户id
//    obj_name:String, //车牌号
//    device_id:Number, //终端id：0 表示没有绑定终端
//    car_brand:String, //车辆品牌
//    car_series:String, //车型
//    car_type:String,   //车款
//    engine_no:String,  //发动机号
//    frame_no:String,   //车架号
//    insurance_company:String, //保险公司
//    insurance_date:Date,      //保险到期时间
//    annual_inspect_date:Date, //车辆年检日期
//    maintain_company:String,  //保养4s店
//    maintain_last_mileage:Number,  //最后保养里程
//    maintain_last_data:Date,   //最后保养时间
//    maintain_next_mileage:Number, //下次保养里程
//    buy_date:Date,            //购车时间
exports.addVehicle = function (nick_name, obj_name, cust_id, car_brand, car_series, car_type, brand_id, series_id, type_id, frame_no, mileage, callback) {
    m_vehicle.findOne({"cust_id": cust_id, "obj_name": obj_name}, {"obj_id": 1}, function(err, vehicle) {
        if (vehicle) {
            m_vehicle.update({
                "cust_id": cust_id,
                "obj_name": obj_name
            }, {
                "$set": {
                    "car_brand_id": brand_id,
                    "car_brand": car_brand,
                    "car_series_id": series_id,
                    "car_series": car_series,
                    "car_type_id": type_id,
                    "car_type": car_type,
                    "frame_no": frame_no,
                    "mileage": mileage
                }
            }, function (err, row, raw) {
                callback(err, vehicle.obj_id);
            });
        } else {
            getNewID("vehicle", function (new_obj_id) {
                var i_vehicle = new m_vehicle();
                i_vehicle.obj_id = new_obj_id;
                i_vehicle.obj_name = obj_name;
                i_vehicle.nick_name = nick_name;
                i_vehicle.cust_id = cust_id;
                i_vehicle.car_brand_id = brand_id;
                i_vehicle.car_brand = car_brand;
                i_vehicle.car_series_id = series_id;
                i_vehicle.car_series = car_series;
                i_vehicle.car_type_id = type_id;
                i_vehicle.car_type = car_type;
                i_vehicle.fault_count = 0;
                i_vehicle.alert_count = 0;
                i_vehicle.vio_count = 0;
                i_vehicle.device_id = 0;
                i_vehicle.fuel_ratio = 0;
                i_vehicle.gas_no = "93#(92#)";
                i_vehicle.fuel_price = 0;
                i_vehicle.frame_no = frame_no;
                i_vehicle.mileage = mileage;
                i_vehicle.create_time = new Date();
                i_vehicle.update_time = new Date();
                i_vehicle.save(function (err) {
                    if (callback) {
                        callback(err, new_obj_id);
                    }
                });
            });
        }
    });
};

// 更新车辆信息
exports.updateVehicle = function (obj_id, json, callback) {
    var update_time = new Date();
    json.update_time = update_time;
    m_vehicle.update({'obj_id': obj_id}, {"$set": json}, function (err, row, raw) {
        callback(row);
    });
};

// 业务数据
var business = new Schema({
    business_id: Number,        //业务ID
    cust_id: Number,            //用户id
    cust_name:String,           //临时字段
    obj_id: Number,             //车辆id
    obj_name: String,           //车牌号
    mileage: String,            //当时里程
    business_type: Number,      //业务类型 1:保养 2:维修 3:美容 4:救援
    business_content: String,   //业务内容
    status: Number,             //业务状态 1:在店 2:离店
    arrive_time: Date,          //到店时间
    leave_time: Date,           //离店时间
    evaluate_level: Number,     //评价等级 1 - 5
    env_level: Number,          //环境等级 1 - 5
    price_level: Number,        //价格等级 1 - 5
    service_level: Number,      //服务等级 1 - 5
    evaluate_content: String,   //评价内容
    evaluate_time: Date         //评价时间
});

var m_business = mongoose.model('business', business);
exports.business = m_business;

// 新增业务信息
exports.addBusiness = function (cust_id, cust_name, obj_id, obj_name, milage, business_type, business_content, callback) {
    getNewID("business", function (new_busi_id) {
        var i_business = new m_business();
        i_business.business_id = new_busi_id;
        i_business.cust_id = cust_id;
        i_business.cust_name = cust_name;
        i_business.obj_id = obj_id;
        i_business.obj_name = obj_name;
        i_business.milage = milage;
        i_business.status = 1; //业务状态 1:在店 2:离店
        i_business.business_type = business_type;
        i_business.business_content = business_content;
        i_business.arrive_time = new Date();
        i_business.save(function (err) {
            if (callback) {
                callback(err, new_busi_id);
            }
        });
    });
};

// 更新业务信息,比如状态和离店时间
exports.updateBusiness = function (business_id, json, callback) {
    m_business.update({'business_id': business_id}, {"$set": json}, function (err, row, raw) {
        callback(row);
    });
};

// 验证码对象
var auth = new Schema({
    auth_code: String,
    valid_time: Date
});
var m_auth = mongoose.model('auth', auth);
exports.auth = m_auth;

exports.saveAuthCode = function (auth_code, callback) {
    var valid_time = new Date();
    var d = valid_time.getTime() + 24 * 60 * 60 * 1000;
    valid_time = new Date(d);
    m_auth.findOneAndUpdate({'auth_code': auth_code}, {'$set': {'valid_time': valid_time}}, {'upsert': true}, function (err) {
        callback(err, valid_time);
    });
};

exports.ifAuthCodeValid = function (auth_code, callback) {
    var now = new Date();
    m_auth.findOne({'auth_code': auth_code, 'valid_time': {'$gte': now}}, function (err, auth) {
        if (auth) {
            callback(true);
        } else {
            callback(false)
        }
    })
};

// 开发者接口
var developer = new Schema({
    dev_id: Number,      //开发者编号
    email: String,       //登陆邮箱
    password: String,    //密码
    dev_type: Number,    //开发者类型 1:个人 2:企业
    dev_name: String,    //姓名
    dev_key: String,     //开发者标识
    dev_secret: String,  //开发者密匙
    create_time: Date,   //创建时间
    update_time: Date    //更新时间
});
var m_developer = mongoose.model('developer', developer);
exports.developer = m_developer;

exports.addDeveloper = function (email, password, dev_type, dev_name, callback) {
    getNewID("developer", function (new_dev_id) {
        var i_developer = new m_developer();
        i_developer.dev_id = new_dev_id;
        i_developer.email = email;
        i_developer.password = password;
        i_developer.dev_type = dev_type;
        i_developer.dev_name = dev_name;
        var timestamp = new Date();
        timestamp = Date.parse(timestamp);
        i_developer.dev_key = util.md5("dev_key" + timestamp);
        i_developer.dev_secret = util.md5("dev_secret" + timestamp);
        i_developer.create_time = new Date();
        i_developer.save(function (err) {
            if (callback) {
                callback(err, new_dev_id);
            }
        });
    });
};

// 开发者应用接口
var app = new Schema({
    app_id: Number,      //应用编号
    dev_id: Number,      //开发者编号
    app_name: String,    //应用名称
    app_logo: String,    //应用Logo
    app_key: String,     //开发者标识
    app_secret: String,  //开发者密匙
    create_time: Date,   //创建时间
    update_time: Date    //更新时间
});
var m_app = mongoose.model('app', app);
exports.app = m_app;

exports.addApp = function (dev_id, app_name, app_logo, callback) {
    getNewID("app", function (new_app_id) {
        var i_app = new m_app();
        i_app.app_id = new_app_id;
        i_app.dev_id = dev_id;
        i_app.app_name = app_name;
        i_app.app_logo = app_logo;
        var timestamp = new Date();
        timestamp = Date.parse(timestamp);
        i_app.app_key = util.md5("app_key" + timestamp);
        i_app.app_secret = util.md5("app_secret" + timestamp);
        i_app.create_time = new Date();
        i_app.save(function (err) {
            if (callback) {
                callback(err, new_app_id);
            }
        });
    });
};

exports.getApp = function(app_key, callback){
    m_app.findOne({"app_key": app_key}, function(err, app){
       callback(app);
    });
};