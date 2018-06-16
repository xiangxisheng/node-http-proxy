module.exports = function (_headers) {
    if (_headers === undefined) {
        _headers = {};
    }
    const ucfirst = function (str) {// 正则法
        str = str.toLowerCase();//首先把全部都转小写
        var reg = /\b(\w)|\-(\w)/g;//  \b判断边界\-判断横线
        return str.replace(reg, function (m) {
            return m.toUpperCase();
        });
    };
    const headers = {};
    const oPrivate = {};
    oPrivate.updateContentType = () => {
        if (!oPrivate.contentType) {
            oPrivate.contentType = 'text/html';
        }
        let value = oPrivate.contentType;
        if (typeof oPrivate.charset === 'string' && oPrivate.charset) {
            value += '; charset=' + oPrivate.charset;
        }
        oPublic.set('content-type', value);
    };
    const oPublic = {};
    oPublic.getAll = () => {
        return headers;
    };
    oPublic.get = (key) => {
        return headers[ucfirst(key)];
    };
    oPublic.set = (key, value) => {
        key = ucfirst(key);
        headers[key] = value;
        if (key === ucfirst('content-type')) {
            const aContType = value.split(';');
            oPrivate.contentType = aContType.shift().trim();
            const contentType_obj = global.oFun.common.arrtohash(aContType);
            if (contentType_obj.hasOwnProperty('charset')) {
                oPrivate.charset = contentType_obj.charset;
            }
        }
    };
    oPublic.exists = (key) => {
        return headers.hasOwnProperty(ucfirst(key));
    };
    oPublic.del = (key) => {
        delete headers[ucfirst(key)];
    };
    oPublic.contentType = (_value) => {
        if (_value === undefined) {
            return oPrivate.contentType;
        }
        if (typeof _value !== 'string') {
            return;
        }
        if (!_value) {
            return;
        }
        oPrivate.contentType = _value.toLowerCase();
        oPrivate.updateContentType();
    };
    oPublic.charset = (_charset) => {
        if (_charset === undefined) {
            return oPrivate.charset;
        }
        if (typeof _charset !== 'string') {
            return;
        }
        if (!_charset) {
            return;
        }
        oPrivate.charset = _charset.toLowerCase();
        oPrivate.updateContentType();
    };
    for (const key in _headers) {
        //headers[ucfirst(key)] = _headers[key];
        oPublic.set(key, _headers[key]);
    }
    return oPublic;
};
