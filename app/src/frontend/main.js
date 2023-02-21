(async function () {
    window.addEventListener('load', async () => {
        const menu = require('src/frontend/components/menu');
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const menuModel = await ajaxJSON('configs/homePage.json');
        await menu.renderItems(menuModel);
        menu.defineComponent();
    });
})();
