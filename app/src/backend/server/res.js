module.exports = class Res {
    constructor(nativeResponse, options) {
        this.nativeResponse = nativeResponse;
        this.templatesFolder = options.templatesFolder;
    }
    async template(templateRelativePath, data) {
        const fs = require('fs');
        const promosify = require('src/common/promisify');
        const readFile = promosify(fs.readFile);
        let contents = await readFile(`${this.templatesFolder}${templateRelativePath}`);
        if (data) {
            const simplicity = require('src/common/simplicity');
            contents = Buffer.from(await simplicity.parse(contents.toString(), data));
        }
        this.nativeResponse.setHeader("Content-Type", "text/html");
        this.nativeResponse.writeHead(200);
        this.nativeResponse.end(contents);
    }
    json(obj) {
        this.nativeResponse.setHeader("Content-Type", "application/json");
        this.nativeResponse.writeHead(200);
        this.nativeResponse.end(Buffer.from(JSON.stringify(obj)));
    }
};
