/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-29
 * Time: 下午4:58
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs');
var mongoose = require('mongoose');
//var conn = mongoose.createConnection('mongodb://182.254.215.35:20099/revise'); //智联车网服务器
var conn = mongoose.createConnection('mongodb://182.254.214.210:20099/revise, mongodb://182.254.215.229:20099/revise, mongodb://182.254.215.35:20099/revise', {read_secondary:true}); //业务服务器

var step = require("step");

// Define Model
var Schema = mongoose.Schema;
// 百度纠偏数据对象
var bd_revise = new Schema({
    lon: Number,
    lat: Number,
    rev_lon: Number,
    rev_lat: Number
});
var m_bd_revise = conn.model('bd_revise', bd_revise);

exports.gpsToBaidu = function(docs, mode, callback)
{
    step(
        function gpsToBaidu(){
            var group = this.group();
            if(mode == "active_gps_data"){
                for(var i = 0; i < docs.length; i++){
                    if(docs[i].active_gps_data != undefined) {
                        m_bd_revise.findOne({lon: docs[i].active_gps_data.lon.toFixed(2), lat: docs[i].active_gps_data.lat.toFixed(2)}, group());
                    }
                }
            }else if(mode == "page_data"){
                for(var i = 0; i < docs.data.length; i++){
                    m_bd_revise.findOne({lon: docs.data[i].lon.toFixed(2), lat: docs.data[i].lat.toFixed(2)}, group());
                }
            }else if(mode == "start_loc"){
                for(var i = 0; i < docs.length; i++){
                    m_bd_revise.findOne({lon: docs[i].start_lon.toFixed(2), lat: docs[i].start_lat.toFixed(2)}, group());
                }
            }else if(mode == "end_loc"){
                for(var i = 0; i < docs.length; i++){
                    m_bd_revise.findOne({lon: docs[i].end_lon.toFixed(2), lat: docs[i].end_lat.toFixed(2)}, group());
                }
            }else{
                for(var i = 0; i < docs.length; i++){
                    m_bd_revise.findOne({lon: docs[i].lon.toFixed(2), lat: docs[i].lat.toFixed(2)}, group());
                }
            }
        },
        function loadDocs(err, rev_docs){
            callback(rev_docs);
        }
     );
};

exports.gpsToGoogle = function(x, y)
{
    var i, j, k;
    var x1 = 0, y1 = 0, x2 = 0, y2 = 0, x3 = 0, y3 = 0, x4 = 0, y4 = 0, xtry = 0, ytry = 0, dx = 0, dy = 0;
    var x1y1, x2y2, x3y3, x4y4;
    var t, u;

    xtry = x;
    ytry = y;

    var fd = fs.openSync("../data/Coordinate.dat", "r");
    for (k = 0; k < 10; ++k)
    {
        if (xtry < 72 || xtry > 137.9 || ytry < 10 || ytry > 54.9)
        {
            break;
        }

        i = parseInt((xtry - 72.0) * 10.0);
        j = parseInt((ytry - 10.0) * 10.0);

        x1y1 = initTable(fd, getOffset(i, j));
        x2y2 = initTable(fd, getOffset(i + 1, j));
        x3y3 = initTable(fd, getOffset(i + 1, j + 1));
        x4y4 = initTable(fd, getOffset(i, j + 1));

        t = (xtry - 72.0 - 0.1 * i) * 10.0;
        u = (ytry - 10.0 - 0.1 * j) * 10.0;

        dx = (1.0 - t) * (1.0 - u) * x1y1.x + t * (1.0 - u) * x2y2.x + t * u * x3y3.x + (1.0 - t) * u * x4y4.x - xtry;
        dy = (1.0 - t) * (1.0 - u) * x1y1.y + t * (1.0 - u) * x2y2.y + t * u * x3y3.y + (1.0 - t) * u * x4y4.y - ytry;

        xtry = (xtry + x - dx) / 2.0;
        ytry = (ytry + y - dy) / 2.0;
    }
    fs.closeSync(fd);
    xout = 2 * x - xtry;
    yout = 2 * y - ytry;
    var xy = {
           x: xout,
           y: yout
        };
    return xy;
};

exports.googleToGps = function(x, y)
{
    var i, j, k;
    var x1 = 0, y1 = 0, x2 = 0, y2 = 0, x3 = 0, y3 = 0, x4 = 0, y4 = 0, xtry = 0, ytry = 0, dx = 0, dy = 0;
    var x1y1, x2y2, x3y3, x4y4;
    var t, u;

    xtry = x;
    ytry = y;

    var fd = fs.openSync("Coordinate.dat", "r");
    for (k = 0; k < 10; ++k)
    {
        if (xtry < 72 || xtry > 137.9 || ytry < 10 || ytry > 54.9)
        {
            break;
        }

        i = parseInt((xtry - 72.0) * 10.0);
        j = parseInt((ytry - 10.0) * 10.0);

        x1y1 = initTable(fd, getOffset(i, j));
        x2y2 = initTable(fd, getOffset(i + 1, j));
        x3y3 = initTable(fd, getOffset(i + 1, j + 1));
        x4y4 = initTable(fd, getOffset(i, j + 1));

        t = (xtry - 72.0 - 0.1 * i) * 10.0;
        u = (ytry - 10.0 - 0.1 * j) * 10.0;

        dx = (1.0 - t) * (1.0 - u) * x1y1.x + t * (1.0 - u) * x2y2.x + t * u * x3y3.x + (1.0 - t) * u * x4y4.x - xtry;
        dy = (1.0 - t) * (1.0 - u) * x1y1.y + t * (1.0 - u) * x2y2.y + t * u * x3y3.y + (1.0 - t) * u * x4y4.y - ytry;

        xtry = (xtry + x - dx) / 2.0;
        ytry = (ytry + y - dy) / 2.0;
    }
    fs.closeSync(fd);
    var xy = {
        x: xtry,
        y: ytry
    };
    return xy;
};

function getOffset(i, j)
{
    return ((i) + 660 * (j));
}


function initTable(fd, offset)
{
    if (fs == null)
    {
        return;
    }
    var buf = new Buffer(9);
    try
    {
        //fs.Seek(offset * 18 + offset / 2 * 2, SeekOrigin.Begin);
        //fs.readSync(fd, buffer, offset, length, position)
        var pos = offset * 18 + offset / 2 * 2;
        fs.readSync(fd, buf, 0, 9, pos);
        var str = String(buf.toString()).trim();
        var xx = parseFloat(str) / 100000.0;
        fs.readSync(fd, buf, 0, 9, pos + 9);
        str = String(buf.toString()).trim();
        var yy = parseFloat(str) / 100000.0;
        return {
            x:xx,
            y:yy
        }
    }catch(ex){
        return {
            x:0,
            y:0
        }
    }
}