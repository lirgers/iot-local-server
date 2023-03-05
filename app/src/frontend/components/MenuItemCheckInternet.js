class MenuItemCheckInternet extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('checkInternetConnection');
        if (result.success) {
            alert(`Internet is ${result.isConnectionExists ? 'ON': 'OFF'}`);
        } else {
            alert('The request has failed');
        }
    }
}

customElements.define('menu-item-check-internet', MenuItemCheckInternet);