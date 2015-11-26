/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-22
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var fs = require('fs');
var define = require("../lib/define.js");

// 新增集群
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_name = req.body.cluster_name;
            db.addCluster(cluster_name, function(err, cluster_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "cluster_id": cluster_id
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 编辑集群信息
exports.edit = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            // 新增预注册表
            var cluster_id = req.params.cluster_id;
            var cluster_name = req.body.cluster_name;
            db.editCluster(cluster_id, cluster_name, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 删除集群
exports.delete = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_id = req.params.cluster_id;
            db.deleteCluster(cluster_id, function(err){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var page_no = parseInt(req.query.page_no);
            var page_count = parseInt(req.query.page_count);
            db.getClusterList(function(clusters){
                var page_data = db.getPageData(clusters, page_no, page_count);
                res.send(page_data);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 新增Rest节点
exports.addRestNode = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_id = req.params.cluster_id;
            var address = req.body.address;
            var port = req.body.port;
            var remark = req.body.remark;
            db.addRestNode(cluster_id, address, port, remark, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 删除Rest节点
exports.deleteRestNode = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_id = parseInt(req.params.cluster_id);
            var address = req.body.address;
            var port = req.body.port;
            db.deleteRestNode(cluster_id, address, port, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 新增通信节点
exports.addUdpNode = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_id = req.params.cluster_id;
            var address = req.body.address;
            var port = req.body.port;
            var remark = req.body.remark;
            db.addUdpNode(cluster_id, address, port, remark, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 删除通信节点
exports.deleteUdpNode = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var result;
            var cluster_id = parseInt(req.params.cluster_id);
            var address = req.body.address;
            var port = req.body.port;
            db.deleteUdpNode(cluster_id, address, port, function(row){
                if(row == 0){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    }
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK  //0 成功 >0 失败
                    }
                }
                res.send(result);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};