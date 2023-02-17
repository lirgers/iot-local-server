module.exports = {
    click_networkName: function () {
        alert('Network Name');
    },
    attachHandlers: function (menuModel) {
        menuModel.menuItems.forEach(menuItem => {
            if (menuItem.id) {
                const menuItemEl = document.querySelector(`[data-id="${menuItem.id}"]`);
                const events = menuItem?.events?.split(',').map(el => el.trim());
                if (events) {
                    events.forEach(event => {
                        const eventHandler = this[`${event}_${menuItem.id}`];
                        if (eventHandler) {
                            menuItemEl?.addEventListener(event, eventHandler);
                        }
                    });

                }

            }
        });
    },
    renderItems: async function (renderingData) {
        const template = require('src/frontend/template');
        await template.render('menu-template', renderingData);
    }
};
