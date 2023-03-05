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
    const { checkInternetConnection } = require('src/backend/utils/networking');
    try {
        const isConnectionExists = await checkInternetConnection();
        res.json({ isConnectionExists, success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
};
