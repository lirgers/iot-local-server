const { customizeRequire } = require('./src/backend/utils/overwrites/commonjs');
customizeRequire(__dirname);

const http = require('http');
const url = require('url');
const fs = require('fs');
const server = require('src/backend/server/server');
const promosify = require('src/common/promisify');

const readFile = promosify(fs.readFile);
const APP_DIR = `${__dirname}/`;
const DEV_PORT = 8888;
const PROD_PORT = 9999;
let PORT = DEV_PORT;

server.attachControllers(APP_DIR);

function notFound(response) {
    response.writeHead(404);
    response.write('This page does not exist');
    response.end();
}

const nativeServer = http.createServer(async (request, response) => {
    const path = url.parse(request.url).pathname;
    if (/^(src\/backend|main.js)/.test(path)) {
        return notFound(response);
    }
    const controllerExists = await server.executeController(path, request, response);
    if (controllerExists) {
        return;
    }
    try {
        const data = await readFile(APP_DIR + path.substring(1));
        const extensionRegExRes = path.match(/\.([\w|\d]+)$/);
        if (extensionRegExRes) {
            let contentType = 'text/plain';
            switch (extensionRegExRes[1]) {
                case 'mustache':
                case 'html':
                    contentType = 'text/html';
                    break;
                case 'css':
                    contentType = 'text/css';
                    break;
                case 'json':
                    contentType = 'application/json';
                    break;
                case 'js':
                    contentType = 'text/javascript';
                    break;
                case 'ico':
                    contentType = 'image/vnd.microsoft.icon';
            }
            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(data);
            response.end();
        } else {
            notFound(response);
        }
    } catch (error) {
        console.error(error);
        notFound(response);
    }
});

const args = process.argv;
args.shift();
args.shift();
args.forEach(val => {
    const [ name, value ] = val.split('=');
    if (name === 'MODE' && value === 'PRODUCTION') {
        PORT = PROD_PORT;
    }
});

nativeServer.listen(PORT, null, null, () => {
    const ips = server.getLocalHostIps();

    console.log('Server is initialized at the following addresses:\n');
    Object.keys(ips).forEach(interfaceName => {
        ips[interfaceName].forEach(ip => {
            console.log(`http://${ip}:${PORT}`);
        });
    });
});
