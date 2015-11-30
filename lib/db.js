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

exports.updateCustomerPassword = function (cust_id, new_pass, callback) {
    m_customer.update({'cust_id': cust_id}, {"$set": {"password": new_pass}}, function (err, row, raw) {
        callback(row);
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
        default:
            callback({});
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
    obj_id: Number,                  //车辆id
    cust_id: Number,                 //用户id
    cust_name:String,                //临时字段
    obj_name: String,                //车牌号
    nick_name: String,               //车辆名称
    device_id: Number,               //终端id：0 表示没有绑定终端
    active_gps_data: {},             //临时字段
    car_brand_id: Number,            //品牌id
    car_brand: String,               //车辆品牌
    car_series_id: Number,           //车型id
    car_series: String,              //车型
    car_type_id: Number,             //车款id
    car_type: String,                //车款
    engine_no: String,               //发动机号
    frame_no: String,                //车架号
    reg_no: String,                  //登记证书
    insurance_company: String,       //保险公司
    insurance_tel: String,           //保险公司电话
    insurance_date: Date,            //保险到期时间
    insurance_no: String,            //保险单号
    annual_inspect_date: Date,       //车辆年检日期
    maintain_company: String,        //保养4S店
    maintain_tel: String,            //保养4S店电话
    mileage: Number,                 //当前里程，需要动态更新
    maintain_last_mileage: Number,   //最后保养里程
    maintain_last_date: Date,        //最后保养时间
    maintain_next_mileage: Number,   //下次保养里程
    gas_no: String,                  //汽油标号 0#, 90#, 93#(92#), 97#(95#)
    fuel_ratio: Number,              //油耗修正系数(直接原始数据*该系数得到实际油耗)
    fuel_price: Number,              //加油油价
    buy_date: Date,                  //购车时间
    business_status: Number,         //业务状态 1:在店 2:离店
    create_time: Date,               //创建时间
    update_time: Date,               //更新时间
    last_arrive_time: Date,          //最后一次到店时间
    arrive_count: Number,            //到店次数
    evaluate_count: Number,          //评价次数
    fault_count: Number,             //最新故障计数
    alert_count: Number,             //最新报警计数
    event_count: Number,             //车务提醒计数
    vio_count: Number,               //最新违章计数
    geofence: {                      //围栏
        //        geo_type: 0,       //0: 进出报警 1:驶入报警 2:驶出报警
        //        lon: 112,
        //        lat: 22,
        //        width: 1000
    },
    last_query: Date,                //最后查询时间，用于控制用户查询周期，vip一天一次，免费用户七天一次。
    vio_citys: [                     //违章城市
        //{ vio_city_name: '深圳', vio_location: '0755' }
    ]
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
                i_vehicle.business_status = 2; //离店
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

// 获取车辆列表
//      parent_cust_id: 商户ID
exports.getVehicleList = function (parent_cust_id, max_id, fields, callback) {
    m_customer.find({"parent_cust_id": parent_cust_id}, {"cust_id": 1, "cust_name": 1}, function (err, customers) {
        var cust_ids = [];
        for (var i = 0; i < customers.length; i++) {
            cust_ids.push(customers[i].cust_id);
        }
        m_vehicle.count({"cust_id": {"$in": cust_ids}}, function(err, count){
            if(max_id > 0){
                m_vehicle.find({"cust_id": {"$in": cust_ids}, "obj_id": {"$gt": max_id}}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, vehicles) {
                    for(var i = 0; i < vehicles.length; i++){
                        for(var j= 0; j < customers.length; j++){
                            if(vehicles[i].cust_id == customers[j].cust_id){
                                vehicles[i].cust_name = customers[j].cust_name;
                            }
                        }
                    }
                    var result = {
                        total: count,
                        data: vehicles
                    };
                    callback(result);
                });
            }else{
                m_vehicle.find({"cust_id": {"$in": cust_ids}}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, vehicles) {
                    for(var i = 0; i < vehicles.length; i++){
                        for(var j= 0; j < customers.length; j++){
                            if(vehicles[i].cust_id == customers[j].cust_id){
                                vehicles[i].cust_name = customers[j].cust_name;
                            }
                        }
                    }
                    var result = {
                        total: count,
                        data: vehicles
                    };
                    callback(result);
                });
            }
        });
    });
};

// 搜索车辆列表
// 参数:
//      parent_cust_id: 商户ID
//      obj_name: 车牌号
//      fields: 返回的字段
// 返回:
//      返回指令字段的列表
exports.searchCustomerVehicle = function (parent_cust_id, obj_name, fields, max_id, callback) {
    m_customer.find({"parent_cust_id": parent_cust_id}, {"cust_id": 1, "cust_name": 1}, function (err, customers) {
        var cust_ids = [];
        for (var i = 0; i < customers.length; i++) {
            cust_ids.push(customers[i].cust_id);
        }
        m_vehicle.count({"cust_id": {"$in": cust_ids}, "obj_name": {"$regex": obj_name}}, function(err, count){
            if(max_id > 0){
                m_vehicle.find({"cust_id": {"$in": cust_ids}, "obj_name": {"$regex": obj_name}, "obj_id": {"$gt": max_id}}, fields, {"sort": {"create_time": -1}, "limit": 10}, function (err, vehicles) {
                    for(var i = 0; i < vehicles.length; i++){
                        for(var j= 0; j < customers.length; j++){
                            if(vehicles[i].cust_id == customers[j].cust_id){
                                vehicles[i].cust_name = customers[j].cust_name;
                            }
                        }
                    }
                    var result = {
                        total: count,
                        data: vehicles
                    };
                    callback(result);
                });
            }else{
                m_vehicle.find({"cust_id": {"$in": cust_ids}, "obj_name": {"$regex": obj_name}}, fields, {"sort": {"create_time": -1}, "limit": 10}, function (err, vehicles) {
                    for(var i = 0; i < vehicles.length; i++){
                        for(var j= 0; j < customers.length; j++){
                            if(vehicles[i].cust_id == customers[j].cust_id){
                                vehicles[i].cust_name = customers[j].cust_name;
                            }
                        }
                    }
                    var result = {
                        total: count,
                        data: vehicles
                    };
                    callback(result);
                });
            }
        });
    });
};

exports.getVehicleListByObjIDs = function (obj_ids, callback) {
    m_vehicle.find({'obj_id': {"$in": obj_ids}}, {"obj_id":1, "car_brand_id":1, "car_series_id":1, "car_type_id":1, "car_brand":1, "car_series":1, "car_type":1}, function (err, vehicles) {
        callback(vehicles);
    });
};

exports.getVehicleListByDevices = function (device_ids, callback) {
    m_vehicle.find({'device_id': {"$in": device_ids}}, {"cust_id":1, "device_id":1, "obj_name":1, "car_brand_id":1, "car_brand":1}, function (err, vehicles) {
        var cust_ids = [];
        for(var i = 0; i < vehicles.length; i++){
            cust_ids.push(vehicles[i].cust_id);
        }
        cust_ids = util.unique(cust_ids);
        m_customer.find({'cust_id': {'$in': cust_ids}}, {"cust_id":1, "cust_name":1}, function(err, customers) {
            for(var i = 0; i < vehicles.length; i++){
                for(var j= 0; j < customers.length; j++){
                    if(vehicles[i].cust_id == customers[j].cust_id){
                        vehicles[i].cust_name = customers[j].cust_name;
                    }
                }
            }
            callback(vehicles);
        });
    });
};

// 业务数据
var business = new Schema({
    business_id: Number,        //业务ID
    cust_id: Number,            //用户id
    cust_name:String,           //临时字段
    obj_id: Number,             //车辆id
    obj_name: String,           //车牌号
    car_brand_id: Number,            //品牌id
    car_brand: String,               //车辆品牌
    car_series_id: Number,           //车型id
    car_series: String,              //车型
    car_type_id: Number,             //车款id
    car_type: String,                //车款
    mileage: Number,            //当时里程
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
exports.addBusiness = function (cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, callback) {
    getNewID("business", function (new_busi_id) {
        var i_business = new m_business();
        i_business.business_id = new_busi_id;
        i_business.cust_id = cust_id;
        i_business.cust_name = cust_name;
        i_business.obj_id = obj_id;
        i_business.obj_name = obj_name;
        i_business.mileage = mileage;
        i_business.status = 1; //业务状态 1:在店 2:离店
        i_business.business_type = business_type;
        i_business.business_content = business_content;
        i_business.arrive_time = new Date();
        i_business.save(function (err) {
            if (callback) {
                callback(err, new_busi_id);
            }
        });

        // 更新车辆最后到店时间和业务状态
        m_vehicle.update({"obj_id": obj_id}, {"$set": {"business_status":1, "last_arrive_time": i_business.arrive_time}, "$inc": {"arrive_count": 1}}, function(err, row, raw){
            if(row > 0){
                console.log("update vehicle arrive status ok");
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

// 获取业务列表
//      parent_cust_id: 商户ID
//      status: 1: 在店  2: 离店
//      min_id: 本页最小ID
//      max_id: 本页最大ID
//      query_type: 离店查询方式 1:到店时间 2:离店时间 3:评价时间
//      begin_time: 开始时间
//      end_time: 结束时间
exports.getBusinessList = function (parent_cust_id, status, max_id, query_type, begin_time, end_time, fields, callback) {
    fields.obj_id = 1;
    m_customer.find({"parent_cust_id": parent_cust_id}, {"cust_id": 1}, function(err, customers){
        var cust_ids = [];
        for(var i = 0; i < customers.length; i++){
            cust_ids.push(customers[i].cust_id);
        }
        if(status == 1){
            m_business.count({"cust_id": {"$in": cust_ids}, "status": 1}, function(err, count){
                m_business.find({"cust_id": {"$in": cust_ids}, "status": 1}, fields, {"sort": {"arrive_time": 1}}, function (err, docs) {
                    var result = {
                        total: count,
                        data: docs
                    };
                    callback(result);
                });
            });
        }else{
            var filter = {};
            var sort = {};
            switch (query_type){
                case 1:
                    filter = {"cust_id": {"$in": cust_ids}, "business_id": {"$gt": max_id}, "arrive_time": {"$gte": begin_time, "$lte": end_time}, "status": 2};
                    sort = {"sort": {"arrive_time": 1}, "limit": 10};
                    break;
                case 2:
                    filter = {"cust_id": {"$in": cust_ids}, "business_id": {"$gt": max_id}, "leave_time": {"$gte": begin_time, "$lte": end_time}, "status": 2};
                    sort = {"sort": {"leave_time": 1}, "limit": 10};
                    break;
                case 3:
                    filter = {"cust_id": {"$in": cust_ids}, "business_id": {"$gt": max_id}, "evaluate_time": {"$gte": begin_time, "$lte": end_time}, "status": 2};
                    sort = {"sort": {"evaluate_time": 1}, "limit": 10};
                    break;
                default:
                    filter = {"cust_id": {"$in": cust_ids}, "business_id": {"$gt": max_id}, "arrive_time": {"$gte": begin_time, "$lte": end_time}, "status": 2};
                    sort = {"sort": {"arrive_time": 1}, "limit": 10};
                    break;
            }
            m_business.count(filter, function (err, count) {
                if (max_id > 0) {
                    m_business.find(filter, fields, sort, function (err, docs) {
                        var result = {
                            total: count,
                            data: docs
                        };
                        callback(result);
                    });
                } else {
                    m_business.find({"cust_id": {"$in": cust_ids}, "status": 2}, fields, sort, function (err, docs) {
                        var result = {
                            total: count,
                            data: docs
                        };
                        callback(result);
                    });
                }
            });
        }
    });
};

// 获取业务列表
//      parent_cust_id: 商户ID
//      begin_time: 开始时间
//      end_time: 结束时间
exports.getBusinessTotal = function (parent_cust_id, begin_time, end_time, callback) {
    m_customer.find({"parent_cust_id": parent_cust_id}, {"cust_id": 1}, function(err, customers) {
        var cust_ids = [];
        for (var i = 0; i < customers.length; i++) {
            cust_ids.push(customers[i].cust_id);
        }
        m_business.count({"cust_id": {"$in": cust_ids}, "arrive_time": {"$gte": begin_time, "$lte": end_time}}, function (err, arrive_count) {
            m_business.count({"cust_id": {"$in": cust_ids}, "leave_time": {"$gte": begin_time, "$lte": end_time}}, function (err, leave_count) {
                m_business.count({"cust_id": {"$in": cust_ids}, "evaluate_time": {"$gte": begin_time, "$lte": end_time}}, function (err, evaluate_count) {
                    var result = {
                        arrive_count: arrive_count,
                        leave_count: leave_count,
                        evaluate_count: evaluate_count
                    };
                    callback(result);
                });
            });
        });
    });
};


// 终端设备
var device = new Schema({
    device_id: Number,        //终端id
    device_type: String,      //终端型号
    dealer_id:Number,         //代理商id
    seller_id:Number,         //商户id
    cust_id: Number,          //归属用户，默认0，公司仓库，如果用户购买并支付，则变成用户id
    cust_name:String,
    mobile:String,
    email:String,
    serial: String,           //终端序列号
    init_sim: String,         //初始配卡
    sim: String,              //终端内置sim卡
    status: Number,           //0：未出库 1：已出库 2: 确认收货 3：已激活
    is_crowdfunding: Boolean, //是否众筹用户
    service_end_date: Date,   //服务到期日
    hardware_version: String, //硬件版本号
    software_version: String, //软件版本号
    create_time: Date,
    update_time: Date,
    stock_time: Date,
    active_time: Date,        //激活时间
    end_time: Date,           //到期时间
    refuel_number: Number,        //1: 第一次， 2: 第二次
    refuel_first_time: Date,      //第一次加油时间
    refuel_first_mileage:Number,  //第一次加油时的累计里程
    refuel_second_time: Date,     //第二次加油时间
    refuel_second_mileage:Number, //第二次加油时的累计里程
    refuel_second_quantiy:Number, //第二次加油量
    total_traffic: Number,        //每月总的流量
    remain_traffic: Number,       //剩余流量
    params: {},
    active_gps_data: {
        //        device_id:String,
        //        lon:Number,
        //        lat:Number,
        //        speed:Number,
        //        direct:Number,
        //        gps_flag:Number,
        //        mileage:Number,
        //        fuel:Number,
        //        temp:Number,
        //        status:String,
        //        cmd_type:Number,
        //        cmd_word:String,
        //        data:String,
        //        gps_time:Date,
        //        rcv_time:Date,
        //        signal:Number,
        //        battery:Number,
        //        event:Number,
        //        uni_status:[],
        //        uni_alerts:[],
        //        rev_lon:Number,
        //        rev_lat:Number,
        //        b_lon:Number,
        //        b_lat:Number
    },
    is_online: Boolean,      //是否在线
    signal_level: Number,    //信号强度
    device_flag: Number,     //0: 静止  1：运行  2：设防  3：报警
    stealth_mode: Number,    //是否隐身 1：隐身  0：不隐身
    active_obd_err: [],      //最新obd故障码['P2011', 'P2000']
    //{
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
    //}
    active_obd_data: {},               //最新obd标准数据：电瓶电压，节气门开度，发动机转速，水温，三元催化器温度，剩余油量，环境温度，大气压力，进气压力，进气温度，燃油压力，发动机负载，长期燃油修正，点火提交角
    last_drive_score: Number,          //最新驾驶得分 满分：100
    //{
    //    lt_dpdy: Number,                  //长期电瓶电压检测值 10-15V  取最近10天日行程超过2公里的数据
    //    lt_jqmkd: Number,                 //长期节气门开度值 12-17%
    //    lt_fdjzs: Number,                 //长期怠速发动机转速 700-910 rpm
    //    lt_sw: Number,                    //长期水温 0-112°C
    //    lt_chqwd: Number                  //长期三元催化器温度 300-800°
    //}
    last_health_check: {},             //最后体检数据
    server_ip: String                  //所处服务器地址
});
var m_device = mongoose.model('device', device);
exports.m_device = m_device;

// 更新设备信息, 比如激活
exports.updateDevice = function (device_id, json, callback) {
    m_device.update({'device_id': device_id}, {"$set": json}, function (err, row, raw) {
        callback(row);
    });
};

// 获取商户设备列表, 只有确认收货的终端才能显示
exports.getSellerDeviceList = function(parent_cust_id, max_id, fields, callback){
    m_device.count({"seller_id": parent_cust_id}, function (err, count) {
        if (max_id > 0) {
            m_device.find({"seller_id": parent_cust_id, "device_id": {"$gt": max_id}}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, devices) {
                var result = {
                    total: count,
                    data: devices
                };
                callback(result);
            });
        } else {
            m_device.find({"seller_id": parent_cust_id}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, devices) {
                var result = {
                    total: count,
                    data: devices
                };
                callback(result);
            });
        }
    });
};

// 搜索商户设备列表
exports.searchSellerDeviceList = function(parent_cust_id, max_id, serial, fields, callback){
    m_device.count({"seller_id": parent_cust_id, "serial": {"$regex": serial}}, function (err, count) {
        if (max_id > 0) {
            m_device.find({"seller_id": parent_cust_id, "device_id": {"$gt": max_id}, "serial": {"$regex": serial}}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, devices) {
                var result = {
                    total: count,
                    data: devices
                };
                callback(result);
            });
        } else {
            m_device.find({"seller_id": parent_cust_id, "serial": {"$regex": serial}}, fields, {"sort": {"create_time": 1}, "limit": 10}, function (err, devices) {
                var result = {
                    total: count,
                    data: devices
                };
                callback(result);
            });
        }
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

// 车辆品牌
var car_brand = new Schema({
    id: Number,
    name: String,
    pid: Number,
    url_spell: String,
    t_spell: String,
    url_icon: String
});

var m_car_brand = mongoose.model('car_brand', car_brand);

exports.addCarBrand = function (id, name, pid, url_spell, t_spell) {
    m_car_brand.findOne({id: id}, {id: 1}, function (err, brand) {
        if(!brand){
            var i_brand = new m_car_brand();
            i_brand.id = id;
            i_brand.name = name;
            i_brand.pid = pid;
            i_brand.url_spell = url_spell;
            i_brand.t_spell = t_spell;
            i_brand.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Car Brand Saved!');
                }
            });
        }
    });
};

exports.getBrandList = function (callback) {
    m_car_brand.find({}, {}, {"sort": {"t_spell": 1}}, function (err, brands) {
        callback(brands);
    });
};

// 车辆型号
var car_series = new Schema({
    id: Number,
    name: String,
    pid: Number,
    url_spell: String,
    show_name: String,
    go_id: Number,
    go_name: String,
    maintain: {},
    fuel_ratio: Number,
    obd_far_pic: [],  //近景图，可以上传多张{big_pic_url: "", small_pic_url: "", author: "WiCARE", is_auth: false}
    obd_near_pic: [],  //远景图，可以上传多张{big_pic_url: "", small_pic_url: "", author: "WiCARE", is_auth: false}
    back_pic: String  //背景图片 1280*1280
});

var m_car_series = mongoose.model('car_series', car_series);

exports.addCarSeries = function (id, name, pid, url_spell, show_name, go_id, go_name) {
    m_car_series.findOne({'id': id}, {"id": 1}, function (err, series) {
        if(!series){
            var i_series = new m_car_series();
            i_series.id = id;
            i_series.name = name;
            i_series.pid = pid;
            i_series.url_spell = url_spell;
            i_series.show_name = show_name;
            i_series.go_id = go_id;
            i_series.go_name = go_name;
            i_series.fuel_ratio = 1;
            i_series.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Car Series Saved!');
                }
            });
        }
    });
};

exports.getSeriesList = function (pid, callback) {
    m_car_series.find({"pid": pid}, {}, {"sort": {"id": 1}}, function (err, series) {
        callback(series);
    });
};

// 车辆款式
var car_type = new Schema({
    id: Number,
    name: String,
    pid: Number,
    go_id: String,
    go_name: String,
    refer_price: String,
    url_spell: String,    //车型简拼
    displacement: Number, //排量
    transmission: String, //变速箱
    maintain: [],
    zh_fuel: Number,  //综合工况油耗
    sn_fuel: Number,  //市内工况油耗
    jq_fuel: Number,  //郊区工况油耗
    sj_fuel: Number,   //网友发布平均油耗(网友反映的平均油耗值)
    is_deal: Boolean   //已处理
});

var m_car_type = mongoose.model('car_type', car_type);

exports.addCarType = function (id, name, pid, go_id, go_name, refer_price) {
    m_car_type.findOne({"id": id}, {"id": 1}, function (err, type) {
        if(!type){
            var i_type = new m_car_type();
            i_type.id = id;
            i_type.name = name;
            i_type.pid = pid;
            i_type.go_id = go_id;
            i_type.go_name = go_name;
            i_type.refer_price = refer_price;
            i_type.zh_fuel = 7;
            i_type.sn_fuel = 9;
            i_type.jq_fuel = 7;
            i_type.sj_fuel = 7;
            i_type.is_deal = false;
            i_type.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Car Type Saved!');
                }
            });
        }
    });
};

exports.getCarTypeList = function (pid, callback) {
    m_car_type.find({"pid": pid}, {}, {"sort": {"go_id": 1}}, function (err, car_types) {
        callback(car_types);
    });
};