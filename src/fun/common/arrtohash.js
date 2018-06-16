module.exports = function (_input, _eq) {
    if (typeof _input !== 'object') {
        throw "_input必须为数组";
        return;
    }
    if (typeof _eq !== 'string') {
        _eq = '=';
    }
    const oRet = {};
    for (var i = 0; i < _input.length; i++) {
        const colI = _input[i].indexOf(_eq);
        const key = _input[i].substr(0, colI);
        const value = _input[i].substr(colI + _eq.length);
        oRet[key.trim()] = value.trim();
    }
    return oRet;
};
