/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-29
 * Time: 下午4:58
 * 违章处理模块
 */
var db = require("../lib/db.js");
var util = require("../lib/myutil.js");
var define = require("../lib/define.js");
var http = require("http");
var step = require("step");
var async = require('async');
//var Wind = require("wind");

//var getVehicleById = Wind.Async.Binding.fromCallback(db.getVehicleById);
//var updateVehicleLastQuery = Wind.Async.Binding.fromCallback(db.updateVehicleLastQuery);
//var addViolation = Wind.Async.Binding.fromCallback(db.addViolation);
//var updateViolocation = Wind.Async.Binding.fromCallback(db.updateViolocation);
//var getViolationList = Wind.Async.Binding.fromCallback(db.getViolationList);
//var getViolation = Wind.Async.Binding.fromCallback(util.getViolation);

// 获取违章查询城市及需要的资料
function _getVioCity(callback){
    try{
        // http://v.juhe.cn/wz/citys?key=8b596b7292f44285b3aa279a9c72fc7a
        var path = '/wz/citys?key=8b596b7292f44285b3aa279a9c72fc7a';
        var options = {
            host:"v.juhe.cn",
            port:80,
            path:path,
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
                responseString = responseString.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
                var resultObject = JSON.parse(responseString);
                if(callback){
                    callback(resultObject);
                }
            });
        });

        req.on('error', function(e) {
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        req.end();
    }catch(e){
        var resultObject = {
            status_code: define.API_STATUS_EXCEPTION,
            content:e.toString()
        };
        if(callback){
            callback(resultObject);
        }
    }
}

