module.exports = async (req, res) => {
    const { getNetworkName } = require('src/backend/utils/networking');
    const networkName = await getNetworkName();
    res.json({
        networkName,
        success: networkName ? true : false
    });
};
