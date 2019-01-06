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
config.domains = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/domains.json'), 'utf-8'));
config.servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/servers.json'), 'utf-8'));
config.sys = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/sys.json'), 'utf-8'));
config.sys.diag.logdir = path.join(path.dirname(__dirname), 'log');
config.sys.http.listen_addr = process.argv[3] ? process.argv[3] : '0.0.0.0';
config.sys.http.listen_port = process.argv[2] ? parseInt(process.argv[2], 10) : 80;
config.sys.http.ssl.enabled = (config.sys.http.listen_port.toString().indexOf('443') === 0);
config.sys.http.ssl.key = fs.readFileSync('cert/feieryun.net.key');
config.sys.http.ssl.cert = fs.readFileSync('cert/feieryun.net.cer');
config.sys.http.proxy_pass = 'http://10.86.2.72';//反向代理后端WEB
config.sys.http.limit = {};
config.sys.http.limit.enabled = 0;
config.sys.http.limit.max_size_byte = 1024 * 1024 * 0.8;//限制文件大小(字节)
config.sys.http.limit.max_gzsize_byte = 1024 * 1024 * 0.3;//限制GZ压缩后的大小(字节)
config.sys.http.process = 0; //开启文本处理模块（一般只需在SLB中开启）
config.sys.http.beian.enabled = 0; //是否开启备案检测
global.config = config;
console.info(config);
oClass.http.createServer(config, (httpsrv_req, httpsrv_res) => {
    const oStr = oClass.common.string();
    var hostname = httpsrv_req.headers.hostname;
    oStr.setSource(hostname);
    oStr.setSuffix('.feieryun.net');
    let httpreq;
    if (oStr.match_suffix()) {
        var host = oStr.getPrefix();
        host = host.replace(/\-\-/g, ',');
        host = host.replace(/\-/g, '.');
        host = host.replace(/\,/g, '-');
        httpsrv_req.headers.hostname = host;
        httpreq = oClass.http.createRequest(config, httpsrv_req, (httpreq_res, oResHeader) => {
            if (!oResHeader.exists('Access-Control-Allow-Origin')) {
                // 允许任何网站调用该页面
                oResHeader.set('Access-Control-Allow-Origin', '*');
            }
            httpsrv_res.writeHead(httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
            httpreq_res.on('data', (chunk) => {
                httpsrv_res.write(chunk);
            });
            httpreq_res.on('end', () => {
                httpsrv_res.end();
            });
        });
    } else {
        httpreq = oClass.http.createRequest(config, httpsrv_req, (httpreq_res, oResHeader) => {
            if (oFun.http.limit.filesize(oFun, config, httpsrv_res, httpsrv_req, httpreq_res)) {
                return;//达到限制条件,下面就不执行了
            }
            const sGzipFlag = oFun.http.getGzipFlag(config, httpsrv_res, oResHeader);
            oFun.http.responseData(oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader, httpsrv_req);
        });
    }
    oClass.http.requestForward(httpsrv_req, httpreq);
});
