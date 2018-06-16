const zlib = require('zlib');
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
        if (sGzipFlag === 'ignore') {
            httpsrv_res.write(chunk);
        } else {
            aDataChunk.push(chunk);
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
                decoded = oFun.process.html(decoded, oResHeader);
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
        }
    });
};
