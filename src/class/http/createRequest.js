const http = require('http');
const url = require('url');
//const zlib = require('zlib');

module.exports = (config, httpsrv_req, _callBack) => {
    httpsrv_req.headers.host = httpsrv_req.headers.hostname;
    let proxy_pass = config.proxy_pass;
    if (httpsrv_req.headers.hostname === 'yun.mcys.top') {
        proxy_pass = 'http://10.86.7.11:8000';
    }
    if (httpsrv_req.headers.hostname === 'mcys.anan.cc') {
        proxy_pass = 'http://10.86.7.11:8000';
    }
    if (httpsrv_req.headers.hostname === 'mcys.feieryun.net') {
        proxy_pass = 'http://10.86.7.11:8000';
    }
    const oProxyPass = url.parse(proxy_pass);
    const httpreq_options = {
        protocol: oProxyPass.protocol ? oProxyPass.protocol : 'http:',
        host: oProxyPass.hostname,
        family: 4, //IP address family to use when resolving host
        port: oProxyPass.port ? oProxyPass.port : 80,
        method: httpsrv_req.method, //GET,POST,HEAD
        path: httpsrv_req.url,
        headers: httpsrv_req.headers//来自用户请求的头
    };
    const httpreq = http.request(httpreq_options, (httpreq_res) => {
        //给用户发送WEB返回的头
        const oResHeader = global.oClass.http.header(httpreq_res.headers);
        oResHeader.set('Connection', 'keep-alive');//保持长连接
        oResHeader.del('Server');
        oResHeader.del('X-Powered-By');
        oResHeader.statusCode = httpreq_res.statusCode;//WEB返回的状态号码
        oResHeader.statusMessage = httpreq_res.statusMessage;//WEB返回的状态消息
        oResHeader.method = httpsrv_req.method;
        oResHeader.realURL = httpsrv_req.realURL;//用户请求的URL
        oResHeader.hostname = httpsrv_req.headers.hostname;
        oResHeader.urlinfo = httpsrv_req.urlinfo
        _callBack(httpreq_res, oResHeader);
    });
    return httpreq;
};
