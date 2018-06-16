module.exports = (httpsrv_res, curLength, limitLength) => {
    const oResHeader = global.oClass.http.header();
    oResHeader.set('Content-Type', 'text/html; charset=utf-8');
    oResHeader.set('Expires', -1);
    oResHeader.set('Cache-Control', 'no-cache');
    oResHeader.set('Pragma', 'no-cache');
    const cur_size_mb = parseInt(curLength / 1024 / 1024 * 100, 10) / 100;//当前文件大小
    const max_size_mb = parseInt(limitLength / 1024 / 1024 * 100, 10) / 100;//最大限制
    var msg = '<h1>文件超过最大限制</h1>';
    msg += `您所要下载的文件大小为<b>${cur_size_mb}MB</b>, 已经超过<b>${max_size_mb}MB</b>的限制<br />`;
    msg += '请暂时通过FTP下载，或则登录飞儿云VPS里面通过QQ传文件<br />';
    msg += '此次为临时限制一下，24小时内将恢复正常下载。<br />';
    msg += '如果你认为这个限制不合理，请联系[项希盛]的QQ:<b>309385018</b><br />';
    const buf = new Buffer(msg);
    oResHeader.set('Content-Length', buf.length);
    httpsrv_res.writeHead(444, oResHeader.getAll());
    httpsrv_res.end(buf);
};
