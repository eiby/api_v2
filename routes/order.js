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
var define = require("../lib/define.js");
var sms = require("../lib/sms.js");
var cust = require("./customer.js");

// 新增订单
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, order_type, product_name, remark, unit_price, quantity, total_price,
            var cust_id = req.body.cust_id;
            var order_type = req.body.order_type;
            var product_name = decodeURIComponent(req.body.product_name);
            var remark = decodeURIComponent(req.body.remark);
            var unit_price = req.body.unit_price;
            var quantity = req.body.quantity;
            var total_price = req.body.total_price;
            db.addOrder(cust_id, order_type, product_name, remark, unit_price, quantity, total_price, function(err, order_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "order_id": order_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 订单列表
exports.list = function(req, res){
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
            db.getOrderList(cust_id, min_id, max_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 支付以后，发货以后需更新订单状态
exports.updateStatus = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //order_id, status
            var order_id = req.params.order_id;
            var status = parseInt(req.body.status);
            db.updateOrderStatus(order_id, status, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 支付完成以后需更新订单号及支付状态
exports.updatePay = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //order_id, alipay_order_no,
            var order_id = req.params.order_id;
            var alipay_order_no = req.body.alipay_order_no;
            db.updateOrderAlipay(order_id, alipay_order_no, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 发货以后需更新快递公司及快递单号
exports.updateExpress= function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //order_id, tracking_number,
            var order_id = req.params.order_id;
            var tracking_number = req.body.tracking_number;
            db.updateOrderExpress(order_id, tracking_number, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    };
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};