(async function () {
    window.addEventListener('load', async () => {
        const menu = require('src/frontend/menu');
        const menuModel = JSON.parse(await (await fetch('homeConfig.json')).text());
        await menu.renderItems(menuModel);
        menu.attachHandlers(menuModel);
    });
})();