function _getVioCity2(callback){
    var vio_citys =
    {"dataversion": 1419224684035, "status": 1, "statusmsg": "success", "paramname": "province", "title": "选择城市", "option": [
        {"value": "1-010100-0", "text": "北京", "abbreviation": "京", "isopen": 0},
        {"value": "2-010100-0", "text": "上海", "abbreviation": "沪", "isopen": 0},
        {"value": "37-010006-0", "text": "重庆", "abbreviation": "渝", "isopen": 0},
        {"value": "50001-010004-0", "text": "河北", "abbreviation": "冀", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "241-010001-0", "text": "石家庄", "abbreviation": "冀", "isopen": 0},
            {"value": "424-010001-0", "text": "保定", "abbreviation": "冀", "isopen": 0},
            {"value": "652-010001-0", "text": "沧州", "abbreviation": "冀", "isopen": 0},
            {"value": "6760-010001-0", "text": "承德", "abbreviation": "冀", "isopen": 0},
            {"value": "8398-010004-0", "text": "定州", "abbreviation": "冀", "isopen": 0},
            {"value": "8706-010004-0", "text": "馆陶", "abbreviation": "冀", "isopen": 0},
            {"value": "572-010001-0", "text": "邯郸", "abbreviation": "冀", "isopen": 0},
            {"value": "993-010001-0", "text": "衡水", "abbreviation": "冀", "isopen": 0},
            {"value": "772-010001-0", "text": "廊坊", "abbreviation": "冀", "isopen": 0},
            {"value": "1078-010001-0", "text": "秦皇岛", "abbreviation": "冀", "isopen": 0},
            {"value": "276-010001-0", "text": "唐山", "abbreviation": "冀", "isopen": 0},
            {"value": "751-010001-0", "text": "邢台", "abbreviation": "冀", "isopen": 0},
            {"value": "3198-010004-0", "text": "正定", "abbreviation": "冀", "isopen": 0},
            {"value": "11201-010004-0", "text": "张北", "abbreviation": "冀", "isopen": 0},
            {"value": "3328-010001-0", "text": "张家口", "abbreviation": "冀", "isopen": 0},
            {"value": "9048-010004-0", "text": "赵县", "abbreviation": "冀", "isopen": 0}
        ]},
        {"value": "50002-010006-0", "text": "山西", "abbreviation": "晋", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "740-010001-0", "text": "太原", "abbreviation": "晋", "isopen": 0},
            {"value": "6921-010001-0", "text": "长治", "abbreviation": "晋", "isopen": 0},
            {"value": "6964-010001-0", "text": "大同", "abbreviation": "晋", "isopen": 0},
            {"value": "3350-010001-0", "text": "晋城", "abbreviation": "晋", "isopen": 0},
            {"value": "8854-010001-0", "text": "晋中", "abbreviation": "晋", "isopen": 0},
            {"value": "5669-010001-0", "text": "临汾", "abbreviation": "晋", "isopen": 0},
            {"value": "9193-010006-0", "text": "临猗", "abbreviation": "晋", "isopen": 0},
            {"value": "3222-010001-0", "text": "吕梁", "abbreviation": "晋", "isopen": 0},
            {"value": "9871-010001-0", "text": "朔州", "abbreviation": "晋", "isopen": 0},
            {"value": "3453-010001-0", "text": "忻州", "abbreviation": "晋", "isopen": 0},
            {"value": "8760-010001-0", "text": "阳泉", "abbreviation": "晋", "isopen": 0},
            {"value": "5653-010001-0", "text": "运城", "abbreviation": "晋", "isopen": 0}
        ]},
        {"value": "50003-010006-0", "text": "内蒙古自治区", "abbreviation": "蒙", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "811-010101-0", "text": "呼和浩特", "abbreviation": "蒙", "isopen": 0},
            {"value": "10083-010101-0", "text": "阿拉善盟", "abbreviation": "蒙", "isopen": 0},
            {"value": "801-010101-0", "text": "包头", "abbreviation": "蒙", "isopen": 0},
            {"value": "10070-010101-0", "text": "巴彦淖尔", "abbreviation": "蒙", "isopen": 0},
            {"value": "6700-010101-0", "text": "赤峰", "abbreviation": "蒙", "isopen": 0},
            {"value": "2037-010001-0", "text": "鄂尔多斯", "abbreviation": "蒙", "isopen": 0},
            {"value": "10039-010101-0", "text": "呼伦贝尔", "abbreviation": "蒙", "isopen": 0},
            {"value": "2043-010106-0", "text": "海拉尔", "abbreviation": "蒙", "isopen": 0},
            {"value": "10015-010101-0", "text": "通辽", "abbreviation": "蒙", "isopen": 0},
            {"value": "9993-010101-0", "text": "乌兰察布", "abbreviation": "蒙", "isopen": 0},
            {"value": "2404-010101-0", "text": "乌海", "abbreviation": "蒙", "isopen": 0},
            {"value": "9976-010101-0", "text": "兴安盟", "abbreviation": "蒙", "isopen": 0},
            {"value": "2408-010101-0", "text": "锡林郭勒盟", "abbreviation": "蒙", "isopen": 0}
        ]},
        {"value": "50004--0", "text": "辽宁", "abbreviation": "辽", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "188-010001-0", "text": "沈阳", "abbreviation": "辽", "isopen": 0},
            {"value": "523-010001-0", "text": "鞍山", "abbreviation": "辽", "isopen": 0},
            {"value": "5845-010004-0", "text": "本溪", "abbreviation": "辽", "isopen": 0},
            {"value": "10106-010000-0", "text": "朝阳", "abbreviation": "辽", "isopen": 0},
            {"value": "3445-010304-0", "text": "丹东", "abbreviation": "辽", "isopen": 0},
            {"value": "147-010001-0", "text": "大连", "abbreviation": "辽", "isopen": 0},
            {"value": "5722-010001-0", "text": "抚顺", "abbreviation": "辽", "isopen": 0},
            {"value": "10097-010100-0", "text": "阜新", "abbreviation": "辽", "isopen": 0},
            {"value": "10088-010001-0", "text": "葫芦岛", "abbreviation": "辽", "isopen": 0},
            {"value": "2354-010006-0", "text": "锦州", "abbreviation": "辽", "isopen": 0},
            {"value": "2038-010001-0", "text": "辽阳", "abbreviation": "辽", "isopen": 0},
            {"value": "2041-010004-0", "text": "盘锦", "abbreviation": "辽", "isopen": 0},
            {"value": "3306-010001-0", "text": "庄河", "abbreviation": "辽", "isopen": 0},
            {"value": "6729-010000-0", "text": "铁岭", "abbreviation": "辽", "isopen": 0},
            {"value": "3279-010001-0", "text": "瓦房店", "abbreviation": "辽", "isopen": 0},
            {"value": "5898-010001-0", "text": "营口", "abbreviation": "辽", "isopen": 0}
        ]},
        {"value": "50027-010004-0", "text": "吉林", "abbreviation": "吉", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "319-010001-0", "text": "长春", "abbreviation": "吉", "isopen": 0},
            {"value": "10179-010001-0", "text": "白山", "abbreviation": "吉", "isopen": 0},
            {"value": "5918-010001-0", "text": "白城", "abbreviation": "吉", "isopen": 0},
            {"value": "700-010001-0", "text": "吉林", "abbreviation": "吉", "isopen": 0},
            {"value": "2501-010001-0", "text": "辽源", "abbreviation": "吉", "isopen": 0},
            {"value": "2315-010001-0", "text": "松原", "abbreviation": "吉", "isopen": 0},
            {"value": "10171-010001-0", "text": "四平", "abbreviation": "吉", "isopen": 0},
            {"value": "10159-010001-0", "text": "通化", "abbreviation": "吉", "isopen": 0},
            {"value": "3184-010001-0", "text": "延边", "abbreviation": "吉", "isopen": 0}
        ]},
        {"value": "50005--0", "text": "黑龙江", "abbreviation": "黑", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "202-010001-0", "text": "哈尔滨", "abbreviation": "黑", "isopen": 0},
            {"value": "375-010001-0", "text": "大庆", "abbreviation": "黑", "isopen": 0},
            {"value": "9878-010001-0", "text": "大兴安岭", "abbreviation": "黑", "isopen": 0},
            {"value": "9061-010001-0", "text": "鹤岗", "abbreviation": "黑", "isopen": 0},
            {"value": "9862-010001-0", "text": "黑河", "abbreviation": "黑", "isopen": 0},
            {"value": "7289-010001-0", "text": "鸡西", "abbreviation": "黑", "isopen": 0},
            {"value": "6776-010001-0", "text": "佳木斯", "abbreviation": "黑", "isopen": 0},
            {"value": "3489-010001-0", "text": "牡丹江", "abbreviation": "黑", "isopen": 0},
            {"value": "5853-010001-0", "text": "齐齐哈尔", "abbreviation": "黑", "isopen": 0},
            {"value": "9848-010001-0", "text": "七台河", "abbreviation": "黑", "isopen": 0},
            {"value": "6718-010001-0", "text": "绥化", "abbreviation": "黑", "isopen": 0},
            {"value": "9837-010001-0", "text": "双鸭山", "abbreviation": "黑", "isopen": 0},
            {"value": "9773-010001-0", "text": "伊春", "abbreviation": "黑", "isopen": 0}
        ]},
        {"value": "50006--0", "text": "江苏", "abbreviation": "苏", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "172-010100-0", "text": "南京", "abbreviation": "苏", "isopen": 0},
            {"value": "463-010100-0", "text": "常州", "abbreviation": "苏", "isopen": 0},
            {"value": "11279-010100-0", "text": "大丰", "abbreviation": "苏", "isopen": 0},
            {"value": "968-010600-0", "text": "淮安", "abbreviation": "苏", "isopen": 0},
            {"value": "2049-010100-0", "text": "连云港", "abbreviation": "苏", "isopen": 0},
            {"value": "394-010100-0", "text": "南通", "abbreviation": "苏", "isopen": 0},
            {"value": "5772-010600-0", "text": "沭阳", "abbreviation": "苏", "isopen": 0},
            {"value": "5-010601-0", "text": "苏州", "abbreviation": "苏", "isopen": 0},
            {"value": "2350-010600-0", "text": "宿迁", "abbreviation": "苏", "isopen": 0},
            {"value": "693-010600-0", "text": "泰州", "abbreviation": "苏", "isopen": 0},
            {"value": "93-010600-0", "text": "无锡", "abbreviation": "苏", "isopen": 0},
            {"value": "471-010100-0", "text": "徐州", "abbreviation": "苏", "isopen": 0},
            {"value": "613-010100-0", "text": "盐城", "abbreviation": "苏", "isopen": 0},
            {"value": "637-010601-0", "text": "扬州", "abbreviation": "苏", "isopen": 0},
            {"value": "645-010601-0", "text": "镇江", "abbreviation": "苏", "isopen": 0}
        ]},
        {"value": "50007-010006-0", "text": "浙江", "abbreviation": "浙", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "79-010001-0", "text": "杭州", "abbreviation": "浙", "isopen": 0},
            {"value": "831-010001-0", "text": "湖州", "abbreviation": "浙", "isopen": 0},
            {"value": "531-010001-0", "text": "金华", "abbreviation": "浙", "isopen": 0},
            {"value": "497-010101-0", "text": "嘉兴", "abbreviation": "浙", "isopen": 0},
            {"value": "7921-010006-0", "text": "丽水", "abbreviation": "浙", "isopen": 0},
            {"value": "135-010001-0", "text": "宁波", "abbreviation": "浙", "isopen": 0},
            {"value": "6793-010006-0", "text": "衢州", "abbreviation": "浙", "isopen": 0},
            {"value": "13951-010006-0", "text": "瑞安", "abbreviation": "浙", "isopen": 0},
            {"value": "355-010001-0", "text": "绍兴", "abbreviation": "浙", "isopen": 0},
            {"value": "403-010001-0", "text": "台州", "abbreviation": "浙", "isopen": 0},
            {"value": "330-010006-0", "text": "温州", "abbreviation": "浙", "isopen": 0},
            {"value": "12291-010006-0", "text": "义乌", "abbreviation": "浙", "isopen": 0},
            {"value": "13950-010006-0", "text": "乐清", "abbreviation": "浙", "isopen": 0},
            {"value": "8481-010001-0", "text": "舟山", "abbreviation": "浙", "isopen": 0}
        ]},
        {"value": "50008-010006-0", "text": "安徽", "abbreviation": "皖", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "837-010001-0", "text": "合肥", "abbreviation": "皖", "isopen": 0},
            {"value": "3251-010001-0", "text": "安庆", "abbreviation": "皖", "isopen": 0},
            {"value": "3470-010001-0", "text": "蚌埠", "abbreviation": "皖", "isopen": 0},
            {"value": "2329-010001-0", "text": "亳州", "abbreviation": "皖", "isopen": 0},
            {"value": "10229-010001-0", "text": "巢湖", "abbreviation": "皖", "isopen": 0},
            {"value": "10260-010001-0", "text": "池州", "abbreviation": "皖", "isopen": 0},
            {"value": "10266-010001-0", "text": "滁州", "abbreviation": "皖", "isopen": 0},
            {"value": "2325-010001-0", "text": "阜阳", "abbreviation": "皖", "isopen": 0},
            {"value": "10892-010006-0", "text": "和县", "abbreviation": "皖", "isopen": 0},
            {"value": "2319-010001-0", "text": "淮南", "abbreviation": "皖", "isopen": 0},
            {"value": "11226-010006-0", "text": "霍邱", "abbreviation": "皖", "isopen": 0},
            {"value": "9357-010001-0", "text": "淮北", "abbreviation": "皖", "isopen": 0},
            {"value": "2323-010001-0", "text": "黄山", "abbreviation": "皖", "isopen": 0},
            {"value": "2328-010001-0", "text": "六安", "abbreviation": "皖", "isopen": 0},
            {"value": "2039-010001-0", "text": "马鞍山", "abbreviation": "皖", "isopen": 0},
            {"value": "3359-010001-0", "text": "宿州", "abbreviation": "皖", "isopen": 0},
            {"value": "11296-010001-0", "text": "桐城", "abbreviation": "皖", "isopen": 0},
            {"value": "10285-010001-0", "text": "铜陵", "abbreviation": "皖", "isopen": 0},
            {"value": "2045-010001-0", "text": "芜湖", "abbreviation": "皖", "isopen": 0},
            {"value": "5633-010001-0", "text": "宣城", "abbreviation": "皖", "isopen": 0}
        ]},
        {"value": "50009--0", "text": "福建", "abbreviation": "闽", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "304-010001-0", "text": "福州", "abbreviation": "闽", "isopen": 0},
            {"value": "6752-010004-0", "text": "龙岩", "abbreviation": "闽", "isopen": 0},
            {"value": "7951-010004-0", "text": "宁德", "abbreviation": "闽", "isopen": 0},
            {"value": "10291-010004-0", "text": "南平", "abbreviation": "闽", "isopen": 0},
            {"value": "2429-010004-0", "text": "莆田", "abbreviation": "闽", "isopen": 0},
            {"value": "291-010004-0", "text": "泉州", "abbreviation": "闽", "isopen": 0},
            {"value": "2048-010004-0", "text": "三明", "abbreviation": "闽", "isopen": 0},
            {"value": "10761-010004-0", "text": "武夷山", "abbreviation": "闽", "isopen": 0},
            {"value": "606-010001-0", "text": "厦门", "abbreviation": "闽", "isopen": 0},
            {"value": "710-010004-0", "text": "漳州", "abbreviation": "闽", "isopen": 0}
        ]},
        {"value": "50010--0", "text": "江西", "abbreviation": "赣", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "669-010006-0", "text": "南昌", "abbreviation": "赣", "isopen": 0},
            {"value": "10134-010006-0", "text": "抚州", "abbreviation": "赣", "isopen": 0},
            {"value": "2363-010006-0", "text": "赣州", "abbreviation": "赣", "isopen": 0},
            {"value": "2364-010006-0", "text": "吉安", "abbreviation": "赣", "isopen": 0},
            {"value": "2360-010006-0", "text": "景德镇", "abbreviation": "赣", "isopen": 0},
            {"value": "2247-010006-0", "text": "九江", "abbreviation": "赣", "isopen": 0},
            {"value": "2248-010006-0", "text": "萍乡", "abbreviation": "赣", "isopen": 0},
            {"value": "10120-010006-0", "text": "上饶", "abbreviation": "赣", "isopen": 0},
            {"value": "10115-010006-0", "text": "新余", "abbreviation": "赣", "isopen": 0},
            {"value": "5709-010006-0", "text": "宜春", "abbreviation": "赣", "isopen": 0},
            {"value": "3209-010006-0", "text": "鹰潭", "abbreviation": "赣", "isopen": 0},
            {"value": "11077-010006-0", "text": "永新", "abbreviation": "赣", "isopen": 0}
        ]},
        {"value": "50011--0", "text": "山东", "abbreviation": "鲁", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "265-010001-0", "text": "济南", "abbreviation": "鲁", "isopen": 0},
            {"value": "944-010001-0", "text": "滨州", "abbreviation": "鲁", "isopen": 0},
            {"value": "623-010001-0", "text": "东营", "abbreviation": "鲁", "isopen": 0},
            {"value": "728-010001-0", "text": "德州", "abbreviation": "鲁", "isopen": 0},
            {"value": "5632-010001-0", "text": "菏泽", "abbreviation": "鲁", "isopen": 0},
            {"value": "450-010001-0", "text": "济宁", "abbreviation": "鲁", "isopen": 0},
            {"value": "11313-010006-0", "text": "垦利", "abbreviation": "鲁", "isopen": 0},
            {"value": "882-010001-0", "text": "聊城", "abbreviation": "鲁", "isopen": 0},
            {"value": "505-010001-0", "text": "临沂", "abbreviation": "鲁", "isopen": 0},
            {"value": "2292-010001-0", "text": "莱芜", "abbreviation": "鲁", "isopen": 0},
            {"value": "122-010001-0", "text": "青岛", "abbreviation": "鲁", "isopen": 0},
            {"value": "3177-010001-0", "text": "日照", "abbreviation": "鲁", "isopen": 0},
            {"value": "686-010001-0", "text": "泰安", "abbreviation": "鲁", "isopen": 0},
            {"value": "518-010001-0", "text": "威海", "abbreviation": "鲁", "isopen": 0},
            {"value": "362-010001-0", "text": "潍坊", "abbreviation": "鲁", "isopen": 0},
            {"value": "228-010001-0", "text": "烟台", "abbreviation": "鲁", "isopen": 0},
            {"value": "961-010001-0", "text": "枣庄", "abbreviation": "鲁", "isopen": 0},
            {"value": "385-010001-0", "text": "淄博", "abbreviation": "鲁", "isopen": 0},
            {"value": "9146-010001-0", "text": "诸城", "abbreviation": "鲁", "isopen": 0},
            {"value": "8680-010001-0", "text": "章丘", "abbreviation": "鲁", "isopen": 0}
        ]},
        {"value": "50012--0", "text": "河南", "abbreviation": "豫", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "342-010001-0", "text": "郑州", "abbreviation": "豫", "isopen": 0},
            {"value": "1096-010106-0", "text": "安阳", "abbreviation": "豫", "isopen": 0},
            {"value": "9344-010006-0", "text": "长葛", "abbreviation": "豫", "isopen": 0},
            {"value": "2344-010001-0", "text": "鹤壁", "abbreviation": "豫", "isopen": 0},
            {"value": "3266-010001-0", "text": "焦作", "abbreviation": "豫", "isopen": 0},
            {"value": "9918-010001-0", "text": "济源", "abbreviation": "豫", "isopen": 0},
            {"value": "2342-010101-0", "text": "开封", "abbreviation": "豫", "isopen": 0},
            {"value": "2347-010006-0", "text": "漯河", "abbreviation": "豫", "isopen": 0},
            {"value": "556-010106-0", "text": "洛阳", "abbreviation": "豫", "isopen": 0},
            {"value": "8541-010006-0", "text": "明港", "abbreviation": "豫", "isopen": 0},
            {"value": "592-010001-0", "text": "南阳", "abbreviation": "豫", "isopen": 0},
            {"value": "1005-010001-0", "text": "平顶山", "abbreviation": "豫", "isopen": 0},
            {"value": "2346-010006-0", "text": "濮阳", "abbreviation": "豫", "isopen": 0},
            {"value": "9317-010001-0", "text": "三门峡", "abbreviation": "豫", "isopen": 0},
            {"value": "1029-010001-0", "text": "商丘", "abbreviation": "豫", "isopen": 0},
            {"value": "977-010006-0", "text": "许昌", "abbreviation": "豫", "isopen": 0},
            {"value": "1016-010001-0", "text": "新乡", "abbreviation": "豫", "isopen": 0},
            {"value": "8694-010006-0", "text": "信阳", "abbreviation": "豫", "isopen": 0},
            {"value": "9123-010006-0", "text": "鄢陵", "abbreviation": "豫", "isopen": 0},
            {"value": "979-010006-0", "text": "禹州", "abbreviation": "豫", "isopen": 0},
            {"value": "933-010001-0", "text": "周口", "abbreviation": "豫", "isopen": 0},
            {"value": "1067-010001-0", "text": "驻马店", "abbreviation": "豫", "isopen": 0}
        ]},
        {"value": "50013-010005-0", "text": "湖北", "abbreviation": "鄂", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "158-010001-0", "text": "武汉", "abbreviation": "鄂", "isopen": 0},
            {"value": "2302-010001-0", "text": "恩施", "abbreviation": "鄂", "isopen": 0},
            {"value": "9709-010001-0", "text": "鄂州", "abbreviation": "鄂", "isopen": 0},
            {"value": "2299-010001-0", "text": "黄冈", "abbreviation": "鄂", "isopen": 0},
            {"value": "1734-010001-0", "text": "黄石", "abbreviation": "鄂", "isopen": 0},
            {"value": "2296-010001-0", "text": "荆门", "abbreviation": "鄂", "isopen": 0},
            {"value": "3479-010001-0", "text": "荆州", "abbreviation": "鄂", "isopen": 0},
            {"value": "9669-010005-0", "text": "潜江", "abbreviation": "鄂", "isopen": 0},
            {"value": "2032-010001-0", "text": "十堰", "abbreviation": "鄂", "isopen": 0},
            {"value": "9605-010005-0", "text": "神农架", "abbreviation": "鄂", "isopen": 0},
            {"value": "9656-010001-0", "text": "随州", "abbreviation": "鄂", "isopen": 0},
            {"value": "9517-010005-0", "text": "天门", "abbreviation": "鄂", "isopen": 0},
            {"value": "891-010001-0", "text": "襄阳", "abbreviation": "鄂", "isopen": 0},
            {"value": "9617-010001-0", "text": "咸宁", "abbreviation": "鄂", "isopen": 0},
            {"value": "9736-010005-0", "text": "仙桃", "abbreviation": "鄂", "isopen": 0},
            {"value": "3434-010001-0", "text": "孝感", "abbreviation": "鄂", "isopen": 0},
            {"value": "858-010001-0", "text": "宜昌", "abbreviation": "鄂", "isopen": 0}
        ]},
        {"value": "50014--0", "text": "湖南", "abbreviation": "湘", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "10198-010401-0", "text": "益阳", "abbreviation": "湘", "isopen": 0},
            {"value": "1086-010100-0", "text": "株洲", "abbreviation": "湘", "isopen": 0}
        ]},
        {"value": "50015--0", "text": "广东", "abbreviation": "粤", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "3-010406-0", "text": "广州", "abbreviation": "粤", "isopen": 0},
            {"value": "4-010601-0", "text": "深圳", "abbreviation": "粤", "isopen": 0},
            {"value": "413-010606-0", "text": "东莞", "abbreviation": "粤", "isopen": 0},
            {"value": "10461-010606-0", "text": "潮州", "abbreviation": "粤", "isopen": 0},
            {"value": "222-010606-0", "text": "佛山", "abbreviation": "粤", "isopen": 0},
            {"value": "10467-010606-0", "text": "河源", "abbreviation": "粤", "isopen": 0},
            {"value": "722-010606-0", "text": "惠州", "abbreviation": "粤", "isopen": 0},
            {"value": "629-010606-0", "text": "江门", "abbreviation": "粤", "isopen": 0},
            {"value": "927-010606-0", "text": "揭阳", "abbreviation": "粤", "isopen": 0},
            {"value": "679-010606-0", "text": "茂名", "abbreviation": "粤", "isopen": 0},
            {"value": "9389-010606-0", "text": "梅州", "abbreviation": "粤", "isopen": 0},
            {"value": "7303-010606-0", "text": "清远", "abbreviation": "粤", "isopen": 0},
            {"value": "8716-010606-0", "text": "顺德", "abbreviation": "粤", "isopen": 0},
            {"value": "2192-010606-0", "text": "韶关", "abbreviation": "粤", "isopen": 0},
            {"value": "783-010606-0", "text": "汕头", "abbreviation": "粤", "isopen": 0},
            {"value": "9449-010606-0", "text": "汕尾", "abbreviation": "粤", "isopen": 0},
            {"value": "11263-010606-0", "text": "台山", "abbreviation": "粤", "isopen": 0},
            {"value": "8566-010606-0", "text": "阳春", "abbreviation": "粤", "isopen": 0},
            {"value": "10485-010606-0", "text": "云浮", "abbreviation": "粤", "isopen": 0},
            {"value": "2284-010606-0", "text": "阳江", "abbreviation": "粤", "isopen": 0},
            {"value": "910-010106-0", "text": "珠海", "abbreviation": "粤", "isopen": 0},
            {"value": "791-010606-0", "text": "湛江", "abbreviation": "粤", "isopen": 0},
            {"value": "901-010106-0", "text": "肇庆", "abbreviation": "粤", "isopen": 0},
            {"value": "771-010601-0", "text": "中山", "abbreviation": "粤", "isopen": 0}
        ]},
        {"value": "50026-010004-0", "text": "海南", "abbreviation": "琼", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "2053-010001-0", "text": "海口", "abbreviation": "琼", "isopen": 0},
            {"value": "10380-010004-0", "text": "白沙", "abbreviation": "琼", "isopen": 0},
            {"value": "10367-010004-0", "text": "保亭", "abbreviation": "琼", "isopen": 0},
            {"value": "10353-010004-0", "text": "昌江", "abbreviation": "琼", "isopen": 0},
            {"value": "10331-010004-0", "text": "澄迈", "abbreviation": "琼", "isopen": 0},
            {"value": "10303-010004-0", "text": "定安", "abbreviation": "琼", "isopen": 0},
            {"value": "10250-010004-0", "text": "东方", "abbreviation": "琼", "isopen": 0},
            {"value": "10236-010004-0", "text": "乐东", "abbreviation": "琼", "isopen": 0},
            {"value": "10206-010004-0", "text": "临高", "abbreviation": "琼", "isopen": 0},
            {"value": "10184-010004-0", "text": "陵水", "abbreviation": "琼", "isopen": 0},
            {"value": "10136-010004-0", "text": "琼海", "abbreviation": "琼", "isopen": 0},
            {"value": "10064-010004-0", "text": "琼中", "abbreviation": "琼", "isopen": 0},
            {"value": "13722-010001-0", "text": "三沙", "abbreviation": "琼", "isopen": 0},
            {"value": "2422-010001-0", "text": "三亚", "abbreviation": "琼", "isopen": 0},
            {"value": "10394-010004-0", "text": "儋州", "abbreviation": "琼", "isopen": 0},
            {"value": "10044-010004-0", "text": "屯昌", "abbreviation": "琼", "isopen": 0},
            {"value": "10022-010004-0", "text": "万宁", "abbreviation": "琼", "isopen": 0},
            {"value": "9984-010004-0", "text": "文昌", "abbreviation": "琼", "isopen": 0},
            {"value": "9952-010004-0", "text": "五指山", "abbreviation": "琼", "isopen": 0}
        ]},
        {"value": "50017--0", "text": "四川", "abbreviation": "川", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "102-010001-0", "text": "成都", "abbreviation": "川", "isopen": 0},
            {"value": "9799-010006-0", "text": "达州", "abbreviation": "川", "isopen": 0},
            {"value": "2372-010006-0", "text": "泸州", "abbreviation": "川", "isopen": 0}
        ]},
        {"value": "50018-010600-0", "text": "贵州", "abbreviation": "贵", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "2015-010100-0", "text": "贵阳", "abbreviation": "贵", "isopen": 0},
            {"value": "7468-010100-0", "text": "安顺", "abbreviation": "贵", "isopen": 0},
            {"value": "10564-010100-0", "text": "毕节", "abbreviation": "贵", "isopen": 0},
            {"value": "10506-010100-0", "text": "六盘水", "abbreviation": "贵", "isopen": 0},
            {"value": "9363-010100-0", "text": "黔东南", "abbreviation": "贵", "isopen": 0},
            {"value": "10492-010100-0", "text": "黔南", "abbreviation": "贵", "isopen": 0},
            {"value": "10434-010600-0", "text": "黔西南", "abbreviation": "贵", "isopen": 0},
            {"value": "10417-010100-0", "text": "铜仁", "abbreviation": "贵", "isopen": 0},
            {"value": "7620-010100-0", "text": "遵义", "abbreviation": "贵", "isopen": 0}
        ]},
        {"value": "50019-010004-0", "text": "云南", "abbreviation": "云", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "541-010401-0", "text": "昆明", "abbreviation": "云", "isopen": 0},
            {"value": "2397-010001-0", "text": "西双版纳", "abbreviation": "云", "isopen": 0},
            {"value": "2390-010001-0", "text": "保山", "abbreviation": "云", "isopen": 0},
            {"value": "2393-010001-0", "text": "楚雄", "abbreviation": "云", "isopen": 0},
            {"value": "2398-010001-0", "text": "大理", "abbreviation": "云", "isopen": 0},
            {"value": "9437-010001-0", "text": "德宏", "abbreviation": "云", "isopen": 0},
            {"value": "9432-010001-0", "text": "迪庆", "abbreviation": "云", "isopen": 0},
            {"value": "2394-010001-0", "text": "红河", "abbreviation": "云", "isopen": 0},
            {"value": "9422-010001-0", "text": "临沧", "abbreviation": "云", "isopen": 0},
            {"value": "2392-010001-0", "text": "丽江", "abbreviation": "云", "isopen": 0},
            {"value": "9462-010001-0", "text": "怒江", "abbreviation": "云", "isopen": 0},
            {"value": "9444-010001-0", "text": "普洱", "abbreviation": "云", "isopen": 0},
            {"value": "2389-010001-0", "text": "曲靖", "abbreviation": "云", "isopen": 0},
            {"value": "13801-010001-0", "text": "思茅", "abbreviation": "云", "isopen": 0},
            {"value": "2395-010001-0", "text": "文山", "abbreviation": "云", "isopen": 0},
            {"value": "2040-010001-0", "text": "玉溪", "abbreviation": "云", "isopen": 0},
            {"value": "9409-010001-0", "text": "昭通", "abbreviation": "云", "isopen": 0}
        ]},
        {"value": "50020--0", "text": "西藏", "abbreviation": "藏", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "9618-010001-0", "text": "那曲", "abbreviation": "藏", "isopen": 0}
        ]},
        {"value": "50021--0", "text": "陕西", "abbreviation": "陕", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "483-010100-0", "text": "西安", "abbreviation": "陕", "isopen": 0},
            {"value": "3157-010101-0", "text": "安康", "abbreviation": "陕", "isopen": 0},
            {"value": "2044-010101-0", "text": "宝鸡", "abbreviation": "陕", "isopen": 0},
            {"value": "3163-010100-0", "text": "汉中", "abbreviation": "陕", "isopen": 0},
            {"value": "9854-010100-0", "text": "商洛", "abbreviation": "陕", "isopen": 0},
            {"value": "9832-010101-0", "text": "铜川", "abbreviation": "陕", "isopen": 0},
            {"value": "5733-010101-0", "text": "渭南", "abbreviation": "陕", "isopen": 0},
            {"value": "7453-010101-0", "text": "咸阳", "abbreviation": "陕", "isopen": 0},
            {"value": "8973-010100-0", "text": "延安", "abbreviation": "陕", "isopen": 0},
            {"value": "5942-010100-0", "text": "榆林", "abbreviation": "陕", "isopen": 0}
        ]},
        {"value": "50022-010001-0", "text": "甘肃", "abbreviation": "甘", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "952-010001-0", "text": "兰州", "abbreviation": "甘", "isopen": 0},
            {"value": "10304-010001-0", "text": "白银", "abbreviation": "甘", "isopen": 0},
            {"value": "10322-010001-0", "text": "定西", "abbreviation": "甘", "isopen": 0},
            {"value": "10343-010001-0", "text": "甘南", "abbreviation": "甘", "isopen": 0},
            {"value": "7428-010001-0", "text": "金昌", "abbreviation": "甘", "isopen": 0},
            {"value": "10387-010001-0", "text": "酒泉", "abbreviation": "甘", "isopen": 0},
            {"value": "10362-010001-0", "text": "嘉峪关", "abbreviation": "甘", "isopen": 0},
            {"value": "7112-010001-0", "text": "临夏", "abbreviation": "甘", "isopen": 0},
            {"value": "10415-010001-0", "text": "陇南", "abbreviation": "甘", "isopen": 0},
            {"value": "7154-010001-0", "text": "平凉", "abbreviation": "甘", "isopen": 0},
            {"value": "10475-010001-0", "text": "庆阳", "abbreviation": "甘", "isopen": 0},
            {"value": "8601-010001-0", "text": "天水", "abbreviation": "甘", "isopen": 0},
            {"value": "10448-010001-0", "text": "武威", "abbreviation": "甘", "isopen": 0},
            {"value": "10454-010001-0", "text": "张掖", "abbreviation": "甘", "isopen": 0}
        ]},
        {"value": "50023--0", "text": "青海", "abbreviation": "青", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "2052-010001-0", "text": "西宁", "abbreviation": "青", "isopen": 0},
            {"value": "9936-010601-0", "text": "果洛藏族", "abbreviation": "青", "isopen": 0},
            {"value": "9917-010601-0", "text": "海北藏族", "abbreviation": "青", "isopen": 0},
            {"value": "9909-010601-0", "text": "海东", "abbreviation": "青", "isopen": 0},
            {"value": "10574-010601-0", "text": "海南藏族", "abbreviation": "青", "isopen": 0},
            {"value": "9896-010601-0", "text": "黄南藏族", "abbreviation": "青", "isopen": 0},
            {"value": "9902-010601-0", "text": "海西蒙古族藏族", "abbreviation": "青", "isopen": 0},
            {"value": "9888-010601-0", "text": "玉树藏族", "abbreviation": "青", "isopen": 0}
        ]},
        {"value": "50024-010006-0", "text": "宁夏", "abbreviation": "宁", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "2054-010001-0", "text": "银川", "abbreviation": "宁", "isopen": 0},
            {"value": "2421-010001-0", "text": "固原", "abbreviation": "宁", "isopen": 0},
            {"value": "9971-010001-0", "text": "石嘴山", "abbreviation": "宁", "isopen": 0},
            {"value": "9962-010001-0", "text": "吴忠", "abbreviation": "宁", "isopen": 0},
            {"value": "9951-010001-0", "text": "中卫", "abbreviation": "宁", "isopen": 0}
        ]},
        {"value": "50025-010004-0", "text": "新疆", "abbreviation": "新", "paramname": "xiaolei", "title": "选择城市", "isopen": 0, "option": [
            {"value": "984-010001-0", "text": "乌鲁木齐", "abbreviation": "新", "isopen": 0},
            {"value": "9499-010001-0", "text": "阿克苏", "abbreviation": "新", "isopen": 0},
            {"value": "9539-010006-0", "text": "阿拉尔", "abbreviation": "新", "isopen": 0},
            {"value": "13802-010001-0", "text": "阿勒泰", "abbreviation": "新", "isopen": 0},
            {"value": "9529-010001-0", "text": "博尔塔拉", "abbreviation": "新", "isopen": 0},
            {"value": "9530-010001-0", "text": "巴音郭楞", "abbreviation": "新", "isopen": 0},
            {"value": "8582-010001-0", "text": "昌吉", "abbreviation": "新", "isopen": 0},
            {"value": "7452-010001-0", "text": "哈密", "abbreviation": "新", "isopen": 0},
            {"value": "9489-010001-0", "text": "和田", "abbreviation": "新", "isopen": 0},
            {"value": "7168-010001-0", "text": "库尔勒", "abbreviation": "新", "isopen": 0},
            {"value": "2042-010001-0", "text": "克拉玛依", "abbreviation": "新", "isopen": 0},
            {"value": "9326-010001-0", "text": "喀什", "abbreviation": "新", "isopen": 0},
            {"value": "13804-010001-0", "text": "奎屯", "abbreviation": "新", "isopen": 0},
            {"value": "9519-010001-0", "text": "克孜勒苏", "abbreviation": "新", "isopen": 0},
            {"value": "9551-010006-0", "text": "石河子", "abbreviation": "新", "isopen": 0},
            {"value": "13803-010001-0", "text": "塔城", "abbreviation": "新", "isopen": 0},
            {"value": "9475-010001-0", "text": "吐鲁番", "abbreviation": "新", "isopen": 0},
            {"value": "9559-010006-0", "text": "图木舒克", "abbreviation": "新", "isopen": 0},
            {"value": "9562-010006-0", "text": "五家渠", "abbreviation": "新", "isopen": 0},
            {"value": "9472-010001-0", "text": "伊犁", "abbreviation": "新", "isopen": 0}
        ]}
    ]};
    callback(vio_citys);
}

