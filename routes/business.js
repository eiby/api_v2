/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-20
 * Time: 下午5:50
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var http = require("http");

// 创建新的业务
exports.new = function (req, res) {
    //    cust_id: 车主用户ID
    //    cust_name: 车主名称
    //    obj_id: 车辆ID
    //    obj_name: 车牌号
    //    mileage: 行驶里程
    //    business_type: 业务类型
    //    business_content: 业务内容
    //var cust_name = req.query.cust_name;
    //var obj_name = req.query.obj_name;
    //var mileage = parseInt(req.query.mileage);
    //var business_type = parseInt(req.query.business_type);
    //var business_content = req.query.business_content;
    var create_json = util.getCreateJson(req.query, "seller_id,cust_id,cust_name,obj_id,obj_name,mileage,business_type,business_content");
    create_json.status = 1;
    create_json.arrive_time = new Date();
    //db.addBusiness(cust_id, cust_name, obj_id, obj_name, mileage, business_type, business_content, function (err, busi_id) {
    db.create(db.table_name_def.TAB_BUSINESS, create_json, false, null, null, false, null, null, function (status, busi_id) {
        if (status == define.DB_STATUS_FAIL) {
            result = {
                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            };
            res.send(result);
        } else {
            result = {
                "status_code": define.API_STATUS_OK, //0 成功 >0 失
                "business_id": busi_id
            };
            res.send(result);

            // 更新车辆的到店次数及最后到店时间
            var obj_id = req.query.obj_id;
            var query_json = {
                obj_id: obj_id
            };
            var last_arrive = new Date();
            var update_json = {
                "$set": {"business_status": 1, "last_arrive_time": last_arrive},
                "$inc": {"arrive_count": 1}
            };
            db.update2(db.table_name_def.TAB_VEHICLE, query_json, update_json, function (status) {
                if (status == define.DB_STATUS_FAIL) {
                    console.log("update vehicle business status failed.");
                }
            });

            // 向用户发送业务通知
            var seller_id = req.query.seller_id;
            var cust_id = req.query.cust_id;
            var obj_name = req.query.obj_name;
            var business_content = req.query.business_content;
            db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: seller_id}, "login_id,cust_name,sex,logo", function(seller) {
                db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: cust_id}, "login_id,cust_name,sex,logo", function (friend) {
                    if (friend) {
                        var link = "http://h5.bibibaba.cn/baba/wx/src/baba/repair_list.html";
                        var msg = "您的爱车[" + obj_name + "]已进店, 等待开始作业, 后续将会发送微信通知, 请耐心等候.";
                        util.sendWeixinNewMsg(seller.cust_name, msg, friend.login_id, link, function (ret) {

                        });
                    }
                });
            });
        }
    });
};

