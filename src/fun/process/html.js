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
    // 写这个函数是因为url.parse不能解析“//”开头的网址
    const ret = {};
    ret.host = '';
    ret.path = srcfile;
    const arr = ['//', 'http://', 'https://'];
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (srcfile.indexOf(v) === 0) {
            // 比如成功找到https://
            const sub1 = v.length;
            const sub2 = srcfile.indexOf('/', sub1);
            if (sub2 !== -1) {
                ret.host = srcfile.substring(sub1, sub2);
                ret.path = srcfile.substr(sub2);
            } else {
                ret.host = srcfile.substr(sub1);
                ret.path = '';
            }
            break;
        }
    }
    return ret;
};
const setSrcPath = function (oResHeader, src, field, that) {
    const port = (oResHeader.realProto === 'http') ? 8001 : 4431;
    var newurl = oResHeader.realProto + '://' + oResHeader.fastHost + ':' + port;
    const srcinfo = urlParse(src);
    src = srcinfo.path;
    if (srcinfo.host) {
        if (srcinfo.host !== oResHeader.urlinfo.host) {
            return;
        }
    }
    if (src.indexOf('/') === 0) {
        that.attr(field, newurl + src);
        return;
    }
    var dirname = (function (dirname) {
        if (dirname.substr(0, 1) !== '/') {
            dirname = '/' + dirname;
        }
        if (dirname.substr(-1, 1) !== '/') {
            dirname = dirname + '/';
        }
        return dirname;
    })(oResHeader.urlinfo.dirname);
    if (src.indexOf('./') === 0) {
        src = src.substr(2);
    }
    that.attr(field, newurl + dirname + src);
};
const str_replace_one = function(fulltext, subtext, newtext) {
    const i1 = fulltext.indexOf(subtext);
    if (i1 === -1) {
        return fulltext;
    }
    return fulltext.substr(0, i1) + newtext + fulltext.substr(i1 + subtext.length);
}
const str_replace = function(subtext, newtext, fulltext) {
    // 模仿PHP写的文本替换功能
    let i1 = 0;
    let i2 = 0;
    let arr = [];
    while (true) {
        i1 = fulltext.indexOf(subtext, i2);
        if (i1 === -1) {
            arr.push(fulltext.substr(i2));
            break;
        }
        arr.push(fulltext.substring(i2, i1));
        i2 = i1 + subtext.length;
    }
    return arr.join(newtext);
}

/**
 * 解决出现 &#x 的错误
 * @param {string} str
 */
const html_decode1 = function (str) {
    return unescape(str.replace(/&#x/g,'%u').replace(/;/g,''));
}

/**
 * 解决出现 &#x 的错误
 * 参考文档https://www.cnblogs.com/philipding/p/10153094.html
 * @param {string} str
 */
const html_decode = function (str) {
    // 一般可以先转换为标准 unicode 格式（有需要就添加：当返回的数据呈现太多\\\u 之类的时）
    // str = unescape(str.replace(/\\u/g, "%u"));
    // 再对实体符进行转义
    // 有 x 则表示是16进制，$1 就是匹配是否有 x，$2 就是匹配出的第二个括号捕获到的内容，将 $2 以对应进制表示转换
    str = str.replace(/&#(x)?(\w{4});/g, function($, $1, $2) {
        return String.fromCharCode(parseInt($2, $1 ? 16: 10));
    });
    return str;
}

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
    const isDenyHtml = (function (sHtml) {
        if (sHtml.indexOf('空中俏佳人') >= 0) return true;
        if (sHtml.indexOf('烈火狼之笼斗') >= 0) return true;
        return false;
    })(outObj.sHtml);
    if (isDenyHtml) {
        return("<meta http-equiv=Content-Type content=text/html;charset=utf-8><title>该页已被屏蔽</title><h2>由于当前页面含有非法关键字，已被屏蔽。</h2>如有疑问请联系工作人员QQ: 309385018");
    }
    // console.info(outObj.charset, oResHeader.realURL);
    const cheerio_config = {};
    // cheerio_config.decodeEntities = false;
    const $ = cheerio.load(outObj.sHtml, cheerio_config);
    const title = $('title').text();
    if (oTitles.hasOwnProperty(title)) {
        // 重复的标题不记录
        oTitles[title]++;
    } else {
        oTitles[title] = 0;
        console.debug(outObj.charset, oResHeader.statusCode, title, oResHeader.realURL);
    }
    if (1 && oResHeader.realProto === 'http') {
        $("[src!='']").each(function(i, elem) {
            if (elem.type === 'tag' && elem.name === 'frame') {
                return;
            }
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
        outObj.sHtml = html_decode(outObj.sHtml);
    }
    const virus_domain = [];
    virus_domain.push('qqzwc.cn');
    for (let i = 0; i < virus_domain.length; i++) {
        let domain = virus_domain[i];
        outObj.sHtml = str_replace(domain, 'bad.xxs.firadio.net', outObj.sHtml);
    }
    // outObj.sHtml = str_replace('layer.msg("执行操作中...", {', 'return;layer.msg("执行操作中...", {', outObj.sHtml);
    if (!isEmpty(outObj.charset) && outObj.charset !== 'utf-8') {
        //编码转换回用户网站原有的编码
        outObj.sHtml = iconv.encode(outObj.sHtml, outObj.charset);
    }
    return outObj.sHtml;
};
