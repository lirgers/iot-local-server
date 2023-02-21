(async function () {
    const events = {};
    const componentEventEmitter = {
        subscribe: function (component, name, listener) {
            if (!events[name]) {
                events[name] = {};
            }
            if (!events[name][component.tagName]) {
                events[name][component.tagName] = [];
            }
            events[name][component.tagName].push({ listener, component });
        },
        unsubscribe: function (component, name) {
            if (events[name] && events[name][component.tagName]) {
                events[name][component.tagName] = [];
            }
        },
        getBindingDataAttributeName: function (component) {
            let name = component.tagName.toLowerCase();
            const matched = name.match(/-(\w{1})/g);
            if (matched) {
                matched.forEach(function (dashLetter) {
                    name = name.replace(dashLetter, dashLetter[1].toUpperCase());
                })
            }
            return 'bind' + name[0].toUpperCase() + name.substring(1);
        },
        publish: function (publisherComponent, name, data) {
            if (events[name]) {
                Object.keys(events[name]).forEach(subscribedComponentName => {
                    events[name][subscribedComponentName].forEach(({ component:subscribedComponent, listener }) => {
                        const dataAttrForSubscribedComponent = this.getBindingDataAttributeName(subscribedComponent);
                        const dataAttrForPublisherComponent = this.getBindingDataAttributeName(publisherComponent);
                        if (publisherComponent.dataset[dataAttrForSubscribedComponent] === 'true'
                            && subscribedComponent.dataset[dataAttrForPublisherComponent] === 'true') {
                                listener.call(subscribedComponent, publisherComponent, data);
                        }
                    });
                })
            }
        }
    };
    Object.defineProperty(window, 'componentEventEmitter', {
        value: componentEventEmitter,
        writable: false
    });
})();
