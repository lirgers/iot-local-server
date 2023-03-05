class MenuItemNetworkList extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        this.classList.add('flip', 'animated-long');
        const result = await ajaxJSON('networksList');
        this.classList.remove('flip', 'animated-long');
        if (result.success) {
            window.componentEventEmitter.publish(this, 'menu-list-renew', result);
        }
    }
}

customElements.define('menu-item-network-list', MenuItemNetworkList);