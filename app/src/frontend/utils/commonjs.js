const module = (function () {
    let modules = [];
    let exports = {};
    return {
        set exports(module) {
            modules.push(module);
        },
        get exports() {
            return new Proxy({}, {
                set({}, prop, value) {
                    const module = {};
                    module[prop] = value;
                    modules.push(module);
                },
                get(target, p) {
                    return exports[p];
                }
            });
        },
        assignModulePath: function (path) {
            exports[path] = modules.pop();
        }
    }
})();
const require = path => {
    return module.exports[path];
};
const loadModule = (path) => {
    const script = document.createElement('script');
    script.onload = () => {
        module.assignModulePath(path);
    };
    script.defer = true;
    script.src = `${path}.js`;
    document.head.appendChild(script);
}