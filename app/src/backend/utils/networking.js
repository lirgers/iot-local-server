//const PUBLIC_IPS = ['192.168.2.230'];
const PUBLIC_IPS = ['8.8.8.8', 'apple.com', 'amazon.com'];
const DEFAULT_PING_TIMEOUT = 10;
const RETRY_COUNT_PER_IP = 4;

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
    },
    checkInternetConnection: async function () {
        const promisify = require('src/common/promisify');
        const child_process = require('child_process');
        const exec = promisify(child_process.exec);
        switch (process.platform) {
            case 'darwin':
                const promises = [];
                PUBLIC_IPS.forEach(IP => {
                    promises.push(exec(`ping ${IP} -t ${DEFAULT_PING_TIMEOUT} -c ${RETRY_COUNT_PER_IP}`));
                });
                const result = await new Promise(async (resolve) => {
                    let promisesRemained = promises.length;
                    let done = false;
                    promises.forEach(promise => {
                        promise
                            .then(res => {
                                if (done) {
                                    return;
                                }
                                promisesRemained--;
                                const regexpRes = res.match(/\s([\d]+)\spackets\sreceived/);
                                if (regexpRes ? Number(regexpRes[1]) > 0 : false) {
                                    promisesRemained = 0;
                                    done = true;
                                    resolve(true);
                                }
                            })
                            .catch(error => {
                                if (done || --promisesRemained === 0) {
                                    resolve(false);
                                }
                            })
                    })
                });
                return result;
            default:
                return false;
        }
    }
};
