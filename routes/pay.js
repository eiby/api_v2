/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-2-12
 * Time: 下午1:49
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var alipay = require("../lib/alipay.js");
var WXPay = require('weixin-pay');
var xmlreader = require("xmlreader");
var fs = require('fs');
var config = require("../lib/config.js");
var xml2js = require('xml2js');

var notifyUrl = config.pay.notify_url;

// 获取最终支付地址
exports.doPay = function (req, res) {
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function (valid) {
        if (valid) {
            var pay_req = alipay.createReq(alipay.services.create, null);
            pay_req.req_id = req.query.order_id.toString();
            pay_req.req_data = {
                subject: req.query.product_name,                 // # 商品名称
                out_trade_no: req.query.order_id.toString(),     // # 网站订单号
                total_fee: parseFloat(req.query.total_price),    // # 价钱(number)，单位元，例如 0.01 代表1分钱
                seller_account_name: alipay.alipay_account,      // # 支付宝账号
                call_back_url: alipay.call_back_url,             // # 支付成功后浏览器跳转地址
                notify_url: alipay.notify_url,                   // # 支付成功支付宝的通知将异步发送到此地址
                out_user: req.query.cust_id,                     // # 网站的用户标识
                merchant_url: alipay.merchant_url,               // # 商品展示页面， 只是实际测试时(ios)发现支付时没地方可以跳到这个页面
                pay_expire: 1440                                 // # 交易过期时间
            };
            pay_req.req_data = alipay.toReqData('direct_trade_create_req', pay_req.req_data);
            pay_req.sign = alipay.getSign(pay_req, alipay.key);
            alipay.sendCreate(pay_req, function (err, doc) {
                if (err) {
                    obj = {
                        status_code: define.API_STATUS_PAY_FAIL,  //0 成功 >0 失败
                        err_msg: "pay failed."
                    };
                    res.send(obj);
                } else {
                    var token = alipay.parseTokenFromXml(doc.res_data);
                    var pay_url = alipay.createAuthUrl(token, alipay.key);
                    obj = {
                        status_code: define.API_STATUS_OK, //0 成功 >0 失败
                        redirect: pay_url
                    };
                    res.send(obj);
                }
            });
        } else {
            util.resSendNoRight(res);
        }
    });
};

// 支付回调
exports.doCallback = function (req, res) {
    var sign = alipay.getSign(req.query, alipay.key);
    if (sign == req.query.sign) {
        //res.send("签名正确");
        //out_trade_no=2014021100000013004857&request_token=requestToken&result=success&trade_no=2014021925771857
        var out_trade_no = req.query.out_trade_no;
        var trade_no = req.query.trade_no;
        var result = req.query.result;
        db.updateOrderAlipay(out_trade_no, trade_no, 4, function (row) {
            if (row > 0) {
                res.render('callback', { status: '支付成功' });
            } else {
                res.render('callback', { status: '支付成功，状态同步中' });
            }
        });
    } else {
        res.render('callback', { status: '签名错误' });
    }
};

// 支付取消
exports.doCancel = function (req, res) {
    res.render('cancel', {});
};

// WAP支付通知
exports.doNotify = function (req, res) {
    var sign = alipay.getNotitySign(req.body, alipay.key);
    if (sign == req.body.sign) {
        //res.send("签名正确");
        //out_trade_no=2014021100000013004857&request_token=requestToken&result=success&trade_no=2014021925771857
        var notify_data = req.body.notify_data;
        xmlreader.read(notify_data, function (errors, response) {
            if (null !== errors) {
                res.send("fail");
            } else {
                var trade_status = response.notify.trade_status.text();
                var out_trade_no = response.notify.out_trade_no.text();
                var trade_no = response.notify.trade_no.text();
                if (trade_status == "TRADE_SUCCESS" || trade_status == "TRADE_FINISHED")
                    db.updateOrderAlipay(out_trade_no, trade_no, 1, function (row) {
                        if (row > 0) {
                            res.send("success");
                        } else {
                            res.send("fail");
                        }
                    });
            }
        });
    } else {
        res.send("fail");
    }
};

