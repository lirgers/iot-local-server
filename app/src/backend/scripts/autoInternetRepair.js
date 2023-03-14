const https = require('https');
const { notify } = require('src/backend/utils/telegram');
const { checkInternetConnection } = require('src/backend/utils/networking');
const { exec } = require("child_process");
let isCheckingActive = true;
let isSwitchingIterationJustOver = false;
let noInternetNetwork = '';
let logging = false;
global.isAutoInternetRepairScriptEnabled = true;

let wifiEndpointsStack = [];
let runningOutOfOptionsDate;

const WIFI_NETWORKS = require('configs/networksCreds.json');

function cmd(command) {
  return new Promise((resolveFunc, rejectFunc) => {
    exec(command, null, (error, a, b) => {
        if (error instanceof Error) {
            return rejectFunc(error);
        }
        return resolveFunc((a || '').replace('\n', '').trim());
    });
  });
}

const reccuringInternetCheck = async () => {
    if (!isCheckingActive) {
        return;
    }

    let isInternetOn = await checkInternetConnection();

    currentOnlineState = isInternetOn;

    if (isInternetOn) {
        // logging && console.log('\x1b[32m%s\x1b[0m', 'Інтернет Є');
        if (runningOutOfOptionsDate || wifiEndpointsStack.length) {
            wifiEndpointsStack = [];
            runningOutOfOptionsDate = null;
            isSwitchingIterationJustOver = false;
            const currentNetwork = await cmd(`/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}'`);
            notify(`У "${noInternetNetwork}" інтернету не було. В результаті спроб знайти мережу з інтернетом переключено до "${currentNetwork}" WiFi мережі.`);
            noInternetNetwork = '';
        }
    } else {
        logging && console.log('\x1b[31m%s\x1b[0m', 'Інтернету НЕМАЄ');
        const isSwitchingIteration = !runningOutOfOptionsDate && wifiEndpointsStack.length;
        if (isSwitchingIteration) {
            const newNetwork = wifiEndpointsStack.shift();
            await cmd(`networksetup -setairportnetwork en1 "${newNetwork.ssid}" "${newNetwork.password}"`);
            if (!wifiEndpointsStack.length) {
                runningOutOfOptionsDate = new Date();
                isSwitchingIterationJustOver = true;
            }
        } else if (!runningOutOfOptionsDate) {
            wifiEndpointsStack = [...WIFI_NETWORKS];
            const currentNetwork = await cmd(`/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}'`);
            noInternetNetwork = currentNetwork;
            const index = WIFI_NETWORKS.findIndex(el => el.ssid === currentNetwork);
            if (index !== -1) {
                // remove current network from the list, as it is confirmed that it is not working
                wifiEndpointsStack.splice(index, 1);
            }

            const newNetwork = wifiEndpointsStack.shift();

            if (!wifiEndpointsStack.length) {
                runningOutOfOptionsDate = new Date();
                isSwitchingIterationJustOver = true;
            }

            await cmd(`networksetup -setairportnetwork en1 "${newNetwork.ssid}" "${newNetwork.password}"`);
        }
        if (runningOutOfOptionsDate) {
            if (isSwitchingIterationJustOver) {
                isSwitchingIterationJustOver = false;
                const defaultNetwork = WIFI_NETWORKS[0];
                await cmd(`networksetup -setairportnetwork en1 "${defaultNetwork.ssid}" "${defaultNetwork.password}"`);
                logging && console.log('Switched to default network after switch iteration is over and none of networks has wifi');
            }
            const timestampdiff = new Date() - runningOutOfOptionsDate;
            if (((timestampdiff / 1000) / 60) >= 10) {
                runningOutOfOptionsDate = null;
            }
        }
    }
};

// initialInternetCheck();
reccuringInternetCheck();
let reccuringInternetCheckInterval = setInterval(reccuringInternetCheck, 15000);

