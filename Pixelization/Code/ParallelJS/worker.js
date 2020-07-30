function runWorker(task) {
    var color = createPaletteFromCanvas(task.data, task.pixelCount, task.colors);
    task.result = color[0];
    return task;
}