// APP支付通知
exports.doAppNotify = function (req, res) {
    var body = req.body;
    body.subject = decodeURIComponent(body.subject);
    body.body = decodeURIComponent(body.body);
    var valid = alipay.checkRsaSign(body);
    if (valid) {
        var trade_status = req.body.trade_status;
        var out_trade_no = req.body.out_trade_no;
        var trade_no = req.body.trade_no;
        if (trade_status == "TRADE_SUCCESS" || trade_status == "TRADE_FINISHED")
            db.updateOrderAlipay(out_trade_no, trade_no, 1, function (row) {
                if (row > 0) {
                    res.send("success");
                } else {
                    res.send("fail");
                }
            });
    } else {
        res.send("fail");
    }
};

// 支付宝公众服务接口
exports.doAlipayService = function (req, res) {
    //res.send("签名正确");
    //out_trade_no=2014021100000013004857&request_token=requestToken&result=success&trade_no=2014021925771857
    var biz_content = req.body.biz_content;
    xmlreader.read(biz_content, function (errors, response) {
        if (null !== errors) {
            res.send("fail");
        } else {
            var event_type = response.XML.EventType.text();
            if (event_type == "verifygw") {
                var sign = alipay.getRsaSign("<biz_content>MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCtl32p+xql8QO4LiQU1ekZ+MsgWBxoMyd9Hah0mschtjis7ty1DOa26iSlNN30Fs5+gCLb/IXFRRj9kPUQDy/RvZ7gUfuenRp0Ced/fB4jmTtrv5L7D/LE9Al3gQhTY/SvRmpOLIyXxzpDReWs8ZXLJxnzVemm2WjCJ7ZOVdAalwIDAQAB</biz_content><success>true</success>");
                var result = '<?xml version="1.0" encoding="GBK"?>' +
                    '<alipay>' +
                    '<response>' +
                    '<success>true</success>' +
                    '<biz_content>MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCtl32p+xql8QO4LiQU1ekZ+MsgWBxoMyd9Hah0mschtjis7ty1DOa26iSlNN30Fs5+gCLb/IXFRRj9kPUQDy/RvZ7gUfuenRp0Ced/fB4jmTtrv5L7D/LE9Al3gQhTY/SvRmpOLIyXxzpDReWs8ZXLJxnzVemm2WjCJ7ZOVdAalwIDAQAB</biz_content>' +
                    '</response>' +
                    '<sign>' + sign + '</sign>' +
                    '<sign_type>RSA</sign_type>' +
                    '</alipay>';
                res.contentType('application/xml');
                res.charset = 'GBK';
                res.send(result);
            }
        }
    });
};

// 终端支付逻辑
// 1. 首先产生订单
// 2. 获取支付参数,发回给JS
exports.doWeixinPay = function (req, res) {
    //cust_id, order_type, product_name, remark, unit_price, quantity, total_price,
    //var cust_id = parseInt(req.query.cust_id);
    var open_id = req.query.open_id;
    //var order_type = parseInt(req.query.order_type);
    //var pay_key = req.query.pay_key;
    var product_name = req.query.product_name;
    var remark = req.query.remark;
    //var unit_price = parseFloat(req.query.unit_price);
    //var quantity = parseInt(req.query.quantity);
    var total_price = parseFloat(req.query.total_price);
    var create_json = util.getCreateJson(req.query, "");

    //db.addOrder(cust_id, order_type, product_name, remark, unit_price, quantity, total_price, pay_key, 0, function (err, order_id) {
    db.getID(db.table_name_def.TAB_ORDER, function(order_id) {
        var now = new Date();
        var oid = now.getFullYear().toString() + util.pad(now.getMonth() + 1, 2) + util.pad(now.getDate(), 2) + util.pad(order_id, 8) + util.pad(Math.floor(Math.random() * 10000), 6);
        create_json.order_id = oid;
        create_json.status = 0;
        db.create2(db.table_name_def.TAB_ORDER, create_json, false, null, null, false, null, null, function (status) {
            if (status == define.DB_STATUS_OK) {
                var wxpay = WXPay({
                    appid: 'wxa5c196f7ec4b5df9',
                    mch_id: '1285609701',
                    partner_key: '9410bc1cbfa8f44ee5f8a331ba8dd3fc', //微信商户平台API密钥
                    pfx: fs.readFileSync('./apiclient_cert.p12')       //微信商户平台证书
                });

                wxpay.getBrandWCPayRequestParams({
                    openid: open_id,
                    body: product_name,
                    detail: remark,
                    out_trade_no: oid,
                    total_fee: total_price * 100,
                    spbill_create_ip: '192.168.2.210',
                    notify_url: notifyUrl
                }, function (err, param) {
                    // in express
                    var result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "pay_args": param,
                        "order_id": oid
                    };
                    res.send(result);
                });
            } else {
                var result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR,  //0 成功 >0 失败
                    "err_msg": "add order failed."
                };
                res.send(result);
            }
        });
    });
};

