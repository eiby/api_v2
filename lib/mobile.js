/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-29
 * Time: 下午4:58
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var conn = mongoose.createConnection('mongodb://42.121.119.243:20099/mobile'); //手机归属地数据库
//var conn = mongoose.createConnection('mongodb://10.200.22.102:20099/mobile, mongodb://10.135.29.245:20099/mobile', {read_secondary: true}); //中心服务器

// Define Model
var Schema = mongoose.Schema;
// 手机归属地数据对象
var mobile = new Schema({
    MobileNumber: Number,
    MobileArea: String,
    MobileType: String,
    AreaCode: Number,
    PostCode: Number
});
var m_mobile = conn.model('mobile', mobile);

exports.getMobile = function(pre_num, callback){
    m_mobile.findOne({"MobileNumber": pre_num}, function(err, doc){
        if(doc){
            var city = doc.MobileArea.split(" ");
            doc = {
                mobile_type: doc.MobileType,
                province: city[0],
                city: city[1],
                area_code: doc.AreaCode,
                post_code: doc.PostCode
            };
        }else{
            doc = {};
        }
        callback(doc);
    });
};

