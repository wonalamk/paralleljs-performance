"use strict";
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs');

var WORKER_NUMBER = 4;
var NUMBER_OF_TESTS = 4;
var POINTS = 1e8;


var start;
var end;
var currentTest = 0;
var result = 0;
var performance_results = [];

const csvWriter = createCsvWriter({
  path: `./results/webworkers-${POINTS}-${WORKER_NUMBER}.csv`,
  header: [
    {id: 'start', title: 'start'},
    {id: 'end', title: 'end'},
    {id: 'total', title: 'total'},
  ]
});

function estimatePI(points) {
  var i = points;
  var insideCircle = 0;

  while (i-- > 0) {
    var x = Math.random();
    var y = Math.random();

    if(Math.pow(x,2) + Math.pow(y,2) <= 1){
      insideCircle++;
    }
  }
  var mean = insideCircle / points;
  return {value: mean * 4};
}

if (isMainThread) {
  function init(points) {
    start = process.hrtime.bigint();
    currentTest++;
    setup_workers(points)
  }

  function setup_workers(points){
    var threads = new Set();

    for (var i = 0; i < WORKER_NUMBER; i++){
      threads.add(new Worker(__filename, {workerData: {points: [points / WORKER_NUMBER]}}))
    }
    console.log(
      `Estimate PI test nr ${currentTest} for ${POINTS} points and ${WORKER_NUMBER} threads...`
    );

    
    for (let worker of threads) {
      worker.on('error', (err) => {
        throw err;
      });

      worker.on("exit", () => {
        threads.delete(worker);

        if(threads.size === 0) {
          result = result / WORKER_NUMBER
          end = process.hrtime.bigint();
          var total = Number(end-start)/1e6;
          console.log("End of estimation, total time: ", total, " estimate: ", result);
          var test_performance = {start: Number(start)/1e6, end: Number(end)/1e6, total: total}
          performance_results.push(test_performance);
          if(currentTest < NUMBER_OF_TESTS) {
            restart();
          }
          else {
            console.log("All tests ended: ", performance_results);
            csvWriter.writeRecords(performance_results).then(()=> console.log("Results saved successfully"))
          }
        }
      });

      worker.on("message", (msg) => {
        result += msg.value;
        console.log(msg.value)
      })
    }
  }

  function restart(){
    result = 0;
  
    init(POINTS);
  }
  init(POINTS);
} else {
  var partResult = estimatePI(workerData.points)
  parentPort.postMessage(partResult)
}
