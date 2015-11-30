/**
 * Module dependencies.
 * Woaiwoche Open API
 */
var cl = require('cluster');
var numCPUs = require('os').cpus().length;
var express = require('express')
    , customer = require('./routes/customer')
    , vehicle = require('./routes/vehicle')
    , device = require('./routes/device')
    , business = require('./routes/business')
    , dict = require('./routes/dict')
    , file = require('./routes/file')
    , comm = require('./routes/comm')
    , http = require('http')
    , path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.compress());
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use('/public', express.staticCache());
app.use('/public', express.static(__dirname + '/public', { maxAge:900000 }));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler());
});

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
//    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 获取车辆品牌列表
//http://localhost:8000/base/car_brand
// 参数：空
// 返回：
//      name: 品牌名称
//      url_icon: 品牌Logo文件名
app.get('/base/car_brands/list', dict.brandList);

// 获取车型列表
//http://localhost:8000/base/car_series?pid=9
// 参数：
//      pid: 车牌品牌对应的id
// 返回：
//      show_name: 车型名称
app.get('/base/car_series/list', dict.seriesList);

// 获取车款列表
//http://localhost:8000/base/car_series?pid=9
// 参数：
//      pid: 车型对应的id
// 返回：
//      refer_price: 参考价格
//      go_name: 年份
//      name: 车款名称
app.get('/base/car_types/list', dict.typeList);

// 获取全局令牌
// 参数：
//      account: 账号
//      password: 密码
//      app_key: app_key
//
// 返回：
//      access_token: 全局令牌
//      valid_time: 有效时间
app.get('/customer/token', customer.token);

// 登陆接口
// 参数：
//      account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：
//      cust_id: 用户id
//      cust_name: 用户名称
//      access_token: 全局令牌
//      valid_time: 有效时间
app.get('/customer/login', customer.login);

// 注册接口
// 参数:
//    mobile: 手机(手机或者邮箱选其一)
//    email: 邮箱(手机或者邮箱选其一)
//    password: 加密密码(md5加密)
// 返回：
//    cust_id: 用户id
app.get('/customer/register', customer.register);

// 重置密码
// 参数：
//      account: 手机号码或者邮箱地址
//      passsword: md5(新登陆密码)
// 返回：
//      status_code: 调用状态
app.get('/customer/password/reset', customer.resetPassword);

// 创建用户信息接口
// 参数:
//    mode: 创建模式 1:仅仅创建用户 2:同时创建用户,车辆,到店记录
//    parent_cust_id: 商户ID, 如果没有默认为0
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
//    if_enter: 是否到店, 1则需要传入到店类型和备注, 0则不需要
//    business_type: 业务类型
//    business_content: 业务内容
// 返回：
//    status_code: 状态码
//    cust_id: 用户ID
//    obj_id: 车辆ID
//    business_id: 业务ID
app.get('/customer/create', customer.new);

// 修改用户信息接口
// 参数:
//    cust_id: 用户ID
//    customer表里面的除了cust_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/customer/update', customer.update);

// 判断用户是否存在
// 参数:
//    customer表里面的除了cust_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/customer/exists', customer.exists);

// 获取用户信息
// 参数:
//    cust_id: 用户ID
//    fields: 需要返回的字段
// 返回：
//    返回fields指定的字段
app.get('/customer', customer.get);

// 验证用户输入的校验码
// 参数:
//    valid_type: 1: 通过手机号  2:通过邮箱
//    valid_code: 收到的验证码
//    mobile: 手机
//    email: 邮箱
// 返回:
//    valid: true 有效 false 无效
app.get('/customer/valid_code', comm.validCode);

// 发送模板短信
// 参数:
//    mobile: 手机号码
//    type: 发送短信类型
//      1: 普通校验码信息
//      2: 忘记密码校验信息
// 返回：
//    status_code: 状态码
app.get('/comm/sms/send', comm.sendSMS);

// 发送模板邮件
// 参数:
//    email: 手机号码
//    type: 发送邮件类型
//      1: 普通校验码信息
//      2: 忘记密码校验信息
// 返回：
//    status_code: 状态码
app.get('/comm/mail/send', comm.sendEmail);

// 修改车辆信息接口
// 参数:
//    vehicle表里面的除了obj_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/vehicle/update', vehicle.update);

// 获取商户的用户车辆列表
// 参数:
//    vehicle表里面的除了obj_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/seller/customer/vehicles/list', customer.customerVehicleList);

// 搜索商户的用户车辆列表
// 参数:
//    parent_cust_id: 商户ID;
//    obj_name: 搜索的车牌号
//    max_id: 本页最大ID, 获取下页内容时使用
//    fields: 返回字段;
// 返回：
//    按fields返回数据列表
app.get('/seller/customer/vehicles/search', customer.searchCustomerVehicle);

// 修改车辆信息接口
// 参数:
//    vehicle表里面的除了obj_id, create_time, update_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/device/update', device.update);

// 获取商户的设备列表
// 参数:
//    parent_cust_id: 商户ID;
//    max_id: 本页最大ID, 获取下页内容时使用
//    fields: 返回字段;
// 返回：
//    按fields返回数据列表
app.get('/seller/devices/list', customer.sellerDeviceList);

// 搜索商户的设备列表
// 参数:
//    parent_cust_id: 商户ID;
//    serial: 搜索的序列号
//    max_id: 本页最大ID, 获取下页内容时使用
//    fields: 返回字段;
// 返回：
//    按fields返回数据列表
app.get('/seller/devices/search', customer.searchSellerDeviceList);

// 创建业务信息接口
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
app.get('/business/create', business.new);

// 修改业务信息接口
// 参数:
//    business表里面的除了business_id, arrive_time之外的所有字段
// 返回：
//    status_code: 状态码
app.get('/business/update', business.update);

// 获取业务列表接口
// 参数:
//    parent_cust_id: 商户ID;
//    status: 状态 1:在店 2:离店;
//    query_type: 离店查询方式;
//    begin_time: 开始时间;
//    end_time: 结束时间;
//    max_id: 本页最大ID, 获取下页内容时使用
//    fields: 返回字段;
// 返回：
//    按fields返回数据列表
app.get('/business/list', business.list);

// 获取业务列表接口
// 参数:
//    parent_cust_id: 商户ID;
//    begin_time: 开始时间;
//    end_time: 结束时间;
// 返回：
//    arrive_total: 到店总数
//    leave_total: 离店总数
//    evaluate_total: 评价总数
app.get('/business/total', business.total);

// 创建http服务器
if(process.env.NODE_ENV == "development"){
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
}else{
    if (cl.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cl.fork();
        }
        // As workers come up.
        cl.on('listening', function(worker, address) {
            console.log("A worker with #"+worker.id+" is now connected to " +
                address.address + ":" + address.port);
        });

        cl.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            cl.fork();
        });
    } else {
        // Workers can share any TCP connection
        // In this case its a HTTP server
        http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
    }
}