// 修改业务信息
// 修改的字段由用户自行传入, 修改什么字段就传入什么字段
exports.update = function(req, res){
    //var business_id = req.query.business_id;
    //var json = util.getUpdateJson(req.query, "business_id");
    //business_type: Number,      //业务类型 1:保养 2:维修 3:美容 4:救援
    //    business_content: String,   //业务内容
    //    status: Number,             //业务状态 1:在店 2:完工离店 3:直接离店
    //    arrive_time: Date,          //到店时间
    //    leave_time: Date,           //离店时间
    //    evaluate_level: Number,     //评价等级 1 - 5
    //    env_level: Number,          //环境等级 1 - 5
    //    price_level: Number,        //价格等级 1 - 5
    //    service_level: Number,      //服务等级 1 - 5
    //    evaluate_content: String,   //评价内容
    //    evaluate_time: Date,        //评价时间
    var update_fields = "business_type,business_content,status,arrive_time,leave_time,evaluate_level,env_level,price_level,service_level,evaluate_content,evaluate_time,job_start_time,job_end_time,job_cust_id";
    var json = util.getQueryAndUpdateJson(req.query, "business_id", update_fields);
    var query = json.query;
    var update = json.update;

    //db.updateBusiness(business_id, json, function (row) {
    if(json.has_query) {
        db.update(db.table_name_def.TAB_BUSINESS, query, update, function (status) {
            // 如果传入状态为离店, 则判断是直接离店, 还是完工离店
            var sta = parseInt(req.query.status);
            var mileage = parseInt(req.query.mileage);
            var obj_id = req.query.obj_id;
            var evaluate_level = req.query.evaluate_level;
            var evaluate_content = req.query.evaluate_content;
            var evaluate_time = req.query.evaluate_time;
            if(evaluate_level != undefined){ //评价
                // 向商户发送评价通知
                var business_id = parseInt(req.query._business_id);
                db.get(db.table_name_def.TAB_BUSINESS, {business_id: business_id}, "cust_id,seller_id,obj_id,obj_name,business_content", function(business) {
                    if(business){
                        db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: business.seller_id}, "login_id,cust_name,sex,logo", function(seller) {
                            db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: business.cust_id}, "login_id,cust_name,sex,logo", function (friend) {
                                if (friend) {
                                    var link = "http://h5.bibibaba.cn/baba/wx/src/customer_leave.html";
                                    var msg = "车主对车辆[" + business.obj_name + "]在本店已完成的作业[" + business.business_content + "]进行了评价[星级:" + evaluate_level +", 内容:" + evaluate_content + "].";
                                    util.sendWeixinNewMsg(friend.cust_name, msg, seller.login_id, link, function (ret) {

                                    });
                                }
                            });
                        });

                        // 更新车辆的评价次数
                        var query_json = {
                            obj_id: business.obj_id
                        };
                        var update_json = {
                            "$inc": {"evaluate_count": 1}
                        };
                        db.update2(db.table_name_def.TAB_VEHICLE, query_json, update_json, function (status) {
                            if (status == define.DB_STATUS_FAIL) {
                                console.log("update vehicle evaluate_count failed.");
                            }
                        });
                    }
                });
            }
            if (sta >= 2) {
                var business_id = parseInt(req.query._business_id);
                db.get(db.table_name_def.TAB_BUSINESS, {business_id: business_id}, "cust_id,seller_id,obj_name,business_type,business_content", function (business) {
                    if (business) {
                        var query_json = {"obj_id": obj_id};
                        var update_json = {};
                        if (sta == 2 && business.business_type == 1) {
                            update_json = {"maintain_last_mileage": mileage};
                            db.update(db.table_name_def.TAB_VEHICLE, query_json, update_json, function (status) {
                            });
                        } else if (sta == 3) {
                            update_json = {"business_status": 2};
                            db.update(db.table_name_def.TAB_VEHICLE, query_json, update_json, function (status) {
                            });
                        }

                        // 向用户发送业务通知
                        db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: business.seller_id}, "login_id,cust_name,sex,logo", function (seller) {
                            db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: business.cust_id}, "login_id,cust_name,sex,logo", function (friend) {
                                if (friend) {
                                    var link = "http://h5.bibibaba.cn/baba/wx/src/baba/repair_list.html";
                                    var msg = "";
                                    if(sta == 4){ //开工
                                        msg = "您的爱车[" + business.obj_name + "]已开始作业[" + business.business_content + "], 请您耐心等候...";
                                    }else if(sta == 2){ //完工
                                        msg = "您的爱车[" + business.obj_name + "]已完成作业[" + business.business_content + "], 请移步店内验车结算, 谢谢您的耐心等候.";
                                    }else if(sta == 3){ //离店
                                        msg = "感谢您的光临, 请对本次作业[" + business.business_content + "]进行评价, 我们会根据您的建议不断进行完善!";
                                    }
                                    if(msg != ""){
                                        util.sendWeixinNewMsg(seller.cust_name, msg, friend.login_id, link, function (ret) {

                                        });
                                    }
                                }
                            });
                        });
                    }
                });
                if (status == define.DB_STATUS_FAIL) {
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                } else {
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            } else {
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
            }
        });
    }else{
        result = {
            "status_code": define.API_STATUS_INVALID_PARAM  //0 成功 >0 失败
        };
        res.send(result);
    }
};

// 业务离店更新
//exports.leave = function(req, res){
//    var business_id = parseInt(req.query.business_id);
//    var obj_id = parseInt(req.query.obj_id);
//    var business_type = parseInt(req.query.business_type);
//    var mileage = parseInt(req.query.mileage);
//
//    db.updateBusinessLeave(business_id, obj_id, business_type, mileage, function (row) {
//        if (row == 0) {
//            result = {
//                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
//            }
//        } else {
//            result = {
//                "status_code": define.API_STATUS_OK  //0 成功 >0 失败
//            }
//        }
//        res.send(result);
//    });
//};

