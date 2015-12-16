/**
 * Created by 1 on 15/8/6.
 */
var _ = require('lodash')
    , root = __dirname;

var baseConfig = {
    env: process.env.NODE_ENV,
    root: root
};

console.log(baseConfig);

var envConfig = {
    development: {
        server: {
            port: 9966
        },
        mongo: {
            url: 'mongodb://182.254.214.210:20099/baba_test, mongodb://182.254.215.229:20099/baba_test, mongodb://182.254.215.35:20099/baba_test'
        },
        api: {
            url: "http://localhost:3000"
        },
        router: {
            url: "http://localhost:8088",
            map: {
                'wicare.base.car_brands.list': '/base/car_brands/list',
                'wicare.base.car_series.list': '/base/car_series/list',
                'wicare.base.car_types.list': '/base/car_types/list',
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.sso_login': '/customer/sso_login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.get': '/customer',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicles.list': '/vehicles/list',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.devices.list': '/devices/list',
                'wicare.device.update': '/device/update',
                'wicare.file.upload': '/file/upload',
                'wicare.pay.weixin': '/pay/weixin',
                'wicare.exceptions.list': '/exceptions/list',
                'wicare.exception.create': '/exception/create', // 异常车况创建接口
                'wicare.exception.update': '/exception/update', // 异常车况更新接口
                'wicare.exception.delete': '/exception/delete', // 异常车况删除接口
                'wicare.exception_options.list': '/exception_option/list',
                'wicare.exception_option.create': '/exception_option/create', // 异常车况提醒设置创建接口
                'wicare.exception_option.update': '/exception_option/update', // 异常车况提醒设置更新接口
                'wicare.exception_option.delete': '/exception_option/delete', // 异常车况提醒设置删除接口
                'wicare.chat.create': '/chat/create',  //创建聊天记录
                'wicare.chat.update': '/chat/update',  //更新聊天记录
                'wicare.chats.list': '/chat/list',     //获取聊天记录
                'wicare.relations.list': '/relation/list', //获取所有聊天
                'wicare.day_trips.list': '/day_trip/list', //日行程统计列表
                'wicare.device_obd_datas.list': '/device_obd_data/list'  //OBD标准数据列表
            }
        },
        pay: {
            call_back_url: "http://o.bibibaba.cn/pay/callback",
            notify_url: "http://o.bibibaba.cn/pay/notify"
        },
        authorize: {
            '/base/car_brands/list': false,
            '/base/car_series/list': false,
            '/base/car_types/list': false,
            '/customer/token': false,
            '/customer/login': false,
            '/customer/sso_login': false,
            '/customer/register': false,
            '/customer/create': true,
            '/customer/update': true,
            '/customer': true,
            '/customer/exists': false,
            '/customer/valid_code': false,
            '/customer/password/reset': false,
            '/vehicles/list': true,
            '/vehicle/update': true,
            '/comm/sms/send': false,
            '/business/total': true,
            '/business/list': true,
            '/business/create': true,
            '/business/update': true,
            '/devices/list': true,
            '/device/update': true,
            '/file/upload': false,
            '/pay/weixin': false,
            '/exceptions/list': true,
            '/exception/create': true, // 异常车况创建接口
            '/exception/update': true, // 异常车况更新接口
            '/exception/delete': true, // 异常车况删除接口
            '/exception_option/list': true,
            '/exception_option/create': true, // 异常车况提醒设置创建接口
            '/exception_option/update': true, // 异常车况提醒设置更新接口
            '/exception_option/delete': true, // 异常车况提醒设置删除接口
            '/chat/create': true,
            '/chat/update': true,
            '/chat/list': true,
            '/relation/list': true,
            '/day_trip/list': true,
            '/device_obd_data/list': true
        }
    },
    production: {
        server: {
            port: 9966
        },
        mongo: {
            url: 'mongodb://182.254.214.210:20099/baba_test, mongodb://182.254.215.229:20099/baba_test, mongodb://182.254.215.35:20099/baba_test'
        },
        api: {
            url: "http://i.bibibaba.cn"  //internal
        },
        router: {
            url: "http://o.bibibaba.cn",  //open
            map: {
                'wicare.base.car_brands.list': '/base/car_brands/list',
                'wicare.base.car_series.list': '/base/car_series/list',
                'wicare.base.car_types.list': '/base/car_types/list',
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.sso_login': '/customer/sso_login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.get': '/customer',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicles.list': '/vehicles/list',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.devices.list': '/devices/list',
                'wicare.device.update': '/device/update',
                'wicare.file.upload': '/file/upload',
                'wicare.pay.weixin': '/pay/weixin',
                'wicare.exceptions.list': '/exceptions/list',
                'wicare.exception.create': '/exception/create', // 异常车况创建接口
                'wicare.exception.update': '/exception/update', // 异常车况更新接口
                'wicare.exception.delete': '/exception/delete', // 异常车况删除接口
                'wicare.exception_options.list': '/exception_option/list',
                'wicare.exception_option.create': '/exception_option/create', // 异常车况提醒设置创建接口
                'wicare.exception_option.update': '/exception_option/update', // 异常车况提醒设置更新接口
                'wicare.exception_option.delete': '/exception_option/delete', // 异常车况提醒设置删除接口
                'wicare.chat.create': '/chat/create',  //创建聊天记录
                'wicare.chat.update': '/chat/update',  //更新聊天记录
                'wicare.chats.list': '/chat/list',     //获取聊天记录
                'wicare.relations.list': '/relation/list', //获取所有聊天
                'wicare.day_trips.list': '/day_trip/list', //日行程统计列表
                'wicare.device_obd_datas.list': '/device_obd_data/list'  //OBD标准数据列表
            }
        },
        pay: {
            call_back_url: "http://o.bibibaba.cn/pay/callback",
            notify_url: "http://o.bibibaba.cn/pay/notify"
        },
        authorize: {
            '/base/car_brands/list': false,
            '/base/car_series/list': false,
            '/base/car_types/list': false,
            '/customer/token': false,
            '/customer/login': false,
            '/customer/sso_login': false,
            '/customer/register': false,
            '/customer/create': true,
            '/customer/update': true,
            '/customer': true,
            '/customer/exists': false,
            '/customer/valid_code': false,
            '/customer/password/reset': false,
            '/vehicles/list': true,
            '/vehicle/update': true,
            '/comm/sms/send': false,
            '/business/total': true,
            '/business/list': true,
            '/business/create': true,
            '/business/update': true,
            '/devices/list': true,
            '/device/update': true,
            '/file/upload': false,
            '/pay/weixin': false,
            '/exceptions/list': true,
            '/exception/create': true, // 异常车况创建接口
            '/exception/update': true, // 异常车况更新接口
            '/exception/delete': true, // 异常车况删除接口
            '/exception_option/list': true,   // 异常车况提醒设置获取列表接口
            '/exception_option/create': true, // 异常车况提醒设置创建接口
            '/exception_option/update': true, // 异常车况提醒设置更新接口
            '/exception_option/delete': true, // 异常车况提醒设置删除接口
            '/chat/create': true,
            '/chat/update': true,
            '/chat/list': true,
            '/relation/list': true,
            '/day_trip/list': true,
            '/device_obd_data/list': true
        }
    }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);