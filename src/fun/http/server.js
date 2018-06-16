const http = require('http');
const url = require('url');
module.exports = (oFun, config) => {
    // Create an HTTP server
    const httpsrv = http.createServer((httpsrv_req, httpsrv_res) => {
        const urlinfo = url.parse(httpsrv_req.url); // 取得用户要访问的URL
        const remoteAddress = httpsrv_res.socket.remoteAddress;
        const remotePort = httpsrv_res.socket.remotePort;
        const remoteSocket = remoteAddress + ':' + remotePort;
        var realIP = remoteAddress; // 腾讯云CDN请求过来的IP
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-for')) {
            // 从腾讯云CDN获得用户的真实IP
            realIP = httpsrv_req.headers['x-forwarded-for'];
        }
        // 告知后端WEB服务器的用户真实IP
        httpsrv_req.headers['x-real-ip'] = realIP;
        let realProto = 'http';
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-proto')) {
            realProto = httpsrv_req.headers['x-forwarded-proto'];//客户请求的协议
        }
        const loguuid = httpsrv_req.headers['x-nws-log-uuid'];
        httpsrv_req.realURL = realProto + '://' + httpsrv_req.headers.host + httpsrv_req.url;
        //console.log(uuid + "\r\n" + httpsrv_req.realURL);
        //fun.log(`${realip}\t${proto}://${httpsrv_req.headers.host}${urlinfo.pathname}[${httpsrv_req.method}]`);
        const host = httpsrv_req.headers.host;
        oFun.log.site(oFun, config, host, `${remoteSocket}\t${realIP}\t[${realProto}]${urlinfo.pathname}[${httpsrv_req.method}]`);
        const httpreq = oFun.http.request(oFun, config, httpsrv_res, httpsrv_req);
        httpreq.on('error', (err) => {
            console.error(`error on httpreq: ${err.message}`);
        });
        httpsrv_req.on('data', (chunk) => {
            //console.log('httpsrv_req.on.data');
            //收到用户POST过来数据，所以转发给Web服务器
            httpreq.write(chunk);
        });
        httpsrv_req.on('end', () => {
            //console.log('httpsrv_req.on.end');
            //因为用户结束了请求，所以也就跟Web服务器断开连接
            httpreq.end();
        });
    });
    httpsrv.on('connect', (req, cltSocket, head) => {
        // connect to an origin server
        console.info('connect to an origin server');
    });
    httpsrv.on('error', (err) => {
        console.error(err);
    });
    httpsrv.listen(config.listen_port, config.listen_addr, () => {
        console.info('httpserver.listen in ' + config.listen_addr + ':' + config.listen_port);
    });
};
