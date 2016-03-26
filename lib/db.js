/**
 * User: Tom
 * Date: 13-12-30
 * Time: 下午3:04
 * db define module
 */
//connect to DB
var mongoose = require('mongoose');
var core = require('./core');
var util = require("./myutil");

// Define Model
var Schema = mongoose.Schema;

// 表名变量定义
var table_name_def = {};
table_name_def.TAB_CUSTOMER = "customer";
table_name_def.TAB_VEHICLE = "vehicle";
table_name_def.TAB_DEVICE = "device";
table_name_def.TAB_BUSINESS = "business";
table_name_def.TAB_EXCEPTION = "exception";
table_name_def.TAB_ORDER = "order";
table_name_def.TAB_DEVELOPER = "developer";
table_name_def.TAB_APP = "app";
table_name_def.TAB_CAR_BRAND = "car_brand";
table_name_def.TAB_CAR_SERIES = "car_series";
table_name_def.TAB_CAR_TYPE = "car_type";
table_name_def.TAB_VALID_CODE = "valid_code";
table_name_def.TAB_ACCESS_TOKEN = "access_token";
table_name_def.TAB_EXCEPTION_OPTION = "exception_option";
table_name_def.TAB_CHAT = "chat";
table_name_def.TAB_RELATION = "relation";
table_name_def.TAB_DAY_TRIP = "day_trip";
table_name_def.TAB_GPS_DATA = 'gps_data';
table_name_def.TAB_AIR_DATA = 'air_data';
table_name_def.TAB_DICT = 'dict';
table_name_def.TAB_WEIXIN_FRIEND = 'weixin_friend';
table_name_def.TAB_LOCATION = "location";
table_name_def.TAB_LOTTERY = "lottery";
table_name_def.TAB_LOTTERY_LOG = "lottery_log";
table_name_def.TAB_OP_LOG = 'op_log';
table_name_def.TAB_BILL = 'bill';
table_name_def.TAB_WARE_HOUSE = 'ware_house';
table_name_def.TAB_PRODUCT = 'product';
table_name_def.TAB_GAME = 'game';
table_name_def.TAB_GAME_LOG = 'game_log';

exports.table_name_def = table_name_def;

// 访问令牌
var access_token = new Schema({
    access_token: String,
    valid_time: Date
});
//access_token.index({access_token: 1});

// 短信校验码数据
var valid_code = new Schema({
    mobile: String,            //登陆手机
    email: String,             //邮箱地址
    valid_code: String,        //校验码
    valid_time: Date,          //有效期
    create_time: Date,         //创建时间
    update_time: Date          //更新时间
});
//valid_code.index({mobile: 1, valid_code: 1, valid_time: 1});
//valid_code.index({email: 1, valid_code: 1, valid_time: 1});

// 客户数据
var customer = new Schema({
    cust_id: Number,
    seller_id: Number,         //商户ID, 如果为商户, 则为0, 如果为车主, 则为车主所绑定的商户, 如果为员工, 则为员工所属商户
    saler_id: Number,          //销售人员id
    login_id: String,          //第三方登录返回的标识ID
    cust_name: String,         //用户昵称
    cust_type: Number,         //用户类型 0: 无车 1: 车主 2：服务商 3: 员工 4: 销售商
    service_type: Number,      //服务商类型（0 销售，1 售后，2 保险，3 理赔，4 代办，5 维修，6 保养）
    bonus_point: Number,       //会员积分(不同类型的用户, 有不同的积分规则)
    class: Number,             //会员等级(销售商等级, 1:钻石, 2:金牌, 3:银牌, 4:铜牌 5:普通 (根据积分规则升级))
    status: Number,            //状态, 0:正常 1:停用 -1:删除
    car_brand: String,         //车辆品牌
    car_series: String,        //车型
    mobile: String,            //登陆手机
    email: String,             //邮箱地址
    password: String,          //登陆密码
    province: String,          //省份
    city: String,              //城市
    loc: {},                   //经纬度
    logo: String,              //车主头像
    photo: [],                 //店铺照片
    remark: String,            //用户简介
    sex: Number,               //性别
    birth: Date,               //生日
    contacts: String,          //联系人
    address: String,           //联系地址
    tel: String,               //联系电话
    id_card_type: String,      //驾照类型
    annual_inspect_date: Date, //驾照年审
    change_date: Date,         //换证日期
    wi_dou: Number,            //微豆
    wi_yuan: Number,           //微元
    frozen_balance: Number,    //冻结金额
    balance: Number,           //账户余额，可提现, 仅用于返还现金，暂时不支持充值
    privilege: String,         //操作权限, 格式:功能编码01,功能编码02,功能编码03,功能编码04
    receive_push: Number,      //是否接收推送 空或0:不接收  1:接收
    parent_dealer_id: Number,  //上级代理商
    dealer_tree_path: String,  //代理树, 格式: 1,100,120,140,
    dealer_level: Number,      //代理层级, 1:总代, 2:一级, 3:二级, 4:分销
    create_time: Date,         //创建时间
    update_time: Date          //更新时间
});
//customer.index({cust_id: 1});
//customer.index({mobile: 1, password: 1});
//customer.index({email: 1, password: 1});
//customer.index({parent_cust_id: 1});

