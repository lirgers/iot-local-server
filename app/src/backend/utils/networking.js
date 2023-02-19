module.exports = {
    getNetworkName: async function () {
        const promisify = require('src/common/promisify');
        const child_process = require('child_process');
        const exec = promisify(child_process.exec);
        switch (process.platform) {
            case 'darwin':
                const result = await exec(`/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I  | awk -F' SSID: '  '/ SSID: / {print $2}'`)
                return typeof result === 'string' ? result.trim() : '';
            default:
                return '';
        }
    }
};
