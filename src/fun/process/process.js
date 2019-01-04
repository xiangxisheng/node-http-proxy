module.exports = (buffer, oResHeader) => {
    if (oResHeader.contentType() === 'text/html') {
        buffer = global.oFun.process.html(buffer, oResHeader);
    }
    if (oResHeader.contentType() === 'text/css' || oResHeader.urlinfo.extname === '.css') {
        buffer = global.oFun.process.css(buffer, oResHeader);
    }
    return buffer;
};