// 获取交管局列表
exports.vioCity = function(req, res){
    _getVioCity(function(citys){
        res.send(citys);
    });
};

// 获取交管局列表
exports.vioCity2 = function(req, res){
    var city_new = {
        result: {

        }
    };
    var citys = [];
    var city = {};
    var values;
    _getVioCity2(function(docs){
        for(var i = 0; i < docs.option.length; i++){
            if(docs.option[i].option == undefined) {
                values = docs.option[i].value.split("-");
                city_new.result[docs.option[i].abbreviation] = {
                    "province": docs.option[i].text,
                    "citys": [
                        {
                            "city_name": docs.option[i].text,
                            "city_code": values[0],
                            "abbr": docs.option[i].abbreviation,
                            "engine": parseInt(values[1].substr(2, 2)) > 0 ? "1": "0",
                            "engineno": parseInt(values[1].substr(2, 2)).toString(),
                            "classa": parseInt(values[1].substr(4, 2)) > 0 ? "1": "0",
                            "class": parseInt(values[1].substr(4, 2)) > 0 ? "1": "0",
                            "classno": parseInt(values[1].substr(4, 2)).toString(),
                            "regist": "0",
                            "registno": "0"
                        }
                    ]
                };
            }else{
                citys = [];
                for(var j = 0; j < docs.option[i].option.length; j++){
                    values = docs.option[i].option[j].value.split("-");
                    city = {
                        "city_name": docs.option[i].option[j].text,
                        "city_code": values[0],
                        "abbr": docs.option[i].option[j].abbreviation,
                        "engine": parseInt(values[1].substr(2, 2)) > 0 ? "1": "0",
                        "engineno": parseInt(values[1].substr(2, 2)).toString(),
                        "classa": parseInt(values[1].substr(4, 2)) > 0 ? "1": "0",
                        "class": parseInt(values[1].substr(4, 2)) > 0 ? "1": "0",
                        "classno": parseInt(values[1].substr(4, 2)).toString(),
                        "regist": "0",
                        "registno": "0"
                    }
                    citys.push(city);
                }
                city_new.result[docs.option[i].abbreviation] = {
                    "province": docs.option[i].text,
                    "citys": citys
                };
            }
        }
        res.send(city_new);
    });
};

