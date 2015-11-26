/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-2-11
 * Time: 下午10:27
 * To change this template use File | Settings | File Templates.
 */
var util = require("./myutil.js");
var http = require("http");
var url = require("url");
var querystring = require("querystring");
var crypto = require('crypto');
var fs = require('fs');

var api_url = "http://wappaygw.alipay.com/service/rest.htm";
var regexTokenXml = /<request_token>(.*)<\/request_token>/;
var pid = "2088301535733532";
var ali_key = "5nhfqh3rwz8civcuqjanja1xae6nouqn";
var public_key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnxj/9qwVfgoUh/y2W89L6BkRAFljhNhgPdyPuBV64bfQNN1PjbCzkIM6qRdKBoLPXmKKMiFYnkd6rAoprih3/PrQEB/VsW8OoM8fxn67UDYuyBTqA23MML9q1+ilIZwBC2AQ2UBVOrFXfFl75p6/B5KsiNG9zpgmLCUYuLkxpLQIDAQAB";
var private_key = "MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAK2Xfan7GqXxA7guJBTV6Rn4yyBYHGgzJ30dqHSaxyG2OKzu3LUM5rbqJKU03fQWzn6AItv8hcVFGP2Q9RAPL9G9nuBR+56dGnQJ5398HiOZO2u/kvsP8sT0CXeBCFNj9K9Gak4sjJfHOkNF5azxlcsnGfNV6abZaMIntk5V0BqXAgMBAAECgYA+D3jnulQum1nfEO/pWwh5No84Qwf04MTvYBkHhwZGMSVV/hd9ytz47ACp55qqVzT/2MOdrkwM2MU0cgyK70MCvC+mLHi7OAx0SHrMxBm5f9/+zDAUqGECiVZfPQwSVTxrWZKgvU1QLMvrXs8Je9LMvVwY4Up0CLu0OIrXH90XcQJBAN+VcqFQUOocFtsu//BjVyGAcsNc2iyXi6EnHkUST/hca+Zp5AMyx7m02PdTHon35pm0rK0G72rfhQJFnT0x++UCQQDGwokdC/tJGc6QY4XUVvAc+7EcY+v07eMA1zKVdCxx1hlPMopfZBxhvS46F6fU2nuuZ8O6LZcInqTKBTQuOizLAkAc9tVUxHzW9zCW0G3jjFr7QhKb8GlrIW67P8ASHp8xg3eO7+TT7T4mdqEs2R25rd23x8oe2Ckn5TDr7GzEQrdpAkAcyYg6YMXgbJBycTes7XqReBLK3d4K93ltYb29z7mwMyYvRk6sSj+iGFhdqZdxSMOpGvZKPNgnM3MCn4ZTO7HJAkAEWIo6E3890i3aBkCb4zWboKEvWM4a6Il4Zr5YyV8Hnezr9gRCQqZTFtA8w0foPHl3wPwBtxiajl4cGwxHyXf7";
exports.key = ali_key;

exports.alipay_account = "thomas@wisegps.cn";
exports.call_back_url = "http://wiwc.api.wisegps.cn/pay/callback";
exports.notify_url = "http://wiwc.api.wisegps.cn/pay/notify";
exports.merchant_url = "http://wiwc.api.wisegps.cn/pay/cancel";

var services =  {
   create: "alipay.wap.trade.create.direct",
   auth: "alipay.wap.auth.authAndExecute"
};
exports.services = services;

exports.toReqData = function(name, obj){
    var arr = [];
    arr.push("<" + name + ">");
    for(var k in obj){
        arr.push("<" + k + ">" + obj[k] + "</" + k + ">");
    }
    arr.push("</" + name + ">");
    return arr.join("");
};

var createReq = function(service,req_data){
    return {
        service : service,
        format  : 'xml',
        v       : '2.0',
        partner : pid,
        sec_id  : 'MD5',
        sign    : null,
        req_data: req_data
    };
};
exports.createReq = createReq;

exports.parseTokenFromXml = function(xml){
    if(!xml){
        return null
    }else{
        m = regexTokenXml.exec(xml);
        return m[1].trim();
    }
};

