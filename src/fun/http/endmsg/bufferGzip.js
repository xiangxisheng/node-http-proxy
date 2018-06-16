const zlib = require('zlib');
module.exports = (oFun, config, buffer, httpreq_res, httpsrv_res, oResHeader) => {
    zlib.gzip(buffer, function (err, encoded) {
        if (err) {
            console.error(`error on zlib.gzip2: ${err.message}`);
            return;
        }
        if (config.limit_gzsize_byte && encoded.length > config.limit_gzsize_byte) {
            oFun.http.endmsg.sizeLimited(httpsrv_res, encoded.length, config.limit_gzsize_byte);
            return;
        }
        oResHeader.set('content-length', encoded.length);
        try {
            httpsrv_res.writeHead(httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
        } catch (err) {
            console.error(err, httpreq_res.statusCode, httpreq_res.statusMessage, oResHeader.getAll());
        }
        httpsrv_res.end(encoded);
    });
};
