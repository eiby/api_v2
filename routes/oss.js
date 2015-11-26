/**
 * Created by 1 on 15/8/14.
 */
var ALY = require('aliyun-sdk');

var oss = new ALY.OSS({
    "accessKeyId": "eJ3GLV07j9DD4LY5",
    "secretAccessKey": "iAxAHoAuG1ZYwjIRLfyYKK2oF9WcCe",
    // 根据你的 oss 实例所在地区选择填入
    // 杭州：http://oss-cn-hangzhou.aliyuncs.com
    // 北京：http://oss-cn-beijing.aliyuncs.com
    // 青岛：http://oss-cn-qingdao.aliyuncs.com
    // 深圳：http://oss-cn-shenzhen.aliyuncs.com
    // 香港：http://oss-cn-hongkong.aliyuncs.com
    // 注意：如果你是在 ECS 上连接 OSS，可以使用内网地址，速度快，没有带宽限制。
    // 杭州：http://oss-cn-hangzhou-internal.aliyuncs.com
    // 北京：http://oss-cn-beijing-internal.aliyuncs.com
    // 青岛：http://oss-cn-qingdao-internal.aliyuncs.com
    // 深圳：http://oss-cn-shenzhen-internal.aliyuncs.com
    // 香港：http://oss-cn-hongkong-internal.aliyuncs.com
    endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2013-10-15'
});

module.exports = oss;