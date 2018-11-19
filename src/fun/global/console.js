module.exports = function () {
    const types = ['log', 'info', 'warn', 'error'];
    types.push('debug');
    for (const key in types) {
        const type = types[key];
        const isExistType = console.hasOwnProperty(type);
        const _console_type = isExistType ? console[type] : null;
        console[type] = function () {
            if (!config.debug && type === 'debug') {
                return;
            }
            if (!config.log && type === 'log') {
                return;
            }
            if (!config.info && type === 'info') {
                return;
            }
            if (!config.warn && type === 'warn') {
                return;
            }
            if (!config.error && type === 'error') {
                return;
            }
            const argv = Array.prototype.slice.call(arguments);
            global.oFun.log.console(type, argv);
            let firstText = '';
            firstText += '[' + type.toUpperCase() + ']';
            firstText += global.oFun.common.date('H:i:s.e');
            argv.unshift(firstText);
            if (isExistType)
                _console_type.apply(this, argv);
        };
    }
};