// 业务列表
exports.list = function(req, res){
    //var parent_cust_id = req.query.parent_cust_id;
    //var status = parseInt(req.query.status);
    //var query_type = parseInt(req.query.query_type);
    //var begin_time = new Date(req.query.begin_time);
    //var end_time = new Date(req.query.end_time);
    //var fields = req.query.fields;
    //var arr = fields.split(",");
    //var json = {};
    //for (var i = 0; i < arr.length; i++) {
    //    json[arr[i]] = 1;
    //}
    //
    //var max_id = req.query.max_id;
    //if (typeof max_id == "undefined") {
    //    max_id = 0;
    //} else {
    //    max_id = parseInt(max_id);
    //}
    var json = util.getQueryJson(req.query, "business_id,seller_id,status,obj_id,cust_id,obj_name,arrive_time,leave_time,evaluate_time");
    var query = json.query;
    var page = req.query.page;
    var max_id = util.getID(req.query.max_id, page);
    var min_id = util.getID(req.query.min_id, page);
    var fields = req.query.fields;
    var sorts = req.query.sorts;
    var limit = parseInt(req.query.limit);
    //db.getBusinessList(parent_cust_id, status, max_id, query_type, begin_time, end_time, json, function (docs) {
    if(json.has_query) {
        db.list(db.table_name_def.TAB_BUSINESS, query, fields, sorts, page, min_id, max_id, limit, function (docs) {
            var obj_ids = [];
            for (var i = 0; i < docs.data.length; i++) {
                obj_ids.push(docs.data[i].obj_id);
            }
            var query_json = {'obj_id': {"$in": obj_ids}};
            var fields = "obj_id,car_brand_id,car_series_id,car_type_id,car_brand,car_series,car_type";
            var sorts = "obj_id";
            //db.getVehicleListByObjIDs(obj_ids, function(vehicle){
            db.list(db.table_name_def.TAB_VEHICLE, query_json, fields, sorts, "", 0, 0, -1, function (vehicle) {
                for (var i = 0; i < docs.data.length; i++) {
                    for (var j = 0; j < vehicle.data.length; j++) {
                        if (docs.data[i].obj_id == vehicle.data[j].obj_id) {
                            docs.data[i].car_brand_id = vehicle.data[j].car_brand_id;
                            docs.data[i].car_series_id = vehicle.data[j].car_series_id;
                            docs.data[i].car_type_id = vehicle.data[j].car_type_id;
                            docs.data[i].car_brand = vehicle.data[j].car_brand;
                            docs.data[i].car_series = vehicle.data[j].car_series;
                            docs.data[i].car_type = vehicle.data[j].car_type;
                            break;
                        }
                    }
                }
                res.send(docs);
            });
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
};

exports.total = function (req, res) {
    var seller_id = req.query.seller_id;
    var begin_time = new Date(req.query.begin_time);
    var end_time = new Date(req.query.end_time);
    //db.getBusinessTotal(parent_cust_id, begin_time, end_time, function (total) {
    //    res.send(total);
    //});
    //m_business.count({"cust_id": {"$in": cust_ids}, "arrive_time": {"$gte": begin_time, "$lte": end_time}}, function (err, arrive_count) {
    //    m_business.count({"cust_id": {"$in": cust_ids}, "leave_time": {"$gte": begin_time, "$lte": end_time}}, function (err, leave_count) {
    //        m_business.count({"cust_id": {"$in": cust_ids}, "evaluate_time": {"$gte": begin_time, "$lte": end_time}}, function (err, evaluate_count) {
    //            var result = {
    //                arrive_count: arrive_count,
    //                leave_count: leave_count,
    //                evaluate_count: evaluate_count
    //            };
    //            callback(result);
    //        });
    //    });
    //});
    var arrive_query = {"seller_id": seller_id, "arrive_time": {"$gte": begin_time, "$lte": end_time}};
    var leave_query = {"seller_id": seller_id, "leave_time": {"$gte": begin_time, "$lte": end_time}};
    var evaluate_query = {"seller_id": seller_id, "evaluate_time": {"$gte": begin_time, "$lte": end_time}};

    db.count(db.table_name_def.TAB_BUSINESS, arrive_query, function(arrive_count){
        db.count(db.table_name_def.TAB_BUSINESS, leave_query, function(leave_count){
            db.count(db.table_name_def.TAB_BUSINESS, evaluate_query, function(evaluate_count){
                var result = {
                    arrive_count: arrive_count,
                    leave_count: leave_count,
                    evaluate_count: evaluate_count
                };
                res.send(result);
            });
        });
    });
};
