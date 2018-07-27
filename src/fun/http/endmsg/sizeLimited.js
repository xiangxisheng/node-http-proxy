const fs = require('fs');

module.exports = (httpsrv_res, curLength, limitLength) => {
    const oResHeader = global.oClass.http.header();
    oResHeader.set('Content-Type', 'text/html; charset=utf-8');
    oResHeader.set('Expires', -1);
    oResHeader.set('Cache-Control', 'no-cache');
    oResHeader.set('Pragma', 'no-cache');
    const cur_size_mb = parseInt(curLength / 1024 / 1024 * 100, 10) / 100;//当前文件大小
    const max_size_mb = parseInt(limitLength / 1024 / 1024 * 100, 10) / 100;//最大限制
    fs.readFile('./html/sizelimit.htm', 'utf8', function(err, data) {
        data = data.replace(/\$\{cur_size_mb\}/g, cur_size_mb);
        data = data.replace(/\$\{max_size_mb\}/g, max_size_mb);
        const buf = new Buffer(data);
        oResHeader.set('Content-Length', buf.length);
        httpsrv_res.writeHead(200, oResHeader.getAll());
        httpsrv_res.end(buf);
    });
};
