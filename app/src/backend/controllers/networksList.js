/**
 * @typedef {import('src/backend/server/res')} Res
 * @typedef {import('src/backend/server/req')} Req
 */

/**
 * 
 * @param {Req} req 
 * @param {Res} res 
 */
module.exports = async (req, res) => {
    const networksCreds = require('configs/networksCreds.json');
    const promisify = require('src/common/promisify');
    const child_process = require('child_process');
    const exec = promisify(child_process.exec);
    let result = [];

    switch (process.platform) {
        case 'darwin':
            const stdout = await exec(`/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s`);
            if (typeof stdout === 'string') {
                const lines = stdout.split('\n');
                if (lines.length) {
                    const columnLength = lines[0].indexOf('SSID') + 'SSID'.length;
                    lines.shift();
                    lines.forEach(line => {
                        const networkName = line.substring(0, columnLength).trim()
                        if (networkName && networksCreds.find(cred => cred.ssid === networkName)
                            && result.indexOf(networkName) === -1) {
                            result.push(networkName);
                        }
                    });
                }

                break;
            }
        default:
            result = [];
    }

    result = result.map(networkName => {
        return {
            caption: networkName,
            data: { ssid: networkName },
            id: 'selectNetwork',
            events: 'click'
        }
    });

    const menuItems = [
        {
            caption: '← Home',
            id: 'back',
            events: 'click'
        },
        ...result
    ];

    res.json({
        success: true,
        menuItems: menuItems
    });
};
