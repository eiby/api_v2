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
                'wicare.exception.delete': '/exception/delete'  // 异常车况删除接口
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
            '/customer/valid_code': false,
            '/customer/password/reset': false,
            '/vehicles/list': true,
            '/vehicle/update': true,
            '/comm/sms/send': true,
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
            '/exception/delete': true  // 异常车况删除接口
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
                'wicare.exception.delete': '/exception/delete'  // 异常车况删除接口
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
                '/customer/valid_code': false,
                '/customer/password/reset': false,
                '/vehicles/list': true,
                '/vehicle/update': true,
                '/comm/sms/send': true,
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
                '/exception/delete': true  // 异常车况删除接口
            }
        },
        pay: {
            call_back_url: "http://o.bibibaba.cn/pay/callback",
            notify_url: "http://o.bibibaba.cn/pay/notify"
        }
    }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);