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
const modulesToLoad = [];
const loadModule = (path) => {
    const load = (path) => {
        if (/.+\.js$/.test(path)) {
            path = path.substr(0, path.length - 3)
        }
        const script = document.createElement('script');
        script.onload = () => {
            module.assignModulePath(path);
            modulesToLoad.shift();
            if (modulesToLoad.length) {
                load(modulesToLoad[0]);
            }
        };
        script.defer = true;
        script.src = `${path}.js`;
        document.head.appendChild(script);
    };

    if (modulesToLoad.length) {
        modulesToLoad.push(path);
        return;
    } else {
        modulesToLoad.push(path);
    }
    load(path);
}
