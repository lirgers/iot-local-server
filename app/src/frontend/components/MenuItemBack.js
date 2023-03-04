class MenuItemBack extends MenuItem {
    async click() {
        window.componentEventEmitter.publish(this, 'menu-list-back');
    }
}

customElements.define('menu-item-back', MenuItemBack);