// 新增违章
exports.new = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //obj_name, vio_time, location, action, code, score, fine, department, status,
            var obj_name = req.body.obj_name;
            var vio_time = req.body.vio_time;
            var location = decodeURIComponent(req.body.location);
            var action = decodeURIComponent(req.body.action);
            var code = req.body.code;
            var fine = req.body.fine;
            var department = req.body.department;
            var status = req.body.status;
            db.addViolation(obj_name, vio_time, location, action, code, fine, department, status, function(err, vio_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "vio_id": vio_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 新增违章吐槽
exports.newComplain = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            //location, cust_name, content
            var location = decodeURIComponent(req.body.location);
            var cust_name = decodeURIComponent(req.body.cust_name);
            var content = decodeURIComponent(req.body.content);
            db.addViolationComplain(location, cust_name, content, function(err, complain_id){
                if(err){
                    result = {
                        "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
                    };
                }else{
                    result = {
                        "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                        "complain_id": complain_id
                    };
                }
                res.send(result);
            })
        }else{
            util.resSendNoRight(res);
        }
    });
};

// 查询违章吐槽
exports.listComplain = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var location = req.params.location;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }

            db.getViolationComplainList(location, min_id, max_id, function(docs){
                res.send(docs);
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};

//var listAsync = eval(Wind.compile("async", function(obj_id, max_id, min_id, res){
//    var vehicle = $await(getVehicleById(obj_id));
//    console.log(vehicle);
//    if (vehicle) {
//        // 判断是否已超过一天间隔，如果是同步违章数据
//        var query_date = vehicle.last_query;
//        query_date = new Date(Date.parse(query_date) + (86400000 * 1));
//        var now = new Date();
//        if (vehicle.last_query == undefined || now > query_date) {
//            // 更新最后查询时间
//            var row = $await(updateVehicleLastQuery(vehicle.obj_id, now));
//            if (row > 0) {
//                console.log("update vehicle last query data ok.");
//            }
//
//            //  同步违章
//            var vios = [];
//            for (var i = 0; i < vehicle.vio_citys.length; i++) {
//                var obj = $await(getViolation(vehicle.obj_name, vehicle.vio_citys[i].vio_location, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no));
//                console.log(obj);
//                vios.push(obj);
//                if(obj.resultcode == "200"){
//                    for (var j = 0; j < obj.result.lists.length; j++) {
//                        vio_time = new Date(obj.result.lists[j].date);
//                        var err = $await(addViolation(vehicle.obj_name, vio_time, obj.result.lists[j].area, obj.result.lists[j].act,
//                            obj.result.lists[j].code, obj.result.lists[j].fen, obj.result.lists[j].money, '',
//                            obj.result.lists[j].handled, vehicle.vio_citys[j].vio_city_name));
//                    }
//                }
//            }
//            console.log(vios);
//
//            var docs = $await(getViolationList(vehicle.obj_name, min_id, max_id));
//            console.log(docs);
//            for (var i = 0; i < docs.data.length; i++) {
//                var handled = true;
//                var time = new Date(docs.data[i].vio_time);
//                for (var j = 0; j < vios.length; j++) {
//                    if (vios[j].resultcode == "200") {
//                        for (var k = 0; i < vios[j].result.lists.length; k++) {
//                            vio_time = new Date(vios[j].result.lists[k].date);
//                            if (vios[j].result.lists[k].area == docs.data[i].location && vio_time == time) {
//                                handled = false;
//                            }
//                        }
//                    }
//                }
//
//                if (handled) {
//                    docs.data[i].status = 1; //已处理
//                    var row = $await(updateViolocation(docs.data[i].vio_id, 1));
//                    if (row > 0) {
//                        console.log("update violocation ok.");
//                    }
//                }
//            }
//            res.send(docs);
//
//        } else {
//            var docs = $await(getViolationList(vehicle.obj_name, min_id, max_id));
//            res.send(docs);
//        }
//    } else {
//        res.send({});
//    }
//}));

var listAsync = function(obj_id, max_id, min_id, res){
    async.waterfall([
        function(cb) {
            db.getVehicleById(obj_id, function(vehicle)
            {
                cb(null, vehicle);
            });
        },
        function(vehicle, cb) {
            var vios = [];
            if (vehicle) {
                // 判断是否已超过一天间隔，如果是同步违章数据
                var query_date = vehicle.last_query;
                query_date = new Date(Date.parse(query_date) + (86400000 * 1));
                var now = new Date();
                if (vehicle.last_query == undefined || now > query_date) {
                    // 更新最后查询时间
                    db.updateVehicleLastQuery(vehicle.obj_id, now, function(row){
                        if (row > 0) {
                            console.log("update vehicle last query data ok.");
                        }
                    });

                    async.eachSeries(vehicle.vio_citys,function(item, callback) {
//                        util.getViolation(vehicle.obj_name, item.vio_location, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no, function(obj){
//                            console.log(obj);
//                            vios.push(obj);
//                            if(obj.resultcode == "200"){
//                                for (var j = 0; j < obj.result.lists.length; j++) {
//                                    vio_time = new Date(obj.result.lists[j].date);
//                                    db.addViolation(vehicle.obj_name, vio_time, obj.result.lists[j].area, obj.result.lists[j].act,
//                                        obj.result.lists[j].code, obj.result.lists[j].fen, obj.result.lists[j].money, '',
//                                        obj.result.lists[j].handled, vehicle.vio_citys[j].vio_city_name, function(err){
//                                        callback(null, err);
//                                    });
//                                }
//                            }
//                        });

                        var city_code = util.getCityCode(item.vio_city_name);
                        util.getViolationFree(vehicle.obj_name, city_code.province_pinyin, city_code.city_pinyin, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no, function(obj){
                            if(obj){
                                vios.push(obj);
                                db.addViolation(vehicle.obj_name, obj.time, obj.area, obj.act,
                                    '', obj.fen, obj.money, '',
                                    obj.handled, item.vio_city_name, function(err, vid){
                                        callback(null, err);
                                    });

                            }else{
                                callback(null, null);
                            }
                        });

                    }, function(err) {
                        console.log(vios);
                        db.getViolationList(vehicle.obj_name, min_id, max_id, function(docs){
                            console.log(docs);
                            for (var i = 0; i < docs.data.length; i++) {
                                var handled = true;
                                var time = new Date(docs.data[i].vio_time);
//                                for (var j = 0; j < vios.length; j++) {
//                                    if (vios[j].resultcode == "200") {
//                                        for (var k = 0; k < vios[j].result.lists.length; k++) {
//                                            vio_time = new Date(vios[j].result.lists[k].date);
//                                            if (vios[j].result.lists[k].area == docs.data[i].location && vio_time.getTime() == time.getTime()) {
//                                                handled = false;
//                                            }
//                                        }
//                                    }
//                                }

                                for (var j = 0; j < vios.length; j++) {
                                    vio_time = vios[j].time;
                                    if (vios[j].area == docs.data[i].location && vio_time.getTime() == time.getTime()) {
                                        handled = false;
                                    }
                                }

                                if (handled) {
                                    docs.data[i].status = 1; //已处理
                                }else{
                                    docs.data[i].status = 0; //已处理
                                }
                                db.updateViolocation(docs.data[i].vio_id, docs.data[i].status, function(row){
                                    if (row > 0) {
                                        console.log("update violocation ok.");
                                    }
                                });

                            }

                            cb(null, docs);
                        });
                    });

                } else {
                    db.getViolationList(vehicle.obj_name, min_id, max_id, function(docs){
                        cb(null, docs);
                    });
                }
            } else {
                res.send({});
            }
        },
        function(docs, cb) {
            res.send(docs);
        }
    ], function (err, result) {

    });

};

var listAsync2 = function(obj_id, max_id, min_id, res){
    async.waterfall([
        function(cb) {
            db.getVehicleById(obj_id, function(vehicle)
            {
                cb(null, vehicle);
            });
        },
        function(vehicle, cb) {
            var vios = [];
            if (vehicle) {
                // 判断是否已超过一天间隔，如果是同步违章数据
                var query_date = vehicle.last_query;
                query_date = new Date(Date.parse(query_date) + (86400000 * 1));
                var now = new Date();
                var vio_count = 0;
                var vio_p = 0;
                if (vehicle.last_query == undefined || now > query_date) {
                    // 更新最后查询时间
                    db.updateVehicleLastQuery(vehicle.obj_id, now, function(row){
                        if (row > 0) {
                            console.log("update vehicle last query data ok.");
                        }
                    });

                    async.eachSeries(vehicle.vio_citys,function(item, callback) {
                        util.getViolationFree(vehicle.obj_name, item.province, item.vio_location, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no, function(obj){
                            if(obj){
                                vio_count = obj.infos.length;
                                for(var i = 0; i < obj.infos.length; i++){
                                    db.addViolation(vehicle.obj_name, obj.infos[i].time, obj.infos[i].area, obj.infos[i].act,
                                        '', obj.infos[i].points, obj.infos[i].money, '',
                                        obj.handled, item.vio_city_name, function(err, vid){
                                            vio_p++;
                                            callback(null, err);
                                        });
                                    vios.push(obj.infos[i]);
                                }

                            }else{
                                callback(null, null);
                            }
                        });

                    }, function(err) {
                        if(vio_p == vio_count){
                            console.log(vios);
                            db.getViolationList(vehicle.obj_name, min_id, max_id, function(docs){
                                console.log(docs);
                                for (var i = 0; i < docs.data.length; i++) {
                                    var handled = true;
                                    var time = new Date(docs.data[i].vio_time);

                                    for (var j = 0; j < vios.length; j++) {
                                        vio_time = vios[j].time;
                                        if (vios[j].area == docs.data[i].location && vio_time.getTime() == time.getTime()) {
                                            handled = false;
                                        }
                                    }

                                    if (handled) {
                                        docs.data[i].status = 1; //已处理
                                    }else{
                                        docs.data[i].status = 0; //已处理
                                    }
                                    db.updateViolocation(docs.data[i].vio_id, docs.data[i].status, function(row){
                                        if (row > 0) {
                                            console.log("update violocation ok.");
                                        }
                                    });

                                }

                                cb(null, docs);
                            });
                        }
                    });
                } else {
                    db.getViolationList(vehicle.obj_name, min_id, max_id, function(docs){
                        cb(null, docs);
                    });
                }
            } else {
                res.send({});
            }
        },
        function(docs, cb) {
            res.send(docs);
        }
    ], function (err, result) {

    });

};

// 查询违章
exports.list = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.params.obj_id;
            var min_id = req.query.min_id;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }

            //listAsync(obj_id, min_id, max_id, res).start();
            listAsync2(obj_id, max_id, min_id, res);

            // 获取违章消息时，将未读消息数更新为0
            db.updateCustomerVioReaded(obj_id, 0, function(row){
                if(row > 0){
                    console.log("update customer vio unread to 0!");
                }
            });

        }else{
            util.resSendNoRight(res);
        }
    });
};

