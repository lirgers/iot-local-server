class AjaxToggler extends MenuItem {
    async change(event) {
        const isChecked = event.srcElement?.checked;
        const result = await require('src/frontend/utils/ajax').ajaxJSON(this.dataset.uri);
        if (!result || !result.success) {
            event.srcElement.checked = !isChecked;
            alert(`There is an error with ${isChecked ? 'disabling' : 'enabling'} script`);
        }
    }
}

customElements.define('ajax-toggler', AjaxToggler);
