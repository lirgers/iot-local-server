module.exports = {
    customizeRequire: function(rootDirPath) {
        let Module = require('module');
        let originalRequire = Module.prototype.require;

        Module.prototype.require = function () {
            try {
                return originalRequire.apply(this, arguments);
            } catch (error) {
                if (!/^\.\//.test(arguments[0])) {
                    return originalRequire(`${rootDirPath}/${arguments[0]}`);
                }
                throw new Error(error);
            }
        };
    }
};
