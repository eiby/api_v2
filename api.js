/**
 * Module dependencies.
 * Woaiwoche Open API
 */
var cl = require('cluster');
var numCPUs = require('os').cpus().length;
var express = require('express')
    , customer = require('./routes/customer')
    , vehicle = require('./routes/vehicle')
    , business = require('./routes/business')
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

// 获取全局令牌
// 参数：account: 账号
//      password: 密码
//      app_key: app_key
//
// 返回：access_token: 全局令牌
//      valid_time: 有效时间
app.get('/customer/token', customer.token);

// 登陆接口
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：auth_code: api调用验证码
//      cust_id: 用户id
app.get('/customer/login', customer.login);

// 注册接口
// 参数:
//    mobile: 手机(手机或者邮箱选其一)
//    email: 邮箱(手机或者邮箱选其一)
//    password: 加密密码(md5加密)
// 返回：
//    cust_id: 用户id
app.get('/customer/register', customer.register);

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
