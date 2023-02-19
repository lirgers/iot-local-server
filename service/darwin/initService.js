const fs = require('fs');

async function initService() {
    try {
        fs.readFile(`${__dirname}/iot.local.server.plist`, (error, content) => {
            content = content.toString().replace(/\$\{projectPath\}/g, __dirname);
            fs.writeFile('/Library/LaunchDaemons/iot.local.server.plist', content, (error) => {
                console.log(error ? 'Fail' : 'Success');
                error && console.error(error);
            });

        });
        fs.readFile(`${__dirname}/run.sh.template`, (error, content) => {
            content = content.toString().replace(/\$\{projectPath\}/g, __dirname);
            const nodePath = process.env.NVM_BIN + '/node';
            content = content.replace('${node}', nodePath);
            console.log(nodePath);
            fs.writeFile(`${__dirname}/run.sh`, content, (error) => {
                console.log(error ? 'Fail' : 'Success');
                error && console.error(error);
            });
        });
    } catch (err) {
        console.log(err);
    }
}

initService();