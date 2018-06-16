module.exports = (oFun, config, httpsrv_res, httpsrv_req, httpreq_res) => {
    if (httpreq_res.statusCode < 200 || httpreq_res.statusCode > 299) {
        //当WEB返回非2XX时不去判断文件大小,直接通过
        return false;
    }
    if (!httpreq_res.headers.hasOwnProperty('content-length')) {
        console.warn('have no content-length at ' + httpsrv_req.realURL + '[' + httpsrv_req.method + ']');
        return false;
    }
    var resLen = parseInt(httpreq_res.headers['content-length'], 10);
    if (httpreq_res.headers.hasOwnProperty('content-range')) {
        const resRange = httpreq_res.headers['content-range'].toString();
        const lastI = resRange.lastIndexOf('/');
        if (lastI !== -1) {
            const resRangeTotal = parseInt(resRange.substr(lastI + 1), 10);
            if (resRangeTotal > resLen)
                resLen = resRangeTotal;
        }
    }
    if (resLen > config.max_size_byte) {
        const cur_size_mb = parseInt(resLen / 1024 / 1024 * 100, 10) / 100;
        console.warn('have limitsize at ' + httpsrv_req.realURL + '[' + httpsrv_req.method + ']');
        oFun.http.endmsg.sizeLimited(httpsrv_res, resLen, config.max_size_byte);
        return true;//达到限制
    }
    return false;//不限制
};