// 车辆数据
var vehicle = new Schema({
    obj_id: Number,                  //车辆id
    seller_id: Number,               //商户id
    cust_id: Number,                 //用户id
    cust_name: String,               //临时字段
    obj_name: String,                //车牌号
    nick_name: String,               //车辆名称
    device_id: Number,               //终端id：0 表示没有绑定终端
    active_gps_data: {},             //临时字段
    car_brand_id: Number,            //品牌id
    car_brand: String,               //车辆品牌
    car_series_id: Number,           //车型id
    car_series: String,              //车型
    car_type_id: Number,             //车款id
    car_type: String,                //车款
    engine_no: String,               //发动机号
    frame_no: String,                //车架号
    reg_no: String,                  //登记证书
    insurance_company: String,       //保险公司
    insurance_tel: String,           //保险公司电话
    insurance_date: Date,            //保险到期时间
    insurance_no: String,            //保险单号
    annual_inspect_date: Date,       //车辆年检日期
    maintain_company: String,        //保养4S店
    maintain_tel: String,            //保养4S店电话
    mileage: Number,                 //当前里程，需要动态更新
    maintain_last_mileage: Number,   //最后保养里程
    maintain_last_date: Date,        //最后保养时间
    maintain_next_mileage: Number,   //下次保养里程
    gas_no: String,                  //汽油标号 0#, 90#, 93#(92#), 97#(95#)
    fuel_ratio: Number,              //油耗修正系数(直接原始数据*该系数得到实际油耗)
    fuel_price: Number,              //加油油价
    buy_date: Date,                  //购车时间
    business_status: Number,         //业务状态 1:在店 2:离店
    create_time: Date,               //创建时间
    update_time: Date,               //更新时间
    last_arrive_time: Date,          //最后一次到店时间
    arrive_count: Number,            //到店次数
    evaluate_count: Number,          //评价次数
    fault_count: Number,             //最新故障计数
    alert_count: Number,             //最新报警计数
    event_count: Number,             //车务提醒计数
    vio_count: Number,               //最新违章计数
    geofence: {                      //围栏
        //        geo_type: 0,       //0: 进出报警 1:驶入报警 2:驶出报警
        //        lon: 112,
        //        lat: 22,
        //        width: 1000
    },
    last_query: Date,                //最后查询时间，用于控制用户查询周期，vip一天一次，免费用户七天一次。
    vio_citys: [                     //违章城市
        //{ vio_city_name: '深圳', vio_location: '0755' }
    ]
});
//vehicle.index({cust_id: 1});
//vehicle.index({obj_id: 1});
//vehicle.index({device_id: 1});

// 业务数据
var business = new Schema({
    business_id: Number,        //业务ID
    cust_id: Number,            //用户id
    seller_id: Number,          //商户id
    cust_name: String,          //临时字段
    obj_id: Number,             //车辆id
    obj_name: String,           //车牌号
    car_brand_id: Number,       //品牌id
    car_brand: String,          //车辆品牌
    car_series_id: Number,      //车型id
    car_series: String,         //车型
    car_type_id: Number,        //车款id
    car_type: String,           //车款
    mileage: Number,            //当时里程
    business_type: Number,      //业务类型 1:保养 2:维修 3:美容 4:救援
    business_content: String,   //业务内容
    status: Number,             //业务状态 1:在店 2:完工 3:离店 4:作业中
    arrive_time: Date,          //到店时间
    leave_time: Date,           //离店时间
    job_start_time: Date,       //作业开始时间
    job_end_time: Date,         //作业结束时间
    job_cust_id: Number,        //作业人员ID
    evaluate_level: Number,     //评价等级 1 - 5
    env_level: Number,          //环境等级 1 - 5
    price_level: Number,        //价格等级 1 - 5
    service_level: Number,      //服务等级 1 - 5
    evaluate_content: String,   //评价内容
    evaluate_time: Date,        //评价时间
    create_time: Date,         //创建时间
    update_time: Date          //更新时间
});
//business.index({cust_id: 1, status: 1});
//business.index({obj_id: 1});
//business.index({business_id: 1});

