module.exports = function (httpsrv_req, httpreq) {
    httpreq.on('error', (err) => {
        console.error(`error on httpreq: ${err.message}`);
    });
    httpsrv_req.on('data', (chunk) => {
        //console.log('httpsrv_req.on.data');
        //收到用户POST过来数据，所以转发给Web服务器
        httpreq.write(chunk);
    });
    httpsrv_req.on('end', () => {
        //console.log('httpsrv_req.on.end');
        //因为用户结束了请求，所以也就跟Web服务器断开连接
        httpreq.end();
    });
};
