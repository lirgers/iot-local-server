class MenuItemCheckInternet extends MenuItem {
    async click() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        this.classList.add('expand', 'animated');
        const result = await ajaxJSON('checkInternetConnection');
        this.classList.remove('expand', 'animated');
        if (result.success) {
            alert(`Internet is ${result.isConnectionExists ? 'ON': 'OFF'}`);
        } else {
            alert('The request has failed');
        }
    }
}

customElements.define('menu-item-check-internet', MenuItemCheckInternet);