var getSign = function(obj, key){
    if(!obj){
        return null
    }else{
        var arr = [];
        for(var k in obj){
            if(k != "sign" && k != "sign_type" && obj[k] != ""){
                arr.push([k, obj[k]]);
            }
        }
        arr.sort();
        var src = "";
        for(var i in arr){
            src += arr[i][0] + "=" + arr[i][1] + "&";
        }
        src = src.substr(0, src.length - 1);
        src += key;
        src = util.md5(src);
        return src;
    }
};
exports.getSign = getSign;

exports.getNotitySign = function(obj, key){
    if(!obj){
        return null
    }else{
        var src = "";
        src += "service=" + obj.service + "&v=" + obj.v + "&sec_id=" + obj.sec_id + "&notify_data=" + obj.notify_data;
        src += key;
        src = util.md5(src);
        return src;
    }
};

exports.checkRsaSign = function(obj){
    var valid = false;
    var arr = [];
    for(var k in obj){
        if(k != "sign" && k != "sign_type" && obj[k] != ""){
            arr.push([k, obj[k]]);
        }
    }
    arr.sort();
    var src = "";
    for(var i in arr){
        src += arr[i][0] + "=" + arr[i][1] + "&";
    }
    src = src.substr(0, src.length - 1);
    //var rsa_private_key = fs.readFileSync('rsa_private_key.pem');
    //var rsa_public_key = fs.readFileSync('rsa_public_key.pem');

//    var verify = crypto.createVerify('RSA-SHA1');
//    verify.update(src, "utf-8");
//    valid = verify.verify(public_key, obj.sign, 'base64');
//    return valid;
    return true;
};

exports.getRsaSign = function(content){
    var rsa_private_key = fs.readFileSync('rsa_private_key.pem');

    var signer = crypto.createSign('RSA-SHA1');
    signer.update(content);
    var sign = signer.sign(rsa_private_key, "base64");
    return sign;
};

exports.sendCreate = function(req, callback){
    var file_url = createCreateUrl(req);
    try{
        var options = {
            host: url.parse(file_url).hostname,
            port: 80,
            path: url.parse(file_url).path,
            method:'GET'
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function(data) {
                responseString += data;
            });
            res.on('end', function() {
                if(callback){
                    var ret = querystring.parse(responseString);
                    callback(null, ret);
                }
            });
        });

        req.on('error', function(e) {
            // TODO: handle error.
            if(callback){
                callback(e);
            }
        });
        // write data to request body
        //req.write(post_data);
        req.end();
    }catch(e){
        if(callback){
            callback(e);
        }
    }
};

exports.createAuthUrl = function(token, key){
    var req = createReq(services.auth, null);
    req.req_data = "<auth_and_execute_req><request_token>" + token + "</request_token></auth_and_execute_req>";
    req.sign = getSign(req, key);
    return createAuthUrl(req);
};

var createCreateUrl = function(req){
    var url = api_url + "?";
    url += "req_data=" + encodeURIComponent(req.req_data);
    url += "&service=" + encodeURIComponent(req.service);
    url += "&sec_id=" + encodeURIComponent(req.sec_id);
    url += "&partner=" + encodeURIComponent(req.partner);
    url += "&req_id=" + encodeURIComponent(req.req_id);
    url += "&sign=" + encodeURIComponent(req.sign);
    url += "&format=" + encodeURIComponent(req.format);
    url += "&v=" + encodeURIComponent(req.v);
    return url;
};

var createAuthUrl = function(req){
    var url = api_url + "?";
    url += "req_data=" + encodeURIComponent(req.req_data);
    url += "&service=" + encodeURIComponent(req.service);
    url += "&sec_id=" + encodeURIComponent(req.sec_id);
    url += "&partner=" + encodeURIComponent(req.partner);
    url += "&sign=" + encodeURIComponent(req.sign);
    url += "&format=" + encodeURIComponent(req.format);
    url += "&v=" + encodeURIComponent(req.v);
    return url;
};