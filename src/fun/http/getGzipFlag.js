module.exports = (config, httpsrv_res, oResHeader) => {
    var sGzipFlag = 'ignore';
    const is200 = (oResHeader.statusCode === 200);
    const is2XX = (oResHeader.statusCode >= 200 && oResHeader.statusCode <= 299);
    if (!is200) {
        //跳过非2XX状态的请求
    } else
    if (oResHeader.exists('content-encoding')) {
        const encoding = oResHeader.get('content-encoding');
        //console.log(encoding + ',' + httpreq_ctype + ',' + httpsrv_req.realURL);
        const isText = (oResHeader.contentType() === 'text/html');
        if (encoding === 'gzip' && isText) {
            sGzipFlag = 'de-encode';
            //var gunzipStream = zlib.createGunzip();
            //httpreq_res.pipe(zlib.createGunzip());
        }
    } else if (0) {
        //httpreq_res.pipe(zlib.createGzip(config.gzip_options));
        oResHeader.set('Content-Encoding', 'gzip');
        oResHeader.set('Content-Length-Before', oResHeader.get('content-length'));
        oResHeader.del('content-length');
    } else {
        sGzipFlag = 'encode';
    }
    if (config.debug && oResHeader.statusCode === 304) {
        oResHeader.statusCode = 200;
        oResHeader.statusMessage = 'OK';
    }
    if (config.debug) {
        oResHeader.set('Expires', -1);
        oResHeader.set('Cache-Control', 'no-cache');
        oResHeader.set('Pragma', 'no-cache');
    }
    if (sGzipFlag === 'ignore') {
        httpsrv_res.writeHead(oResHeader.statusCode, oResHeader.statusMessage, oResHeader.getAll());
    } else {
        oResHeader.set('Content-Encoding', 'gzip');
        oResHeader.set('Content-Length-Before', oResHeader.get('content-length'));
    }
    return sGzipFlag;
};
