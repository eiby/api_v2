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
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.get': '/customer',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update'
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
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.get': '/customer',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update'
            }
        }
    }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);