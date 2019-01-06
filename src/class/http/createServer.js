const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');

module.exports = (config, _callBack) => {
    const getRemoteAddress = function (httpsrv_req, httpsrv_res) {
        if (httpsrv_res.hasOwnProperty('socket') && (typeof httpsrv_res.socket) === 'object' && httpsrv_res.socket !== null && httpsrv_res.socket.remoteAddress) {
            return httpsrv_res.socket.remoteAddress;
        }
        if (httpsrv_req.hasOwnProperty('connection') && (typeof httpsrv_req.connection) === 'object' && httpsrv_req.connection !== null && httpsrv_req.connection.remoteAddress) {
            return httpsrv_req.connection.remoteAddress;
        }
        return '0.0.0.0';
    };
    const getRemotePort = function (httpsrv_req, httpsrv_res) {
        if (httpsrv_res.hasOwnProperty('socket') && (typeof httpsrv_res.socket) === 'object' && httpsrv_res.socket !== null && httpsrv_res.socket.remotePort) {
            return httpsrv_res.socket.remotePort;
        }
        if (httpsrv_req.hasOwnProperty('connection') && (typeof httpsrv_req.connection) === 'object' && httpsrv_req.connection !== null && httpsrv_req.connection.remotePort) {
            return httpsrv_req.connection.remotePort;
        }
        return 0;
    };
    const getDirname = function (pathname) {
        pathname = pathname.replace(/\/$/, '');
        if (path.extname(pathname) === '') {
            return pathname;
        }
        return path.dirname(pathname);
    };
    const removePortByHost = function (host) {
        const colon_pos = host.lastIndexOf(':');
        if (colon_pos >= 0) {
            host = host.substr(0, colon_pos);
        }
        return host;
    };
    // Create an HTTP server
    const callback = (httpsrv_req, httpsrv_res) => {
        if (!httpsrv_req.headers.hasOwnProperty('host')) {
            console.info('have no host in httpsrv_req.headers');
            httpsrv_res.end();
            return;
        }
        // 先把host的端口去掉,变为hostname
        httpsrv_req.headers.hostname = removePortByHost(httpsrv_req.headers.host);
        // 然后对hostname去掉前后多余的小数点
        httpsrv_req.headers.hostname = httpsrv_req.headers.hostname.replace(/^\.+|\.+$/gm, '');
        // 取得用户要访问的URL的请求信息
        const urlinfo = url.parse(httpsrv_req.url);
        urlinfo.extname = path.extname(urlinfo.pathname);
        urlinfo.dirname = getDirname(urlinfo.pathname);
        urlinfo.host = httpsrv_req.headers.host;
        urlinfo.hostname = httpsrv_req.headers.hostname;
        const remoteAddress = getRemoteAddress(httpsrv_req, httpsrv_res);
        const remotePort = getRemotePort(httpsrv_req, httpsrv_res);
        const remoteSocket = remoteAddress + ':' + remotePort;
        var realIP = remoteAddress; // 腾讯云CDN请求过来的IP
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-for')) {
            // 从腾讯云CDN获得用户的真实IP
            realIP = httpsrv_req.headers['x-forwarded-for'];
        }
        // 告知后端WEB服务器：腾讯云CDN请求过来的IP
        httpsrv_req.headers['remoteSocket'] = remoteSocket;
        // 告知后端WEB服务器：用户的真实IP（由腾讯云获取）
        httpsrv_req.headers['x-real-ip'] = realIP;
        let realProto = 'http';
        if (httpsrv_req.headers.hasOwnProperty('x-forwarded-proto')) {
            realProto = httpsrv_req.headers['x-forwarded-proto'];//客户请求的协议
        }
        realProto = realProto.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
        const loguuid = httpsrv_req.headers['x-nws-log-uuid'];
        httpsrv_req.realURL = realProto + '://' + httpsrv_req.headers.host + httpsrv_req.url;
        httpsrv_req.realProto = realProto;
        httpsrv_req.urlinfo = urlinfo;
        // global.oFun.log.site(global.oFun, config, httpsrv_req.headers.host, `${remoteSocket}\t${realIP}\t[${realProto}]${urlinfo.pathname}[${httpsrv_req.method}]`);
        _callBack(httpsrv_req, httpsrv_res);
    };
    let httpsrv = (config.sys.http.ssl.enabled) ? https.createServer(config.sys.http.ssl, callback) : http.createServer(callback);
    httpsrv.on('connect', (req, cltSocket, head) => {
        // connect to an origin server
        console.info('connect to an origin server');
    });
    httpsrv.on('error', (err) => {
        console.error(err);
    });
    httpsrv.listen(config.sys.http.listen_port, config.sys.http.listen_addr, () => {
        console.info('httpserver.listen in ' + config.sys.http.listen_addr + ':' + config.sys.http.listen_port);
    });
};
