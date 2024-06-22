document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    chrome.storage.local.get(['currentTask', 'allTasks', 'allLogs'], function (data) {
        if (data.currentTask) {
            document.getElementById('taskForm').classList.add('hidden');
            document.getElementById('finishTask').classList.remove('hidden');
            document.getElementById('taskInput').value = data.currentTask;
            document.getElementById('task').textContent = data.currentTask;
            document.getElementById('task').classList.remove('hidden');
        } else {
            document.getElementById('taskForm').classList.remove('hidden');
            document.getElementById('finishTask').classList.add('hidden');
            document.getElementById('task').classList.add('hidden');
        }

        if (data.allTasks) {
            refreshTaskList(data.allTasks);
        }

        if (data.allLogs) {
            updateFileSizeEstimate(data.allLogs);
        }
    });

    document.getElementById('taskForm').onsubmit = function (e) {
        e.preventDefault();
        let task = document.getElementById('taskInput').value;
        chrome.storage.local.set({ currentTask: task, logs: [] }, function () {
            console.log('Task started:', task);
            document.getElementById('taskForm').classList.add('hidden');
            document.getElementById('finishTask').classList.remove('hidden');
            document.getElementById('task').textContent = task;
            document.getElementById('task').classList.remove('hidden');
        });
    };

    document.getElementById('finishTask').onclick = function () {
        chrome.storage.local.get(['currentTask', 'logs', 'allTasks', 'allLogs'], function (data) {
            let allTasks = data.allTasks || [];
            let allLogs = data.allLogs || [];

            if (data.logs && data.logs.length > 0) {
                let taskLogs = data.logs.map(log => ({ instruction: data.currentTask, ...log }));
                taskLogs = dedupeLogs(taskLogs);
                allLogs = allLogs.concat(taskLogs);
            }

            allTasks.push(data.currentTask);
            chrome.storage.local.set({ currentTask: '', logs: [], allTasks: allTasks, allLogs: allLogs }, function () {
                resetForm();
                refreshTaskList(allTasks);
                updateFileSizeEstimate(allLogs);
            });
        });
    };

    document.getElementById('exportButton').onclick = function () {
        chrome.storage.local.get(['allLogs'], function (data) {
            let allLogs = data.allLogs || [];
            if (allLogs.length === 0) {
                document.getElementById('noLogsMessage').classList.remove('hidden');
                return;
            }
            document.getElementById('noLogsMessage').classList.add('hidden');

            // Dedupe logs before exporting
            const dedupedLogs = dedupeLogs(allLogs);

            const jsonlContent = dedupedLogs.map(log => JSON.stringify(log)).join("\n");
            const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'all_tasks_logs.jsonl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            chrome.storage.local.set({ allTasks: [], allLogs: [] }, function () {
                refreshTaskList([]);
                updateFileSizeEstimate([]);
            });
        });
    };

    function refreshTaskList(allTasks) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        if (allTasks.length === 0) {
            const noLogsMessage = document.getElementById('noLogsMessage');
            noLogsMessage.classList.remove('hidden');
        } else {
            allTasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                tasksList.appendChild(li);
            });
            const noLogsMessage = document.getElementById('noLogsMessage');
            noLogsMessage.classList.add('hidden');
        }
    }

    function updateFileSizeEstimate(logs) {
        const jsonlContent = logs.map(log => JSON.stringify(log)).join("\n");
        const sizeInBytes = new Blob([jsonlContent]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        document.getElementById('fileSizeEstimate').textContent = `(${sizeInMB} MB)`;
    }

    function updateFileSizeEstimate(logs) {
        const dedupedLogs = dedupeLogs(logs);
        const jsonlContent = dedupedLogs.map(log => JSON.stringify(log)).join("\n");
        const sizeInBytes = new Blob([jsonlContent]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        document.getElementById('fileSizeEstimate').textContent = `(${sizeInMB} MB)`;
    }

    function resetForm() {
        document.getElementById('taskForm').classList.remove('hidden');
        document.getElementById('finishTask').classList.add('hidden');
        document.getElementById('task').classList.add('hidden');
        document.getElementById('taskInput').value = '';
    }

    function dedupeLogs(logs) {
        let cachedTypeId = "";
        let dedupedLogs = []
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const typeId = `${log.type}_${log.tagName}_${log.instruction}`;
            if (typeId === cachedTypeId) { // TODO: not the best dedupe logic, improve this
                dedupedLogs[dedupedLogs.length - 1] = log;
            } else {
                dedupedLogs.push(log);
                cachedTypeId = typeId;
            }
        }
        return dedupedLogs;
    }
});
