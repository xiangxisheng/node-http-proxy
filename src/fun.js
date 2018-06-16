/* global __dirname */

const fs = require('fs');
const path = require('path');
const files = [];
const scandir = (function fun(_root, _sub, _file) {
    var sub = _sub;
    if (_file) {
        if (sub)
            sub += '/';
        sub += _file;
    }
    const _path = path.join(_root, sub);
    if (fs.statSync(_path).isFile()) {
        return files.push({sub: _sub, file: _file});
    }
    fs.readdirSync(_path).forEach(function (file) {
        fun(_root, sub, file);
    });
});
//scandir(path.join(__dirname, 'fun'), '', '');
//console.log(files);
String.prototype.getBaseName = function () {
    const obj = this.toString();
    var i = obj.lastIndexOf('.');
    return (i === -1) ? obj : obj.substr(0, i);
};
const load_fun = (function fun(_path, _obj, _file, _objParent) {
    if (_file) {
        _path = path.join(_path, _file);
        if (fs.statSync(_path).isFile()) {
            _objParent[_file.getBaseName()] = require(_path);
            return;
        }
    }
    fs.readdirSync(_path).forEach(function (file) {
        var name = file.getBaseName();
        _obj[name] = {};
        fun(_path, _obj[name], file, _obj);
    });
});
module.exports = {};
load_fun(path.join(__dirname, 'fun'), module.exports);
//console.log(module.exports);
