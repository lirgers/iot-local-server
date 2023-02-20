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
    const { getNetworkName } = require('src/backend/utils/networking');
    const networkName = await getNetworkName();
    res.json({
        networkName,
        success: networkName ? true : false
    });
};
