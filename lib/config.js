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
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.get': '/customer',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.user.customers.vehicles.list': '/seller/customer/vehicles/list',
                'wicare.user.customers.vehicles.search': '/seller/customer/vehicles/search',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.user.devices.list': '/seller/devices/list',
                'wicare.user.devices.search': '/seller/devices/search',
                'wicare.device.update': '/device/update',
                'wicare.file.upload': '/file/upload'
            }
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
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.get': '/customer',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.user.customers.vehicles.list': '/seller/customer/vehicles/list',
                'wicare.user.customers.vehicles.search': '/seller/customer/vehicles/search',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.user.devices.list': '/seller/devices/list',
                'wicare.user.devices.search': '/seller/devices/search',
                'wicare.device.update': '/device/update',
                'wicare.file.upload': '/file/upload'
            }
        }
    }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);