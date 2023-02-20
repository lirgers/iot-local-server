const rootEndpoint = '/home';
let templatesFolder;
const controllers = {};

module.exports.attachControllers = async rootDir => {
    templatesFolder = `${rootDir}templates/`;
    const readdir = require('src/common/promisify')(require('fs').readdir);
    const controllersHomeFolder = `${rootDir}src/backend/controllers/`;
    const controllersFileNames = await readdir(controllersHomeFolder);
    controllersFileNames.forEach(fileName => {
        const nameWithoutExtension = fileName.substr(0, fileName.length - 3);
        controllers[`/${nameWithoutExtension}`] = `${controllersHomeFolder.replace(rootDir, '') + nameWithoutExtension}`;
    });
    if (rootEndpoint && controllers[rootEndpoint]) {
        controllers['/'] = controllers[rootEndpoint];
    }
};

module.exports.getLocalHostIps = () => {
    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    return results;
}

module.exports.executeController = async (path, request, response) => {
    if (controllers[path]) {
        const Res = require('src/backend/server/res');
        const Req = require('src/backend/server/req');
        await require(controllers[path])(
            new Req(request),
            new Res(response, { templatesFolder })
        );
        return true;
    } else {
        return false;
    }
};
