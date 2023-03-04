class MenuItemNetworkName extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networkName');
        alert(result.success ? result.networkName : `Query failed`);
    }
}

customElements.define('menu-item-network-name', MenuItemNetworkName);