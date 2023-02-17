const { customizeRequire } = require('./src/backend/utils/commonjs');
customizeRequire(__dirname);

const http = require('http');
const url = require('url');
const fs = require('fs');
const promosify = require('src/common/promisify');

const APP_DIR = `${__dirname}/`;
const PORT = 8888;
const readFile = promosify(fs.readFile);

function notFound(response) {
    response.writeHead(404);
    response.write('This page does not exist');
    response.end();
}

const server = http.createServer(async (request, response) => {
    const path = url.parse(request.url).pathname;
    if (/^(src\/backend|server.js)/.test(path)) {
        return notFound(response);
    }
    switch (path) {
        case '/home':
        case '/':
            const contents = await readFile(`${APP_DIR}templates/home.html`)
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            response.end(contents);
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

server.listen(PORT, null, null, () => {
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

    console.log('Server is initialized at the following addresses:\n');
    Object.keys(results).forEach(interfaceName => {
        results[interfaceName].forEach(ip => {
            console.log(`http://${ip}:${PORT}`);
        });
    });
});