// 终端设备
// 查询字段: seller_id, cust_id, device_id, serial
// 排序字段: device_id, serial, create_time
// 返回字段: 所有字段
var device = new Schema({
    device_id: Number,        //终端id
    device_type: String,      //终端型号
    dealer_id: Number,        //代理商id
    seller_id: Number,        //商户id
    cust_id: Number,          //用户id
    cust_name: String,
    mobile: String,
    email: String,
    serial: String,           //终端序列号
    init_sim: String,         //初始配卡
    sim: String,              //终端内置sim卡
    status: Number,           //0：未出库 1：已出库 2: (已收货)未激活 3：已激活 4: 申请退货
    is_crowdfunding: Boolean, //是否众筹用户
    service_end_date: Date,   //服务到期日
    hardware_version: String, //硬件版本号
    software_version: String, //软件版本号
    create_time: Date,         //创建时间
    update_time: Date,         //更新时间
    stock_time: Date,
    active_time: Date,        //激活时间
    end_time: Date,           //到期时间
    refuel_number: Number,        //1: 第一次， 2: 第二次
    refuel_first_time: Date,      //第一次加油时间
    refuel_first_mileage: Number,  //第一次加油时的累计里程
    refuel_second_time: Date,     //第二次加油时间
    refuel_second_mileage: Number, //第二次加油时的累计里程
    refuel_second_quantiy: Number, //第二次加油量
    total_traffic: Number,        //每月总的流量
    remain_traffic: Number,       //剩余流量
    params: {},
    active_gps_data: {
        //        device_id:String,
        //        lon:Number,
        //        lat:Number,
        //        speed:Number,
        //        direct:Number,
        //        gps_flag:Number,
        //        mileage:Number,
        //        fuel:Number,
        //        temp:Number,
        //        status:String,
        //        cmd_type:Number,
        //        cmd_word:String,
        //        data:String,
        //        gps_time:Date,
        //        rcv_time:Date,
        //        signal:Number,
        //        battery:Number,
        //        event:Number,
        //        uni_status:[],
        //        uni_alerts:[],
        //        rev_lon:Number,
        //        rev_lat:Number,
        //        b_lon:Number,
        //        b_lat:Number,
        //        air          空气指数
    },
    is_online: Boolean,      //是否在线
    signal_level: Number,    //信号强度
    device_flag: Number,     //0: 静止  1：运行  2：设防  3：报警
    stealth_mode: Number,    //是否隐身 1：隐身  0：不隐身
    active_obd_err: [],      //最新obd故障码['P2011', 'P2000']
    //{
    //   dpdy: 5,      //电瓶电压 V
    //   jqmkd: 10,    //节气门开度 %
    //   fdjzs: 750,   //发动机转速 RPM
    //   sw: 10,       //水温  °C
    //   chqwd: 10,    //三元催化器温度 °C
    //   syyl: 40,     //剩余油量 L
    //   hjwd: 30,     //环境温度 °C
    //   dqyl: 100,    //大气压力 kPa
    //   jqyl: 100,    //进气压力 kPa
    //   jqwd: 100,    //进气温度 °C
    //   ryyl: 300,    //燃油压力 kPa
    //   fdjfz: 200,   //发动机负载 %
    //   cqryxz: 100,  //长期燃油修正
    //   dhtqj: 30     //点火角提前 °
    //}
    active_obd_data: {},               //最新obd标准数据：电瓶电压，节气门开度，发动机转速，水温，三元催化器温度，剩余油量，环境温度，大气压力，进气压力，进气温度，燃油压力，发动机负载，长期燃油修正，点火提交角
    last_drive_score: Number,          //最新驾驶得分 满分：100
    //{
    //    lt_dpdy: Number,                  //长期电瓶电压检测值 10-15V  取最近10天日行程超过2公里的数据
    //    lt_jqmkd: Number,                 //长期节气门开度值 12-17%
    //    lt_fdjzs: Number,                 //长期怠速发动机转速 700-910 rpm
    //    lt_sw: Number,                    //长期水温 0-112°C
    //    lt_chqwd: Number                  //长期三元催化器温度 300-800°
    //}
    last_health_check: {},             //最后体检数据
    server_ip: String                  //所处服务器地址
});
//device.index({seller_id: 1});
//device.index({cust_id: 1});
//device.index({device_id: 1});

// 开发者接口
var developer = new Schema({
    dev_id: Number,      //开发者编号
    email: String,       //登陆邮箱
    password: String,    //密码
    dev_type: Number,    //开发者类型 1:个人 2:企业
    dev_name: String,    //姓名
    dev_key: String,     //开发者标识
    dev_secret: String,  //开发者密匙
    create_time: Date,   //创建时间
    update_time: Date    //更新时间
});

