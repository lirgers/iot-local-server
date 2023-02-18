module.exports = (nativeResponse, options = {}) => {
    return {
        nativeResponse,
        template: async function (templateRelativePath) {
            const fs = require('fs');
            const promosify = require('src/common/promisify');
            const readFile = promosify(fs.readFile);
            const contents = await readFile(`${options.templatesFolder}${templateRelativePath}`);
            this.nativeResponse.setHeader("Content-Type", "text/html");
            this.nativeResponse.writeHead(200);
            this.nativeResponse.end(contents);
        }
    };
};
