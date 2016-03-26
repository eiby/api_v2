/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-20
 * Time: 下午3:56
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var revise = require("../lib/revise.js");
var config = require("../lib/config.js");
var url = require("url");

//检查全局令牌
exports.checkAccessToken = function (req, res, next){
    var authorize = config.authorize;
    //console.log(config);
    // 判断是否需要验证令牌, 如果不需要, 则继续
    var obj = url.parse(req.url);
    if(authorize[obj.pathname]){
        var access_token = req.query.access_token;
        db.checkAccessToken(access_token, function(success){
            if(success){
                next();
            }else{
                util.resSendNoRight(res);
            }
        });
    }else{
        next();
    }
};

//获取全局令牌
exports.token = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var app_key = req.query.app_key;
    var query_json = {
        "$or": [{
            mobile: account,
            password: password
        }, {
            email: account,
            password: password
        }]
    };
    db.get(db.table_name_def.TAB_CUSTOMER, query_json, "cust_id,password", function(customer){
        if (customer) {
            if (customer.password == password) {
                var query_json = {"app_key": app_key};
                db.get(db.table_name_def.TAB_APP, query_json, "app_id,app_secret", function (app) {
                    if (!app) {
                        result = {
                            "status_code": define.API_STATUS_INVALID_APPKEY  //错误APPkey
                        };
                        res.send(result);
                    } else {
                        var access_token = util.encodeAES(app.app_secret + "," + customer.cust_id);
                        var valid_time = new Date();
                        var d = valid_time.getTime() + 24 * 60 * 60 * 1000;
                        valid_time = new Date(d);
                        var query_json = {access_token: access_token};
                        var update_json = {valid_time: valid_time};
                        db.findAndUpdate(db.table_name_def.TAB_ACCESS_TOKEN, query_json, update_json, function(status, doc){
                            if(status == define.DB_STATUS_OK){
                                result = {
                                    "status_code": define.API_STATUS_OK, //0 成功 >0失败
                                    "access_token": access_token,
                                    "valid_time": valid_time
                                };
                            }else{
                                result = {
                                    "status_code": define.API_STATUS_DATABASE_ERROR //0 成功 >0失败
                                };
                            }
                            res.send(result);
                        });
                    }
                });
            } else {
                result = {
                    "status_code": define.API_STATUS_WRONG_PASSWORD  //密码错误
                };
                res.send(result);
            }
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_USER  //用户不存在
            };
            res.send(result);
        }
    });
};

//使用注册用户登陆
exports.login = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var app_key = req.query.app_key;
    // 判断邮箱或者手机是否登录成功
    var query_json = {
        "$or": [{
            mobile: account,
            password: password
        }, {
            email: account,
            password: password
        }]
    };
    db.get(db.table_name_def.TAB_CUSTOMER, query_json, "cust_id,password,cust_type,cust_name,tree_path", function(customer){
        if (customer) {
            if (customer.password == password) {
                var query_json = {"app_key": app_key};
                db.get(db.table_name_def.TAB_APP, query_json, "app_id,app_secret", function (app) {
                    if (!app) {
                        result = {
                            "status_code": define.API_STATUS_INVALID_APPKEY  //错误APPkey
                        };
                        res.send(result);
                    } else {
                        var access_token = util.encodeAES(app.app_secret + "," + customer.cust_id);
                        var valid_time = new Date();
                        var d = valid_time.getTime() + 24 * 60 * 60 * 1000;
                        valid_time = new Date(d);
                        var query_json = {access_token: access_token};
                        var update_json = {valid_time: valid_time};
                        db.findAndUpdate(db.table_name_def.TAB_ACCESS_TOKEN, query_json, update_json, function(status, doc){
                            if(status == define.DB_STATUS_OK) {
                                result = {
                                    "status_code": define.API_STATUS_OK, //0 成功 >0失败
                                    "cust_type": customer.cust_type,
                                    "cust_id": customer.cust_id,
                                    "cust_name": customer.cust_name,
                                    "tree_path": customer.tree_path,
                                    "access_token": access_token,
                                    "valid_time": valid_time
                                };
                            }else{
                                result = {
                                    "status_code": define.API_STATUS_DATABASE_ERROR //0 成功 >0失败
                                };
                            }
                            res.send(result);
                        });
                    }
                });
            } else {
                result = {
                    "status_code":define.API_STATUS_WRONG_PASSWORD  //密码错误
                };
                res.send(result);
            }
        } else {
            result = {
                "status_code": define.API_STATUS_INVALID_USER  //用户不存在
            };
            res.send(result);
        }
    });
};

