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

// HOVER FUNCTIONALITY

let oldBorder;
let hoverBox = document.createElement('div');

hoverBox.style.position = 'absolute';
hoverBox.style.padding = '5px 10px';
hoverBox.style.background = 'black';
hoverBox.style.color = 'white';
hoverBox.style.borderRadius = '5px';
hoverBox.style.fontSize = '12px';
hoverBox.style.zIndex = '10000';
hoverBox.style.pointerEvents = 'none';
hoverBox.style.display = 'none';
document.body.appendChild(hoverBox);

document.addEventListener('mouseover', function (e) {
    chrome.storage.local.get(['currentTask'], function (data) {
        if (data.currentTask) {
            oldBorder = e.target.style.border;
            e.target.style.border = '2px dashed black';
            hoverBox.textContent = e.target.tagName + ' element';
            hoverBox.style.display = 'block';
            hoverBox.style.left = (e.pageX + 10) + 'px';
            hoverBox.style.top = (e.pageY + 10) + 'px';
        }
    });
});

document.addEventListener('mouseout', function (e) {
    chrome.storage.local.get(['currentTask'], function (data) {
        if (data.currentTask) {
            e.target.style.border = oldBorder;
            hoverBox.style.display = 'none';
        }
    });
});

document.addEventListener('mousemove', function (e) {
    chrome.storage.local.get(['currentTask'], function (data) {
        if (data.currentTask) {
            hoverBox.style.left = (e.pageX + 10) + 'px';
            hoverBox.style.top = (e.pageY + 10) + 'px';
        }
    });
});