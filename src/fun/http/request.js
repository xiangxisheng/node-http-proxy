const http = require('http');
const url = require('url');
const fs = require('fs');
//const zlib = require('zlib');
module.exports = (oFun, config, httpsrv_res, httpsrv_req) => {
    httpsrv_req.headers.host = httpsrv_req.headers.hostname;
    const callBack = (httpreq_res, oResHeader) => {
        //给用户发送WEB返回的头
        //httpreq_ctype = httpreq_ctype.trim();
        if (oFun.http.limit.filesize(oFun, config, httpsrv_res, httpsrv_req, httpreq_res)) {
            return;//达到限制条件,下面就不执行了
        }
        // 取得后端WEB服务器返回的headers
        if (1) {
            oResHeader.del('Content-Security-Policy');
            oResHeader.del('X-Content-Security-Policy');
            oResHeader.del('X-Webkit-Csp');
        }
        oResHeader.fastHost = httpsrv_req.fastHost;
        oResHeader.realProto = httpsrv_req.realProto;
        oResHeader.urlinfo = httpsrv_req.urlinfo;
        //const httpreq_oInfo = oFun.http.getInfoByWebRes(httpsrv_req, httpreq_res, oResHeader);
        if (httpreq_res.statusCode === 503) {
            fs.readFile('./html/503.htm', function(err, data) {
                // console.log(httpsrv_req.realURL);
                oResHeader.set('Content-Type', 'text/html; charset=utf-8');
                oResHeader.set('Content-Length', data.length);
                httpsrv_res.writeHead(200, oResHeader.getAll());
                httpsrv_res.end(data);
            });
            return;
        }
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
                // 后端WEB服务器返回的HTML网页是通过gzip做了压缩
                sGzipFlag = 'de-encode'; // 告知后面的处理程序进行【解压后再编码】的操作
                //var gunzipStream = zlib.createGunzip();
                //httpreq_res.pipe(zlib.createGunzip());
            }
        } else if (0) {
            //httpreq_res.pipe(zlib.createGzip(config.gzip_options));
            oResHeader.set('Content-Encoding', 'gzip');
            oResHeader.set('Content-Length-Before', oResHeader.get('content-length'));
            oResHeader.del('content-length');
        } else {
            // 告知后面的处理程序进行【编码】的操作
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
        oFun.http.responseData(oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader, httpsrv_req);
    };
    httpsrv_req.url = (function (urlinfo) {
        // urlinfo = oFun.common.str_replace('.woff2-v=', '.woff2?v=', urlinfo)
        // console.info(urlinfo);
        return urlinfo;
    })(httpsrv_req.url);
    // 向后端WEB服务器发送HTTP请求
    return oClass.http.createRequest(config, httpsrv_req, callBack);
};
