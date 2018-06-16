const http = require('http');
const url = require('url');
//const zlib = require('zlib');
module.exports = (oFun, config, httpsrv_res, httpsrv_req) => {
    const oProxyPass = url.parse(config.proxy_pass);
    const httpreq_options = {
        protocol: oProxyPass.protocol ? oProxyPass.protocol : 'http:',
        host: oProxyPass.host,
        family: 4, //IP address family to use when resolving host
        port: oProxyPass.port ? oProxyPass.port : 80,
        method: httpsrv_req.method, //GET,POST,HEAD
        path: httpsrv_req.url,
        headers: httpsrv_req.headers//来自用户请求的头
    };
    const httpreq = http.request(httpreq_options, (httpreq_res) => {
        //给用户发送WEB返回的头
        //httpreq_ctype = httpreq_ctype.trim();
        if (oFun.http.limit.filesize(oFun, config, httpsrv_res, httpsrv_req, httpreq_res)) {
            return;//达到限制条件,下面就不执行了
        }
        const oResHeader = global.oClass.http.header(httpreq_res.headers);
        oResHeader.set('Connection', 'keep-alive');//保持长连接
        oResHeader.del('Server');
        oResHeader.del('X-Powered-By');
        oResHeader.statusCode = httpreq_res.statusCode;//WEB返回的状态号码
        oResHeader.statusMessage = httpreq_res.statusMessage;//WEB返回的状态消息
        oResHeader.realURL = httpsrv_req.realURL;//用户请求的URL
        //const httpreq_oInfo = oFun.http.getInfoByWebRes(httpsrv_req, httpreq_res, oResHeader);
        var sGzipFlag = 'ignore';
        const is200 = (httpreq_res.statusCode === 200);
        const is2XX = (httpreq_res.statusCode >= 200 && httpreq_res.statusCode <= 299);
        if (!is200) {
            //跳过非2XX状态的请求
        } else
        if (oResHeader.exists('content-encoding')) {
            const encoding = oResHeader.get('content-encoding');
            //console.log(encoding + ',' + httpreq_ctype + ',' + httpsrv_req.realURL);
            const isText = (oResHeader.contentType() === 'text/html');
            if (encoding === 'gzip' && isText) {
                sGzipFlag = 'de-encode';
                //var gunzipStream = zlib.createGunzip();
                //httpreq_res.pipe(zlib.createGunzip());
            }
        } else if (0) {
            //httpreq_res.pipe(zlib.createGzip(config.gzip_options));
            oResHeader.set('Content-Encoding', 'gzip');
            oResHeader.set('Content-Length-Before', oResHeader.get('content-length'));
            oResHeader.del('content-length');
        } else {
            sGzipFlag = 'encode';
        }
        if (config.debug && httpreq_res.statusCode === 304) {
            httpreq_res.statusCode = 200;
            httpreq_res.statusMessage = 'OK';
        }
        if (config.debug) {
            oResHeader.set('Expires', -1);
            oResHeader.set('Cache-Control', 'no-cache');
            oResHeader.set('Pragma', 'no-cache');
        }
        if (sGzipFlag === 'ignore') {
            httpsrv_res.writeHead(httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
        } else {
            oResHeader.set('Content-Encoding', 'gzip');
            oResHeader.set('Content-Length-Before', oResHeader.get('content-length'));
        }
        oFun.http.responseData(oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader);
    });
    return httpreq;
};
