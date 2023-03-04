class MenuItemNetworkList extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networksList');
        if (result.success) {
            window.componentEventEmitter.publish(this, 'menu-list-renew', result);
        }
    }
}

customElements.define('menu-item-network-list', MenuItemNetworkList);