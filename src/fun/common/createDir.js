const path = require('path');
const fs = require('fs');
module.exports = (function fun(dirpath, callback, mode) {
    fs.exists(dirpath, function (exists) {
        if (exists) {
            return callback(dirpath);
        }
        //尝试创建父目录，然后再创建当前目录
        return fun(path.dirname(dirpath), function () {
            fs.mkdir(dirpath, callback, mode);
        }, mode);
    });
});