// 开发者应用接口
var app = new Schema({
    app_id: Number,      //应用编号
    dev_id: Number,      //开发者编号
    app_name: String,    //应用名称
    app_logo: String,    //应用Logo
    app_key: String,     //开发者标识
    app_secret: String,  //开发者密匙
    create_time: Date,   //创建时间
    update_time: Date    //更新时间
});

// 车辆品牌
var car_brand = new Schema({
    id: Number,
    name: String,
    pid: Number,
    url_spell: String,
    t_spell: String,
    url_icon: String
});

// 车辆型号
var car_series = new Schema({
    id: Number,
    name: String,
    pid: Number,
    url_spell: String,
    show_name: String,
    go_id: Number,
    go_name: String,
    maintain: {},
    fuel_ratio: Number,
    obd_far_pic: [],  //近景图，可以上传多张{big_pic_url: "", small_pic_url: "", author: "WiCARE", is_auth: false}
    obd_near_pic: [],  //远景图，可以上传多张{big_pic_url: "", small_pic_url: "", author: "WiCARE", is_auth: false}
    back_pic: String  //背景图片 1280*1280
});
//car_series.index({pid: 1});

// 车辆款式
var car_type = new Schema({
    id: Number,
    name: String,
    pid: Number,
    go_id: String,
    go_name: String,
    refer_price: String,
    url_spell: String,    //车型简拼
    displacement: Number, //排量
    transmission: String, //变速箱
    maintain: [],
    zh_fuel: Number,  //综合工况油耗
    sn_fuel: Number,  //市内工况油耗
    jq_fuel: Number,  //郊区工况油耗
    sj_fuel: Number,   //网友发布平均油耗(网友反映的平均油耗值)
    is_deal: Boolean   //已处理
});
//car_type.index({pid: 1});

// 仓库对象
var ware_house = new Schema({
    ware_id: String,
    ware_type: Number,       //仓库类别
    ware_name: String,       //仓库名称
    remark: String,          //商品简介
    create_time: Date,       //创建时间
    update_time: Date        //更新时间
});

// 商品对象
var product = new Schema({
    product_id: Number,
    product_type: Number,    //商品类别
    status: Number,          //0: 上架  1: 下架
    product_name: String,    //商品名称
    photo: [],               //商品图片
    sku_info: [],            //单品属性, 可以定义各种商品属性, 比如颜色, 尺码, 型号等等
    //{
    //    color: "金色"
    //    model: ""
    //    price: 668
    //}
    unit_price: Number,      //商品单价
    stock: Number,           //库存数量
    remark: String,          //商品简介
    url: String,             //商品页面链接
    create_time: Date,       //创建时间
    update_time: Date        //更新时间
});
//product.index({product_id: 1});

// 订单对象
var order = new Schema({
    order_id: String,
    cust_id: Number,         //用户id
    open_id: String,         //微信id
    seller_id: Number,       //商户id
    saler_id: Number,        //销售人员/代理商id
    order_type: Number,      //1: 终端  2：服务  3: 商品
    status: Number,          //订单状态参考define中定义
    pay_key: String,         //付费对象, 如果为终端,则为终端序列号, 如果为SIM卡费,则为sim卡号
    product_name: String,    //名称, order_type为1和2时使用
    unit_price: Number,      //单价, order_type为1和2时使用
    quantity: Number,        //数量, order_type为1和2时使用
    total_price: Number,     //总价
    remark: String,          //备注, order_type为1和2时使用
    order_detail: [],        //order_type为3时使用
    //[
    //    {
    //        product_id: 2,
    //        product_name: 'WiCARE汽车环保卫士',
    //        unit_price: 349,
    //        discount: 1,                                 //折扣,默认为100%
    //        quantity: 2,
    //        total_price: 698,
    //        serials: [
    //            {serial: "56624851896", status: 3},      //status  0：未出库 1：已出库 2: (已收货)未激活 3：已激活 4: 申请退货
    //            {serial: "56622821412", status: 3}
    //        ]
    //    }
    //]
    alipay_order_no: String, //支付宝或者微信订单号
    express_company: Number, //1:顺丰快递：默认
    tracking_number: String, //快递单号，暂时只使用顺丰快递
    address: String,         //发货地址
    receiver: String,        //收件人
    tel: String,             //联系电话
    service_end_date: Date,  //新的到期时间
    create_time: Date,       //创建时间
    update_time: Date        //更新时间
});
//order.index({order_id: 1});
//order.index({cust_id: 1, status: 1});

