module.exports.ajaxJSON = async (url, options = {}, method = 'GET') => {
    const nativeOptions = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    let queryParams;
    if (method === 'POST') {
        nativeOptions.body = JSON.stringify(options.body);
        delete options.body;
        queryParams = options.queryParams;
    } else {
        queryParams = options;
    }
    url = Object.keys(queryParams).reduce((acc, attrName, index) => {
        return `${acc}${index === 0 ? '?' : '&'}${attrName}=${queryParams[attrName]}`;
    }, url);
    const rawResponse = await fetch(url, nativeOptions);
    return await rawResponse.json() || {};
};
