var workers = [];
var rowData;
var nextRow = 0;
var canvas;
var ctx;

var startTime = 0;
var endTime = 0;
var startDateTime = "";
var endDateTime = "";
var palette = []; //color pallette
var initX = 0;
var initY = 0;

var currentTest = 0;
var csvData = [];

var BROWSER = "Firefox";
//STARTING POINT
if (BROWSER === "Chrome") {
  initX = 546;
  initY = 490;
} else if (BROWSER === "Firefox") {
  initX = 547.25;
  initY = 488.5;
}

// starting point depends on browser workspace resolution 
// is calculated from y = -1.76838525 x = -0.00110825 to screen coords
// and it needs to be tuned for different resolutions

//VARIABLES
var ZOOM = Math.pow(2, 11);
var MAX_ITERATIONS = Math.pow(10, 4);
var NUMBER_OF_WORKERS = 12;
var NUMBER_OF_SAMPLES = 50;

//coords range
var XMIN = -2.5;
var XMAX = 1.5;
var YMAX = 1.5;
var YMIN = -1.5;

function initVariables() {
  workers = [];
  rowData = [];
  nextRow = 0;
  startTime = 0;
  endTime = 0;
  canvas = undefined;
  ctx = undefined;
  xMin = XMIN;
  xMax = XMAX;
  yMax = YMAX;
  yMin = YMIN;
}

window.onload = initTest;

function initTest() {
  startDateTime = new Date().toTimeString();
  runTest();
}

function runTest() {
  initVariables();
  initCanvas();
  makePalette();
  handleZoom();
  startWorkers();
}

function initCanvas() {
  canvas = document.getElementById("mandel");
  ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var width = ((yMax - yMin) * canvas.width) / canvas.height;
  var xMid = (xMax + xMin) / 2;
  xMin = xMid - width / 2;
  xMax = xMid + width / 2;

  rowData = ctx.createImageData(canvas.width, 1);
}

function startWorkers() {
  //beginning of test
  currentTest++;
  startTime = performance.now();
  console.log("Start time", startTime);
  nextRow = 0;
  var data = [];

  for (var i = 0; i < canvas.height; i++) {
    data[i] = createTask(i);
  }

  var p = new Parallel(data, options={synchronous: false, maxWorkers: NUMBER_OF_WORKERS});

  p.map(calculateRow).then(function (data) {
    for (var i = 0; i < data.length; i++) {
      this.calculate(data[i]);
    }
  });
}

function calculateRow(task) {
  var iter = 0;
  var cI = task.i;
  task.values = [];

  for (var i = 0; i < task.width; i++) {
    var c = task.xMin + ((task.xMax - task.xMin) * i) / task.width;
    var zR = 0;
    var zI = 0;

    for (iter = 0; zR * zR + zI * zI < 4 && iter < task.maxIterations; iter++) {
      var tmp = zR * zR - zI * zI + c;
      zI = 2 * zR * zI + cI;
      zR = tmp;
    }

    if (iter === task.maxIterations) {
      iter = -1;
    }

    task.values.push(iter);
  }
  return task;
}

function calculate(results) {
  drawRow(results);
  if (results.row + 1 == canvas.height) {
    //end of test
    endTime = performance.now();
    csvData[currentTest] = [startTime, endTime, endTime - startTime];
    if (currentTest === NUMBER_OF_SAMPLES) {
      endDateTime = new Date().toTimeString();
      saveToCSV(csvData);
    } else {
      console.log(currentTest);
      runTest();
    }
  }
}

function createTask(row) {
  var task = {
    row: row,
    width: rowData.width,
    xMin,
    xMax,
    i: yMax + ((yMin - yMax) * row) / canvas.height,
    maxIterations: MAX_ITERATIONS,
  };
  return task;
}

function handleZoom() {
  if (ZOOM !== 1) {
    var x = xMax - xMin;
    var y = yMin - yMax;
    var zoomPointX = xMin + (x * initX) / canvas.width;
    var zoomPointY = yMax + (y * initY) / canvas.height;

    xMin = zoomPointX - x / ZOOM;
    xMax = zoomPointX + x / ZOOM;
    yMin = zoomPointY - y / ZOOM;
    yMax = zoomPointY + y / ZOOM;
  }
}

function saveToCSV(data) {
  var csv = `start,end,total,start: ${startDateTime},end: ${endDateTime}\n`;
  data.forEach(function (row) {
    csv += row + ",";
    csv += "\n";
  });

  var blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  var pom = document.createElement("a");
  var url = URL.createObjectURL(blob);
  pom.href = url;
  pom.setAttribute(
    "download",
    `ParallelJS-${BROWSER}-${NUMBER_OF_WORKERS}-${MAX_ITERATIONS}-${ZOOM}.csv`
  );
  pom.click();
}

function makePalette() {
  for (var i = 0; i < MAX_ITERATIONS; i++) {
    var hue = i / MAX_ITERATIONS;
    palette[i] = makeSpectralColor(hue);
  }
}

function makeSpectralColor(hue) {
  var section = Math.floor(hue * 6);
  var fraction = hue * 6 - section;
  switch (section) {
    case 0:
      r = 1;
      g = fraction;
      b = 0;
      break;
    case 1:
      r = 1 - fraction;
      g = 1;
      b = 0;
      break;
    case 2:
      r = 0;
      g = 1;
      b = fraction;
      break;
    case 3:
      r = 0;
      g = 1 - fraction;
      b = 1;
      break;
    case 4:
      r = fraction;
      g = 0;
      b = 1;
      break;
    case 5:
      r = 1;
      g = 0;
      b = 1 - fraction;
      break;
  }
  var rx = Math.floor(r * 255);
  var gx = Math.floor(g * 255);
  var bx = Math.floor(b * 255);
  return [rx, gx, bx];
}

function drawRow(results) {
  var values = results.values;
  var pixelData = rowData.data;
  for (var i = 0; i < rowData.width; i++) {
    var basePix = i * 4;
    var red = basePix;
    var green = basePix + 1;
    var blue = basePix + 2;
    var alpha = basePix + 3;

    pixelData[alpha] = 255;

    if (values[i] < 0) {
      pixelData[red] = pixelData[green] = pixelData[blue] = 0;
    } else {
      var color = palette[values[i]];
      pixelData[red] = color[0];
      pixelData[green] = color[1];
      pixelData[blue] = color[2];
    }
  }
  ctx.putImageData(this.rowData, 0, results.row);
}
