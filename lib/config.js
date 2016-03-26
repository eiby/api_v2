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
            url: 'mongodb://182.254.214.210:20099/baba, mongodb://182.254.215.229:20099/baba, mongodb://182.254.215.35:20099/baba'
        },
        api: {
            url: "http://localhost:3000"
        },
        router: {
            url: "http://localhost:8088",
            map: {
                'wicare.util.pic_valid_code.get': '/util/pic_valid_code/get',
                'wicare.dict.get': '/dict/get',
                'wicare.base.car_brands.list': '/base/car_brands/list',
                'wicare.base.car_series.list': '/base/car_series/list',
                'wicare.base.car_types.list': '/base/car_types/list',
                'wicare.base.aqi.get': '/base/aqi/get',
                'wicare.product.create': '/product/create',
                'wicare.products.list': '/product/list',
                'wicare.product.get': '/product/get',
                'wicare.lottery_logs.list': '/lottery_log/list',
                'wicare.lottery.draw': '/lottery/draw',
                'wicare.lottery.receive': '/lottery/receive',
                'wicare.locations.list': '/location/list',
                'wicare.users.list': '/customer/list',
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.bind': '/customer/bind',
                'wicare.user.sso_login': '/customer/sso_login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.get': '/customer',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.get': '/vehicle/get',
                'wicare.vehicle.create': '/vehicle/create',
                'wicare.vehicle.delete': '/vehicle/delete',
                'wicare.vehicles.list': '/vehicles/list',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.device.get': '/device/get',
                'wicare.devices.list': '/devices/list',
                'wicare.device.update': '/device/update',
                'wicare.game.get': '/game/get',
                'wicare.game.create': '/game/create',
                'wicare.file.upload': '/file/upload',
                'wicare.pay.weixin': '/pay/weixin',
                //'wicare.pay.weixin2user': '/pay/weixin2user',
                'wicare.exceptions.list': '/exceptions/list',
                'wicare.exception.create': '/exception/create', // 异常车况创建接口
                'wicare.exception.update': '/exception/update', // 异常车况更新接口
                'wicare.exception.delete': '/exception/delete', // 异常车况删除接口
                'wicare.exception_options.list': '/exception_option/list',
                'wicare.exception_option.create': '/exception_option/create', // 异常车况提醒设置创建接口
                'wicare.exception_option.update': '/exception_option/update', // 异常车况提醒设置更新接口
                'wicare.exception_option.delete': '/exception_option/delete', // 异常车况提醒设置删除接口
                'wicare.orders.list': '/order/list',    // 订单列表接口
                'wicare.order.get': '/order/get',       // 订单查询接口
                'wicare.order.create': '/order/create', // 订单创建接口
                'wicare.order.update': '/order/update', // 订单更新接口
                'wicare.order.delete': '/order/delete', // 订单删除接口
                'wicare.chat.create': '/chat/create',  //创建聊天记录
                'wicare.chat.update': '/chat/update',  //更新聊天记录
                'wicare.chats.list': '/chat/list',     //获取聊天记录
                'wicare.relations.list': '/relation/list', //获取所有聊天
                'wicare.day_trips.list': '/day_trip/list', //日行程统计列表
                'wicare.day_trip.inc': '/day_trip/inc', //日行驶统计更新
                'wicare.device_obd_datas.list': '/device_obd_data/list',  //OBD标准数据列表
                'wicare.crash.create': '/crash/create', //缺陷崩溃
                'wicare.crashes.list': '/crash/list',    //获取缺陷记录
                'wicare.gps_datas.list': '/gps_data/list',  //获取设备历史定位记录
                'wicare.air_datas.list': '/air_data/list',  //获取设备历史空气记录
                'wicare.command.create': '/command/create', //向设备发送指令
                'wicare.weixin_friend.update': '/weixin_friend/update' //添加微信好友关系记录
            }
        },
        pay: {
            call_back_url: "http://o.bibibaba.cn/pay/callback",
            notify_url: "http://o.bibibaba.cn/pay/notify"
        },
        authorize: {
            '/util/pic_valid_code/get': false,
            '/dict/get': false,
            '/base/car_brands/list': false,
            '/base/car_series/list': false,
            '/base/car_types/list': false,
            '/base/aqi/get': false,
            '/product/create': false,
            '/product/list': false,
            '/product/get': false,
            '/lottery_log/list': false,
            '/lottery/draw': false,
            '/lottery/receive': false,
            '/location/list': false,
            '/customer/list': false,
            '/customer/token': false,
            '/customer/login': false,
            '/customer/bind': false,
            '/customer/sso_login': false,
            '/customer/register': false,
            '/customer/create': true,
            '/customer/update': true,
            '/customer': true,
            '/customer/exists': false,
            '/customer/valid_code': false,
            '/customer/password/reset': false,
            '/vehicle/get': true,
            '/vehicle/create': true,
            '/vehicle/delete': true,
            '/vehicles/list': true,
            '/vehicle/update': true,
            '/comm/sms/send': false,
            '/business/total': true,
            '/business/list': true,
            '/business/create': true,
            '/business/update': true,
            '/device/get': true,
            '/devices/list': true,
            '/device/update': true,
            '/game/get': false,
            '/game/create': false,
            '/file/upload': false,
            '/pay/weixin': false,
            '/pay/weixin2user': true,
            '/exceptions/list': true,
            '/exception/create': true, // 异常车况创建接口
            '/exception/update': true, // 异常车况更新接口
            '/exception/delete': true, // 异常车况删除接口
            '/exception_option/list': true,
            '/exception_option/create': true, // 异常车况提醒设置创建接口
            '/exception_option/update': true, // 异常车况提醒设置更新接口
            '/exception_option/delete': true, // 异常车况提醒设置删除接口
            '/order/list': true,              // 订单列表接口
            '/order/get': true,               // 订单查询接口
            '/order/create': true,            // 订单创建接口
            '/order/update': true,            // 订单更新接口
            '/order/delete': true,            // 订单删除接口
            '/chat/create': true,
            '/chat/update': true,
            '/chat/list': true,
            '/relation/list': true,
            '/day_trip/list': false,
            '/day_trip/inc': false,
            '/device_obd_data/list': true,
            '/crash/create': false,
            '/crash/list': false,
            '/gps_data/list': true,
            '/air_data/list': true,
            '/command/create': true,
            '/weixin_friend/update': false
        }
    },
    production: {
        server: {
            port: 9966
        },
        mongo: {
            url: 'mongodb://182.254.214.210:20099/baba, mongodb://182.254.215.229:20099/baba, mongodb://182.254.215.35:20099/baba'
        },
        api: {
            url: "http://i.bibibaba.cn"  //internal
        },
        router: {
            url: "http://o.bibibaba.cn",  //open
            map: {
                'wicare.util.pic_valid_code.get': '/util/pic_valid_code/get',
                'wicare.dict.get': '/dict/get',
                'wicare.base.car_brands.list': '/base/car_brands/list',
                'wicare.base.car_series.list': '/base/car_series/list',
                'wicare.base.car_types.list': '/base/car_types/list',
                'wicare.base.aqi.get': '/base/aqi/get',
                'wicare.product.create': '/product/create',
                'wicare.products.list': '/product/list',
                'wicare.product.get': '/product/get',
                'wicare.lottery_logs.list': '/lottery_log/list',
                'wicare.lottery.draw': '/lottery/draw',
                'wicare.lottery.receive': '/lottery/receive',
                'wicare.locations.list': '/location/list',
                'wicare.users.list': '/customer/list',
                'wicare.user.access_token': '/customer/token',
                'wicare.user.login': '/customer/login',
                'wicare.user.sso_login': '/customer/sso_login',
                'wicare.user.register': '/customer/register',
                'wicare.user.create': '/customer/create',
                'wicare.user.update': '/customer/update',
                'wicare.user.bind': '/customer/bind',
                'wicare.user.get': '/customer',
                'wicare.user.exists': '/customer/exists',
                'wicare.user.valid_code': '/customer/valid_code',
                'wicare.user.password.reset': '/customer/password/reset',
                'wicare.comm.sms.send': '/comm/sms/send',
                'wicare.vehicle.get': '/vehicle/get',
                'wicare.vehicle.create': '/vehicle/create',
                'wicare.vehicle.delete': '/vehicle/delete',
                'wicare.vehicles.list': '/vehicles/list',
                'wicare.vehicle.update': '/vehicle/update',
                'wicare.business.total': '/business/total',
                'wicare.business.list': '/business/list',
                'wicare.business.create': '/business/create',
                'wicare.business.update': '/business/update',
                'wicare.device.get': '/device/get',
                'wicare.devices.list': '/devices/list',
                'wicare.device.update': '/device/update',
                'wicare.game.get': '/game/get',
                'wicare.game.create': '/game/create',
                'wicare.file.upload': '/file/upload',
                'wicare.pay.weixin': '/pay/weixin',
                //'wicare.pay.weixin2user': '/pay/weixin2user',
                'wicare.exceptions.list': '/exceptions/list',
                'wicare.exception.create': '/exception/create', // 异常车况创建接口
                'wicare.exception.update': '/exception/update', // 异常车况更新接口
                'wicare.exception.delete': '/exception/delete', // 异常车况删除接口
                'wicare.exception_options.list': '/exception_option/list',
                'wicare.exception_option.create': '/exception_option/create', // 异常车况提醒设置创建接口
                'wicare.exception_option.update': '/exception_option/update', // 异常车况提醒设置更新接口
                'wicare.exception_option.delete': '/exception_option/delete', // 异常车况提醒设置删除接口
                'wicare.orders.list': '/order/list',    // 订单列表接口
                'wicare.order.get': '/order/get',       // 订单查询接口
                'wicare.order.create': '/order/create', // 订单创建接口
                'wicare.order.update': '/order/update', // 订单更新接口
                'wicare.order.delete': '/order/delete', // 订单删除接口
                'wicare.chat.create': '/chat/create',  //创建聊天记录
                'wicare.chat.update': '/chat/update',  //更新聊天记录
                'wicare.chats.list': '/chat/list',     //获取聊天记录
                'wicare.relations.list': '/relation/list', //获取所有聊天
                'wicare.day_trips.list': '/day_trip/list', //日行程统计列表
                'wicare.day_trip.inc': '/day_trip/inc', //字段加1
                'wicare.device_obd_datas.list': '/device_obd_data/list',  //OBD标准数据列表
                'wicare.crash.create': '/crash/create', //缺陷崩溃
                'wicare.crashes.list': '/crash/list',   //获取缺陷记录
                'wicare.gps_datas.list': '/gps_data/list',  //获取设备历史定位记录
                'wicare.air_datas.list': '/air_data/list',  //获取设备历史空气记录
                'wicare.command.create': '/command/create', //向设备发送指令
                'wicare.weixin_friend.update': '/weixin_friend/update' //添加微信好友访问记录
            }
        },
        pay: {
            call_back_url: "http://o.bibibaba.cn/pay/callback",
            notify_url: "http://o.bibibaba.cn/pay/notify"
        },
        authorize: {
            '/util/pic_valid_code/get': false,
            '/dict/get': false,
            '/base/car_brands/list': false,
            '/base/car_series/list': false,
            '/base/car_types/list': false,
            '/base/aqi/get': false,
            '/product/create': false,
            '/product/list': false,
            '/product/get': false,
            '/lottery_log/list': false,
            '/lottery/draw': false,
            '/lottery/receive': false,
            '/location/list': false,
            '/customer/list': false,
            '/customer/token': false,
            '/customer/login': false,
            '/customer/bind': false,
            '/customer/sso_login': false,
            '/customer/register': false,
            '/customer/create': true,
            '/customer/update': true,
            '/customer': true,
            '/customer/exists': false,
            '/customer/valid_code': false,
            '/customer/password/reset': false,
            '/vehicle/get': true,
            '/vehicle/create': true,
            '/vehicle/delete': true,
            '/vehicles/list': true,
            '/vehicle/update': true,
            '/comm/sms/send': false,
            '/business/total': true,
            '/business/list': true,
            '/business/create': true,
            '/business/update': true,
            '/device/get': true,
            '/devices/list': true,
            '/device/update': true,
            '/game/get': false,
            '/game/create': false,
            '/file/upload': false,
            '/pay/weixin': false,
            '/pay/weixin2user': true,
            '/exceptions/list': true,
            '/exception/create': true, // 异常车况创建接口
            '/exception/update': true, // 异常车况更新接口
            '/exception/delete': true, // 异常车况删除接口
            '/exception_option/list': true,
            '/exception_option/create': true, // 异常车况提醒设置创建接口
            '/exception_option/update': true, // 异常车况提醒设置更新接口
            '/exception_option/delete': true, // 异常车况提醒设置删除接口
            '/order/list': true,              // 订单列表接口
            '/order/get': true,               // 订单查询接口
            '/order/create': true,            // 订单创建接口
            '/order/update': true,            // 订单更新接口
            '/order/delete': true,            // 订单删除接口
            '/chat/create': true,
            '/chat/update': true,
            '/chat/list': true,
            '/relation/list': true,
            '/day_trip/list': false,
            '/day_trip/inc': false,
            '/device_obd_data/list': true,
            '/crash/create': false,
            '/crash/list': false,
            '/gps_data/list': true,
            '/air_data/list': true,
            '/command/create': true,
            '/weixin_friend/update': false
        }
    }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);