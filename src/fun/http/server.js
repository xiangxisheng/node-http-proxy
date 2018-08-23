const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
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
        arr.push('.css', '.ttf', '.woff', '.woff2');
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
        host += '.feieryun.net';
        return host;
    };

    const suffixMatch = function (suffix, fulltext) {
        const cha = fulltext.length - suffix.length;
        if (cha < 0) return false;
        const i = fulltext.lastIndexOf(suffix);
        return (i === cha);
    };
    const isBeian = function (host) {
        host = host + '.';
        console.log(host);
        const beianList = global.config.beianList;
        const len = beianList.length;
        for (var i = 0; i < len; i++) {
            const domain = beianList[i];
            if (domain + '.' === host) {
                return true;
            }
            if (suffixMatch('.' + domain + '.', host)) {
                return true;
            }
        }
        return false;
    };
    const isCloudflare = function (headers) {
        if (headers.hasOwnProperty('x-real-ip')) {
            return true;
        }
        if (headers.hasOwnProperty('cookie')) {
            if (headers.cookie.indexOf('__cfduid=') === 0) {
                return true;
            }
        }
        if (headers.hasOwnProperty('Referer')) {
            return true;
        }
        console.log(headers);

        if (!headers.hasOwnProperty('cf-ipcountry')) {
            return false;
        }
        if (!headers.hasOwnProperty('cf-ray')) {
            return false;
        }
        if (!headers.hasOwnProperty('cf-visitor')) {
            return false;
        }
        if (!headers.hasOwnProperty('cf-connecting-ip')) {
            return false;
        }
        if (!headers.hasOwnProperty('x-real-ip')) {
            return false;
        }

        return true;
    };
    // Create an HTTP server
    oClass.http.createServer(config, (httpsrv_req, httpsrv_res) => {
        const remoteSocket = httpsrv_req.headers['remoteSocket'];
        const realIP = httpsrv_req.headers['x-real-ip'];
        const hostname = httpsrv_req.headers.hostname;
        oFun.log.site(oFun, config, hostname, `${remoteSocket}\t${realIP}\t[${httpsrv_req.realProto}]${httpsrv_req.urlinfo.pathname}[${httpsrv_req.method}]`);
        if (httpsrv_req.method === 'GET' && global.cache_url.hasOwnProperty(httpsrv_req.realURL)) {
            const obj = global.cache_url[httpsrv_req.realURL];
            const timeout = ((+new Date()) - obj.timestamp) / 1000;
            if (timeout < 600) {
                httpsrv_res.writeHead(200, obj.oResHeader.getAll());
                httpsrv_res.end(obj.data);
                // console.log(`cached ${httpsrv_req.realURL}`);
                return;
            }
        }
        httpsrv_req.fastHost = getNewHost(hostname);
        if (global.config.listen_port == 84) {
            const skipBeian = (isFileDL(httpsrv_req.urlinfo) && isCloudflare(httpsrv_req.headers));
            if (!isBeian(hostname) && !skipBeian) {
                fs.readFile('./html/non-beian.htm', 'utf8', function(err, data) {
                    data = data.replace(/\$\{hostname\}/g, hostname);
                    data = data.replace(/\$\{fastHost\}/g, httpsrv_req.fastHost);
                    data = data.replace(/\$\{pathUrl\}/g, httpsrv_req.url);
                    const buf = new Buffer(data);
                    const oResHeader = global.oClass.http.header();
                    oResHeader.set('Content-Type', 'text/html; charset=utf-8');
                    oResHeader.set('Content-Length', buf.length);
                    httpsrv_res.writeHead(400, oResHeader.getAll());
                    httpsrv_res.end(buf);
                });
                return;
            }
        }
        //console.log(uuid + "\r\n" + httpsrv_req.realURL);
        //oFun.log(`${realip}\t${proto}://${httpsrv_req.headers.host}${httpsrv_req.urlinfo.pathname}[${httpsrv_req.method}]`);
        if (1
            && httpsrv_req.method === 'GET'
            && isFileDL(httpsrv_req.urlinfo)
            && global.config.listen_port != 84
        ) {
            const port = (httpsrv_req.realProto === 'http') ? 8001 : 4431;
            var newurl = httpsrv_req.realProto + '://' + httpsrv_req.fastHost + ':' + port + httpsrv_req.url;
            // console.log(newurl);
            httpsrv_res.writeHead(302, {'Location': newurl});
            httpsrv_res.end();
            return;
        }
        const httpreq = oFun.http.request(oFun, config, httpsrv_res, httpsrv_req);
        global.oClass.http.requestForward(httpsrv_req, httpreq);
    });

};
