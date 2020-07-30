//Inspired by HTML5 and JavaScript Web Apps, Wesley Hales
var NUMBER_OF_WORKERS = 4;
var PIXEL_SIZE = 50;
var TEST_IMAGE = "kitkats.jpg"
var BROWSER = "Chrome"
var NUMBER_OF_SAMPLES = 2;

var ctx;
var imageWidth;
var imageHeight;
var worker;
var workerPool = [];
var total = 0;
var count = 0;
var startTime = 0;
var csvData = [];
var currentTest = 1;

var pool = new Pool(NUMBER_OF_WORKERS);
pool.init();

window.onload = initTest;

function initTest() {
    initVariables();
    setupCanvas();
}

function initVariables() { 
    ctx = undefined;
    imageWidth = 0;
    imageHeight = 0;
    worker = undefined;
    workerPool = [];
    total = 0;
    count = 0;
    startTime = 0;

    pool = new Pool(NUMBER_OF_WORKERS);
    pool.init();
}

function setupCanvas() {
    var c = document.getElementById('photo');
    ctx = c.getContext('2d');
    var img1 = new Image();
    img1.src = `../images/${TEST_IMAGE}`
    img1.onload = function () {
        c.width = img1.width;
        c.height = img1.height;
        renderElements(img1)
    }
}

function renderElements(img) {
    startTime = performance.now();
    var nrX = Math.round(img.width / PIXEL_SIZE);
    var nrY = Math.round(img.height / PIXEL_SIZE);
    total = nrX * nrY;

    for (var x = 0; x < nrX; x++) {
        for (var y = 0; y < nrY; y++) {
            var canvas2 = document.createElement('canvas');
            canvas2.width = PIXEL_SIZE;
            canvas2.height = PIXEL_SIZE;
            var context2 = canvas2.getContext('2d');
            context2.drawImage(img, x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE, 0, 0, PIXEL_SIZE, PIXEL_SIZE);
            var data = context2.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE).data
            var dataAsArray = [];
            for (var i = 0; i < data.length; i++) {
                dataAsArray.push(data[i]);
            }
            var task = getTask();
            task.colors = 5;
            task.data = dataAsArray;
            task.pixelCount = PIXEL_SIZE * PIXEL_SIZE;
            task.x = x;
            task.y = y;
            var workerTask = new WorkerTask(runWorker, draw, task);
            pool.addWorkerTask(workerTask);
        }
    }
}

function getTask() {
    return {
        colors: 0,
        pixelCount: 0,
        data: [],
        x: 0,
        y: 0,
        result: [0, 0, 0],
    }
}

function draw(event, data) {
    count++;
    var task = data;
    drawPixel(task.x, task.y, PIXEL_SIZE, task.result);
    event.terminate()
    if (count === total) {
        var endTime = performance.now() ;
        csvData[currentTest] = [startTime, endTime, endTime - startTime];
        if (currentTest === NUMBER_OF_SAMPLES) {
            saveToCSV(csvData);
        } else {
            console.log(currentTest);
            currentTest++;
            initTest();
        }
    }
}

function drawPixel(x, y, PIXEL_SIZE, color) {
    ctx.beginPath();
    ctx.rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    ctx.fillStyle = ["rgba(" + color + ",1)"];
    ctx.fill();
}

function saveToCSV(data) {
    var csv = `start,end,total\n`;
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
        `OperativeJS-${BROWSER}-${TEST_IMAGE}-${NUMBER_OF_WORKERS}-${PIXEL_SIZE}.csv`
    );
    pom.click();
}