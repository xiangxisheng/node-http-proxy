const http = require('http');
const https = require('https');
const url = require('url');
module.exports = (config, _callBack) => {
    // Create an HTTP server
    const callback = (httpsrv_req, httpsrv_res) => {
        const urlinfo = url.parse(httpsrv_req.url);
        if (0 && !httpsrv_res.hasOwnProperty('socket')) {
            console.info('have no socket in httpsrv_res');
            httpsrv_res.end('have no socket in httpsrv_res');
            return;
        }
        if (0 && !httpsrv_req.hasOwnProperty('connection')) {
            console.info('have no connection in httpsrv_req');
            httpsrv_res.end('have no connection in httpsrv_req');
            return;
        }
        var remoteAddress = '0.0.0.0';
        var remotePort = 0;
        if (httpsrv_res.hasOwnProperty('socket') && (typeof httpsrv_res.socket) === 'object' && httpsrv_res.socket.remoteAddress) {
            remoteAddress = httpsrv_res.socket.remoteAddress;
            remotePort = httpsrv_res.socket.remotePort;
        } else
        if (httpsrv_req.hasOwnProperty('connection') && (typeof httpsrv_req.connection) === 'object' && httpsrv_req.connection.remoteAddress) {
            remoteAddress = httpsrv_req.connection.remoteAddress;
            remotePort = httpsrv_req.connection.remotePort;
        } else {
            httpsrv_res.end('have no remoteAddress');
        }
        const remoteSocket = remoteAddress + ':' + remotePort;
        var realIP = remoteAddress;
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-for')) {
            realIP = httpsrv_req.headers['x-forwarded-for'];//获取真实IP
        }
        httpsrv_req.headers['x-real-ip'] = realIP;
        let realProto = 'http';
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-proto')) {
            realProto = httpsrv_req.headers['x-forwarded-proto'];//客户请求的协议
        }
        realProto = realProto.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
        const loguuid = httpsrv_req.headers['x-nws-log-uuid'];
        const host = httpsrv_req.headers.host;
        httpsrv_req.realURL = realProto + '://' + host + httpsrv_req.url;
        // global.oFun.log.site(global.oFun, config, host, `${remoteSocket}\t${realIP}\t[${realProto}]${urlinfo.pathname}[${httpsrv_req.method}]`);
        _callBack(httpsrv_req, httpsrv_res);
    };
    let httpsrv = (config.listen_port.toString().indexOf('443') === 0) ? https.createServer(config, callback) : http.createServer(callback);
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
