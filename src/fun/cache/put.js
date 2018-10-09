const path = require('path');

if (!global.hasOwnProperty('cache_url')) {
    global.cache_url = {};
}
function isNeedCache(oResHeader) {
    if (oResHeader.method !== 'GET') {
        // 非GET请求都不缓存（只缓存GET,最高优先级）
        return false;
    }
    return true; // 现在GET的都要缓存
    const extname = oResHeader.urlinfo.extname;
    if (extname === '') {
        // 主页要缓存
        return true;
    }
    if (extname === '.php') {
        // PHP不缓存
        return false;
    }
    // 其他没提到的都缓存
    return true;
}
module.exports = (oResHeader, data) => {
    // console.log(oResHeader.realURL);
    if (isNeedCache(oResHeader)) {
        const obj = {};
        obj.timestamp = +new Date();
        obj.oResHeader = oResHeader;
        obj.data = data;
        global.cache_url[oResHeader.realURL] = obj;
    }
};
