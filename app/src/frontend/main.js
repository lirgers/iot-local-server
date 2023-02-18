(async function () {
    window.addEventListener('load', async () => {
        const menu = require('src/frontend/menu');
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const menuModel = await ajaxJSON('homeConfig.json');
        await menu.renderItems(menuModel);
        menu.attachHandlers(menuModel);
    });
})();
