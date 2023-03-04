class MenuItemSelectNetwork extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('selectNetwork', { ssid: this.data.data.ssid });
        alert(result?.success ? 'Network successfully changed' : 'Request has failed, please do not fix, find life-work balance');
    }
}

customElements.define('menu-item-select-network', MenuItemSelectNetwork);