const zlib = require('zlib');
if (!global.hasOwnProperty('cache_url')) {
    global.cache_url = {};
}
module.exports = (oFun, config, httpsrv_res, httpreq_res, sGzipFlag, oResHeader) => {
    //var chunk_totalsize = 0;
    const aDataChunk = [];
    httpreq_res.on('data', (chunk) => {
        /*
         chunk_totalsize += chunk.length;
         if (chunk_totalsize > config.max_size_byte) {
         console.log('chunk_totalsize > config.max_size_byte');
         return;
         }//*/
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
                decoded = oFun.process.html(decoded, oResHeader);
                // 把处理好的HTML数据进行Gzip压缩
                oFun.http.endmsg.bufferGzip(oFun, config, decoded, httpreq_res, httpsrv_res, oResHeader);
            });
        } else
        if (sGzipFlag === 'encode') {
            var buffer = Buffer.concat(aDataChunk);
            if (oResHeader.contentType() === 'text/html') {
                buffer = oFun.process.html(buffer, oResHeader);
            }
            oFun.http.endmsg.bufferGzip(oFun, config, buffer, httpreq_res, httpsrv_res, oResHeader);
        } else {
            //sGzipFlag === 'ignore'
            httpsrv_res.end();
            if (oResHeader.method === 'GET' && oResHeader.statusCode == 200) {
                var obj = {};
                obj.oResHeader = oResHeader;
                obj.data = Buffer.concat(aDataChunk);
                global.cache_url[oResHeader.realURL] = obj;
            }
        }
    });
};
