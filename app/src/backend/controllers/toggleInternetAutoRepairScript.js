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
    const scriptStateBeforeToggle = global.isAutoInternetRepairScriptEnabled;
    global.eventEmitter.emit('toggleAutoInternetRepairScript');
    res.json({ success: scriptStateBeforeToggle !== global.isAutoInternetRepairScriptEnabled });
};
