const http = require('http');
const url = require('url');
module.exports = (config, _callBack) => {
    // Create an HTTP server
    const httpsrv = http.createServer((httpsrv_req, httpsrv_res) => {
        const urlinfo = url.parse(httpsrv_req.url);
        const remoteAddress = httpsrv_res.socket.remoteAddress;
        const remotePort = httpsrv_res.socket.remotePort;
        const remoteSocket = remoteAddress + ':' + remotePort;
        var realIP = httpsrv_res.socket.remoteAddress;
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-for')) {
            realIP = httpsrv_req.headers['x-forwarded-for'];//获取真实IP
        }
        httpsrv_req.headers['x-real-ip'] = realIP;
        let realProto = 'http';
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-proto')) {
            realProto = httpsrv_req.headers['x-forwarded-proto'];//客户请求的协议
        }
        const loguuid = httpsrv_req.headers['x-nws-log-uuid'];
		const host = httpsrv_req.headers.host;
        httpsrv_req.realURL = realProto + '://' + host + httpsrv_req.url;
        global.oFun.log.site(global.oFun, config, host, `${remoteSocket}\t${realIP}\t[${realProto}]${urlinfo.pathname}[${httpsrv_req.method}]`);
        _callBack(httpsrv_req, httpsrv_res);
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
