const http = require('http');
const url = require('url');
const path = require('path');
Array.prototype.contain = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) return true;
    }
    return false;
};

module.exports = (oFun, config) => {

    const isFileDL = function (urlinfo) {
        if (urlinfo.pathname === '/') {
            return false;
        }
        const arr = ['', '.htm', '.html', '.php', '.asp', '.aspx'];
        const extname = path.extname(urlinfo.pathname);
        if (arr.contain(extname)) {
            return false;
        }
        // console.log(extname);
        return true;
    };
    const getNewHost = function (host) {
        if (host === undefined) {
            return '';
        }
        host = host.replace(/\-/g, ',');
        host = host.replace(/\./g, '-');
        host = host.replace(/\,/g, '--');
        host += '.feieryun.net:8001';
        return host;
    };
    const getDirname = function (pathname) {
        pathname = pathname.replace(/\/$/, '');
        if (path.extname(pathname) === '') {
            return pathname;
        }
        return path.dirname(pathname);
    };
    // Create an HTTP server
    const httpsrv = http.createServer((httpsrv_req, httpsrv_res) => {
        const urlinfo = url.parse(httpsrv_req.url); // 取得用户要访问的URL
        urlinfo.dirname = getDirname(urlinfo.pathname);
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
        realProto = realProto.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
        const loguuid = httpsrv_req.headers['x-nws-log-uuid'];
        const host = httpsrv_req.headers.host;
        httpsrv_req.realURL = realProto + '://' + host + httpsrv_req.url;
        httpsrv_req.fastHost = getNewHost(host);
        httpsrv_req.realProto = realProto;
        httpsrv_req.urlinfo = urlinfo;
        //console.log(uuid + "\r\n" + httpsrv_req.realURL);
        //fun.log(`${realip}\t${proto}://${httpsrv_req.headers.host}${urlinfo.pathname}[${httpsrv_req.method}]`);
        if (realProto === 'http' && httpsrv_req.method === 'GET' && isFileDL(urlinfo)) {
            var newurl = realProto + '://' + httpsrv_req.fastHost + httpsrv_req.url;
            // console.log(newurl);
            httpsrv_res.writeHead(302, {'Location': newurl});
            httpsrv_res.end();
            return;
        }
        oFun.log.site(oFun, config, host, `${remoteSocket}\t${realIP}\t[${realProto}]${urlinfo.pathname}[${httpsrv_req.method}]`);
        const httpreq = oFun.http.request(oFun, config, httpsrv_res, httpsrv_req);
        global.oClass.http.requestForward(httpsrv_req, httpreq);
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
