/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-28
 * Time: 下午4:55
 * To change this template use File | Settings | File Templates.
 */

// 中心服务器
exports.CENTER_SERVER_HOST = "42.121.109.221";
exports.CENTER_SERVER_PORT = 80;

//短信网关地址
exports.SMS_SERVER_HOST = "v.juhe.cn";
exports.SMS_SERVER_PORT = 80;
exports.SMS_CDKEY = "f6a24dd3398d20d6d8675fda38015509";
exports.SMS_PASSWORD = "512967";

//WiStrom API地址
//exports.API_URL = "http://localhost:8088";
exports.API_URL = "http://o.bibibaba.cn";

//API返回状态定义
//正常：0
//用户不存在：0x0001
//密码错误：0x0002
//没有授权：0x0003
//数据库异常：0x000f
exports.API_STATUS_OK = 0;
exports.API_STATUS_INVALID_USER = 0x0001;
exports.API_STATUS_WRONG_PASSWORD = 0x0002;
exports.API_STATUS_NORIGHT = 0x0003;
exports.API_STATUS_UPLOAD_FAIL = 0x0004;
exports.API_STATUS_WRONG_MAC = 0x0005;   //非法手机登陆
exports.API_STATUS_INVALID_SERIAL = 0x0006; //非法终端序列号
exports.API_STATUS_EXISTS_VEHICLE = 0x0007; //本用户存在车辆，无法删除
exports.API_STATUS_EXISTS_USER = 0x0008;  //用户已存在
exports.API_STATUS_MOBILE_RECOMMNED = 0x0009;  //手机号已被推荐
exports.API_STATUS_MOBILE_ORDERED = 0x0010;  //手机号已预订业务
exports.API_STATUS_MOBILE_INSTALLED = 0x0011;  //手机号已办理业务
exports.API_STATUS_DATABASE_ERROR = 0x000f;
exports.API_STATUS_CONNECT_FAIL = 0x1001; //连接服务器失败
exports.API_STATUS_PAY_FAIL = 0x2001;  //查询不到有效节点
exports.API_STATUS_EXCEPTION = 0x9002;    //发生异常错误
exports.API_STATUS_INVALID_NODE = 0x9003;  //查询不到有效节点
exports.API_STATUS_INVALID_SIGN = 0x9004;  //无效签名
exports.API_STATUS_INVALID_METHOD = 0x9005;  //无效方法
exports.API_STATUS_INVALID_APPKEY = 0x9005;  //无效的Appkey
exports.API_STATUS_INVALID_VERSION = 0x9005;  //无效的版本
exports.API_STATUS_INVALID_VALIDCODE = 0x9006;  //无效的版本

//事件定义
//终端自动注册：
//终端副号注册：
//终端获取位置：
//终端事件切换：
//终端报警上传：
//超速报警上传：
//停留记录上传：
//禁行记录上传：
//终端上线离线上传：
//终端图像上传：
//终端设置回复：
//终端参数上传：
//终端转发运营商短信：
//终端发送短信请求（平台模式下）：
//终端发送密码请求：
exports.EVENT_REGISTER = 0x1001;
exports.EVENT_REGISTER2 = 0x1002;
exports.EVENT_GETLOCATION = 0x1003;
exports.EVENT_DEVICEEVENT = 0x1004;
exports.EVENT_ALERT = 0x1005;
exports.EVENT_OVERSPEED = 0x1006;
exports.EVENT_STOP = 0x1007;
exports.EVENT_RESTRICT = 0x1008;
exports.EVENT_GPRS = 0x1009;
exports.EVENT_IMAGE = 0x100A;
exports.EVENT_RESPONSE = 0x100B;
exports.EVENT_PARAM = 0x100C;
exports.EVENT_TELCOSMS = 0x100D;
exports.EVENT_SMSREQUEST = 0x100E;
exports.EVENT_GETPASS = 0x100F;
exports.EVENT_GPSDATA = 0x1010;
exports.EVENT_ONLINE = 0x1011;
exports.EVENT_LINK = 0x1012;
exports.EVENT_DATA = 0x1013;  //透传数据
exports.EVENT_OBD = 0x1016;    //OBD数据

