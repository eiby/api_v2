//var Canvas = require('canvas');
var getRandom = function (start, end) {
    return start + Math.random() * (end - start);
};

exports.getPicValidCode = function(){
    var canvas = new Canvas(50, 20);
    var ctx = canvas.getContext('2d');
    var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
//for (var i = 0; i < 4; i++) {
//    code += s.substr(parseInt(Math.random() * 36), 1);
//}
    var v1 = parseInt(Math.random() * 9);
    var v2 = parseInt(Math.random() * 9);
    var result = v1 + v2;
    code = v1 + "+" + v2 + '=';
    var font = 'bold {FONTSIZE}px Impact';//"Bold Italic {FONTSIZE}px arial,sans-serif";//"13px sans-serif";
    var start = 3;
    var colors = ["rgb(255,165,0)", "rgb(16,78,139)", "rgb(0,139,0)", "rgb(255,0,0)"];
    var trans = {c: [-0.108, 0.108], b: [-0.05, 0.05]};
    var fontsizes = [11, 12, 13, 14, 15, 16];
    for (var i in code) {
        ctx.font = font.replace('{FONTSIZE}', fontsizes[Math.round(Math.random() * 10) % 6]);
        ctx.fillStyle = colors[Math.round(Math.random() * 10) % 4];//"rgba(0, 0, 200, 0.5)";
        ctx.fillText(code[i], start, 15, 50);
        ctx.fillRect();
        //con.translate(start,15);
        //ctx.transform(a,b, c, d, e, f);
        //参考：
        //a:水平缩放，default：1 ,取值：0.89,1.32,-0.56等,
        //b:y轴斜切，default：0 ,取值：-0.89,1.32等,
        //c:x轴斜切，default：0 ,取值：-0.89,1.32等,
        //d:垂直缩放，default：1 ,取值：-0.89，0.88,1.32等,
        //e:平移，default：0 ,取值：-53,52等,
        //f:纵称，default：0 ,取值：-53,52等,
        var c = getRandom(trans['c'][0], trans['c'][1]);
        var b = getRandom(trans['b'][0], trans['b'][1]);
        //alert(c+','+b);
        //ctx.transform(1,b, c, 1, 0, 0);
        start += 11;
    }
    //参考下面链接；可发送给客户端
    //console.log('code:' + result);
    //console.log();
    return {
        code: result,
        img: '<img src="' + canvas.toDataURL() + '" alt="" />'
    }
};

////输出文件到out.png.可方便使用
//var buf = canvas.toDataURL();
//var base64Data = buf.replace(/^data:image\/\w+;base64,/, "");
//var dataBuffer = new Buffer(base64Data, 'base64');
//
//var fs = require("fs");
//fs.writeFile("out.png", dataBuffer, function (err) {
//    if (err) {
//        console.log("errro！");
//    } else {
//        console.log("保存成功！");
//    }
//});