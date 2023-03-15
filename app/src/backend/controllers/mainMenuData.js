/**
 * @typedef {import('src/backend/server/res')} Res
 * @typedef {import('src/backend/server/req')} Req
 */

/**
 * 
 * @param {Req} req 
 * @param {Res} res 
 */
module.exports = (req, res) => {
    const homeConfig = require('configs/homePage.json');
    homeConfig.isAutoInternetRepairEnabled = global.isAutoInternetRepairScriptEnabled;
    homeConfig.isMainMenu = true;
    res.json(homeConfig);
};