// 异常车况
var exception = new Schema({
    exception_id: Number,          //异常id
    obj_id: Number,                //车辆ID
    obj_name: String,              //车牌号
    car_brand_id: Number,          //品牌ID
    car_series: String,            //车型
    car_type: String,              //车款
    seller_id: Number,             //商户ID
    cust_id: Number,               //客户ID
    open_id: String,               //微信登录ID
    cust_name: String,             //客户名称
    device_id: Number,             //设备ID
    maintain_last_mileage: Number, //最后保养里程
    mileage: Number,               //当前里程
    last_arrive: Date,             //最后到店时间
    exp_type: Number,              //异常类型 1:保养到期 2:长期未到店 3:故障
    exp_reason: String,            //异常原因
    pushed: Number,                //是否已推送 0:未推送 1:已推送
    push_time: Date,               //提送时间
    create_time: Date,             //异常时间
    update_time: Date              //更新时间
});
//exception.index({exception_id: 1});
//exception.index({seller_id: 1, exp_type: 1});

// 异常车况条件设置
var exception_option = new Schema({
    option_id: Number,     //提醒id
    option_type: Number,   //提醒类别 1:保养到期 2:长期未到店 3:故障
    option_name: String,   //提醒名称
    cust_id: Number,       //用户id
    seller_id: Number,     //商户Id
    mileage: Number,       //间隔里程, 单位公里
    duration: Number,      //间隔时间, 单位秒
    object_type: Number,   //目标类型 0:全部  1:品牌  2:车辆
    object: String,        //针对目标, 如果为品牌, 则为品牌Id, 可以设置多品牌, 中间用逗号隔开, 如果为车辆, 则为车辆Id, 中间用逗号隔开, 如果为空, 则表示商户下所有车辆
    object_name: String,   //对应的目标名称, 中间用逗号隔开
    msg_template: String,  //推送消息模板
    create_time: Date,     //创建时间
    update_time: Date      //更新时间
});

// 私信
var chat = new Schema({
    chat_id: Number,               //id
    user_id: Number,               //用户id
    friend_id: Number,             //好友id
    sender_id: Number,             //发送id
    receiver_id: Number,           //接收id
    type: Number,                  //私信类型 0:文本  1:图片  2:语音  3:文件 4:位置
    url: String,                   //如果图片，或者语音，则需设置该地址
    content: String,               //文本内容
    voice_len: Number,             //语音长度
    lon: Number,                   //发送位置经度
    lat: Number,                   //发送位置纬度
    address: String,               //发送位置地址
    send_time: Date,               //发送时间
    read_time: Date,               //阅读时间
    status: Number,                //私信状态 0:未读  1:已读
    create_time: Date,
    update_time: Date
});

// 关系表，暂时为临时好友，既产生私信的朋友
var relation = new Schema({
    relat_id: Number,              //关系id
    user_id: Number,               //用户id
    friend_id: Number,             //好友id
    friend_type: Number,           //好友类型 4: 通知 99: 私信
    order_id: Number,              //排序id  4: 通知 99: 私信
    friend_name: String,           //好友名称
    sex: Number,                   //好友性别
    logo: String,                  //好友logo
    type: Number,                  //最后私信类型 0:文本  1:图片  2:语音  3:文件  4:文件
    content: String,               //最后私信内容
    send_time: Date,               //最后私信时间
    create_time: Date,             //创建时间
    unread_count: Number,          //未读私信
    status: Number                 //0：临时好友  1：正式好友
});

// 日行程汇总数据
var day_trip = new Schema({
    day_trip_id: Number,                   //ID
    serial: String,                        //终端序列号
    rcv_day: Date,                         //统计日期
    total_duration: Number,                //每日运行时长
    total_distance: Number,                //每日里程
    total_fuel: Number,                    //每日油耗
    drive_score: Number,                   //驾驶得分
    safe_score: Number,                    //安全得分
    eco_score: Number,                     //经济得分
    env_score: Number,                     //环保得分
    drive_advice: String,                  //驾驶建议
    avg_fuel: Number,                      //百公里油耗
    total_fee: Number,                     //每日花费
    avg_air: Number,                       //平均空气质量
    idle_range: {},
    speed1_range: {},
    speed2_range: {},
    speed3_range: {},
    speed4_range: {},
    quick_break: Number,             //每日急刹车次数
    quick_accel: Number,             //每日急加速次数
    quick_reflexes: Number,          //每日急转弯次数
    quick_break_after_accel: Number, //每日加油后立即刹车次数
    cust_id:Number,                  //用户ID
    cust_name:String,                //用户名称
    logo:String,                     //用户Logo
    obj_id:Number,                   //车辆ID
    obj_name:String,                 //车牌号
    brand_id:Number,                 //品牌ID
    air_praise: Number               //空气指数赞数
});

