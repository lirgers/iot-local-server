module.exports = async (req, res) => {
    await res.template('serverSideHome.html', require('configs/homePage.json'));
};
