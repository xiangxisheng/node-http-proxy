const http = require('http');
const url = require('url');
//const zlib = require('zlib');
module.exports = (config, httpsrv_req, _callBack) => {
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
        const oResHeader = global.oClass.http.header(httpreq_res.headers);
        oResHeader.set('Connection', 'keep-alive');//保持长连接
        oResHeader.del('Server');
        oResHeader.del('X-Powered-By');
        oResHeader.statusCode = httpreq_res.statusCode;//WEB返回的状态号码
        oResHeader.statusMessage = httpreq_res.statusMessage;//WEB返回的状态消息
        oResHeader.realURL = httpsrv_req.realURL;//用户请求的URL
        _callBack(httpreq_res, oResHeader);
    });
    return httpreq;
};
