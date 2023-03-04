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
    document.body.classList.add('loading-mask');
    const loadingIndicatorEl = document.getElementById('loadingIndicator') || {};

    try {
        loadingIndicatorEl.hidden = false;
        const rawResponse = await fetch(url, nativeOptions);
        const response = await rawResponse.json() || {};
        loadingIndicatorEl.hidden = true;
        document.body.classList.remove('loading-mask');
        return response;
    } catch (error) {
        loadingIndicatorEl.hidden = true;
        document.body.classList.remove('loading-mask');
        return {
            error: true
        };
    }
};
