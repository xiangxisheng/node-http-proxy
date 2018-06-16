const fs = require('fs');
const path = require('path');
module.exports = (_type, _argv) => {
    //const _argv = Array.prototype.slice.call(_arguments);
    const aLogtext = [];
    //aLogtext.push('[' + _type.toUpperCase() + ']');
    aLogtext.push(global.oFun.common.date('Y-m-d H:i:s.e'));
    const len = _argv.length;
    for (let i = 0; i < len; i++) {
        try {
            aLogtext.push(JSON.stringify(_argv[i]));
        } catch (err) {
            aLogtext.push(`ErrI=${i}`);
            console.error(`JSON.stringify in console.${_type}, i=${i}, len=${len}`);
        }
    }
    const log_text = aLogtext.join(' ');
    var logpath = global.config.logdir;
    logpath = path.join(logpath, 'console');
    logpath = path.join(logpath, global.oFun.common.date('Ymd'));
    global.oFun.common.createDir(logpath, function () {
        logpath = path.join(logpath, _type + '.log');
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
