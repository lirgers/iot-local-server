class MenuList extends HTMLElement {
    constructor() {
        super();
        this.init();
    }
    async init() {
        this.history = [];
        if (this.dataset.initialResource) {
            const { ajaxJSON } = require('src/frontend/utils/ajax');
            this.data = await ajaxJSON(this.dataset.initialResource);
        } else {
            try {
                this.data = JSON.parse(this.dataset.data);
            } catch (error) {
                this.data = {};
                console.error('Unable to parse MenuItem data', error);
            }
            
        }
        this.attachHandlers();
        this.renderItems(this.data);
    }
    attachHandlers() {
        window.componentEventEmitter.subscribe(this, 'menu-list-back', this.renderPreviousList);
        window.componentEventEmitter.subscribe(this, 'menu-list-renew', this.renderNewList);
    }
    async renderItems (renderingData) {
        const { render } = require('src/frontend/renderer');
        try {
            await render('menu-template', renderingData);
            this.history.push(renderingData);
        } catch (error) {
            console.error(error);
        }
    }
    renderPreviousList() {
        this.history.pop()
        this.renderItems(this.history[this.history.length - 1]);
    }
    renderNewList(publisher, data) {
        this.renderItems(data);
    }
};

customElements.define('menu-list', MenuList);