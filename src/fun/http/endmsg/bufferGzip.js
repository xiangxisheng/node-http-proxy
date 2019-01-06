const zlib = require('zlib');

const acceptGzip = function (headers) {
    // 判断是否接受GZIP压缩算法
    if (!headers.hasOwnProperty('accept-encoding')) {
        // 默认表示不接受
        return false;
    }
    // 取得acceptEncoding接受哪些算法
    const acceptEncoding = headers['accept-encoding'].split(',');
    for (var i = 0; i < acceptEncoding.length; i++) {
        const ae = acceptEncoding[i].replace(/(^\s*)|(\s*$)/g, '');
        if (ae === 'gzip') {
            // console.log('have gzip in acceptEncoding');
            return true;
        }
    }
    return false;
};
module.exports = (oFun, config, buffer, httpreq_res, httpsrv_res, oResHeader, httpsrv_req) => {
    // 是否跳过编码（不接受GZIP肯定要跳过了）
    var isSkipEncoding = !acceptGzip(httpsrv_req.headers);
    if (config.disableEncoding || isSkipEncoding) {
        // 跳过编码压缩的
        oResHeader.set('content-length', buffer.length);
        oResHeader.del('content-encoding');
        httpsrv_res.end(buffer);
        oFun.cache.put(oResHeader, buffer);
        return;
    }
    // 需要编码压缩的
    zlib.gzip(buffer, function (err, encoded) {
        // console.log('zlib.gzip ' + oResHeader.hostname);
        if (err) {
            console.error(`error on zlib.gzip2: ${err.message}`);
            return;
        }
        if (config.sys.http.limit.enabled && config.sys.http.limit.max_gzsize_byte && encoded.length > config.sys.http.limit.max_gzsize_byte) {
            oFun.http.endmsg.sizeLimited(httpsrv_res, encoded.length, config.sys.http.limit.max_gzsize_byte);
            return;
        }
        oResHeader.set('content-length', encoded.length);
        try {
            httpsrv_res.writeHead(httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
        } catch (err) {
            console.error(err, httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
        }
        httpsrv_res.end(encoded);
        // console.log('[res.end] zlib.gzip ' + oResHeader.hostname);
        oFun.cache.put(oResHeader, encoded);
    });
};