// obd标准数据
var device_obd_data = new Schema({
    obd_data_id: Number,
    serial: String, //serial
    rcv_time: Date,
    obd_data: {
        //   dpdy: 5,      //电瓶电压 V
        //   jqmkd: 10,    //节气门开度 %
        //   fdjzs: 750,   //发动机转速 RPM
        //   sw: 10,       //水温  °C
        //   chqwd: 10,    //三元催化器温度 °C
        //   syyl: 40,     //剩余油量 L
        //   hjwd: 30,     //环境温度 °C
        //   dqyl: 100,    //大气压力 kPa
        //   jqyl: 100,    //进气压力 kPa
        //   jqwd: 100,    //进气温度 °C
        //   ryyl: 300,    //燃油压力 kPa
        //   fdjfz: 200,   //发动机负载 %
        //   cqryxz: 100,  //长期燃油修正
        //   dhtqj: 30     //点火角提前 °
    }
});

// 异常记录
var crash = new Schema({
    crash_id: Number,
    app_key: String,    //app_key
    bug_report: String, //缺陷记录
    account: String,    //登陆账号
    create_time: Date,  //创建时间
    update_time: Date   //更新时间
});

// 定位数据
var gps_data = new Schema({
    gps_data_id: Number,
    serial: String, //serial
    lon: Number,
    lat: Number,
    speed: Number,
    direct: Number,
    gps_flag: Number,
    mileage: Number,
    fuel: Number,
    temp: Number,
    air: Number,
    status: String,
    cmd_type: Number,
    cmd_word: String,
    data: String,
    gps_time: Date,
    rcv_time: Date,
    signal: Number,
    battery: Number,
    event: Number,
    uni_status: [],
    uni_alerts: [],
    rev_lon: Number,
    rev_lat: Number,
    b_lon: Number,
    b_lat: Number
});
exports.gps_data = gps_data;

// 下发指令
var command = new Schema({
    command_id: Number,
    device_id: String,
    cmd_type: Number,
    //exports.SENDFLAG_READY = 0x5001;
    //exports.SENDFLAG_SENDING = 0x5002;
    //exports SENDFLAG_SENDED = 0x5003;
    send_flag: Number,
    send_time: Date,
    mdt_name: String,
    protocol_ver: String,
    accessory: Number,
    params: {},
    server_ip: String,
    create_time: Date,
    update_time: Date
});
exports.command = command;

// 空气数据
var air_data = new Schema({
    serial : String,
    air: Number,
    rcv_time: Date
});
exports.air_data = air_data;

// 字典表对象
var dict = new Schema({
    dict_id: Number,
    dict_name: String,
    dict_type: String,
    dict_value: {}
});

//lottery
//lottery_id: 奖品id
//name: 奖品名称
//sum: 总数
//time_start: 限制时间段
//time_end: 限制时间段
//probability：概率
//is_disable: 是否启用
//list_order: 排序
//msg: 提示信息
//content: 备注
//create_time: 创建时间
//update_time: 更新时间

// 奖品表
var lottery = new Schema({
    lottery_id: Number,   //奖品id
    name: String,         //奖品名称
    type: Number,         //奖品类别 0:现金 1:微豆 2:微元 3:抵用券 4:买赠券 5:折扣券 6:实物 7:无奖
    sum: Number,          //总数
    time_start: String,   //限制时间段
    time_end: String,     //限制时间段
    probability: Number,  //概率(总数为:10000)
    is_disable: Number,   //是否启用 0:启用 1:停用
    list_order: Number,   //排序
    msg: String,          //提示信息
    content: String,      //备注
    create_time: Date,    //创建时间
    update_time: Date,    //更新时间
    create_id: Number,    //创建用户
    update_id: Number     //更新用户
});

// 抽奖日志表
var lottery_log = new Schema({
    log_id: Number,     //日志id
    cust_id: Number,    //用户id
    open_id: String,    //微信id
    is_win: Number,     //是否抽中 1:抽中 0:未抽中
    is_receive: Number, //是否领取 1:领取 0:为领取
    lottery_id: Number, //奖品id
    code: String,       //奖品识别码(对于任一奖品id有唯一标识)
    value: Number,      //数值大小, 对于微豆,微元,现金有效
    create_time: Date,  //时间
    update_time: Date   //更新时间
});

// 微信好友关系表
var weixin_friend = new Schema({
    open_id: String,           //用户open_id
    name: String,              //用户姓名
    friend_open_id: String,    //好友open_id
    friend_name: String,       //好友姓名
    click_count: Number,       //阅读次数
    create_time: Date,         //时间
    update_time: Date          //更新时间
});

// 操作日志
var op_log = new Schema({
    cust_id: Number,         //用户id
    open_id: String,         //用户open_id
    type: Number,            //0:登陆 1:登出 2:进入功能 3:新增操作 4:修改操作 5:删除操作 6:交易
    content: String,         //日志内容
    ip: String,              //ip地址
    create_time: Date,       //日志时间
    update_time: Date        //更新时间
});

