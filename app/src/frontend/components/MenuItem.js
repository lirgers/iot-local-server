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
    attachHandlers() {
        const events = this.data.events?.split(',').map(el => el.trim());
        if (events) {
            events.forEach(event => {
                const eventHandler = this[`${event}`];
                if (eventHandler) {
                    this.addEventListener(event, eventHandler.bind(this));
                }
            });
        }
    }
}

customElements.define('menu-item', MenuItem);