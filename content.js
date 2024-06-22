let currentDOMContent;

function captureDOM() {
    currentDOMContent = document.documentElement.outerHTML;
}

window.onload = captureDOM;

class DataEvent {
    constructor(type, event) {
        this.target = event.target // target object

        this.type = type;
        this.value = event.target.value || "";
        this.contextDOM = currentDOMContent;
        this.element = event.target.outerHTML;
        this.tagName = event.target.tagName;
        this.timestamp = new Date().toISOString();
    }

    toDict() {
        return {
            type: this.type,
            value: this.value,
            contextDOM: this.contextDOM,
            element: this.element,
            tagName: this.tagName,
            timestamp: this.timestamp
        };
    }

    logEvent() {
        chrome.storage.local.get(['logs', 'currentTask'], function (data) {
            if (data.currentTask) {
                let logs = data.logs || [];
                let log = this.toDict();

                log['task'] = data.currentTask

                logs.push(log);
                chrome.storage.local.set({ logs }, function () {
                    console.log('Log stored for element:', log.element);
                });
            }
        }.bind(this));

        captureDOM();
    }
}

document.addEventListener('click', function (e) {
    const event = new DataEvent('click', e);
    event.logEvent();
});

document.addEventListener('keyup', function (e) {
    if (!e.target.matches('input, select, textarea')) {
        const event = new DataEvent('type', e);
        event.logEvent();
    }
});

document.addEventListener('change', function (e) {
    if (e.target.matches('input, textarea')) {
        const event = new DataEvent('type', e);
        event.logEvent();
    } else if (e.target.matches('select')) {
        const event = new DataEvent('select', e);
        event.logEvent();
    }
});