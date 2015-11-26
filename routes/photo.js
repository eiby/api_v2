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
                    var extension_name = "jpg"
                    var tmp_path = req.files.image.path;
                    //判断文件类型
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
                    var target_path = '/wise/pub/wiwc/public/images/' + time_stamp + '.' + extension_name;
                    var target_url = 'http://img.wisegps.cn/images/' + time_stamp + '.' + extension_name;
                    // 移动文件
                    fs.rename(tmp_path, target_path, function(err) {
                        if (err) throw err;
                        // 删除临时文件夹文件,
                        fs.unlink(tmp_path, function() {
                            //if (err) throw err;
                            obj = {
                                status_code: define.API_STATUS_OK,  //0 成功 >0 失败
                                image_file_url: target_url

                            };
                            res.send(obj);
                        });
                    });
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
            //cust_id, cust_name, sex, car_brand_id, brand_logo_url, car_series_id, car_series, small_pic_url,
            //big_pic_url, content, if_beauty, lon, lat, city
            var cust_id = parseInt(req.body.cust_id);
            var cust_name = decodeURIComponent(req.body.cust_name);
            var icon = req.body.icon;
            var sex = req.body.sex;
            var car_brand_id = req.body.car_brand_id;
            var brand_logo_url = req.body.brand_logo_url;
            var car_series_id = req.body.car_series_id;
            var car_series = decodeURIComponent(req.body.car_series);
            var small_pic_url = req.body.small_pic_url;
            var big_pic_url = req.body.big_pic_url;
            var content = decodeURIComponent(req.body.content);
            var photo_type = parseInt(req.body.photo_type);
            var lon = parseFloat(req.body.lon);
            var lat = parseFloat(req.body.lat);
            var city = decodeURIComponent(req.body.city);

            db.addPhoto(cust_id, cust_name, icon, sex, car_brand_id, brand_logo_url, car_series_id, car_series, small_pic_url,
                big_pic_url, content, photo_type, lon, lat, city, function(err, photo_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "photo_id": photo_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

//秀一下评论
exports.comment = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //photo_id, cust_id, cust_name, icon, content, reply,
            var photo_id = req.params.photo_id;
            var cust_id = req.body.cust_id;
            var cust_name = decodeURIComponent(req.body.cust_name);
            var icon = req.body.icon;
            var content = decodeURIComponent(req.body.content);
            var reply = decodeURIComponent(req.body.reply);
            db.addPhotoComment(photo_id, cust_id, cust_name, icon, content, reply, function(row){
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

//秀一下赞
exports.praise = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //photo_id, cust_id, cust_name, icon,
            var photo_id = req.params.photo_id;
            var cust_id = req.body.cust_id;
            var cust_name = decodeURIComponent(req.body.cust_name);
            var icon = req.body.icon;
            db.addPhotoPraise(photo_id, cust_id, cust_name, icon, function(row){
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

//美图收藏
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

// 获取用户发布的美图列表
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
            db.getCustomerPhotoList(cust_id, min_id, max_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取车友大厅美图列表
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //car_brand_id, min_id, max_id, if_beauty,
            var car_brand_id = req.query.car_brand_id;
            var min_id = req.query.min_id;
            if(typeof min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof max_id == "undefined"){
                max_id = 0;
            }
            var photo_type = parseInt(req.query.photo_type);
            var cust_id = req.query.cust_id;
            db.getPhotoList(car_brand_id, min_id, max_id, photo_type, cust_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 获取车秀明细信息
exports.info = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //car_brand_id, min_id, max_id, if_beauty,
            var photo_id = req.params.photo_id;
            var cust_id = parseInt(req.query.cust_id);
            db.getPhoto(photo_id, cust_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};