// 账单表
var bill = new Schema({
    cust_id: Number,            //用户id
    open_id: String,            //用户open_id
    source: String,             //支付来源(默认为WiCARE)
    type: Number,               //0:收入 1:消费  2:提现
    m_type:Number,              //币种 0: 现金 1:微元 2:微币
    sum: Number,                //金额(收入为正值, 消费和提现为负值)
    partner_trade_no: String,   //商户订单号
    payment_no: String,         //微信订单号
    payment_time: String,       //微信支付成功时间
    create_time: Date,          //时间
    update_time: Date           //更新时间
});

// 处理地点(车辆年检，驾驶证年检及换证)
var location = new Schema({
    id: Number,
    type: Number, //1: 车辆年检地点 2：驾驶证年检换证地点 3:违章处理地点 4:充电桩
    city: String,
    name: String,
    address: String,
    tel: String,
    is_collect: Number,
    loc: {},
    lon: Number,
    lat: Number,
    rev_lon: Number,
    rev_lat: Number,
    b_lon: Number,
    b_lat: Number,
    create_time: Date
});

// 游戏表
var game = new Schema({
    game_id: String,       //游戏id(由系统随机产生一个唯一编码)
    open_id: String,       //创建人微信id
    type: Number,          //1: 拼图 2: 猜图 3: 猜音乐
    level: Number,         //难度等级, 如果为拼图或者猜图,则按照宫格数,比如3*3, 则为3
    material_url: String,  //素材地址(图片,音乐,视频)
    answer: [],            //正确答案(如果答案是单值则放在数组第一个元素)
    create_time: Date,
    update_time: Date
});

// 游戏日志表
var game_log = new Schema({
    log_id: Number,        //日志id
    game_id: String,       //游戏id(由系统随机产生一个唯一编码)
    open_id: String,       //玩家微信id
    completion: Number,    //完成度
    add_wi_dou: Number,    //得到微豆
    create_time: Date,
    finish_time: Date,     //完成时间
    update_time: Date
});

// 表名和结构的对照表
var tables = {
    "customer": {schema: customer, unique_id: "cust_id"},
    "vehicle": {schema: vehicle, unique_id: "obj_id"},
    "device": {schema: device, unique_id: "device_id"},
    "business": {schema: business, unique_id: "business_id"},
    "exception": {schema: exception, unique_id: "exception_id"},
    "order": {schema: order, unique_id: "order_id"},
    "developer": {schema: developer, unique_id: "dev_id"},
    "app": {schema: app, unique_id: "app_id"},
    "car_brand": {schema: car_brand, unique_id: "id"},
    "car_series": {schema: car_series, unique_id: "id"},
    "car_type": {schema: car_type, unique_id: "id"},
    "valid_code": {schema: valid_code, unique_id: "mobile"},
    "access_token": {schema: access_token, unique_id: "access_token"},
    "exception_option": {schema: exception_option, unique_id: "option_id"},
    "chat": {schema: chat, unique_id: "chat_id"},
    "relation": {schema: relation, unique_id: "relat_id"},
    "day_trip": {schema: day_trip, unique_id: "day_trip_id"},
    "device_obd_data": {schema: device_obd_data, unique_id: "obd_data_id"},
    "crash": {schema: crash, unique_id: "crash_id"},
    "command": {schema: command, unique_id: "command_id"},
    "gps_data": {schema: gps_data, unique_id: ""},
    "air_data": {schema: air_data, unique_id: ""},
    "dict": {schema: dict, unique: "dict_id"},
    "lottery": {schema: lottery, unique_id: "lottery_id"},
    "lottery_log": {schema: lottery_log, unique_id: "log_id"},
    "weixin_friend": {schema: weixin_friend, unique_id: ""},
    "op_log": {schema: op_log, unique_id: ""},
    "bill":  {schema: bill, unique_id: ""},
    "ware_house": {schema: ware_house, unique_id: "ware_id"},
    "product": {schema: product, unique_id: "product_id"},
    "location": {schema: location, unique_id: "id"},
    "game": {schema: game, unique_id: "game_id"},
    "game_log": {schema: game_log, unique_id: "log_id"}
};

// 获取唯一ID
exports.getID = function(table_name, callback){
    core._getID(table_name, callback);
};

// 执行command
// command: 指令
exports.executeCommand = function (command, callback) {
    core._executeCommand(command, callback);
};

// 新增数据
// table_name: 表名
// create_json: 新增数据
// is_judge_exists: 是否判断数据存在
// exists_query: 判断存在的条件
// exists_fields: 判断存在之后返回的字段
// is_exists_update: 如果存在是否更新数据
// update_json: 更新的数据
exports.create = function (table_name, create_json, is_judge_exists, exists_query, exists_fields,
                           is_exists_update, update_query, update_json, callback) {
    core._create(table_name, tables[table_name].schema, tables[table_name].unique_id, create_json, is_judge_exists, exists_query,
        exists_fields, is_exists_update, update_query, update_json, callback);
};

