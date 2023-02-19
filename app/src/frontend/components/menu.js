module.exports = {
    _history: [],
    click_networkName: async function () {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networkName');
        alert(result.success ? result.networkName : `Query failed`);
    },
    click_back: async function () {
        this._history.pop();
        await this.renderItems(this._history[this._history.length - 1]);
        this.attachHandlers(this._history[this._history.length - 1]);
    },
    click_networksList: async function () {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networksList');
        if (result.success) {
            await this.renderItems(result);
            this.attachHandlers(result);
        }
    },
    click_selectNetwork: async function (data) {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('selectNetwork', { ssid: data.ssid });
        alert(result?.success ? 'Network successfully changed' : 'Request has failed, please do not fix, find life-work balance');
    },
    attachHandlers: function (menuModel) {
        const menuItemTypesRegistry = {};
        // return menu item, including the case when there are multiple elements for one ID
        // @TODO Come up with better naming schema as multiple IDs semantically is nonsense.
        const getMenuItemEl = menuItem => {
            const items = document.querySelectorAll(`[data-id="${menuItem.id}"]`);
            const index = menuItemTypesRegistry[menuItem.id] || 0;
            menuItemTypesRegistry[menuItem.id] = index + 1;
            return items[index];
        };
        menuModel.menuItems.forEach(menuItem => {
            if (menuItem.id) {
                const menuItemEl = getMenuItemEl(menuItem);
                const events = menuItem?.events?.split(',').map(el => el.trim());
                if (events) {
                    events.forEach(event => {
                        const eventHandler = this[`${event}_${menuItem.id}`];
                        if (eventHandler) {
                            menuItemEl?.addEventListener(event, eventHandler.bind(this, menuItem.data || {}));
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
            this._history.push(renderingData);
        } catch (error) {
            console.error(error);
        }
    }
};
