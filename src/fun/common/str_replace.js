module.exports = function(subtext, newtext, fulltext) {
    if (typeof(fulltext) !== 'string') return '';
    // ģ��PHPд���ı��滻����
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
