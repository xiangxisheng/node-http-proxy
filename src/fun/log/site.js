const fs = require('fs');
const path = require('path');
module.exports = (oFun, config, _host, _msg) => {
    const log_text = global.oFun.common.date('Y-m-d H:i:s.e') + ' ' + _msg;
    var logpath = config.logdir;
    var domain = '[none]';
    if (_host) {
        domain = _host.split(':')[0];
    }
    logpath = path.join(logpath, 'site');
    logpath = path.join(logpath, global.oFun.common.date('Ymd'));
    oFun.common.createDir(logpath, function () {
        logpath = path.join(logpath, domain + '.log');
        fs.appendFile(logpath, log_text + "\r\n", (err) => {
            if (err) {
                //throw err
                console.error(`error on fs.appendFile: ${err.message}`);
                //console.log('The file has been saved!');
                return;
            }
        });
    });
};
