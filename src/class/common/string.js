module.exports = function () {
    const oPrivate = {};
    const oPublic = {};
    oPublic.setSource = (_source) => {
        oPrivate.source = _source;
    };
    oPublic.setSuffix = (_suffix) => {
        oPrivate.suffix = _suffix;
    };
    oPublic.match_suffix = () => {
        //判断后缀是否匹配
        if (typeof oPrivate.source !== 'string') {
            return;
        }
        if (typeof oPrivate.suffix !== 'string') {
            return;
        }
        const suflen = oPrivate.suffix.length;//后缀长度
        const source_suflen = oPrivate.source.length;//source的长度
        if (source_suflen < suflen) {
            //source不能比后缀短
            return false;
        }
        //取得source的后缀
        const source_suffix = oPrivate.source.substr(-suflen);
        const ret = (source_suffix === oPrivate.suffix);//两个后缀比较
        if (!ret) {
            return false;
        }
        oPrivate.prefix = oPrivate.source.substr(0, source_suflen - suflen);
        return ret;
    };
    oPublic.getPrefix = () => {
        //取得前缀
        return oPrivate.prefix;
    };
    return oPublic;
};
