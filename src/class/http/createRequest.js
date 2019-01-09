const http = require('http');
const url = require('url');
//const zlib = require('zlib');
const isDomain = function (httpsrv_req, domain) {
    const hostname = httpsrv_req.headers.hostname;
    return isDomain2(hostname, domain);
};
const isDomain2 = function (hostname, domain) {
    const toArr = function (domain) {
        const retArr = [];
        const arr = domain.split('.');
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === '') continue;
            retArr.push(arr[i]);
        }
        return retArr;
    };
    const hostnameArr = toArr(hostname);
    const domainArr = toArr(domain);
    if (hostnameArr.length < domainArr.length) {
        return false;
    }
    for (var i = 0; i < domainArr.length; i++) {
        const name1 = hostnameArr[hostnameArr.length - i - 1];
        const name2 = domainArr[domainArr.length - i - 1];
        if (name1 !== name2) {
            return false;
        }
    }
    return true;
};
const getServerByHost = function (hostname) {
    // 通过hostname取得服务器英文名，例如cn641
    const DomainToArr = function (domain) {
        const retArr = [];
        const arr = domain.split('.');
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === '') continue;
            retArr.push(arr[i]);
        }
        return retArr;
    };
    const arr = DomainToArr(hostname);
    for (var i = 0; i < arr.length -1; i++) {
        const domain1 = arr.slice(i).join('.');
        if (config.domains.hasOwnProperty(domain1)) {
            return config.domains[domain1];
        }
        const domain2 = '*.' + arr.slice(i + 1).join('.');
        if (config.domains.hasOwnProperty(domain2)) {
            return config.domains[domain2];
        }
    }
    return false;
};
const getInfoByServerName = function (serverName, serverType) {
    if (!config.servers.hasOwnProperty(serverName)) {
        return false;
    }
    const srvconf = config.servers[serverName];
    if (!srvconf.enabled) {
        return false;
    }
    if (!srvconf.servers.hasOwnProperty(serverType)) {
        return false;
    }
    return srvconf.servers[serverType];
};
module.exports = (config, httpsrv_req, _callBack) => {
    httpsrv_req.headers.host = httpsrv_req.headers.hostname;
    let oProxyPass = url.parse(config.sys.http.proxy_pass);
    // 首先取得服务器英文名，例如cn641
    const serverName = getServerByHost(httpsrv_req.headers.hostname);
    if (serverName) {
        // 然后取得服务器的信息
        const serverInfo = getInfoByServerName(serverName, config.sys.http.type);
        if (serverInfo) {
            oProxyPass = {};
            oProxyPass.protocol = serverInfo[0] + ':';
            oProxyPass.hostname = serverInfo[1];
            oProxyPass.port = serverInfo[2];
            console.log(oProxyPass);
        }
    }
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
