/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var fs = require('fs');
var oss = require('./oss');

//上传图片，大小不能超过500k
exports.upload = function(req, res){
    var obj;
    if (req.files.image) {
        if (req.files.image.size == 0 || req.files.image.size > 5000 * 1024) {
            obj = {
                status_code: define.API_STATUS_UPLOAD_FAIL,  //0 成功 >0 失败
                err_msg: "no file or file size larger than limit size."
            };
            res.send(obj);
        } else {
            // 获得文件的临时路径
            var time_stamp = new Date();
            var time_stamp = time_stamp.getTime();
            var extension_name = "jpg";
            var tmp_path = req.files.image.path;
            switch (req.files.image.type) {
                case 'image/pjpeg':
                    extension_name = 'jpg';
                    break;
                case 'image/jpeg':
                    extension_name = 'jpg';
                    break;
                case 'image/gif':
                    extension_name = 'gif';
                    break;
                case 'image/png':
                    extension_name = 'png';
                    break;
                case 'image/x-png':
                    extension_name = 'png';
                    break;
                case 'image/bmp':
                    extension_name = 'bmp';
                    break;
            }
            // 指定文件上传后的目录 - 示例为"images"目录。
            var target_path = "photo/" + time_stamp + '.' + extension_name;
            var target_url = 'http://img2.bibibaba.cn/photo/' + time_stamp + '.' + extension_name + '@!baba';
            //var target_url = 'http://baba-img.img-cn-hangzhou.aliyuncs.com/photo/' + time_stamp + '.' + extension_name + '@!baba';
            // 保存到阿里云OSS
            fs.readFile(tmp_path, function (err, data) {
                if (err) {
                    console.log('error:', err);
                    return;
                }
                var expires = new Date("2100-01-01 00:00:00");
                oss.putObject({
                        Bucket: 'baba-img',
                        Key: target_path,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                        Body: data,
                        AccessControlAllowOrigin: '',
                        ContentType: req.files.image.type,
                        CacheControl: 'max-age=31536000', // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                        ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                        ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                        ServerSideEncryption: 'AES256',
                        Expires: expires                       // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
                    },
                    function (err, data) {

                        if (err) {
                            console.log('error:', err);
                            obj = {
                                status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
                            };
                            res.send(obj);
                        } else {
                            obj = {
                                status_code: define.API_STATUS_OK,  //0 成功 >0 失败
                                image_file_url: target_url

                            };
                            res.send(obj);
                        }

                    });
            });
        }
    } else {
        obj = {
            status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
        };
        res.send(obj);
    }
};