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
        const { render } = require('src/frontend/renderer');
        try {
            await render('menu-template', renderingData);
        } catch (error) {
            console.error(error);
        }
    }
};