//第三方登录以后调用此接口，如果已经存在此用户则同步用户信息，如不存在则返回不存在，需走注册绑定接口
exports.sso_login = function(req, res){
    var login_id = req.query.login_id;
    var weixin_appsecret = req.query.weixin_appsecret;
    if(login_id == undefined){
        login_id = "";
    }
    if(util.inArray(define.WEIXIN_APP_SECRET, weixin_appsecret)){
        var app_key = req.query.app_key;
        // 判断邮箱或者手机是否登录成功
        var query_json = {
            login_id: login_id
        };
        db.get(db.table_name_def.TAB_CUSTOMER, query_json, "cust_id,password,cust_type,cust_name,tree_path", function(customer){
            if(customer){
                var query_json = {"app_key": app_key};
                db.get(db.table_name_def.TAB_APP, query_json, "app_id,app_secret", function (app) {
                    if (!app) {
                        result = {
                            "status_code": define.API_STATUS_INVALID_APPKEY  //错误APPkey
                        };
                        res.send(result);
                    } else {
                        var access_token = util.encodeAES(app.app_secret + "," + customer.cust_id);
                        var valid_time = new Date();
                        var d = valid_time.getTime() + 24 * 60 * 60 * 1000;
                        valid_time = new Date(d);
                        var query_json = {access_token: access_token};
                        var update_json = {valid_time: valid_time};
                        db.findAndUpdate(db.table_name_def.TAB_ACCESS_TOKEN, query_json, update_json, function(status, doc){
                            if(status == define.DB_STATUS_OK) {
                                result = {
                                    "status_code": define.API_STATUS_OK, //0 成功 >0失败
                                    "cust_type": customer.cust_type,
                                    "cust_id": customer.cust_id,
                                    "cust_name": customer.cust_name,
                                    "tree_path": customer.tree_path,
                                    "access_token": access_token,
                                    "valid_time": valid_time
                                };
                            }else{
                                result = {
                                    "status_code": define.API_STATUS_DATABASE_ERROR //0 成功 >0失败
                                };
                            }
                            res.send(result);
                        });
                    }
                });
            }else{
                result = {
                    "status_code":define.API_STATUS_INVALID_USER //用户不存在
                };
                res.send(result);
            }
        });
    }else{
        result = {
            "status_code":define.API_STATUS_INVALID_WEIXIN_APPSECRET //无效微信appsecret
        };
        res.send(result);
    }
};

