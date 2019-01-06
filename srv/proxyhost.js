/* global __dirname */

const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
const oFun = require(__dirname + '/../src/fun.js');
global.oFun = oFun;
const oClass = require(__dirname + '/../src/class.js');
global.oClass = oClass;
oFun.global.console();
const config = {};
config.disableEncoding = true;
config.domains = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/domains.json'), 'utf-8'));
config.servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/servers.json'), 'utf-8'));
config.sys = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/sys.json'), 'utf-8'));
config.sys.diag.logdir = path.join(path.dirname(__dirname), 'log');
config.sys.http.listen_addr = process.argv[3] ? process.argv[3] : '0.0.0.0';
config.sys.http.listen_port = process.argv[2] ? parseInt(process.argv[2], 10) : 80;
config.sys.http.process = 0; //开启文本处理模块（一般只需在SLB中开启）
config.sys.http.beiancheck = 0; //是否开启备案检测
global.config = config;
console.info(config);

if (!global.hasOwnProperty('cache_url')) {
    global.cache_url = {};
}

var display_url = function (httpsrv_req) {
    const writeList = [];
    writeList.push('h5.qzone.qq.com');
    writeList.push('so.360kan.com');
    writeList.push('www.360kan.com');

    writeList.push('c.y.qq.com');
    writeList.push('api.discuz.qq.com');
    writeList.push('w.qzone.qq.com');
    writeList.push('w.cnc.qzone.qq.com');
    writeList.push('face.qq.com');
    writeList.push('logic.content.qq.com');
    writeList.push('kg.qq.com');
    writeList.push('mobile.qzone.qq.com');

    writeList.push('mobilecdn.kugou.com');
    writeList.push('addon.discuz.com');

    writeList.push('zhannei.baidu.com');

    // writeList.push('api.spp3.cn');
    // writeList.push('sq.xsfuh.pw');

    if (writeList.indexOf(httpsrv_req.headers.host) >= 0) {
        return;
    }
    console.log(`[${httpsrv_req.method}] ${httpsrv_req.headers.host}`);
    // console.log(`[${httpsrv_req.method}] ${httpsrv_req.realURL}`);
};
oClass.http.createServer(config, (httpsrv_req, httpsrv_res) => {
    var host = httpsrv_req.headers.host;
    httpsrv_req.realURL = 'http://' + host + httpsrv_req.url;
    if (httpsrv_req.method === 'GET' && global.cache_url.hasOwnProperty(httpsrv_req.realURL)) {
        const obj = global.cache_url[httpsrv_req.realURL];
        if ((((+new Date()) - obj.timestamp) / 1000) < 600) {
            httpsrv_res.writeHead(200, obj.oResHeader.getAll());
            httpsrv_res.end(obj.data);
            // console.log(`cached ${httpsrv_req.realURL}`);
            return;
        }
    }
    display_url(httpsrv_req);
    host = host.split(':')[0];
    config.sys.http.proxy_pass = 'http://' + host + ':80';
    httpreq = oClass.http.createRequest(config, httpsrv_req, (httpreq_res, oResHeader) => {
        const sGzipFlag = oFun.http.getGzipFlag(config, httpsrv_res, oResHeader);
        oFun.http.responseData(oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader, httpsrv_req);
    });
    oClass.http.requestForward(httpsrv_req, httpreq);
});
