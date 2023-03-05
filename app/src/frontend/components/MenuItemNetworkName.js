class MenuItemNetworkName extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        this.classList.add('expand', 'animated');
        const result = await ajaxJSON('networkName');
        this.classList.remove('expand', 'animated');
        alert(result.success ? result.networkName : `Query failed`);
    }
}

customElements.define('menu-item-network-name', MenuItemNetworkName);