//终端状态定义
//设防：
//锁车：
//基站定位：
//ACC状态：
//省电状态：
//自定义状态1：
//自定义状态2：
//自定义状态3：
exports.STATUS_FORTIFY = 0x2001;
exports.STATUS_LOCK = 0x2002;
exports.STATUS_NETLOC = 0x2003;
exports.STATUS_ACC = 0x2004;
exports.STATUS_SLEEP = 0x2005;
exports.STATUS_ALARM = 0x2006;
exports.STATUS_RELAY = 0x2007;
exports.STATUS_INPUT1 = 0x2008;
exports.STATUS_INPUT2 = 0x2009;
exports.STATUS_INPUT3 = 0x200A;
exports.STATUS_SMS = 0x200B;

//终端报警定义
//紧急报警：
//超速报警：
//震动报警：
//位移报警：
//防盗器报警：
//非法行驶报警：
//进围栏报警：
//出围栏报警：
//剪线报警：
//低电压报警：
//GPS天线断路报警：
//疲劳驾驶报警：
//非法启动：
//非法开车门：
exports.ALERT_SOS = 0x3001;
exports.ALERT_OVERSPEED = 0x3002;
exports.ALERT_VIRBRATE = 0x3003;
exports.ALERT_MOVE = 0x3004;
exports.ALERT_ALARM = 0x3005;
exports.ALERT_INVALIDRUN = 0x3006;
exports.ALERT_ENTERGEO = 0x3007;
exports.ALERT_EXITGEO = 0x3008;
exports.ALERT_CUTPOWER = 0x3009;
exports.ALERT_LOWPOWER = 0x300A;
exports.ALERT_GPSCUT = 0x300B;
exports.ALERT_OVERDRIVE = 0x300C;
exports.ALERT_INVALIDACC = 0x300D;
exports.ALERT_INVALIDDOOR = 0x300E;
exports.ALERT_ACCESSORY = 0x300F; //附件断开报警
exports.ALERT_ENTERROUTE = 0x3010; //禁入线路报警
exports.ALERT_EXITROUTE = 0x3011; //禁出线路报警
exports.ALERT_INOUTPOINT = 0x3012; //巡更点进出报警

//下发指令定义
exports.COMMAND_VERSION = 0x4001;
exports.COMMAND_GPSINTERVAL = 0x4002;
exports.COMMAND_TRACKINTERVAL = 0x4003;
exports.COMMAND_OVERSPEED = 0x4004;
exports.COMMAND_NETLOC = 0x4005;
exports.COMMAND_SLEEP = 0x4006;
exports.COMMAND_VIBRATEALERT = 0x4007;
exports.COMMAND_RESTARTTIME = 0x4008;
exports.COMMAND_ARMING = 0x4009;
exports.COMMAND_DISARMING = 0x400A;
exports.COMMAND_LOCK = 0x400B;
exports.COMMAND_UNLOCK = 0x400C;
exports.COMMAND_REMOVEALERT = 0x400D;
exports.COMMAND_LISTEN = 0x400E;
exports.COMMAND_RESTART = 0x400F;
exports.COMMAND_RESET = 0x4010;
exports.COMMAND_IP = 0x4011;
exports.COMMAND_GEO = 0x4012;
exports.COMMAND_ROUTE = 0x4013;
exports.COMMAND_MILEAGE = 0x4014;
exports.COMMAND_RESTRICT = 0x4015;
exports.COMMAND_STARTENGINE = 0x4016;   //远程启动
exports.COMMAND_DATA = 0x4017;           //透传数据
exports.COMMAND_SLIENT = 0x4018;        //静音模式
exports.COMMAND_SOUND = 0x4019;         //声光模式
exports.COMMAND_LOCKDOOR = 0x4020;     //锁车
exports.COMMAND_UNLOCKDOOR = 0x4021;  //解锁
exports.COMMAND_AUTOLOCKON = 0x4022;   //行车自动落锁开
exports.COMMAND_AUTOLOCKOFF = 0x4023;  //行车自动落锁关
exports.COMMAND_FINDVEHICLE = 0x4024;  //寻车
exports.COMMAND_STOPENGINE = 0x4025;  //远程熄火
exports.COMMAND_AUTOLOCK = 0x4026;    //模拟行车自动落锁
exports.COMMAND_GPSALERT = 0x4027;    //模拟GPS报警
exports.COMMAND_P20RESTART = 0x4028;  //模拟P20重启
exports.COMMAND_P20STATUS = 0x4029;   //获取P20状态
exports.COMMAND_ACCOFF_AUTOLOCKON = 0x4030;  //熄火自动设防开
exports.COMMAND_ACCOFF_AUTOLOCKOFF = 0x4031; //熄火自动设防关
exports.COMMAND_SLAVE = 0x4033;       //设置副号
exports.COMMAND_OPENTRAIL = 0x4034;   //开启尾箱
exports.COMMAND_OPEN_REPAIR = 0x4035;    //打开修车模式
exports.COMMAND_CLOSE_REPAIR = 0x4036;   //关闭修改模式
exports.COMMAND_SMSMODE = 0x4037;         //设置短信模式
exports.COMMAND_GET_ODBDATA = 0x4038;    //清除OBD故障码
exports.COMMAND_GET_ODBERR = 0x4039;    //清除OBD故障码
exports.COMMAND_CLEAR_ODBERR = 0x4040;    //清除OBD故障码
exports.COMMAND_ODB_INTERVAL = 0x4041;  //清除OBD故障码
exports.COMMAND_UPGRADE = 0x4042;       //发送升级指令
exports.COMMAND_SWITCH = 0x4043;        //开关指令
exports.COMMAND_AIR_MODE = 0x4044;      //设置净化模式指令
exports.COMMAND_AIR_SPEED = 0x4045;     //设置净化速度指令

