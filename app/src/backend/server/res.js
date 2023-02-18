module.exports = (nativeResponse, options = {}) => {
    return {
        nativeResponse,
        template: async function (templateRelativePath, data) {
            const fs = require('fs');
            const promosify = require('src/common/promisify');
            const readFile = promosify(fs.readFile);
            let contents = await readFile(`${options.templatesFolder}${templateRelativePath}`);
            if (data) {
                const template = require('src/common/template');
                contents = Buffer.from(template.parse(contents.toString(), data));
            }
            this.nativeResponse.setHeader("Content-Type", "text/html");
            this.nativeResponse.writeHead(200);
            this.nativeResponse.end(contents);
        }
    };
};
