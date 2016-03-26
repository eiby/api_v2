/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-10-29
 * Time: 下午3:33
 * To change this template use File | Settings | File Templates.
 */
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
var http = require("http");
var async = require('async');
var url = require("url");
var cheerio = require('cheerio');

//采集天气数据
function _getWeather(city_code, is_real, callback){
    try{
        // http://www.weather.com.cn/data/sk/101280601.html
        var path;
        if(is_real == 1){
            path = '/data/sk/' + city_code + '.html';
            var options = {
                host:"www.weather.com.cn",
                port:80,
                path:path,
                method:'GET'
            };
        }else{
            path = '/data/' + city_code + '.html';
            var options = {
                host:"m.weather.com.cn",
                port:80,
                path:path,
                method:'GET'
            };
        }
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

exports.weather = function(req, res){
    var city_code = req.query.city_code;
    var is_real = parseInt(req.query.is_real);
    _getWeather(city_code, is_real, function(weather){
        res.send(weather);
    });
};

exports.weather2 = function(req, res){
    var city = req.query.city;
    db.addWeather(city, function(err){
        db.getWeather(city, function(weather){
            var fa = parseInt(weather.today.weather_id.fa);
            if(fa >= 21 && fa <= 23){
                weather.today.weather_id.fa = fa - 14;
            }else if(fa == 11 || fa == 12 || fa == 24 || fa == 25){
                weather.today.weather_id.fa = 10;
            }else if(fa >= 26 && fa <= 28){
                weather.today.weather_id.fa = fa - 12;
            }
            weather.tips = getWeatherTips(parseInt(weather.today.weather_id.fa), parseInt(weather.sk.temp));
            res.send(weather);
        })
    });
};

exports.aqi = function(req, res){
    var city = req.query.city;
    var url = "http://www.pm25.in/api/querys/aqi_details.json?city=" + city + "&avg=true&stations=no&token=GmBqBNJhqwsNf19Fwqdy";
    util._get(url, function(doc){
        var result = {
            aqi: doc[0].aqi,
            quality: doc[0].quality
        };
        res.send(result);
    });
};

var getWeatherTips = function(weather_id, temp){
    var tips = "";
    switch(weather_id){
        case 0:case 1:case 2:
            if(temp >= 33){
                tips = "天气炎热，车辆行驶请注意防止发动机过热，随时留意水温，如果温度过高，应选择阴凉处停车降温，并可掀起发动机罩通风散热。";
            }
            break;
        case 3:case 7:case 8:case 9:case 21:case 22:
            tips = "今日有雨，道路湿滑，请减慢车速，小心行驶。";
            break;
        case 10:case 11:case 12:case 23:case 24:case 25:
            tips = "今日有大暴雨，请减少外出，驾车时格外小心，尽量低速慢行，保持车距，小心通过积水区，必要时开启双闪和雾灯。";
            break;
        case 4:case 5:
            tips = "雷雨天气，请少打手机，且尽量不要开启电子设备，放慢车速，小心行驶";
            break;
        case 6:
            tips = "雨雪天气，路面湿滑，请行车前清除积雪，行驶时保持除霜常开，尽量低速慢行，保持安全车距，小心行驶。";
            break;
        case 13:case 14:case 15:case 16:case 26:case 27:
            tips = "下雪天气，路面湿滑，请行车前清除积雪，缓慢起步，尽量低速慢行，保持安全车距，小心行驶。";
            break;
        case 17:case 28:
            tips = "暴雨天气，路面异常湿滑，请行车前清除积雪，缓慢起步，尽量低速慢行，保持安全车距，小心行驶。";
            break;
        case 18:
            tips = "今日雾天，请行车时打开雾灯、尾灯、示宽灯和近光灯，控制车速，清洁视线，勤按喇叭警示行人或车辆。";
            break;
        case 19:
            tips = "今日冻雨天气，请行车时打开前后雾灯，低速慢行，刹车以点刹为主，切勿急刹车及急转弯。";
            break;
        case 20:case 29:case 30:case 31:
            tips = "大风扬沙天气，行车时请降低车速，注意行人安全，适时开启小灯或者雾灯，请勿使用远光灯，使用空调时最好使用内循环。";
            break;
    }
    return tips;
};

exports.cityList = function(req, res){
    var is_hot = parseInt(req.query.is_hot);
//    mem.getCache("city_list_" + is_hot, function(obj){
//        if(obj){
//            console.log("get from cache");
//            res.send(obj);
//        }else{
//            console.log("get from db");
            db.getCarCityList(is_hot, function(citys){
                res.send(citys);
//                mem.setCache("city_list_" + is_hot, citys, function(success){
//                    console.log("save to cache");
//                });
            });
//        }
//    });

};

exports.city = function(req, res){
    var name = req.params.name;
    db.getCarCity(name, function (city) {
        res.send(city);
    });
};

exports.insuranceList = function(req, res){
    db.getInsuranceList(function(list){
        res.send(list);
    });
};

exports.brandList = function(req, res){
    //db.getBrandList(function(brands){
    //    res.send(brands);
    //});
    //    id: Number,
    //    name: String,
    //    pid: Number,
    //    url_spell: String,
    //    t_spell: String,
    //    url_icon: String
    db.list(db.table_name_def.TAB_CAR_BRAND, {}, "id,name,pid,url_spell,t_spell,url_icon", "t_spell", "", 0, 0, -1, function(docs){
       res.send(docs);
    });
};

exports.seriesList = function(req, res){
    //var pid = req.query.pid;
    //db.getSeriesList(pid, function(series){
    //    res.send(series);
    //});
    //    id: Number,
    //    name: String,
    //    pid: Number,
    //    url_spell: String,
    //    show_name: String,
    //    go_id: Number,
    //    go_name: String,
    var json = util.getQueryJson(req.query, "pid");
    var query = json.query;
    if(json.has_query){
        db.list(db.table_name_def.TAB_CAR_SERIES, query, "id,name,pid,url_spell,show_name,go_id,go_name", "id", "", 0, 0, -1, function(docs){
            res.send(docs);
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
};

exports.typeList = function(req, res){
    //var pid = req.query.pid;
    //db.getCarTypeList(pid, function(types){
    //    res.send(types);
    //});
    //    id: Number,
    //    name: String,
    //    pid: Number,
    //    go_id: String,
    //    go_name: String,
    //    refer_price: String,
    //    url_spell: String,    //车型简拼
    var json = util.getQueryJson(req.query, "pid");
    var query = json.query;
    if(json.has_query){
        db.list(db.table_name_def.TAB_CAR_TYPE, query, "id,name,pid,url_spell,refer_price,go_id,go_name", "go_id", "", 0, 0, -1, function(docs){
            res.send(docs);
        });
    }else{
        res.send(define.EMPTY_ARRAY);
    }
};

exports.dealerList = function(req, res){
    var city = req.query.city;
    var brand = req.query.brand;
    var lon = req.query.lon;
    if(typeof lon == "undefined"){
        lon = 0;
    }else{
        lon = parseFloat(lon);
    }
    var lat = req.query.lat;
    if(typeof lat == "undefined"){
        lat = 0;
    }else{
        lat = parseFloat(lat);
    }
    var cust_id = req.query.cust_id;
    if(typeof cust_id == "undefined"){
        cust_id = 0;
    }else{
        cust_id = parseInt(cust_id);
    }
    db.getCarDealerListByCityAndBrand(city, brand, lon, lat, 100, function(dealers){
        var names = "";
        for (var i = 0; i < dealers.length; i++) {
            names = names + dealers[i].name + ","
        }
        names = names.substr(0, names.length - 1);
        db.favoriteIsCollect(cust_id, names, function (favorites) {
            for (var i = 0; i < dealers.length; i++) {
                dealers[i].is_collect = 0;
                for (var j = 0; j < favorites.length; j++) {
                    if (dealers[i].name == favorites[j].name) {
                        dealers[i].is_collect = 1;
                        break;
                    }
                }
            }
            res.send(dealers);
        });
        //res.send(dealers);
    });
};

function getLastNum(obj_name){
    var last_num = obj_name.substr(obj_name.length - 1, 1);
    last_num = parseInt(last_num);
    if(isNaN(last_num)){
        last_num = 0;
    }
    return last_num;
}

exports.getBan = function(req, res){
    var city = req.query.city;
    var obj_name = req.query.obj_name;
    var now = new Date();
    var day;
    var limit_num = "";
    var result;
    db.getBan(city, function(ban){
        if(!ban){
            result = {
                limit: "不限"
            }
        }else{
            var last_num = getLastNum(obj_name) + ",";
            if(ban.ban_type == 1){
                day = now.getDate().toString();
                day = day.substr(day.length - 1, 1);
                day = parseInt(day);
            }else{
                day = now.getDay();
            }
            for(var i = 0; i < ban.ban_rule.length; i++){
                if(ban.ban_rule[i].day == day){
                    limit_num = ban.ban_rule[i].limit_num + ",";
                    break;
                }
            }
            if(limit_num.indexOf(last_num) > -1){
                result = {
                    limit: "限行",
                    ban_region: ban.ban_region,
                    ban_time: ban.ban_time
                }
            }else{
                result = {
                    limit: "不限"
                }
            }
        }
        res.send(result);
    });
};

exports.getJoy = function(req, res){
    db.getJoyByRandom(function(doc){
        res.send(doc);
    });
};

exports.getAD = function(req, res){
  var ADs = [
      {
          image: "http://baba-img.oss-cn-hangzhou.aliyuncs.com/photo/AD2.jpg",
          content: "WiCARE应邀参加亚洲生活创新展",
          url: "http://news.163.com/14/1028/13/A9L79ULN00014SEH.html"
      }
  ];
  res.send(ADs);
};

var g_cl = new Array();
g_cl['p1'] = ['北京', 'http://bj.cheshi.com/'];
g_cl['p2'] = ['上海', 'http://sh.cheshi.com/'];
g_cl['c84'] = ['广州', 'http://gz.cheshi.com/'];
g_cl['c85'] = ['深圳', 'http://sz.cheshi.com/'];
g_cl['c89'] = ['成都', 'http://cd.cheshi.com/'];
g_cl['c53'] = ['长春', 'http://cc.cheshi.com/'];
g_cl['c55'] = ['沈阳', 'http://sy.cheshi.com/'];
g_cl['c82'] = ['杭州', 'http://hz.cheshi.com/'];
g_cl['c70'] = ['郑州', 'http://zz.cheshi.com/'];
g_cl['c77'] = ['武汉', 'http://wh.cheshi.com/'];
g_cl['p4'] = ['重庆', 'http://cq.cheshi.com/'];
g_cl['c90'] = ['昆明', 'http://km.cheshi.com/'];
g_cl['c68'] = ['石家庄', 'http://sjz.cheshi.com/'];
g_cl['c73'] = ['青岛', 'http://qd.cheshi.com/'];
g_cl['c56'] = ['大连', 'http://dl.cheshi.com/'];
g_cl['c65'] = ['西安', 'http://xa.cheshi.com/'];
g_cl['c81'] = ['南京', 'http://nj.cheshi.com/'];
g_cl['c50'] = ['哈尔滨', 'http://heb.cheshi.com/'];
g_cl['p3'] = ['天津', 'http://tj.cheshi.com/'];
g_cl['c72'] = ['济南', 'http://jn.cheshi.com/'];
g_cl['c51'] = ['齐齐哈尔', 'http://www.cheshi.com/c_qiqihaer/'];
g_cl['c144'] = ['鞍山', 'http://anshan.cheshi.com/'];
g_cl['c71'] = ['洛阳', 'http://ly.cheshi.com/'];
g_cl['c215'] = ['平顶山', 'http://pds.cheshi.com/'];
g_cl['c216'] = ['焦作', 'http://jz.cheshi.com/'];
g_cl['c218'] = ['新乡', 'http://xx.cheshi.com/'];
g_cl['c219'] = ['安阳', 'http://ay.cheshi.com/'];
g_cl['c220'] = ['濮阳', 'http://py.cheshi.com/'];
g_cl['c221'] = ['许昌', 'http://xc.cheshi.com/'];
g_cl['c224'] = ['南阳', 'http://ny.cheshi.com/'];
g_cl['c225'] = ['商丘', 'http://sq.cheshi.com/'];
g_cl['c226'] = ['信阳', 'http://xy.cheshi.com/'];
g_cl['c228'] = ['驻马店', 'http://www.cheshi.com/c_zmd/'];
g_cl['c227'] = ['周口', 'http://zhoukou.cheshi.com/'];
g_cl['c223'] = ['三门峡', 'http://www.cheshi.com/c_sanmenxia/'];
g_cl['c214'] = ['开封', 'http://kf.cheshi.com/'];
g_cl['c253'] = ['襄阳', 'http://xiangyang.cheshi.com/'];
g_cl['c254'] = ['十堰', 'http://shiyan.cheshi.com/'];
g_cl['c255'] = ['荆州', 'http://jingzhou.cheshi.com/'];
g_cl['c257'] = ['荆门', 'http://jingmen.cheshi.com/'];
g_cl['c262'] = ['随州', 'http://suizhou.cheshi.com/'];
g_cl['c266'] = ['衡阳', 'http://hengyang.cheshi.com/'];
g_cl['c267'] = ['邵阳', 'http://shaoyang.cheshi.com/'];
g_cl['c268'] = ['岳阳', 'http://yueyang.cheshi.com/'];
g_cl['c269'] = ['常德', 'http://changde.cheshi.com/'];
g_cl['c272'] = ['郴州', 'http://chenzhou.cheshi.com/'];
g_cl['c273'] = ['永州', 'http://www.cheshi.com/c_yongzhou/'];
g_cl['c275'] = ['娄底', 'http://loudi.cheshi.com/'];
g_cl['c367'] = ['绵阳', 'http://mianyang.cheshi.com/'];
g_cl['c371'] = ['乐山', 'http://leshan.cheshi.com/'];
g_cl['c372'] = ['南充', 'http://nanchong.cheshi.com/'];
g_cl['c375'] = ['达州', 'http://www.cheshi.com/c_dazhou/'];
g_cl['c363'] = ['自贡', 'http://zigong.cheshi.com/'];
g_cl['c364'] = ['攀枝花', 'http://www.cheshi.com/c_panzhihua/'];
g_cl['c365'] = ['泸州', 'http://luzhou.cheshi.com/'];
g_cl['c366'] = ['德阳', 'http://dy.cheshi.com/'];
g_cl['c399'] = ['遵义', 'http://zunyi.cheshi.com/'];
g_cl['c376'] = ['巴中', 'http://www.cheshi.com/c_bazhong/'];
g_cl['c383'] = ['曲靖', 'http://qujing.cheshi.com/'];
g_cl['c384'] = ['玉溪', 'http://yuxi.cheshi.com/'];
g_cl['c513'] = ['大理', 'http://dali.cheshi.com/'];
g_cl['c52'] = ['牡丹江', 'http://www.cheshi.com/c_mudanjiang/'];
g_cl['c130'] = ['大庆', 'http://daqing.cheshi.com/'];
g_cl['c132'] = ['佳木斯', 'http://www.cheshi.com/c_jiamusi/'];
g_cl['c54'] = ['吉林', 'http://jilin.cheshi.com/'];
g_cl['c137'] = ['四平', 'http://www.cheshi.com/c_siping/'];
g_cl['c139'] = ['通化', 'http://www.cheshi.com/c_tonghua/'];
g_cl['c450'] = ['延吉', 'http://www.cheshi.com/c_yanji/'];
g_cl['c57'] = ['锦州', 'http://jinzhou.cheshi.com/'];
g_cl['c145'] = ['抚顺', 'http://www.cheshi.com/c_fushun/'];
g_cl['c147'] = ['丹东', 'http://www.cheshi.com/c_dandong/'];
g_cl['c148'] = ['葫芦岛', 'http://huludao.cheshi.com/'];
g_cl['c149'] = ['营口', 'http://yingkou.cheshi.com/'];
g_cl['c150'] = ['盘锦', 'http://panjin.cheshi.com/'];
g_cl['c152'] = ['辽阳', 'http://www.cheshi.com/c_liaoyang/'];
g_cl['c154'] = ['朝阳', 'http://chaoyang.cheshi.com/'];
g_cl['c359'] = ['漳州', 'http://zhangzhou.cheshi.com/'];
g_cl['c361'] = ['龙岩', 'http://longyan.cheshi.com/'];
g_cl['c580'] = ['晋江', 'http://www.cheshi.com/c_jinjiang/'];
g_cl['c356'] = ['三明', 'http://sanming.cheshi.com/'];
g_cl['c357'] = ['莆田', 'http://putian.cheshi.com/'];
g_cl['c319'] = ['赣州', 'http://www.cheshi.com/c_ganzhou/'];
g_cl['c320'] = ['吉安', 'http://jian.cheshi.com/'];
g_cl['c323'] = ['上饶', 'http://shangrao.cheshi.com/'];
g_cl['c315'] = ['萍乡', 'http://pingxiang.cheshi.com/'];
g_cl['c324'] = ['珠海', 'http://zhuhai.cheshi.com/'];
g_cl['c325'] = ['汕头', 'http://shantou.cheshi.com/'];
g_cl['c326'] = ['韶关', 'http://www.cheshi.com/c_shaoguan/'];
g_cl['c328'] = ['梅州', 'http://www.cheshi.com/c_meizhou/'];
g_cl['c329'] = ['惠州', 'http://huizhou.cheshi.com/'];
g_cl['c332'] = ['中山', 'http://zhongshan.cheshi.com/'];
g_cl['c333'] = ['江门', 'http://jiangmen.cheshi.com/'];
g_cl['c334'] = ['佛山', 'http://foshan.cheshi.com/'];
g_cl['c336'] = ['湛江', 'http://www.cheshi.com/c_zhanjiang/'];
g_cl['c337'] = ['茂名', 'http://www.cheshi.com/c_maoming/'];
g_cl['c338'] = ['肇庆', 'http://zhaoqing.cheshi.com/'];
g_cl['c339'] = ['清远', 'http://qingyuan.cheshi.com/'];
g_cl['c340'] = ['潮州', 'http://www.cheshi.com/c_chaozhou/'];
g_cl['c341'] = ['揭阳', 'http://www.cheshi.com/c_jieyang/'];
g_cl['c343'] = ['柳州', 'http://liuzhou.cheshi.com/'];
g_cl['c344'] = ['桂林', 'http://guilin.cheshi.com/'];
g_cl['c350'] = ['玉林', 'http://www.cheshi.com/c_yulin_gx/'];
g_cl['c205'] = ['唐山', 'http://ts.cheshi.com/'];
g_cl['c206'] = ['秦皇岛', 'http://qhd.cheshi.com/'];
g_cl['c207'] = ['邯郸', 'http://handan.cheshi.com/'];
g_cl['c208'] = ['邢台', 'http://xingtai.cheshi.com/'];
g_cl['c209'] = ['张家口', 'http://zhangjiakou.cheshi.com/'];
g_cl['c210'] = ['承德', 'http://chengde.cheshi.com/'];
g_cl['c211'] = ['沧州', 'http://cangzhou.cheshi.com/'];
g_cl['c212'] = ['廊坊', 'http://langfang.cheshi.com/'];
g_cl['c213'] = ['衡水', 'http://hengshui.cheshi.com/'];
g_cl['c59'] = ['包头', 'http://bt.cheshi.com/'];
g_cl['c155'] = ['乌海', 'http://wuhai.cheshi.com/'];
g_cl['c156'] = ['赤峰', 'http://chifeng.cheshi.com/'];
g_cl['c157'] = ['通辽', 'http://tongliao.cheshi.com/'];
g_cl['c158'] = ['鄂尔多斯', 'http://eeds.cheshi.com/'];
g_cl['c468'] = ['巴彦淖尔', 'http://bayannaoer.cheshi.com/'];
g_cl['c469'] = ['呼伦贝尔', 'http://hulunbeier.cheshi.com/'];
g_cl['c472'] = ['锡林浩特', 'http://www.cheshi.com/c_xilinhaote/'];
g_cl['c74'] = ['烟台', 'http://yt.cheshi.com/'];
g_cl['c229'] = ['淄博', 'http://zb.cheshi.com/'];
g_cl['c230'] = ['枣庄', 'http://zaozhuang.cheshi.com/'];
g_cl['c231'] = ['东营', 'http://dongying.cheshi.com/'];
g_cl['c232'] = ['潍坊', 'http://wf.cheshi.com/'];
g_cl['c233'] = ['威海', 'http://weihai.cheshi.com/'];
g_cl['c234'] = ['济宁', 'http://jining.cheshi.com/'];
g_cl['c235'] = ['泰安', 'http://taian.cheshi.com/'];
g_cl['c236'] = ['日照', 'http://rz.cheshi.com/'];
g_cl['c237'] = ['莱芜', 'http://www.cheshi.com/c_laiwu/'];
g_cl['c238'] = ['德州', 'http://dezhou.cheshi.com/'];
g_cl['c239'] = ['临沂', 'http://linyi.cheshi.com/'];
g_cl['c240'] = ['聊城', 'http://liaocheng.cheshi.com/'];
g_cl['c241'] = ['滨州', 'http://binzhou.cheshi.com/'];
g_cl['c242'] = ['菏泽', 'http://heze.cheshi.com/'];
g_cl['c76'] = ['大同', 'http://datong.cheshi.com/'];
g_cl['c244'] = ['阳泉', 'http://www.cheshi.com/c_yangquan/'];
g_cl['c245'] = ['长治', 'http://changzhi.cheshi.com/'];
g_cl['c246'] = ['晋城', 'http://www.cheshi.com/c_jincheng/'];
g_cl['c247'] = ['忻州', 'http://xinzhou.cheshi.com/'];
g_cl['c248'] = ['晋中', 'http://jinzhong.cheshi.com/'];
g_cl['c249'] = ['临汾', 'http://linfen.cheshi.com/'];
g_cl['c250'] = ['运城', 'http://yuncheng.cheshi.com/'];
g_cl['c66'] = ['宝鸡', 'http://baoji.cheshi.com/'];
g_cl['c67'] = ['延安', 'http://www.cheshi.com/c_yanan/'];
g_cl['c200'] = ['渭南', 'http://wn.cheshi.com/'];
g_cl['c201'] = ['汉中', 'http://www.cheshi.com/c_hanzhong/'];
g_cl['c64'] = ['天水', 'http://www.cheshi.com/c_tianshui/'];
g_cl['c190'] = ['张掖', 'http://www.cheshi.com/c_zhangye/'];
g_cl['c202'] = ['榆林', 'http://yl.cheshi.com/'];
g_cl['c192'] = ['酒泉', 'http://www.cheshi.com/c_jiuquan/'];
g_cl['c193'] = ['庆阳', 'http://www.cheshi.com/c_qingyang/'];
g_cl['c168'] = ['克拉玛依', 'http://www.cheshi.com/c_kelamayi/'];
g_cl['c502'] = ['哈密', 'http://www.cheshi.com/c_hami/'];
g_cl['c500'] = ['阿克苏', 'http://www.cheshi.com/c_akesu/'];
g_cl['c506'] = ['库尔勒', 'http://kel.cheshi.com/'];
g_cl['c510'] = ['奎屯', 'http://www.cheshi.com/c_kuitun/'];
g_cl['c512'] = ['伊宁', 'http://www.cheshi.com/c_yining/'];
g_cl['c80'] = ['芜湖', 'http://wuhu.cheshi.com/'];
g_cl['c277'] = ['蚌埠', 'http://www.cheshi.com/c_bengbu/'];
g_cl['c279'] = ['马鞍山', 'http://www.cheshi.com/c_maanshan/'];
g_cl['c281'] = ['铜陵', 'http://www.cheshi.com/c_tongling/'];
g_cl['c282'] = ['安庆', 'http://aq.cheshi.com/'];
g_cl['c285'] = ['阜阳', 'http://fuyang.cheshi.com/'];
g_cl['c286'] = ['宿州', 'http://www.cheshi.com/c_suz/'];
g_cl['c288'] = ['六安', 'http://luan.cheshi.com/'];
g_cl['c291'] = ['宣城', 'http://www.cheshi.com/c_xuancheng/'];
g_cl['c292'] = ['徐州', 'http://xuzhou.cheshi.com/'];
g_cl['c293'] = ['连云港', 'http://lianyungang.cheshi.com/'];
g_cl['c294'] = ['淮安', 'http://huaian.cheshi.com/'];
g_cl['c296'] = ['盐城', 'http://yancheng.cheshi.com/'];
g_cl['c297'] = ['扬州', 'http://yangzhou.cheshi.com/'];
g_cl['c298'] = ['泰州', 'http://taizhou.cheshi.com/'];
g_cl['c299'] = ['南通', 'http://nt.cheshi.com/'];
g_cl['c300'] = ['镇江', 'http://zhenjiang.cheshi.com/'];
g_cl['c301'] = ['常州', 'http://changzhou.cheshi.com/'];
g_cl['c302'] = ['无锡', 'http://wuxi.cheshi.com/'];
g_cl['c452'] = ['常熟', 'http://www.cheshi.com/c_changshu/'];
g_cl['c456'] = ['江阴', 'http://www.cheshi.com/c_jiangyin/'];
g_cl['c458'] = ['昆山', 'http://www.cheshi.com/c_kunshan/'];
g_cl['c465'] = ['张家港', 'http://www.cheshi.com/c_zhangjiagang/'];
g_cl['c311'] = ['舟山', 'http://www.cheshi.com/c_zhoushan/'];
g_cl['c69'] = ['保定', 'http://bd.cheshi.com/'];
g_cl['c58'] = ['呼和浩特', 'http://hhht.cheshi.com/'];
g_cl['c75'] = ['太原', 'http://ty.cheshi.com/'];
g_cl['c63'] = ['兰州', 'http://lz.cheshi.com/'];
g_cl['c60'] = ['银川', 'http://yc.cheshi.com/'];
g_cl['c62'] = ['西宁', 'http://xn.cheshi.com/'];
g_cl['c61'] = ['乌鲁木齐', 'http://wlmq.cheshi.com/'];
g_cl['c79'] = ['合肥', 'http://hf.cheshi.com/'];
g_cl['c304'] = ['宁波', 'http://nb.cheshi.com/'];
g_cl['c309'] = ['金华', 'http://jh.cheshi.com/'];
g_cl['c306'] = ['嘉兴', 'http://jx.cheshi.com/'];
g_cl['c307'] = ['湖州', 'http://huzhou.cheshi.com/'];
g_cl['c305'] = ['温州', 'http://wz.cheshi.com/'];
g_cl['c313'] = ['丽水', 'http://lishui.cheshi.com/'];
g_cl['c310'] = ['衢州', 'http://quzhou.cheshi.com/'];
g_cl['c308'] = ['绍兴', 'http://sx.cheshi.com/'];
g_cl['c312'] = ['台州', 'http://tz.cheshi.com/'];
g_cl['c78'] = ['长沙', 'http://cs.cheshi.com/'];
g_cl['c87'] = ['福州', 'http://fz.cheshi.com/'];
g_cl['c88'] = ['厦门', 'http://xm.cheshi.com/'];
g_cl['c358'] = ['泉州', 'http://qz.cheshi.com/'];
g_cl['c83'] = ['南昌', 'http://nc.cheshi.com/'];
g_cl['c331'] = ['东莞', 'http://dg.cheshi.com/'];
g_cl['c86'] = ['南宁', 'http://nn.cheshi.com/'];
g_cl['c93'] = ['海口', 'http://hk.cheshi.com/'];
g_cl['c91'] = ['贵阳', 'http://gy.cheshi.com/'];
g_cl['c92'] = ['拉萨', 'http://ls.cheshi.com/'];
g_cl['c303'] = ['苏州', 'http://suzhou.cheshi.com/'];
g_cl['c256'] = ['宜昌', 'http://yichang.cheshi.com/'];
g_cl['c217'] = ['鹤壁', 'http://hb.cheshi.com/'];
g_cl['c222'] = ['漯河', 'http://lh.cheshi.com/'];
g_cl['c530'] = ['济源', 'http://www.cheshi.com/c_jiyuan/'];
g_cl['c317'] = ['九江', 'http://jiujiang.cheshi.com/'];
g_cl['c582'] = ['阿勒泰', 'http://www.cheshi.com/c_aletai/'];
g_cl['c501'] = ['昌吉', 'http://www.cheshi.com/c_changji/'];
g_cl['c503'] = ['和田', 'http://www.cheshi.com/c_hetian/'];
g_cl['c504'] = ['喀什', 'http://www.cheshi.com/c_kashi/'];
g_cl['c581'] = ['塔城', 'http://www.cheshi.com/c_tacheng/'];
g_cl['c508'] = ['吐鲁番', 'http://www.cheshi.com/c_tulufan/'];
g_cl['c511'] = ['伊犁', 'http://www.cheshi.com/c_yili/'];
g_cl['c289'] = ['亳州', 'http://www.cheshi.com/c_bozhou/'];
g_cl['c287'] = ['巢湖', 'http://www.cheshi.com/c_chaohu/'];
g_cl['c290'] = ['池州', 'http://chizhou.cheshi.com/'];
g_cl['c284'] = ['滁州', 'http://www.cheshi.com/c_chuzhou/'];
g_cl['c280'] = ['淮北', 'http://www.cheshi.com/c_huaibei/'];
g_cl['c278'] = ['淮南', 'http://www.cheshi.com/c_huainan/'];
g_cl['c283'] = ['黄山', 'http://www.cheshi.com/c_huangshan/'];
g_cl['c295'] = ['宿迁', 'http://www.cheshi.com/c_suqian/'];
g_cl['c525'] = ['义乌', 'http://www.cheshi.com/c_yiwu/'];
g_cl['c243'] = ['朔州', 'http://www.cheshi.com/c_shuozhou/'];
g_cl['c135'] = ['绥化', 'http://www.cheshi.com/c_suihua/'];
g_cl['c128'] = ['双鸭山', 'http://www.cheshi.com/c_shuangyashan/'];
g_cl['c134'] = ['黑河', 'http://www.cheshi.com/c_heihe/'];
g_cl['c133'] = ['七台河', 'http://www.cheshi.com/c_qitaihe/'];
g_cl['c131'] = ['伊春', 'http://www.cheshi.com/c_yichun/'];
g_cl['c129'] = ['鸡西', 'http://www.cheshi.com/c_jixi/'];
g_cl['c127'] = ['鹤岗', 'http://www.cheshi.com/c_hegang/'];
g_cl['c138'] = ['辽源', 'http://www.cheshi.com/c_liaoyuan/'];
g_cl['c142'] = ['白城', 'http://www.cheshi.com/c_baicheng/'];
g_cl['c140'] = ['白山', 'http://www.cheshi.com/c_baishan/'];
g_cl['c141'] = ['松原', 'http://www.cheshi.com/c_songyuan/'];
g_cl['c146'] = ['本溪', 'http://www.cheshi.com/c_benxi/'];
g_cl['c151'] = ['阜新', 'http://fuxin.cheshi.com/'];
g_cl['c153'] = ['铁岭', 'http://www.cheshi.com/c_tieling/'];
g_cl['c164'] = ['兴安盟', 'http://xingan.cheshi.com/'];
g_cl['c160'] = ['乌兰察布盟', 'http://wulanchabu.cheshi.com/'];
g_cl['c203'] = ['安康', 'http://www.cheshi.com/c_ankang/'];
g_cl['c198'] = ['铜川', 'http://www.cheshi.com/c_tongchuan/'];
g_cl['c204'] = ['商洛', 'http://www.cheshi.com/c_shangluo/'];
g_cl['c199'] = ['咸阳', 'http://xianyang.cheshi.com/'];
g_cl['c188'] = ['嘉峪关', 'http://www.cheshi.com/c_jiayuguan/'];
g_cl['c189'] = ['武威', 'http://www.cheshi.com/c_wuwei/'];
g_cl['c187'] = ['白银', 'http://www.cheshi.com/c_baiyin/'];
g_cl['c186'] = ['金昌', 'http://www.cheshi.com/c_jinchang/'];
g_cl['c191'] = ['平凉', 'http://www.cheshi.com/c_pingliang/'];
g_cl['c166'] = ['吴忠', 'http://www.cheshi.com/c_wuzhong/'];
g_cl['c583'] = ['中卫', 'http://www.cheshi.com/c_zhongwei/'];
g_cl['c165'] = ['石嘴山', 'http://www.cheshi.com/c_shizuishan/'];
g_cl['c167'] = ['固原', 'http://www.cheshi.com/c_guyuan/'];
g_cl['p31'] = ['海南', 'http://www.cheshi.com/c_hainan/'];
g_cl['c362'] = ['宁德', 'http://ningde.cheshi.com/'];
g_cl['c360'] = ['南平', 'http://nanping.cheshi.com/'];
g_cl['c335'] = ['阳江', 'http://yangjiang.cheshi.com/'];
g_cl['c342'] = ['云浮', 'http://www.cheshi.com/c_yunfu/'];
g_cl['c330'] = ['汕尾', 'http://www.cheshi.com/c_shanwei/'];
g_cl['c327'] = ['河源', 'http://www.cheshi.com/c_heyuan/'];
g_cl['c348'] = ['钦州', 'http://www.cheshi.com/c_qinzhou/'];
g_cl['c345'] = ['梧州', 'http://www.cheshi.com/c_wuzhou/'];
g_cl['c353'] = ['河池', 'http://www.cheshi.com/c_hechi/'];
g_cl['c349'] = ['贵港', 'http://www.cheshi.com/c_guigang/'];
g_cl['c355'] = ['崇左', 'http://www.cheshi.com/c_chongzuo/'];
g_cl['c347'] = ['防城港', 'http://www.cheshi.com/c_fangchenggang/'];
g_cl['c354'] = ['来宾', 'http://www.cheshi.com/c_laibin/'];
g_cl['c351'] = ['百色', 'http://www.cheshi.com/c_baise/'];
g_cl['c346'] = ['北海', 'http://www.cheshi.com/c_beihai/'];
g_cl['c352'] = ['贺州', 'http://www.cheshi.com/c_hezhou/'];
g_cl['c94'] = ['三亚', 'http://www.cheshi.com/c_sanya/'];
g_cl['c260'] = ['黄冈', 'http://huanggang.cheshi.com/'];
g_cl['c259'] = ['孝感', 'http://xiaogan.cheshi.com/'];
g_cl['c252'] = ['黄石', 'http://huangshi.cheshi.com/'];
g_cl['c258'] = ['鄂州', 'http://ezhou.cheshi.com/'];
g_cl['c261'] = ['咸宁', 'http://xianning.cheshi.com/'];
g_cl['c271'] = ['益阳', 'http://yiyang.cheshi.com/'];
g_cl['c270'] = ['张家界', 'http://www.cheshi.com/c_zhangjiajie/'];
g_cl['c264'] = ['株洲', 'http://zhuzhou.cheshi.com/'];
g_cl['c274'] = ['怀化', 'http://www.cheshi.com/c_huaihua/'];
g_cl['c321'] = ['宜春', 'http://ychun.cheshi.com/'];
g_cl['c316'] = ['新余', 'http://xinyu.cheshi.com/'];
g_cl['c314'] = ['景德镇', 'http://www.cheshi.com/c_jingdezhen/'];
g_cl['c318'] = ['鹰潭', 'http://yingtan.cheshi.com/'];
g_cl['c322'] = ['抚州', 'http://fuzhou.cheshi.com/'];
g_cl['c435'] = ['铜仁', 'http://tongren.cheshi.com/'];
g_cl['c400'] = ['安顺', 'http://www.cheshi.com/c_anshun/'];
g_cl['c370'] = ['内江', 'http://www.cheshi.com/c_neijiang/'];
g_cl['c374'] = ['广安', 'http://www.cheshi.com/c_guangan/'];
g_cl['c377'] = ['雅安', 'http://www.cheshi.com/c_yaan/'];
g_cl['c373'] = ['宜宾', 'http://yibin.cheshi.com/'];
g_cl['c379'] = ['资阳', 'http://www.cheshi.com/c_ziyang/'];
g_cl['c378'] = ['眉山', 'http://www.cheshi.com/c_meishan/'];
g_cl['c368'] = ['广元', 'http://www.cheshi.com/c_guangyuan/'];
g_cl['c369'] = ['遂宁', 'http://www.cheshi.com/c_suining/'];
g_cl['c391'] = ['红河', 'http://honghe.cheshi.com/'];
g_cl['c389'] = ['丽江', 'http://www.cheshi.com/c_lijiang/'];
g_cl['c386'] = ['昭通', 'http://www.cheshi.com/c_zhaotong/'];
g_cl['c385'] = ['保山', 'http://www.cheshi.com/c_baoshan/'];
g_cl['c543'] = ['普洱', 'http://www.cheshi.com/c_puer/'];
g_cl['c95'] = ['香港', 'http://www.cheshi.com/c_xianggang/'];
g_cl['c96'] = ['澳门', 'http://www.cheshi.com/c_aomen/'];
g_cl['c559'] = ['天津滨海', 'http://binhai.cheshi.com/'];
g_cl['c432'] = ['都匀', 'http://www.cheshi.com/c_duyun/'];
g_cl['c558'] = ['丰城', 'http://www.cheshi.com/c_fengcheng/'];
g_cl['c457'] = ['靖江', 'http://www.cheshi.com/c_jingjiang/'];
g_cl['c434'] = ['凯里', 'http://www.cheshi.com/c_kaili/'];
g_cl['c398'] = ['六盘水', 'http://www.cheshi.com/c_liupanshui/'];
g_cl['c574'] = ['平阳', 'http://www.cheshi.com/c_pingyang/'];
g_cl['c568'] = ['如皋', 'http://www.cheshi.com/c_rugao/'];
g_cl['c563'] = ['桐乡', 'http://www.cheshi.com/c_tongxiang/'];
g_cl['c577'] = ['枣阳', 'http://www.cheshi.com/c_zaoyang/'];
g_cl['c466'] = ['高安', 'http://www.cheshi.com/c_gaoan/'];
g_cl['c576'] = ['兴义', 'http://www.cheshi.com/c_xingyi/'];
g_cl['c161'] = ['锡林郭勒盟', 'http://xilinguole.cheshi.com/'];
g_cl['c265'] = ['湘潭', 'http://www.cheshi.com/c_xiangtan/'];
g_cl['c441'] = ['恩施', 'http://enshi.cheshi.com/'];
g_cl['c499'] = ['西昌', 'http://www.cheshi.com/c_xichang/'];
g_cl['c102'] = ['新竹', 'http://xinzhu.cheshi.com/'];

function _get(file_url, city, callback){
    try{
        var options = {
            host: url.parse(file_url).hostname,
            port: 80,
            path: url.parse(file_url).path,
            method:'GET'
        };
        var req = http.request(options, function (res) {
//            console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var responseString = '';
            res.on('data', function(data) {
                responseString += data;
            });
            res.on('end', function() {
                try{
//                    var resultObject = JSON.parse(responseString);
                    if(callback){
                        callback(responseString, city);
                    }
                }catch(e){
                    callback(responseString, city);
                }
            });
        });

        req.on('error', function(e) {
            // TODO: handle error.
            var resultObject = {
                status_code: define.API_STATUS_CONNECT_FAIL,
                content:e.toString()
            };
            if(callback){
                callback(resultObject);
            }
        });
        // write data to request body
        //req.write(post_data);
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

function _getHotNews(city, callback2){
    var url = "http://www.cheshi.com";
    for (var code in g_cl) {
        if(g_cl[code][0] == city){
            url = g_cl[code][1];
            break;
        }
    }

    _get(url, city, function (html, city) {
        $ = cheerio.load(html);
        var hots_new = $(".newslist.w188.clearfix").eq(0).children('li');
        var news = [];
        for (var i = 0; i < hots_new.length; i++) {
            news.push({
                title: hots_new.eq(i).children('a').attr("title"),
                url: hots_new.eq(i).children('a').attr("href")
            });
        }
        async.each(news, function (item, callback) {
                var title = item.title;
                var url = item.url;
                _get(url, title, function (html, title) {
                    $ = cheerio.load(html);
                    var summarys = $(".summary_about").children('p');
                    var summary = "";
                    for (var i = 0; i < summarys.length; i++) {
                        if (i > 10)break;
                        summary = summarys.eq(i).text();
                        if(summary.length > 50){
                            break;
                        }
                    }
                    summary = summary.replace(/\r/g, "");
                    summary = summary.replace(/\t/g, "");
                    summary = summary.trim();
                    if(title != "" && summary != ""){
                        db.addCityNews(city, title, summary, url, function (err) {
                            callback(null, err);
                        });
                    }
                });
            },
            function (err) {
                callback2(err);
            }
        );
    });
}

exports.getHotNews = function(req, res) {
    var city = req.query.city;
    var update_time = new Date();
    update_time = update_time.format("yyyy-MM-dd") + " 00:00:00";
    update_time = new Date(update_time);
    db.getCityNewsByDate(city, update_time, function(news){
        if(news){
            db.getLast5CityNews(city, function(news){
                if(news.length > 0){
                    var r = Math.floor(Math.random() * news.length);
                    res.send(news[r]);
                }else{
                    res.send({});
                }
            });
        }else{
            _getHotNews(city, function (err) {

            });
            db.getLast5CityNews(city, function (news) {
                if(news.length > 0){
                    var r = Math.floor(Math.random() * news.length);
                    res.send(news[r]);
                }else{
                    res.send({});
                }
            });
        }
    });
};

exports.get5HotNews = function(req, res) {
    var city = req.query.city;
    var update_time = new Date();
    update_time = update_time.format("yyyy-MM-dd") + " 00:00:00";
    update_time = new Date(update_time);
    db.getCityNewsByDate(city, update_time, function(news){
        if(news){
            db.getLast5CityNews(city, function(news){
                res.send(news);
            });
        }else{
            _getHotNews(city, function (err) {

            });
            db.getLast5CityNews(city, function (news) {
                res.send(news);
            });
        }
    });
};

// 添加微信用户见证记录
exports.addWitness = function(req, res){
    var open_id = req.body.open_id;
    var friend_id = req.body.friend_id;
    db.addWitness(open_id, friend_id, function(err, count){
        var result;
        if (err) {
            result = {
                "status_code": define.API_STATUS_DATABASE_ERROR  //0 成功 >0 失败
            };
        } else {
            result = {
                "status_code": define.API_STATUS_OK,  //0 成功 >0 失败
                "count": count
            };
        }
        res.send(result);
    });
};

// 获取微信用户的见证人数
exports.getWitness = function(req, res){
    var open_id = req.query.open_id;
    db.getWitness(open_id, function(count){
        result = {
            "count": count
        };
        res.send(result);
    });
};