// 用户注册
exports.register = function(req, res){
    var mobile = req.query.mobile;  //手机
    var email = req.query.email;    //邮箱
    var password = req.query.password;  //加密密码
    var valid_type = parseInt(req.query.valid_type);
    var valid_code = req.query.valid_code;

    //db.ifValidCodeValid(mobile, email, valid_type, valid_code, function (valid) {
    // 判断校验码是否正常
    var now = new Date();
    var query_json = {"$or": [
        {'mobile': mobile, 'valid_code': valid_code, 'valid_time': {'$gte': now}},
        {'email': email, 'valid_code': valid_code, 'valid_time': {'$gte': now}}
    ]};
    db.get(db.table_name_def.TAB_VALID_CODE, query_json, "valid_code", function(valid_code){
        if(!valid_code){
            result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        }else{
            // 注册用户, 判断用户名是否存在, 如果存在, 返回提醒信息
            var create_json = {
                mobile: mobile,
                password: password,
                balance: 0,
                seller_id: 0
            };
            var is_judge_exists = false;
            var exists_query = {};
            if(mobile != undefined && mobile != ""){
                exists_query = {'mobile': mobile};
                is_judge_exists = true;
                create_json = {
                    mobile: mobile,
                    email: "",
                    password: password,
                    balance: 0,
                    seller_id: 0
                };
            }else if(email != undefined && email != ""){
                exists_query = {'email': email};
                is_judge_exists = true;
                create_json = {
                    mobile: "",
                    email: email,
                    password: password,
                    balance: 0,
                    seller_id: 0
                };
            }
            db.create(db.table_name_def.TAB_CUSTOMER, create_json, is_judge_exists, exists_query, "cust_id", false, null, null, function(status, id){
                if (status == define.DB_STATUS_OK) {
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "cust_id": id
                    }
                } else if (status == define.DB_STATUS_EXISTS) {
                    result = {
                        "status_code": define.API_STATUS_EXISTS_USER,  //0 成功 >0 失败
                        "cust_id": id
                    }
                } else {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }
    });
};

// 创建新的客户
exports.new = function (req, res) {
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
    var mode = parseInt(req.query.mode);
    var if_arrive = parseInt(req.query.if_arrive);
    var seller_id = req.query.seller_id;
    var create_json = util.getCreateJson(req.query, "seller_id,cust_type,cust_name,mobile,password");
    var mobile = req.query.mobile;
    create_json.password = util.md5(mobile.substr(mobile.length - 6, 6));
    var cust_name = req.query.cust_name;
    //var mobile = req.query.mobile;
    //var obj_name = req.query.obj_name;
    //var frame_no = req.query.frame_no;
    //var car_brand = req.query.car_brand;
    //var car_series = req.query.car_series;
    //var car_type = req.query.car_type;
    //var car_brand_id = parseInt(req.query.car_brand_id);
    //var car_series_id = parseInt(req.query.car_series_id);
    //var car_type_id = parseInt(req.query.car_type_id);
    //var mileage = parseInt(req.query.mileage);
    //var if_arrive = parseInt(req.query.if_arrive);
    //var business_type = parseInt(req.query.business_type);
    //var business_content = req.query.business_content;

    var query_json = {"seller_id": 0, "mobile": req.query.mobile};
    var fields = "cust_id,seller_id";
    db.get(db.table_name_def.TAB_CUSTOMER, query_json, fields, function(customer){
        if(customer){
            var update_json = {"seller_id": seller_id};
            db.update(db.table_name_def.TAB_CUSTOMER, query_json, update_json, function(status){
                if (status == define.DB_STATUS_FAIL) {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                    res.send(result);
                } else {
                    if (mode == 1) {
                        //db.addCustomer(cust_type, cust_name, mobile, parent_cust_id, function (err, cust_id) {
                        result = {
                            "status_code": define.API_STATUS_EXISTS_USER, //用户已存在
                            "cust_id": customer.cust_id
                        };
                        res.send(result);
                    } else if (mode == 2) {
                        var create_json = util.getCreateJson(req.query, "obj_name,cust_id,seller_id,car_brand,car_series,car_type,car_brand_id,car_series_id,car_type_id,frame_no,mileage");
                        create_json.cust_id = customer.cust_id;
                        create_json.seller_id = seller_id;
                        create_json.cust_name = cust_name;
                        if (if_arrive == 1) {
                            create_json.business_status = 1;
                        } else {
                            create_json.business_status = 2;
                        }
                        create_json.arrive_count = 0;
                        create_json.evaluate_count = 0;

                        var exists_query = {"cust_id": customer.cust_id, "obj_name": req.query.obj_name};
                        var exists_field = {"obj_id": 1};
                        var update_json = {"seller_id": seller_id};
                        //db.addVehicle("", obj_name, cust_id, car_brand, car_series, car_type, car_brand_id, car_series_id, car_type_id, frame_no, mileage, function (err, obj_id) {
                        db.create(db.table_name_def.TAB_VEHICLE, create_json, true, exists_query, exists_field, true, exists_query, update_json, function (status, obj_id) {
                            if (status == define.DB_STATUS_FAIL) {
                                result = {
                                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                                };
                                res.send(result);
                            } else {
                                // 如果到店,则自动产生到店记录
                                if (if_arrive == 1) {
                                    //db.addBusiness(cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, function (err, busi_id) {
                                    var create_json = util.getCreateJson(req.query, "seller_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content");
                                    create_json.cust_id = customer.cust_id;
                                    create_json.obj_id = obj_id;
                                    create_json.seller_id = seller_id;
                                    create_json.arrive_time = new Date();
                                    create_json.status = 1;
                                    db.create(db.table_name_def.TAB_BUSINESS, create_json, false, null, null, false, null, null, function (status, busi_id) {
                                        result = {
                                            "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                            "cust_id": customer.cust_id,
                                            "obj_id": obj_id,
                                            "business_id": busi_id
                                        };
                                        res.send(result);
                                    });
                                    // 向用户发送业务通知
                                    var cust_id = customer.cust_id;
                                    var obj_name = req.query.obj_name;
                                    var business_content = req.query.business_content;
                                    db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: seller_id}, "login_id,cust_name,sex,logo", function(seller) {
                                        db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: cust_id}, "login_id,cust_name,sex,logo", function (friend) {
                                            if (friend) {
                                                var link = "http://h5.bibibaba.cn/baba/wx/src/baba/repair_list.html";
                                                var msg = "您的爱车[" + obj_name + "]已进店开始作业[" + business_content + "], 完工之后将会发送微信通知, 请耐心等候.";
                                                util.sendWeixinNewMsg(seller.cust_name, msg, friend.login_id, link, function (ret) {

                                                });
                                            }
                                        });
                                    });
                                } else {
                                    result = {
                                        "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                        "cust_id": customer.cust_id,
                                        "obj_id": obj_id
                                    };
                                    res.send(result);
                                }
                            }
                        });
                    }
                }
            });
        }else{
            var exists_query = {"seller_id": seller_id, "mobile": req.query.mobile};
            var exists_field = {"cust_id": 1};
            if (mode == 1) {
                //db.addCustomer(cust_type, cust_name, mobile, parent_cust_id, function (err, cust_id) {
                db.create(db.table_name_def.TAB_CUSTOMER, create_json, true, exists_query, exists_field, false, null, null, function(status, cust_id){
                    if (status == define.DB_STATUS_FAIL) {
                        result = {
                            "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        };
                        res.send(result);
                    } else if(status == define.DB_STATUS_EXISTS){
                        result = {
                            "status_code": define.API_STATUS_EXISTS_USER, //用户已存在
                            "cust_id": cust_id
                        };
                        res.send(result);
                    } else {
                        result = {
                            "status_code": define.API_STATUS_OK, //0 成功 >0 失
                            "cust_id": cust_id
                        };
                        res.send(result);
                    }
                });
            } else if (mode == 2) {
                db.create(db.table_name_def.TAB_CUSTOMER, create_json, true, exists_query, exists_field, false, null, null, function (status, cust_id) {
                    if (status == define.DB_STATUS_FAIL) {
                        result = {
                            "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        };
                        res.send(result);
                    } else {
                        var create_json = util.getCreateJson(req.query, "obj_name,cust_id,seller_id,car_brand,car_series,car_type,car_brand_id,car_series_id,car_type_id,frame_no,mileage");
                        create_json.cust_id = cust_id;
                        create_json.seller_id = seller_id;
                        create_json.cust_name = cust_name;
                        if (if_arrive == 1) {
                            create_json.business_status = 1;
                        } else {
                            create_json.business_status = 2;
                        }
                        create_json.arrive_count = 0;
                        create_json.evaluate_count = 0;

                        var exists_query = {"cust_id": cust_id, "obj_name": req.query.obj_name};
                        var exists_field = {"obj_id": 1};
                        //db.addVehicle("", obj_name, cust_id, car_brand, car_series, car_type, car_brand_id, car_series_id, car_type_id, frame_no, mileage, function (err, obj_id) {
                        db.create(db.table_name_def.TAB_VEHICLE, create_json, true, exists_query, exists_field, false, null, null, function (status, obj_id) {
                            if (status == define.DB_STATUS_FAIL) {
                                result = {
                                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                                };
                                res.send(result);
                            } else {
                                // 如果到店,则自动产生到店记录
                                if (if_arrive == 1) {
                                    //db.addBusiness(cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, function (err, busi_id) {
                                    var create_json = util.getCreateJson(req.query, "seller_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content");
                                    create_json.cust_id = cust_id;
                                    create_json.obj_id = obj_id;
                                    create_json.seller_id = seller_id;
                                    create_json.arrive_time = new Date();
                                    create_json.status = 1;
                                    db.create(db.table_name_def.TAB_BUSINESS, create_json, false, null, null, false, null, null, function (status, busi_id) {
                                        result = {
                                            "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                            "cust_id": cust_id,
                                            "obj_id": obj_id,
                                            "business_id": busi_id
                                        };
                                        res.send(result);
                                    });
                                    // 向用户发送业务通知
                                    var obj_name = "粤B9548T";
                                    var business_content = req.query.business_content;
                                    db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: seller_id}, "cust_name", function(seller) {
                                        db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: cust_id}, "login_id,cust_name,sex,logo", function (friend) {
                                            if (friend) {
                                                var link = "http://h5.bibibaba.cn/baba/wx/src/baba/repair_list.html";
                                                var msg = "您的爱车[" + obj_name + "]已进店开始作业[" + business_content + "], 完工之后将会发送微信通知, 请耐心等候.";
                                                util.sendWeixinNewMsg(seller.cust_name, msg, friend.login_id, link, function (ret) {

                                                });
                                            }
                                        });
                                    });
                                } else {
                                    result = {
                                        "status_code": define.API_STATUS_OK, //0 成功 >0 失
                                        "cust_id": cust_id,
                                        "obj_id": obj_id
                                    };
                                    res.send(result);
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

// 修改用户信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    var json =  util.getQueryAndUpdateJson(req.query, "cust_id,mobile,email", "login_id,cust_name,cust_type,province,city,logo,photo,remark,sex,birth,contacts,address,tel,id_card_type,annual_inspect_date,change_date");
    var query = json.query;
    var update = json.update;

    //db.updateCustomer(query, update, function (row) {
    if(json.has_query){
        db.update(db.table_name_def.TAB_CUSTOMER, query, update, function(status){
            if (status == define.DB_STATUS_FAIL) {
                result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                }
            } else {
                result = {
                    "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                }
            }
            res.send(result);
        });
    }else{
        result = {
            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
        };
        res.send(result);
    }

};

// 绑定账号
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.bind = function(req, res){
    var valid_code = req.query.valid_code;
    var mobile = req.query._mobile;
    // 判断校验码是否正常
    var now = new Date();
    var query_json = {'mobile': mobile, 'valid_code': valid_code, 'valid_time': {'$gte': now}};
    db.get(db.table_name_def.TAB_VALID_CODE, query_json, "valid_code", function(valid_code) {
        if (!valid_code) {
            result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        } else {
            var json =  util.getQueryAndUpdateJson(req.query, "cust_id,mobile,email", "login_id,logo,cust_name");
            var query = json.query;
            var update = json.update;
            if (json.has_query) {
                db.update(db.table_name_def.TAB_CUSTOMER, query, update, function (status) {
                    if (status == define.DB_STATUS_FAIL) {
                        result = {
                            "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                        }
                    } else {
                        result = {
                            "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                        }
                    }
                    res.send(result);
                });
            } else {
                result = {
                    "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
                };
                res.send(result);
            }
        }
    });
};

// 获取用户信息
// 参数:
//      cust_id: 用户ID
//      fields: 需要返回的字段
// 返回:
//      根据fields定义的字段返回
exports.get = function(req, res){
    var fields = req.query.fields;
    //    cust_id: Number,
    //    login_id: String,          //第三方登录返回的标识ID
    //    cust_name: String,         //用户昵称
    //    cust_type: Number,         //用户类型 0: 无车 1: 车主 2：服务商
    //    service_type: Number,      //服务商类型（0 销售，1 售后，2 保险，3 理赔，4 代办，5 维修，6 保养）
    //    car_brand: String,         //车辆品牌
    //    car_series: String,        //车型
    //    mobile: String,            //登陆手机
    //    email: String,             //邮箱地址
    //    password: String,          //登陆密码
    //    parent_cust_id: Number,    //父用户ID
    //    province: String,          //省份
    //    city: String,              //城市
    //    loc: {},                   //经纬度
    //    logo: String,              //车主头像
    //    photo: [],                 //店铺照片
    //    remark: String,            //用户简介
    //    sex: Number,               //性别
    //    birth: Date,               //生日
    //    contacts: String,          //联系人
    //    address: String,           //联系地址
    //    tel: String,               //联系电话
    //    id_card_type: String,      //驾照类型
    //    annual_inspect_date: Date, //驾照年审
    //    change_date: Date,         //换证日期
    //    balance: Number,           //账户余额，仅用于返还现金，暂时不支持充值
    //    create_time: Date,         //创建时间
    //    update_time: Date          //更新时间
    var query_fields = "cust_id,cust_name,cust_type,service_type,car_brand,car_series,mobile,email,seller_id,province,city,loc,logo,photo,remark,sex,birth,contacts,address,tel,id_card_type,annual_inspect_date,change_date,balance,create_time,update_time";
    var json = util.getQueryJson(req.query, query_fields);
    var query = json.query;
    db.get(db.table_name_def.TAB_CUSTOMER, query, fields, function (customer) {
        res.send(customer);
    });
};

//重置密码
exports.resetPassword = function (req, res) {
    var account = req.query.account;
    var password = req.query.password;
    var valid_type = parseInt(req.query.valid_type);
    var valid_code = req.query.valid_code;

    // 判断校验码是否正常
    var now = new Date();
    var query_json = {"$or": [
        {'mobile': account, 'valid_code': valid_code, 'valid_time': {'$gte': now}},
        {'email': account, 'valid_code': valid_code, 'valid_time': {'$gte': now}}
    ]};
    db.get(db.table_name_def.TAB_VALID_CODE, query_json, "valid_code", function(valid_code){
        if (!valid_code) {
            var result = {
                "status_code": define.API_STATUS_INVALID_VALIDCODE,  //0 成功 >0 失败
                "err_msg": "invalid code"
            };
            res.send(result);
        } else {
            //db.getCustomerByMobileOrMail(account, function (customer) {
            // 判断邮箱或者手机是否登录成功
            var query_json = {
                "$or": [{
                    mobile: account
                }, {
                    email: account
                }]
            };
            db.get(db.table_name_def.TAB_CUSTOMER, query_json, "cust_id", function(customer){
                if (customer) {
                    //db.updateCustomerPassword(customer.cust_id, password, function (row) {
                    var query_json = {"cust_id": customer.cust_id};
                    var update_json = {"password": password};
                    db.update(db.table_name_def.TAB_CUSTOMER, query_json, update_json, function(status){
                        if (status == define.DB_STATUS_OK) {
                            var result = {
                                "status_code": define.API_STATUS_OK  //重置成功
                            };
                            res.send(result);
                        } else {
                            var result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //更新失败
                            };
                            res.send(result);
                        }
                    });
                } else {
                    var result = {
                        "status_code": define.API_STATUS_INVALID_USER  //用户不存在
                    };
                    res.send(result);
                }
            });
        }
    });
};

exports.customerVehicleList = function (req, res) {
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = parseInt(req.query.parent_cust_id);

            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }

            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.getVehicleList(parent_cust_id, max_id, json, function (vehicles) {
                res.send(vehicles);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.searchCustomerVehicle = function (req, res) {
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = parseInt(req.query.parent_cust_id);
            var obj_name = req.query.obj_name;
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }
            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.searchCustomerVehicle(parent_cust_id, obj_name, json, max_id, function (vehicles) {
                res.send(vehicles);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerVehicleList(cust_id, function (vehicles) {
                res.send(vehicles);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithActiveGpsData = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerVehicleList2(cust_id, function (vehicles) {
                var dbs = [];
                var docs = vehicles;
                revise.gpsToBaidu(docs, "active_gps_data", function(rev_docs){
                    for (var i = 0; i < docs.length; i++) {
                        if (rev_docs) {
                            for (var j = 0; j < rev_docs.length; j++) {
                                if (rev_docs[j]) {
                                    if (docs[i].active_gps_data.lon.toFixed(2) == rev_docs[j].lon.toFixed(2) && docs[i].active_gps_data.lat.toFixed(2) == rev_docs[j].lat.toFixed(2)) {
                                        docs[i].active_gps_data.lon = docs[i].active_gps_data.lon + rev_docs[j].rev_lon - rev_docs[j].lon;
                                        docs[i].active_gps_data.lat = docs[i].active_gps_data.lat + rev_docs[j].rev_lat - rev_docs[j].lat;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    res.send(docs);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.vehicleListWithDayTotal = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            var day = req.query.day;
            db.getCustomerVehicleDayTotal(cust_id, day, function (trips_total) {
                res.send(trips_total);
            });

        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.sellerDeviceList = function(req, res){
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            //var parent_cust_id = req.query.parent_cust_id;
            var json = util.getQueryAndUpdateJson(query, "seller_id,cust_id,status,create_time", "");
            var query = json.query;
            var page = req.query.page;
            var max_id = util.getID(req.query.max_id);
            var min_id = util.getID(req.query.min_id);
            var fields = util.getFieldJson(req.query.fields);
            var sorts = util.getSortJson(req.query.sorts);
            var limit = parseInt(req.query.limit);

            db.getDeviceList(query, fields, sorts, page, min_id, max_id, limit, function (devices) {
                var _devices = {
                    total: 0,
                    data: []
                };
                var device_ids = [];
                _devices.total = devices.total;
                for(var i = 0; i < devices.data.length; i++){
                    device_ids.push(devices.data[i].device_id);
                    _devices.data.push(devices.data[i].toJSON());
                }
                db.getVehicleListByDevices(device_ids, function (vehicles) {
                    for (var i = 0; i < _devices.data.length; i++) {
                        _devices.data[i].obj_name = "";
                        _devices.data[i].obj_id = "";
                        _devices.data[i].car_brand_id = 0;
                        _devices.data[i].car_brand = "";
                        _devices.data[i].cust_name = "";
                        for (var j = 0; j < vehicles.length; j++) {
                            if (_devices.data[i].device_id == vehicles[j].device_id) {
                                _devices.data[i].obj_id = vehicles[j].obj_id;
                                _devices.data[i].obj_name = vehicles[j].obj_name;
                                _devices.data[i].car_brand_id = vehicles[j].car_brand_id;
                                _devices.data[i].car_brand = vehicles[j].car_brand;
                                _devices.data[i].cust_name = vehicles[j].cust_name;
                                break;
                            }
                        }
                    }
                    res.send(_devices);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.searchSellerDeviceList = function(req, res){
    var access_token = req.query.access_token;
    db.ifAuthCodeValid(access_token, function (valid) {
        if (valid) {
            var parent_cust_id = req.query.parent_cust_id;
            var serial = req.query.serial;
            var max_id = req.query.max_id;
            if (typeof max_id == "undefined") {
                max_id = 0;
            } else {
                max_id = parseInt(max_id);
            }
            var fields = req.query.fields;
            var arr = fields.split(",");
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                json[arr[i]] = 1;
            }
            db.searchSellerDeviceList(parent_cust_id, max_id, serial, json, function (devices) {
                var _devices = {
                    total: 0,
                    data: []
                };
                var device_ids = [];
                _devices.total = devices.total;
                for(var i = 0; i < devices.data.length; i++){
                    device_ids.push(devices.data[i].device_id);
                    _devices.data.push(devices.data[i].toJSON());
                }
                db.getVehicleListByDevices(device_ids, function (vehicles) {
                    for (var i = 0; i < _devices.data.length; i++) {
                        _devices.data[i].obj_name = "";
                        _devices.data[i].obj_id = "";
                        _devices.data[i].car_brand_id = 0;
                        _devices.data[i].car_brand = "";
                        _devices.data[i].cust_name = "";
                        for (var j = 0; j < vehicles.length; j++) {
                            if (_devices.data[i].device_id == vehicles[j].device_id) {
                                _devices.data[i].obj_id = vehicles[j].obj_id;
                                _devices.data[i].obj_name = vehicles[j].obj_name;
                                _devices.data[i].car_brand_id = vehicles[j].car_brand_id;
                                _devices.data[i].car_brand = vehicles[j].car_brand;
                                _devices.data[i].cust_name = vehicles[j].cust_name;
                                break;
                            }
                        }
                    }
                    res.send(_devices);
                });
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.deviceList = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var cust_id = req.params.cust_id;
            db.getCustomerDeviceList(cust_id, function (devices) {
                res.send(devices);
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            db.getCustomer(cust_id, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.search = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var account = req.query.account;
            db.searchCustomer(account, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.counter = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            db.getCustomerCounter(cust_id, function(customer){
                res.send(customer);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.notification = function(req, res){
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
            var msg_type = req.query.msg_type;
            if(typeof  msg_type == "undefined"){
                msg_type = -1;
            }

            db.getCustomerNotification(cust_id, min_id, max_id, msg_type, function (docs) {
                res.send(docs);
                // 将未读通知数更新为0
                db.clearRelationCount(cust_id, 4, function(err){

                });
            });

            // 获取提醒消息时，将未读消息数更新为0
            db.updateCustomerNotiReaded(cust_id, 0, function(row){
                if(row > 0){
                    console.log("update customer noti unread to 0!");
                }
            });


        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.updateInspectDate = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var annual_inspect_date = new Date(req.body.annual_inspect_date);
            var change_date = new Date(req.body.change_date);

            db.updateCustomerInspectDate(cust_id, annual_inspect_date, change_date, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.updatePush = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, contacts, address, tel,
            var cust_id = req.params.cust_id;
            var if_vio_noti = req.body.if_vio_noti;
            var if_fault_noti = req.body.if_fault_noti;
            var if_alert_noti = req.body.if_alert_noti;
            var if_event_noti = req.body.if_event_noti;

            db.updateCustomerPush(cust_id, if_vio_noti, if_fault_noti, if_alert_noti, if_event_noti, function (row) {
                if (row == 0) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            })
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
            var cust_id = req.params.cust_id;
            db.deleteCustomer(cust_id, function (err) {
                if (err) {
                    result = {
                        "status_code":define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code":define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.getIP = function(req, res){
    result = {
        "ip": req.ip  //0 成功 >0 失败
    };
    res.send(result);
};

exports.restart = function(req, res){
    process.exit(0);
};

// 服务器汇总信息
exports.total = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            var total = {
                customer_total: 1,
                vehicle_total: 3,
                unread_message: 4,
                alert_total: 3,
                fault_total: 5,
                overdue_total: 1
            };
            res.send(total);
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 判断用户是否存在
// 参数:
// 返回:
//      exist: 是否存在 true: 是 false: 否
exports.exists = function(req, res){
    var query_fields = "cust_name,email,mobile,open_id";
    var json = util.getQueryJson(req.query, query_fields);
    var query = json.query;
    db.get(db.table_name_def.TAB_CUSTOMER, query, "cust_id", function (customer) {
        var result = {
            "exist": false
        };
        if(customer){
            result.exist = true;
        }
        res.send(result);
    });
};

// 增加微豆并返回总微豆
exports.updateWiDou = function(open_id, add_wi_dou, callback){
    var query_json = {login_id: open_id};
    var update_json = {"$inc": {'wi_dou': add_wi_dou}};
    db.findAndUpdate2(db.table_name_def.TAB_CUSTOMER, query_json, update_json, function(status, doc){
        if(status == define.DB_STATUS_OK){
            callback(status, doc.wi_dou);
        }else{
            callback(status, 0);
        }
    });
};



