/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-29
 * Time: 下午3:33
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var fs = require('fs');
var define = require("../lib/define.js");
var nodeExcel = require('excel-export'); //关联excel-export模块

exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var device_id = req.query.device_id;
            var rcv_time = new Date(req.query.rcv_time);
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            db.getDataLog(device_id, rcv_time, page_count, (page_no - 1) * page_count, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.registerMonthReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var year = parseInt(req.query.year);
            var province = "";
            if(typeof req.query.province != "undefined"){
                province = req.query.province;
            }
            var city = "";
            if(typeof req.query.city != "undefined"){
                city = req.query.city;
            }
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getVehicleRegisterMonthReport(province, city, year, start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.customerRegisterMonthReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var year = parseInt(req.query.year);
            var province = "";
            if(typeof req.query.province != "undefined"){
                province = req.query.province;
            }
            var city = "";
            if(typeof req.query.city != "undefined"){
                city = req.query.city;
            }
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getCustomerRegisterMonthReport(province, city, year, start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.registerMonthReportTemp = function(req, res){
    var auth_code = 'bba2204bcd4c1f87a19ef792f1f68404';
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var year = 2013;
            var province = '新疆';
            var start_time = new Date('2013-01-01 00:00:00');
            var end_time = new Date('2013-12-31 23:59:59');
            db.getVehicleRegisterMonthReport(province, year, start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.vacMonthReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var year = parseInt(req.query.year);
            var province = req.query.province;
            var city = "";
            if(typeof req.query.city != "undefined"){
                city = req.query.city;
            }
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getVacRegisterMonthReport(province, city, year, start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.vacMonthReportTemp = function(req, res){
    var auth_code = 'bba2204bcd4c1f87a19ef792f1f68404';
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var year = 2013;
            var province = '新疆';
            var start_time = new Date('2013-01-01 00:00:00');
            var end_time = new Date('2013-12-31 23:59:59');
            db.getVacRegisterMonthReport(province, "", year, start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.exists = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var query_type = parseInt(req.query.query_type);
            var value = req.query.value;
            var old_value = req.query.old_value;
            if(old_value == value){
                res.send("true");
            }else{
                db.exists(query_type, value, function(err, count){
                    if(count == 0){
                        res.send("true");
                    }else{
                        res.send("false");
                    }
                });
            }
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.recommendCustomerReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var type = parseInt(req.query.type);
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            var page_no = req.query.page_no;
            var page_count = req.query.page_count;
            db.getRecommendCustomerReport(type, start_time, end_time, function(docs){
                var page_docs = db.getPageData(docs, page_no, page_count);
                if(type == define.SOURCE_NORMALUSER){
                    var cust_ids = [];
                    for(var i = 0; i < page_docs.data.length; i++){
                        cust_ids.push(page_docs.data[i].cust_id);
                    }
                    db.getCustomerListByCustIDs(cust_ids, function(customers){
                        if(customers){
                            for(var i = 0; i < page_docs.data.length; i++){
                                for(var j = 0; j < customers.length; j++){
                                    if(page_docs.data[i].cust_id == customers[j].cust_id){
                                        page_docs.data[i].name = customers[j].cust_name;
                                        page_docs.data[i].mobile = customers[j].contacter_tel;
                                        break;
                                    }
                                }
                            }
                        }
                        res.send(page_docs);
                    });
                }else{
                    var dealer_ids = [];
                    for(var i = 0; i < page_docs.data.length; i++){
                        dealer_ids.push(page_docs.data[i].dealer_id);
                    }
                    db.getDealerListByDealerIDs(dealer_ids, function(dealers){
                        if(dealers){
                            for(var i = 0; i < page_docs.data.length; i++){
                                for(var j = 0; j < dealers.length; j++){
                                    if(page_docs.data[i].dealer_id == dealers[j].dealer_id){
                                        page_docs.data[i].name = dealers[j].dealer_name;
                                        page_docs.data[i].mobile = dealers[j].mobile;
                                        break;
                                    }
                                }
                            }
                        }
                        res.send(page_docs);
                    });
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.recommendTypeReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getRecommendTypeReport(start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};


exports.orderSourceReport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var start_time = new Date(req.query.start_time);
            var end_time = new Date(req.query.end_time);
            db.getOrderSourceReport(start_time, end_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.obdErrExport = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            db.getObdList(function(obds){
                var rows = [];
                var row = [];
                for(var k = 0; k < obds.length; k++){
                    row = [obds[k].code, obds[k].brand, obds[k].category, obds[k].c_define, obds[k].e_define, obds[k].content];
                    rows.push(row);
                }
                var conf = {};
                conf.cols = [
                    {caption:'故障代码', type:'string'},
                    {caption:'适用车型', type:'string'},
                    {caption:'范畴', type:'string'},
                    {caption:'中文定义', type:'string'},
                    {caption:'英文定义', type:'string'},
                    {caption:'背景知识', type:'string'}
                ];
                conf.rows = rows;
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=odbs.xlsx");
                res.end(result, 'binary');
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};