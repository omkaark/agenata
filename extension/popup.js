document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['currentTask'], function (data) {
        if (data.currentTask) {
            document.getElementById('taskForm').style.display = 'none';
            document.getElementById('finishTask').style.display = 'block';
            document.getElementById('taskInput').value = data.currentTask;
            document.getElementById('task').textContent = data.currentTask;
            document.getElementById('task').style.display = 'block';
        } else {
            document.getElementById('taskForm').style.display = 'block';
            document.getElementById('finishTask').style.display = 'none';
            document.getElementById('task').style.display = 'none';
        }
    });
});

document.getElementById('taskForm').onsubmit = function (e) {
    e.preventDefault();
    let task = document.getElementById('taskInput').value;
    chrome.storage.local.set({ currentTask: task, logs: [] }, function () {
        console.log('Task started:', task);
        document.getElementById('taskForm').style.display = 'none';
        document.getElementById('finishTask').style.display = 'block';
        document.getElementById('task').textContent = task;
        document.getElementById('task').style.display = 'block';
    });
};

document.getElementById('finishTask').onclick = function () {
    chrome.storage.local.get(['currentTask', 'logs'], function (data) {
        if (!data.logs || data.logs.length === 0) {
            console.log('No logs to send.');
        } else {
            console.log('Sending logs for task:', data.currentTask);
            fetch('https://8511-72-138-138-18.ngrok-free.app/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ instruction: data.currentTask, logs: data.logs })
            }).then(response => response.json())
                .then(data => {
                    console.log('Logs sent:', data);
                    chrome.storage.local.set({ currentTask: data.currentTask, logs: [] }, resetForm);
                })
                .catch(error => {
                    console.error('Error sending logs:', error);
                    resetForm();
                });
        }
    });
};

function resetForm() {
    document.getElementById('taskForm').style.display = 'block';
    document.getElementById('finishTask').style.display = 'none';
    document.getElementById('task').style.display = 'none';
    document.getElementById('taskInput').value = '';
    chrome.storage.local.set({ logs: [] });
}
