(async function () {
    window.addEventListener('load', async () => {
        const menu = require('src/frontend/menu');
        const menuModel = {
            menuItems: [
                {
                    caption: 'Get current network name',
                    events: 'click',
                    id: 'networkName'
                },
                {
                    caption: 'Option 2'
                },
                {
                    caption: 'Option 3'
                },
                {
                    caption: 'Option 4..'
                }
            ]
        };
        await menu.renderItems(menuModel);
        menu.attachHandlers(menuModel);
    });
})();