var buildXML = function(json){
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};

// 企业微信支付逻辑
// 1. 首先产生订单
// 2. 调用微信企业支付
exports.doWeixinPay2User = function (req, res) {
    //cust_id, order_type, product_name, remark, unit_price, quantity, total_price,
    //var cust_id = parseInt(req.query.cust_id);
    var open_id = req.query.open_id;
    //var order_type = parseInt(req.query.order_type);
    //var pay_key = req.query.pay_key;
    var product_name = req.query.product_name;
    var remark = req.query.remark;
    //var unit_price = parseFloat(req.query.unit_price);
    //var quantity = parseInt(req.query.quantity);
    var total_price = parseFloat(req.query.total_price);
    var create_json = util.getCreateJson(req.query, "");

    //db.addOrder(cust_id, order_type, product_name, remark, unit_price, quantity, total_price, pay_key, 0, function (err, order_id) {
    db.getID(db.table_name_def.TAB_ORDER, function(order_id) {
        var now = new Date();
        var oid = now.getFullYear().toString() + util.pad(now.getMonth() + 1, 2) + util.pad(now.getDate(), 2) + util.pad(order_id, 8) + util.pad(Math.floor(Math.random() * 10000), 6);
        create_json.order_id = oid;
        create_json.status = 0;
        db.create2(db.table_name_def.TAB_ORDER, create_json, false, null, null, false, null, null, function (status) {
            if (status == define.DB_STATUS_OK) {
                var wxpay = WXPay({
                    appid: 'wxa5c196f7ec4b5df9',
                    mch_id: '1285609701',
                    partner_key: '9410bc1cbfa8f44ee5f8a331ba8dd3fc', //微信商户平台API密钥
                    pfx: fs.readFileSync('./apiclient_cert.p12')       //微信商户平台证书
                });

                wxpay.mmPayMktTransfers({
                    openid: open_id,
                    desc: product_name,
                    partner_trade_no: oid,
                    amount: total_price,
                    check_name: 'NO_CHECK',
                    spbill_create_ip: '192.168.2.210'
                }, function (err, data) {
                    // in express
                    var result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "result_data": data
                    };
                    res.send(result);
                });
            } else {
                var result = {
                    "status_code": define.API_STATUS_DATABASE_ERROR,  //0 成功 >0 失败
                    "err_msg": "add order failed."
                };
                res.send(result);
            }
        });
    });
};

// 微信支付通知
exports.doWeixinPayNotify = function (req, res) {
    // 接收xml数据
    req.rawBody = '';
    var json = {};
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });
    req.on('end', function () {
        //json = xml2js.toJson(req.rawBody);
        var parser = new xml2js.Parser({ trim:true, explicitArray:false, explicitRoot:false });
        parser.parseString(req.rawBody, function (err, json) {
            console.log(json);
            var return_code = json.return_code;
            var out_trade_no = json.out_trade_no;
            var transaction_id = json.transaction_id;
            if (return_code == "SUCCESS"){
                // res.success() 向微信返回处理成功信息，res.fail()返回失败信息。
                var query_json = {'order_id': out_trade_no, status: define.ORDER_STATUS_WAIT};
                var update_json = {
                    "alipay_order_no": transaction_id,
                    "status": define.ORDER_STATUS_PAYED
                };
                //db.updateOrder(out_trade_no, transaction_id, 1, function (row) {
                db.findAndUpdate(db.table_name_def.TAB_ORDER, query_json, update_json, function(status, order){
                    res.success = function () {
                        res.end(buildXML({xml: {return_code: 'SUCCESS'}}));
                    };
                    res.fail = function () {
                        res.end(buildXML({xml: {return_code: 'FAIL'}}));
                    };
                    if (order) {
                        var active_time = new Date();
                        query_json = {"serial": order.pay_key};
                        update_json = {"status": 3, "active_time": active_time};
                        // 更新终端状态
                        db.update(db.table_name_def.TAB_DEVICE, query_json, update_json, function(status){
                            if(status == define.DB_STATUS_OK){
                                res.success();
                            }else{
                                res.fail();
                            }
                        });
                    } else {
                        res.fail();
                    }
                });
            }
        });
    });
};