// 新增数据2, 唯一ID由外部传入
// table_name: 表名
// create_json: 新增数据
// is_judge_exists: 是否判断数据存在
// exists_query: 判断存在的条件
// exists_fields: 判断存在之后返回的字段
// is_exists_update: 如果存在是否更新数据
// update_json: 更新的数据
exports.create2 = function (table_name, create_json, is_judge_exists, exists_query, exists_fields,
                           is_exists_update, update_query, update_json, callback) {
    core._create2(table_name, tables[table_name].schema, tables[table_name].unique_id, create_json, is_judge_exists, exists_query,
        exists_fields, is_exists_update, update_query, update_json, callback);
};

// 新增数据3,
// table_name: 表名
// schema: 架构
// create_json: 新增数据
// is_judge_exists: 是否判断数据存在
// exists_query: 判断存在的条件
// exists_fields: 判断存在之后返回的字段
// is_exists_update: 如果存在是否更新数据
// update_json: 更新的数据
exports.create3 = function (table_name, schema, unique_id, create_json, is_judge_exists, exists_query, exists_fields,
                            is_exists_update, update_query, update_json, callback) {
    core._create(table_name, schema, unique_id, create_json, is_judge_exists, exists_query,
        exists_fields, is_exists_update, update_query, update_json, callback);
};

// 更新数据
// table_name: 表名
// query_json: 更新条件
// update_json: 更新的数据
exports.update = function (table_name, query_json, update_json, callback) {
    core._update(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, update_json, callback);
};

// 更新数据2
// table_name: 表名
// query_json: 更新条件
// update_json: 更新的数据
// inc_json: 递增数据
exports.update2 = function (table_name, query_json, update_json, callback) {
    core._update2(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, update_json, callback);
};

// 获取更新数据
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 更新条件
// update_json: 更新的数据
exports.findAndUpdate = function (table_name, query_json, update_json, callback) {
    core._findAndUpdate(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, update_json, callback);
};

// 获取更新数据2
// table_name: 表名
// table_schema: 表结构对象
// unique_id: 表的唯一ID
// query_json: 更新条件
// update_json: 更新的数据
exports.findAndUpdate2 = function (table_name, query_json, update_json, callback) {
    core._findAndUpdate2(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, update_json, callback);
};

// 删除数据
// table_name: 表名
// query_json: 删除条件
exports.remove = function (table_name, query_json, callback) {
    core._remove(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, callback);
};

// 获取单个数据
// table_name: 表名
// query_json: 获取条件
exports.get = function (table_name, query_json, fields, callback) {
    var field_json = util.getFieldJson(fields);
    core._get(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, field_json, callback);
};

// 获取统计数据
// table_name: 表名
// query_json: 获取条件
exports.count = function (table_name, query_json, callback) {
    core._count(table_name, tables[table_name].schema, query_json, callback);
};

// 获取列表数据
// table_name: 表名
// query_json: 获取条件
// fields: 返回字段
// sorts: 排序字段,如果倒序,在字段前面加-
// page: 分页字段
// min_id: 分页字段的本页最小值
// max_id: 分页字段的本页最小值
// limit: 返回条数;
exports.list = function (table_name, query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    var field_json = util.getFieldJson(fields);
    var sort_json = util.getSortJson(sorts);
    core._list(table_name, tables[table_name].schema, tables[table_name].unique_id, query_json, field_json, sort_json, page, min_id, max_id, limit, callback);
};

// 获取列表数据2
// table_name: 表名
// query_json: 获取条件
// fields: 返回字段
// sorts: 排序字段,如果倒序,在字段前面加-
// page: 分页字段
// min_id: 分页字段的本页最小值
// max_id: 分页字段的本页最小值
// limit: 返回条数;
exports.list2 = function (table_name, schema, unique_id, query_json, fields, sorts, page, min_id, max_id, limit, callback) {
    var field_json = util.getFieldJson(fields);
    var sort_json = util.getSortJson(sorts);
    core._list(table_name, schema, unique_id, query_json, field_json, sort_json, page, min_id, max_id, limit, callback);
};

// 核心校验函数
exports.checkAccessToken = function (token, callback) {
    var now = new Date();
    var query_json = {'access_token': token, 'valid_time': {'$gte': now}};
    core._get(table_name_def.TAB_ACCESS_TOKEN, access_token, "access_token", query_json, "access_token,valid_time", function(doc){
        if (doc) {
            callback(true);
        } else {
            callback(false)
        }
    })
};