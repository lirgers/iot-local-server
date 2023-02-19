module.exports = nativeRequest => {
    return {
        nativeRequest,
        get params () {
            let params = {}
            const stringParams = this.nativeRequest.url.split('?')[1];
            if (stringParams) {
                stringParams.split('&').forEach(stringParam => {
                    const [ name, value ] = stringParam.split('=');
                    params[decodeURI(name)] = decodeURI(value);
                });
            }
            return params;
        }
    };
};
