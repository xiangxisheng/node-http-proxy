const zlib = require('zlib');

module.exports = (oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader, httpsrv_req) => {
    var chunk_totalsize = 0;
    const aDataChunk = [];
    httpreq_res.on('data', (chunk) => {
        // console.log(oResHeader.realURL + ' [' + chunk.length + ']');
        chunk_totalsize += chunk.length;
        if (chunk_totalsize > config.sys.http.limit.max_size_byte) {
            console.warn('chunk_totalsize > config.sys.http.limit.max_size_byte');
            // return;
        }
        //收到WEB的数据,下面转发给用户
        aDataChunk.push(chunk);
        if (sGzipFlag === 'ignore') {
            // 直接传送非 2XX 状态的请求
            // 直接传送非 gzip 格式的压缩数据
            // 直接传送非 text/html 的 contentType
            httpsrv_res.write(chunk);
        }
    });
    httpreq_res.on('end', () => {
        // console.log('[' + sGzipFlag + '] ' + oResHeader.hostname + ' [' + chunk_totalsize + ']');
        //因为WEB数据发完了,所以与用户断开连接
        if (sGzipFlag === 'de-encode') {
            const buffer = Buffer.concat(aDataChunk);
            zlib.gunzip(buffer, function (err, decoded) {
                if (err) {
                    console.error(`error on zlib.gunzip: ${err.message}`);
                    return;
                }
                //console.log(sHtml.substr(0, 50));
                // 把解压过的代码交给html进行处理
                if (config.sys.http.process) decoded = oFun.process.process(decoded, oResHeader);
                // 把处理好的HTML数据进行Gzip压缩
                oFun.http.endmsg.bufferGzip(oFun, config, decoded, httpreq_res, httpsrv_res, oResHeader, httpsrv_req);
            });
        } else
        if (sGzipFlag === 'encode') {
            var buffer = Buffer.concat(aDataChunk);
            if (config.sys.http.process) buffer = oFun.process.process(buffer, oResHeader);
            oFun.http.endmsg.bufferGzip(oFun, config, buffer, httpreq_res, httpsrv_res, oResHeader, httpsrv_req);
        } else {
            //sGzipFlag === 'ignore'
            httpsrv_res.end();
            if (oResHeader.statusCode == 200) {
                oFun.cache.put(oResHeader, Buffer.concat(aDataChunk));
            }
        }
    });
};
