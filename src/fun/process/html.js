const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const oTitles = {};
const getHtml = function (_bHtml, _charset, outObj) {
    //第一次先去判断header里的charset是否有效
    if (checkCharset(_bHtml, _charset, outObj)) {
        //有效就直接返回sHTML了
        return true;
    }
    //只要charset编码无效就把charset置空为字符串
    outObj.charset = '';
    //第二次去尝试<meta charset="utf-8">
    const sHtml = _bHtml.toString();
    const $ = cheerio.load(sHtml.toLowerCase());
    let meta_charset = $("meta[charset!='']").attr('charset');
    if (checkCharset(_bHtml, meta_charset, outObj)) {
        outObj.charset = meta_charset;
        //有效就直接返回sHTML了
        return true;
    }
    //第三次去尝试<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
    const meta_contentType = $("meta[http-equiv='content-type']").attr('content');
    if (typeof meta_contentType === 'string') {
        const meta_contentType_hash = global.oFun.common.arrtohash(meta_contentType.split(';'));
        if (meta_contentType_hash.hasOwnProperty('charset')) {
            meta_charset = meta_contentType_hash['charset'];
            if (checkCharset(_bHtml, meta_charset, outObj)) {
                outObj.charset = meta_charset;
                //有效就直接返回sHTML了
                return true;
            }
        }
        //console.log(meta_contentType_hash);
    }
    //如果什么编码都没找到的就用原始数据
    outObj.sHtml = sHtml;
    return false;
};
const checkCharset = function (_bHtml, _charset, outObj) {
    if (_charset === undefined) {
        return false;
    }
    if (!_charset) {
        return false;
    }
    if (_charset.toLowerCase() === 'utf8') {
        _charset = 'utf-8';
    }
    if (_charset.toLowerCase() === 'utf-8') {
        outObj.sHtml = _bHtml.toString();
        return true;
    }
    try {
        outObj.sHtml = iconv.decode(_bHtml, _charset);//使用GBK解码
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
};
module.exports = (_bHtml, oResHeader) => {
    const outObj = {};
    const _charset = oResHeader.charset();
    if (getHtml(_bHtml, _charset, outObj)) {
        //找到编码
        if (!_charset && outObj.charset) {
            oResHeader.charset(outObj.charset);
        }
    }
    const $ = cheerio.load(outObj.sHtml);
    const title = $('title').text();
    if (oTitles.hasOwnProperty(title)) {
        oTitles[title]++;
    } else {
        oTitles[title] = 0;
        console.debug(outObj.charset, oResHeader.statusCode, title, oResHeader.realURL);
    }
    if (outObj.charset && outObj.charset !== 'utf-8') {
        //编码转换回用户网站原有的编码
        return iconv.encode(outObj.sHtml, outObj.charset);
    }
    return outObj.sHtml;
};
