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
//下一步改为阿里云存储
exports.uploadImage = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj;
            if(req.files.image){
                if(req.files.image.size == 0 || req.files.image.size > 500 * 1024)
                {
                    obj = {
                        status_code: define.API_STATUS_UPLOAD_FAIL,  //0 成功 >0 失败
                        err_msg: "no file or file size larger than limit size."
                    };
                    res.send(obj);
                }else{
                   // 获得文件的临时路径
                    var time_stamp = new Date();
                    var time_stamp = time_stamp.getTime();
                    var extension_name = "jpg";
                    var tmp_path = req.files.image.path;
                    switch (req.files.image.type) {
                        case 'image/pjpeg':extension_name = 'jpg';
                            break;
                        case 'image/jpeg':extension_name = 'jpg';
                            break;
                        case 'image/gif':extension_name = 'gif';
                            break;
                        case 'image/png':extension_name = 'png';
                            break;
                        case 'image/x-png':extension_name = 'png';
                            break;
                        case 'image/bmp':extension_name = 'bmp';
                            break;
                    }
                    // 指定文件上传后的目录 - 示例为"images"目录。
                    var target_path = "photo/" + time_stamp + '.' + extension_name;
                    var target_url = 'http://img.bibibaba.cn/photo/' + time_stamp + '.' + extension_name;
                    // 保存到阿里云OSS
                    fs.readFile(tmp_path, function (err, data) {
                        if (err) {
                            console.log('error:', err);
                            return;
                        }
                        var expires = new Date("2019-01-01 00:00:00");
                        oss.putObject({
                                Bucket: 'baba-img',
                                Key: target_path,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                                Body: data,
                                AccessControlAllowOrigin: '',
                                ContentType: 'application/octet-stream',
                                CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
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
                                }else{
                                    obj = {
                                        status_code: define.API_STATUS_OK,  //0 成功 >0 失败
                                        image_file_url: target_url

                                    };
                                    res.send(obj);
                                }

                            });
                    });
                    ////判断文件类型
                    //switch (req.files.image.type) {
                    //    case 'image/pjpeg':extension_name = 'jpg';
                    //        break;
                    //    case 'image/jpeg':extension_name = 'jpg';
                    //        break;
                    //    case 'image/gif':extension_name = 'gif';
                    //        break;
                    //    case 'image/png':extension_name = 'png';
                    //        break;
                    //    case 'image/x-png':extension_name = 'png';
                    //        break;
                    //    case 'image/bmp':extension_name = 'bmp';
                    //        break;
                    //}
                    //// 指定文件上传后的目录 - 示例为"images"目录。
                    //var target_path = '/wise/pub/wiwc/public/images/' + time_stamp + '.' + extension_name;
                    //var target_url = 'http://img.wisegps.cn/images/' + time_stamp + '.' + extension_name;
                    //// 移动文件
                    //fs.rename(tmp_path, target_path, function(err) {
                    //    if (err) throw err;
                    //    // 删除临时文件夹文件,
                    //    fs.unlink(tmp_path, function() {
                    //        //if (err) throw err;
                    //        obj = {
                    //            status_code: define.API_STATUS_OK,  //0 成功 >0 失败
                    //            image_file_url: target_url
                    //
                    //        };
                    //        res.send(obj);
                    //    });
                    //});
                }
            }else{
                obj = {
                    status_code: define.API_STATUS_UPLOAD_FAIL  //0 成功 >0 失败
                };
                res.send(obj);
            }

        }else{
            util.resSendNoRight(res);
        }
    });
};

// 发表博文
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //cust_id, name, title, content, pics, lon, lat, city,
            var cust_id = parseInt(req.body.cust_id);
            var name = decodeURIComponent(req.body.name);
            var title = decodeURIComponent(req.body.title);
            var content = decodeURIComponent(req.body.content);
            var city = decodeURIComponent(req.body.city);
            var logo = req.body.logo;
            var pics;
            try{
                if(typeof req.body.pics != "object"){
                    pics = eval("(" + req.body.pics + ")");
                }else{
                    pics = req.body.pics;
                }
            }catch(e){
                pics = [];
            }
            var lon = parseFloat(req.body.lon);
            var lat = parseFloat(req.body.lat);
            db.addBlog(cust_id, name, title, content, pics, lon, lat, city, logo, function(err, blog_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "blog_id": blog_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

//博文评论
exports.comment = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //blog_id, cust_id, name, content,
            var blog_id = req.params.blog_id;
            var cust_id = req.body.cust_id;
            var name = decodeURIComponent(req.body.name);
            var content = decodeURIComponent(req.body.content);
            db.addComment(blog_id, cust_id, name, content, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

//博文赞
exports.praise = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //blog_id, cust_id, name, content,
            var blog_id = req.params.blog_id;
            var cust_id = req.body.cust_id;
            var name = decodeURIComponent(req.body.name);
            db.addPraise(blog_id, cust_id, name, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

//博文收藏
exports.collect = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var blog_id = parseInt(req.params.blog_id);
            var cust_id = parseInt(req.body.cust_id);
            db.updateCustomerBlogCollection(cust_id, blog_id, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取用户博文列表
exports.listByCustomer = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var cust_id = req.params.cust_id;
            var min_id = req.query.min_id;
            if(typeof min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof max_id == "undefined"){
                max_id = 0;
            }
            db.getCustomerBlogList(cust_id, min_id, max_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取车友圈博文列表
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var type = req.query.type;
            var cust_id = parseInt(req.query.cust_id);
            var lon = parseFloat(req.query.lon);
            var lat = parseFloat(req.query.lat);
            var distance = parseInt(req.query.distance);
            var min_id = req.query.min_id;
            if(typeof min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof max_id == "undefined"){
                max_id = 0;
            }
            var update_time = new Date(req.query.update_time);
            db.getBlogList(type, cust_id, lon, lat, distance, min_id, max_id, update_time, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};