function fetch (url, method = 'GET') {
    method = method.toUpperCase();
    return new Promise((resolve, reject) => {
        var req = https.request(url, { method }, (res) => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', data => {
                body += data;
            });
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                    resolve(body);
                } catch (e) {
                    reject(e);
                }
            });
        })
        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    });
}

const { BOT_API_KEY, PERSONAL_CHAT } = require('configs/telegram.json');

let multilevelCommandsHistory = {};
let offset = 0;
function telegramBotCommandsListener() {
    if (!global.isAutoInternetRepairScriptEnabled) {
        return;
    }
    try {
        fetch(`https://api.telegram.org/bot${BOT_API_KEY}/getUpdates?limit=5&timeout=110&offset=${offset}`)
            .then(async (response = {}) => {
                const { result } = response;
                if (!result) {
                    telegramBotCommandsListener();
                    return;
                }

                for await (const update of result) {
                    const { message } = update;
                    const destination = message && message.from && message.from.id ? message.from.id : PERSONAL_CHAT;
                    if (destination !== Number(PERSONAL_CHAT)) {
                        notify(`You don't have access rights.`, destination);
                        break;
                    }
                    if (multilevelCommandsHistory[destination] === '/changenetwork' && /^[0-9]+$/.test(message.text)) {
                        const option = Number(message.text);
                        if (option > 0 && option <= WIFI_NETWORKS.length) {
                            const newNetwork = WIFI_NETWORKS[option - 1];
                            await cmd(`networksetup -setairportnetwork en1 "${newNetwork.ssid}" "${newNetwork.password}"`);
                            setTimeout(() => {
                                notify(`Switched to ${newNetwork.ssid}`, destination);
                            }, 10000);
                            break;
                        }
                    } else if (multilevelCommandsHistory[destination] === '/changenetwork') {
                        multilevelCommandsHistory[destination] = null;
                    }
                    switch (message.text) {
                        case '/help':
                            notify('Check available commands in bot commands menu', destination);
                            break;
                        case '/whatisactivenetwork':
                            const currentNetwork = await cmd(`/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}'`);
                            notify(`The current network is ${currentNetwork}`, destination);
                            break;
                        case '/switchtodefaultnetwork':
                            const defaultNetwork = WIFI_NETWORKS[0];
                            await cmd(`networksetup -setairportnetwork en1 "${defaultNetwork.ssid}" "${defaultNetwork.password}"`);
                            notify(`Switched to ${defaultNetwork.ssid}`, destination);
                            break;
                        case '/changenetwork':
                            multilevelCommandsHistory[destination] = '/changenetwork';
                            const networksListStringified = WIFI_NETWORKS.reduce((acc, newVal, index) => acc + `${index + 1}. ${newVal.ssid}` + '\n', '\n');
                            notify(`Choose the network:
                                ${networksListStringified}`, destination);
                            break;
                        case '/broadcastnetworkname':
                            const networkName = await cmd(`/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}'`);
                            setTimeout(() => {
                                notify(`Поточна мережа ${networkName}`);
                            }, 10000);
                            break;
                        default:
                            notify('Check available commands in bot commands menu', destination);
                    }
                }

                if (result.length) {
                    const updateId = result[result.length - 1].update_id;
                    offset = (updateId || 0) + 1;
                }

                telegramBotCommandsListener()
            })
            .catch(error => {
                telegramBotCommandsListener()
            });
    } catch (error) {
        setTimeout(telegramBotCommandsListener, 3000);
    }
}

telegramBotCommandsListener();

global.eventEmitter.on('toggleAutoInternetRepairScript', () => {
    if (global.isAutoInternetRepairScriptEnabled) {
        clearInterval(reccuringInternetCheckInterval);
        reccuringInternetCheckInterval = null;
        global.isAutoInternetRepairScriptEnabled = false;
        isCheckingActive = false;
    } else {
        global.isAutoInternetRepairScriptEnabled = true;
        isCheckingActive = true;
        telegramBotCommandsListener();
        reccuringInternetCheck();
        reccuringInternetCheckInterval = setInterval(reccuringInternetCheck, 15000);
    }
});
