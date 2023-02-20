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
    await res.template('serverSideHome.html', require('configs/homePage.json'));
};
