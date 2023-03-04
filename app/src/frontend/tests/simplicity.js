(async function () {
    window.addEventListener('load', async () => {
        const { ajaxJSON } = require('src/frontend/utils/ajax');
        const menuModel = await ajaxJSON('configs/homePage.json');
        const simplicity = require('src/common/simplicity').get();
        const id = 'template-test';
        return new Promise(async (resolve, reject) => {
            const templateEl = document.getElementById(id);
            if (!templateEl) {
                return reject('No template found');
            }
            try {
                const parsedHtml = await simplicity.parse(templateEl.textContent, menuModel);
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
    });
})();
