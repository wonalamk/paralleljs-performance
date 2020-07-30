importScripts('quantize.js' , 'color-thief.js');

self.onmessage = function(event) {
    var task = event.data;
    var color = createPaletteFromCanvas(task.data, task.pixelCount, task.colors);
    task.result = color[0];
    self.postMessage(task);
};