//查询违章2
exports.list2 = function(req, res){
    var auth_code = req.query.auth_code;
    db.ifAuthCodeValid(auth_code, function(valid){
        if(valid){
            var obj_id = req.query.obj_id;
            var min_id = req.query.min_id;
            var vio_city_code = req.query.vio_city_code;
            var vio_city_name = req.query.vio_city_name;
            if(typeof  min_id == "undefined"){
                min_id = 0;
            }
            var max_id = req.query.max_id;
            if(typeof  max_id == "undefined"){
                max_id = 0;
            }
            db.getVehicleById(obj_id, function(vehicle){
                if (vehicle) {
                    // 判断是否已超过一天间隔，如果是同步违章数据
                    var query_date = vehicle.last_query;
                    query_date = new Date(Date.parse(query_date) + (86400000 * 1));
                    var now = new Date();
                    if(vehicle.last_query == undefined || now > query_date){
                        // 更新最后查询时间
                        db.updateVehicleLastQuery(vehicle.obj_id, now, function(row){
                            if(row > 0){
                                console.log("update vehicle last query data ok.");
                            }
                        });

                        //  同步违章
//                        util.getViolation(vehicle.obj_name, vio_city_code, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no, function(obj){
//                            if(obj.resultcode == "200"){
//                                step(
//                                    function(){
//                                        var group = this.group();
//                                        for(var i = 0; i < obj.result.lists.length; i++){
//                                            vio_time = new Date(obj.result.lists[i].date);
//                                            db.addViolation(vehicle.obj_name, vio_time, obj.result.lists[i].area, obj.result.lists[i].act,
//                                                obj.result.lists[i].code, obj.result.lists[i].fen, obj.result.lists[i].money, '',
//                                                obj.result.lists[i].handled, vio_city_name, group());
//                                        }
//                                    },
//                                    function(err){
//                                        db.getViolationList(vehicle.obj_name, min_id, max_id, vio_city_name, function(docs){
//                                            res.send(docs);
//                                        });
//                                    }
//                                );
//                            }else{
//                                db.getViolationList(vehicle.obj_name, min_id, max_id, vio_city_name, function(docs){
//                                    res.send(docs);
//                                });
//                            }
//                        });
                        //var city_code = util.getCityCode(vio_city_name);
                        util.getViolationFree(vehicle.obj_name, vio_city_name, vio_city_code, vehicle.engine_no, vehicle.frame_no, vehicle.reg_no, function(obj){
                            if(obj){
                                db.addViolation(vehicle.obj_name, obj.time, obj.area, obj.act,
                                    '', obj.fen, obj.money, '',
                                    obj.handled, vio_city_name, function(err, vid){
                                        db.getViolationList(vehicle.obj_name, min_id, max_id, vio_city_name, function(docs){
                                            res.send(docs);
                                        });
                                    });

                            }else{
                                db.getViolationList(vehicle.obj_name, min_id, max_id, vio_city_name, function(docs){
                                    res.send(docs);
                                });
                            }
                        });
                    }else{
                        db.getViolationList(vehicle.obj_name, min_id, max_id, vio_city_name, function(docs){
                            res.send(docs);
                        });
                    }
                } else {
                    res.send({});
                }
            });
        }else{
            util.resSendNoRight(res);
        }
    });
};