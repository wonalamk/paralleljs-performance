//Based on HTML5 and JavaScript Web Apps, Wesley Hales
function Pool(size) {
    var _this = this;
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;

    this.addWorkerTask = function(workerTask) {
        if (_this.workerQueue.length > 0) {
            var workerThread = _this.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            _this.taskQueue.push(workerTask);
        }
    }

    this.init = function() {
        for (var i = 0 ; i < size ; i++) {
            _this.workerQueue.push(new WorkerThread(_this));
        }
    }

    this.freeWorkerThread = function(workerThread) {
        if (_this.taskQueue.length > 0) {
            var workerTask = _this.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            _this.taskQueue.push(workerThread);
        }
    }
}

function WorkerThread(parentPool) {

    var _this = this;

    this.parentPool = parentPool;
    this.workerTask = {};

    this.run = function(workerTask) {
        this.workerTask = workerTask;
        var worker = new Worker(workerTask.script);
        worker.addEventListener('message', dummyCallback, false);
        worker.postMessage(workerTask.data);
    }

    function dummyCallback(event) {
        _this.workerTask.callback(event);
        _this.parentPool.freeWorkerThread(_this);
    }
}

function WorkerTask(script, callback, data) {
    this.script = script;
    this.callback = callback;
    this.data = data;
};