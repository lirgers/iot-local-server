module.exports = function (func, firstAttrCallback = false) {
    return function () {
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args[firstAttrCallback ? 'unshift' : 'push'](function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
            func.apply(this, args);
        });
    }
};