// 发送状态
exports.SENDFLAG_READY = 0x0001;
exports.SENDFLAG_SENDING = 0x0002;
exports.SENDFLAG_SENDED = 0x0003;

//附件类型
//A：油耗传感器 B：ODB附件 C：远程启动附件 D：防拆盒
exports.ACCESSORY_FUEL = 0x5001;
exports.ACCESSORY_ODB = 0x5003;
exports.ACCESSORY_ENGINE = 0x5006;
exports.ACCESSORY_LOCKBOX = 05008;

//号码类型
exports.NUMBERTYPE_MASTER = 1;
exports.NUMBERTYPE_SLAVE = 2;

//查询是否存在
exports.EXIST_SIM = 1;
exports.EXIST_DEVICE_ID = 2;
exports.EXIST_SERIAL = 3;
exports.EXIST_OBJ_NAME = 4;
exports.EXIST_CUST_NAME = 5;
exports.EXIST_USER_NAME = 6;
exports.EXIST_DEALER_NAME = 7;
exports.EXIST_DEALER_USER_NAME = 8;

//订单状态
exports.ORDER_STATUS_WAIT = 0;  //待处理
exports.ORDER_STATUS_RECOMMEND = 1;  //已推荐
exports.ORDER_STATUS_RESERVED = 2;  //已预订
exports.ORDER_STATUS_DONE = 3;      //已办理

//推荐来源
exports.SOURCE_SALE = 1;
exports.SOURCE_NORMALUSER = 2;

//获取验证码短信内容类型
exports.SMSTYPE_BIND_MOBILE = 1;
exports.SMSTYPE_FORGOT_PASSWORD = 2;

//好友权限
exports.RIGHT_LOCATION = 0x6001;    //访问车辆实时位置（个人好友及服务商）
exports.RIGHT_TRIP = 0x6002;        //访问车辆行程（个人好友及服务商）
exports.RIGHT_OBD_DATA = 0x6003;    //访问OBD标准数据（服务商）
exports.RIGHT_ODB_ERR = 0x6004;     //访问OBD故障码数据（服务商）
exports.RIGHT_EVENT = 0x6005;       //访问车务提醒（服务商）
exports.RIGHT_VIOLATION = 0x6006;   //访问车辆违章（服务商）
exports.RIGHT_FUEL = 0x6007;        //访问车辆油耗明细（服务商）
exports.RIGHT_DRIVESTAT = 0x6008;   //访问车辆驾驶习惯数据（服务商）
exports.RIGHT_QUERY_INFO = 0x6009;  //查询车辆信息（服务商）
exports.RIGHT_UPDATE_INFO = 0x6010; //更新车辆信息（服务商）