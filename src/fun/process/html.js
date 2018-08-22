const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const oTitles = {};
const isEmpty = function (_input) {
    if (_input === null) {
        return true;
    }
    if (_input === undefined) {
        return true;
    }
    if (_input === false) {
        return true;
    }
    if (_input === '') {
        return true;
    }
    if (_input === 0) {
        return true;
    }
    return false;
};
const getHtml = function (_bHtml, _charset, outObj) {
    //第一次先去判断header里的charset是否有效
    if (checkCharset(_bHtml, _charset, outObj)) {
        outObj.charset = _charset;
        //有效就直接返回sHTML了
        return true;
    }
    //只要charset编码无效就把charset置空为字符串
    outObj.charset = '';
    //第二次去尝试<meta charset="utf-8">
    const sHtml = _bHtml.toString();
    // 全转小写，这样对大小写不敏感了
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
    if (isEmpty(_charset)) {
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
        // 既然不是utf-8编码, 就转换成utf-8
        outObj.sHtml = iconv.decode(_bHtml, _charset);
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
};
const urlParse = function (srcfile) {
    const ret = {};
    ret.host = '';
    ret.path = srcfile;
    const arr = ['//', 'http://', 'https://'];
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (srcfile.indexOf(v) === 0) {
            const sub1 = v.length;
            const sub2 = srcfile.indexOf('/', sub1);
            if (sub2 !== -1) {
                ret.host = srcfile.substring(sub1, sub2);
                ret.path = srcfile.substr(sub2);
                break;
            }
        }
    }
    return ret;
};
const setSrcPath = function (oResHeader, src, field, that) {
    const port = (oResHeader.realProto === 'http') ? 8001 : 4431;
    var newurl = oResHeader.realProto + '://' + oResHeader.fastHost + ':' + port;
    const srcinfo = urlParse(src);
    src = srcinfo.path;
    if (srcinfo.host && srcinfo.host !== oResHeader.urlinfo.host) {
        return;
    }
    if (src.indexOf('/') === 0) {
        that.attr(field, newurl + src);
        return;
    }
    if (src.indexOf('./') === 0) {
        var src2 = src.substr(2);
        that.attr(field, newurl + oResHeader.urlinfo.dirname + '/' + src2);
        return;
    }
    that.attr(field, newurl + oResHeader.urlinfo.dirname + '/' + src);
};
String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1,"gm"), s2);
}
module.exports = (_bHtml, oResHeader) => {
    const outObj = {};
    // 从Header取得编码（例如utf-8或gbk之类的）
    const _charset = oResHeader.charset();
    if (getHtml(_bHtml, _charset, outObj)) {
        //找到编码
        if (isEmpty(_charset) && !isEmpty(outObj.charset)) {
            oResHeader.charset(outObj.charset);
        }
    }
    // console.info(outObj.charset, oResHeader.realURL);
    const $ = cheerio.load(outObj.sHtml);
    const title = $('title').text();
    if (oTitles.hasOwnProperty(title)) {
        // 重复的标题不记录
        oTitles[title]++;
    } else {
        oTitles[title] = 0;
        console.debug(outObj.charset, oResHeader.statusCode, title, oResHeader.realURL);
    }
    if (0 && oResHeader.realProto === 'http') {
        $("[src!='']").each(function(i, elem) {
            let src = $(this).attr('src');
            setSrcPath(oResHeader, src, 'src', $(this));
        });
        $("link[href!='']").each(function(i, elem) {
            let href = $(this).attr('href');
            setSrcPath(oResHeader, href, 'href', $(this));
        });
        $("script[href!='']").each(function(i, elem) {
            let href = $(this).attr('href');
            setSrcPath(oResHeader, href, 'href', $(this));
        });
        outObj.sHtml = $.html();
    }
    const virus_domain = [];
    virus_domain.push('qqzwc.cn');
    for (let i = 0; i < virus_domain.length; i++) {
        let domain = virus_domain[i];
        outObj.sHtml = outObj.sHtml.replaceAll(domain, 'bad.xxs.firadio.net');
    }
    if (!isEmpty(outObj.charset) && outObj.charset !== 'utf-8') {
        //编码转换回用户网站原有的编码
        outObj.sHtml = iconv.encode(outObj.sHtml, outObj.charset);
    }
    return outObj.sHtml;
};
