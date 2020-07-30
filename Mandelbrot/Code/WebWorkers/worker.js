function calculateRow(task) {
  var iter = 0;
	var cI = task.i;
  task.values = [];
  
  for (var i = 0; i < task.width; i++) {
    var c = task.xMin + (task.xMax - task.xMin) * i /task.width;
    var zR = 0;
    var zI = 0;

    for (iter=0; zR*zR + zI*zI < 4 && iter < task.maxIterations; iter++) {
      var tmp = zR * zR - zI * zI + c;
      zI = 2 * zR * zI + cI;
      zR = tmp;
    }

    if (iter === task.maxIterations){
      iter = -1;
    }

    task.values.push(iter);
  }
  return task;
}

self.onmessage = function(task) {
  var workerResults = calculateRow(task.data);
  self.postMessage(workerResults);
}