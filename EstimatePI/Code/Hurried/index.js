"use strict";
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs');
const path = require('path');
const { Thread } = require('hurried');
const { estimatePI } = require('./worker.js');

var WORKER_NUMBER = 2;
var NUMBER_OF_TESTS = 4;
var POINTS = 1e7;


var start;
var end;
var currentTest = 0;
var result = 0;
var performance_results = [];

const csvWriter = createCsvWriter({
  path: `./results/hurried-${POINTS}-${WORKER_NUMBER}.csv`,
  header: [
    {id: 'start', title: 'start'},
    {id: 'end', title: 'end'},
    {id: 'total', title: 'total'},
  ]
});

  function init(points) {
    start = process.hrtime.bigint();
    currentTest++;
    setup_workers(points)
  }

  function setup_workers(points){
    var tasks = []
    var threads = Array(WORKER_NUMBER);

    for (var i = 0; i<WORKER_NUMBER; i++){
      tasks.push(points/WORKER_NUMBER)
      threads.push(Thread.fromFile(path.resolve(__dirname, 'worker.js')));
    }
    var currentData = 0;
    (async () => {
      await Promise.all(threads.map(
        (thread) => {return thread.run('estimatePI', tasks[currentData++])}
      )).then((response) => {
       for (var r in response) {
         if(response[r] !== undefined){
           onmessage(response[r])
         }
       }
       onend();
      });
      threads.forEach(t => t.terminate())
    })()

    console.log(
      `Estimate PI test nr ${currentTest} for ${POINTS} points and ${WORKER_NUMBER} threads...`
    );
  }

  function onend (){
      end = process.hrtime.bigint();
      var total = Number(end-start)/1e6;
      result = result / WORKER_NUMBER;
      console.log("End of estimation, total time: ", total, " Estimate: ", result);
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

  function onmessage(msg){
    console.log(msg)
    result += msg.value;
  }
  function restart(){
    result = 0;
    init(POINTS);
  }

  init(POINTS);