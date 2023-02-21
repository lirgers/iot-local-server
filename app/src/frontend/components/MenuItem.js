class MenuItem extends HTMLElement {
    constructor() {
        super();
        try {
            this.data = JSON.parse(this.dataset.data);
        } catch (error) {
            this.data = {};
            console.error('Unable to parse MenuItem data', error);
        }
        this.attachHandlers();
    }
    async click_networkName() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networkName');
        alert(result.success ? result.networkName : `Query failed`);
    }
    async click_back() {
        window.componentEventEmitter.publish(this, 'menu-list-back');
    }
    async click_networksList() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('networksList');
        if (result.success) {
            window.componentEventEmitter.publish(this, 'menu-list-renew', result);
            // await demiurg.renderItems(result);
        }
    }
    async click_selectNetwork() {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const result = await ajaxJSON('selectNetwork', { ssid: this.data.data.ssid });
        alert(result?.success ? 'Network successfully changed' : 'Request has failed, please do not fix, find life-work balance');
    }
    attachHandlers() {
        if (this.data.id) {
            const events = this.data.events?.split(',').map(el => el.trim());
            if (events) {
                events.forEach(event => {
                    const eventHandler = this[`${event}_${this.data.id}`];
                    if (eventHandler) {
                        this.addEventListener(event, eventHandler.bind(this));
                    }
                });
            }
        }
    }
}

customElements.define('menu-item', MenuItem);