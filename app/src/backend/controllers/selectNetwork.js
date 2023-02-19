module.exports = async (req, res) => {
    let { ssid, password } = req.params;

    if (!password) {
        const networksCreds = require('configs/networksCreds.json');
        const cred = networksCreds.find(cred => cred.ssid === ssid);
        password = cred.password;
    }

    const promisify = require('src/common/promisify');
    const child_process = require('child_process');
    const exec = promisify(child_process.exec);

    try {
        switch (process.platform) {
            case 'darwin':
                await exec(`networksetup -setairportnetwork en1 "${ssid}" "${password}"`);
                break;
            default:
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false });
    }

    res.json({ success: true });
}