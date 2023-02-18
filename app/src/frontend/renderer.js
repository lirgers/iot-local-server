module.exports = {
    render: function (id, data) {
        const template = require('src/common/template');
        return new Promise((resolve, reject) => {
            const templateEl = document.getElementById(id);
            if (!templateEl) {
                return reject('No template found');
            }
            try {
                const parsedHtml = template.parse(templateEl.textContent, data);
                if (!parsedHtml) {
                    return reject('Empty template result');
                }
                if (templateEl.nextElementSibling && templateEl.nextElementSibling.getAttribute('data-template-id') === id) {
                    templateEl.nextElementSibling.remove();
                }
                var renderedtemplateElParent = document.createElement('div');
                renderedtemplateElParent.setAttribute('data-template-id', id);
                templateEl.after(renderedtemplateElParent);
                renderedtemplateElParent.innerHTML = parsedHtml;
                setTimeout(resolve, 0);
            } catch (error) {
                reject(error);
            }
        });
    }
}