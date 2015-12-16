/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 15/12/11
 * Time: 下午2:54
 * WiStorm Router JS -- Chat module
 * Name:
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var core = require("./core.js");
var http = require("http");

var option = {
    //创建限制字段
    create_fields: "",
    // 更新,删除查询限制字段
    query_fields: "",
    // 更新限制字段
    update_fields: "",
    //获取列表查询限制字段
    list_fields: ""
};
var core_router = new core.core_router(db.table_name_def.TAB_CHAT, option);

exports.new = function(req, res){
    //var new_func = core_router.new();
    var user_id = parseInt(req.query.user_id); //1
    var friend_id = parseInt(req.query.friend_id);  //19
    var type = parseInt(req.query.type);
    var content = req.query.content;
    var send_time = new Date();
    var cust_name = req.query.cust_name;
    db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: friend_id}, "login_id,cust_name,sex,logo", function(friend){
        if(friend){
            var link = "http://h5.bibibaba.cn/baba/wx/src/customer_advisory.html?id=" + user_id;
            //var msg = "你有新的消息!";
            util.sendWeixinNewMsg(cust_name, content, friend.login_id, link, function (ret) {
                console.log(ret);
                var create_fields = "";
                var create_json = util.getCreateJson(req.query, create_fields);
                create_json.sender_id = user_id;
                create_json.receiver_id = friend_id;
                create_json.send_time = new Date();               //发送时间
                create_json.read_time = new Date();               //阅读时间
                create_json.status = 1;                           //私信状态 0:未读  1:已读
                db.create(db.table_name_def.TAB_CHAT, create_json, false, null, null, false, null, null, function(status){
                    create_json.user_id = friend_id;
                    create_json.friend_id = user_id;
                    //create_json.sender_id = friend_id;
                    //create_json.receiver_id = user_id;
                    create_json.send_time = new Date();           //发送时间
                    create_json.status = 0;                       //私信状态 0:未读  1:已读
                    db.create(db.table_name_def.TAB_CHAT, create_json, false, null, null, false, null, null, function(status, chat_id){
                        var result;
                        if (status == define.DB_STATUS_FAIL) {
                            result = {
                                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                            };
                        } else {
                            result = {
                                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                                "chat_id": chat_id
                            };
                        }
                        res.send(result);
                    });
                });
                var sex = friend.sex;
                if(sex == undefined){
                    sex = 1
                }
                var logo = friend.logo;
                if(logo == undefined){
                    logo = "";
                }
                var cont = content;
                switch (type) {
                    case 0:
                        cont = content;
                        break;
                    case 1:
                        cont = "[图片]";
                        break;
                    case 2:
                        cont = "[语音]";
                        break;
                    default:
                        cont = content;
                        break;
                }
                //保存临时好友关系
                var relation_create_json = {
                    user_id: user_id,                 //用户id
                    friend_id: friend_id,             //好友id
                    friend_type: 99,                  //好友类型 4: 通知 99: 私信
                    order_id: 99,                     //排序id  4: 通知 99: 私信
                    friend_name: friend.cust_name,    //好友名称
                    sex: sex,                         //好友性别
                    logo: logo,                       //好友logo
                    type: type,                       //最后私信类型 0:文本  1:图片  2:语音  3:文件  4:文件
                    content: cont,                    //最后私信内容
                    send_time: send_time,             //最后私信时间
                    unread_count: 0,                  //未读私信
                    status: 0                         //0：临时好友  1：正式好友
                };
                var exists_query = {
                    user_id: user_id,
                    friend_id: friend_id
                };
                var update_json = {
                    type: type,
                    content: content,
                    send_time: send_time
                };
                db.create(db.table_name_def.TAB_RELATION, relation_create_json, true, exists_query, "relat_id", true, exists_query, update_json, function(status, relat_id){
                    if(status != define.DB_STATUS_FAIL){
                        db.get(db.table_name_def.TAB_CUSTOMER, {cust_id: user_id}, "login_id,cust_name,sex,logo", function(user) {
                            if (user){
                                var sex = user.sex;
                                if(sex == undefined){
                                    sex = 1
                                }
                                var logo = user.logo;
                                if(logo == undefined){
                                    logo = "";
                                }
                                relation_create_json.user_id = friend_id;
                                relation_create_json.friend_id = user_id;
                                relation_create_json.friend_name = user.cust_name;
                                relation_create_json.sex = sex;
                                relation_create_json.logo = logo;
                                relation_create_json.unread_count = 1;
                                var exists_query = {
                                    user_id: friend_id,
                                    friend_id: user_id
                                };
                                db.create(db.table_name_def.TAB_RELATION, relation_create_json, true, exists_query, "relat_id", true, exists_query, update_json, function(status, relat_id) {
                                    console.log(status);
                                });
                            }
                        });
                    }
                });
            });
        }else{
            result = {
                "status_code": define.API_STATUS_INVALID_USER  //0 成功 >0 失败
            };
            res.send(result);
        }
    });
};

exports.update = core_router.update();
exports.delete = core_router.delete();
//exports.list = core_router.list();

exports.list = function(req, res){
    // 未读数清零
    var user_id = parseInt(req.query.user_id); //1
    var friend_id = parseInt(req.query.friend_id);  //19
    var query_json = {
        user_id: user_id,
        friend_id: friend_id
    };
    var update_json = {
        unread_count: 0
    };
    db.update(db.table_name_def.TAB_RELATION, query_json, update_json, function(status){
        console.log("update relation, status == " + status);
    });

    // 返回列表
    var _list = core_router.list();
    _list(req, res);
};

exports.sendWeixin = function(req, res){
    var open_id = req.query.open_id;
    var name = req.query.name;
    var remark = req.query.remark;
    var template_id = req.query.template_id;
    var data = req.query.data;
    util.sendWeixin(template_id, data, open_id, name, remark, function(obj){
        res.send(obj);
    });
};