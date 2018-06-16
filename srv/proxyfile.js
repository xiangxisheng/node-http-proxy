/* global __dirname */

const zlib = require('zlib');
const path = require('path');
const oFun = require(__dirname + '/../src/fun.js');
global.oFun = oFun;
const oClass = require(__dirname + '/../src/class.js');
global.oClass = oClass;
oFun.global.console();
const config = {};
config.logdir = path.join(path.dirname(__dirname), 'log');
config.listen_port = process.argv[2] ? process.argv[2] : 80;
config.listen_addr = process.argv[3] ? process.argv[3] : '0.0.0.0';
config.proxy_pass = 'http://10.86.3.51';//反向代理后端WEB
config.gzip_options = {};
config.gzip_options.level = zlib.Z_BEST_COMPRESSION;
config.debug = 0;
global.config = config;
console.info(config);
oClass.http.createServer(config, (httpsrv_req, httpsrv_res) => {
    const oStr = oClass.common.string();
    if (!httpsrv_req.headers.hasOwnProperty('host')) {
        console.info('have no host in httpsrv_req.headers');
        return;
    }
    var host = httpsrv_req.headers.host;
    host = host.split(':')[0];
    oStr.setSource(host);
    oStr.setSuffix('.http81.firadio.net');
    let httpreq;
    if (oStr.match_suffix()) {
        httpsrv_req.headers.host = oStr.getPrefix();
        httpreq = oClass.http.createRequest(config, httpsrv_req, (httpreq_res, oResHeader) => {
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
            oFun.http.responseData(oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader);
        });
    }
    oClass.http.requestForward(httpsrv_req, httpreq);
});
