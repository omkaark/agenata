document.addEventListener('click', function (event) {
    logEvent('click', event);
});

document.addEventListener('keyup', function (event) {
    logEvent('keyup', event);
});

function logEvent(action, event) {
    chrome.storage.local.get(['logs'], function (data) {
        let logs = data.logs || [];
        if (!logs) return;
        let log = {
            action: action,
            details: {
                x: event.pageX,
                y: event.pageY,
                element: event.target.outerHTML,
                tagName: event.target.tagName,
                value: action === 'keyup' ? event.target.value : undefined
            },
            timestamp: new Date().toISOString()
        };
        logs.push(log);
        chrome.storage.local.set({ logs }, function () {
            console.log('Log stored:', log);
        });
    });
}
