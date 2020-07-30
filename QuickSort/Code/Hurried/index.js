"use strict";
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs');
const path = require('path');
const { Thread } = require('hurried');
const { quicksortTab } = require('./worker');

const ARRAY_SIZE = 1e3;
const WORKER_NUMBER = 2;
const NUMBER_OF_TESTS = 4;
var counter = 0;
counter++
var defaultArray = [];

const csvWriter = createCsvWriter({
  path: `./results/hurried-${ARRAY_SIZE}.csv`,
  header: [
    {id: 'start', title: 'start'},
    {id: 'end', title: 'end'},
    {id: 'total', title: 'total'},
  ]
});

var performance_results = [];

try {
  var data = fs.readFileSync(`/home/kaka/magisterka/Client/QuickSort/Hurried/testArrays/${ARRAY_SIZE}-tab.txt`);
  defaultArray = data.toString().split("\r\n").map((item) => +item);
} catch(e) {
  console.log(e)
}
  

var start;
var end;
var inputArray = JSON.parse(JSON.stringify(defaultArray));
var resultArray = new Array(ARRAY_SIZE);

function runTest() {
    var slicedData = [];
    var firstPivotIdx = 0;
    var threads = new Set();
    var workerNr = WORKER_NUMBER;
    init_sorting();

    function restart() {
      slicedData = [];
      firstPivotIdx = 0;
      workerNr = WORKER_NUMBER;
      threads = new Set();
      inputArray = JSON.parse(JSON.stringify(defaultArray));
      console.log("Input array after reset", inputArray)
      init_sorting();
    }

    function partition(arr, lIdx, rIdx) {
      var pivot_item = arr[lIdx];
      var tmp_lIdx = lIdx;
      var tmp_rIdx = rIdx;
      while (tmp_lIdx < tmp_rIdx) {
        while (arr[tmp_lIdx] <= pivot_item) {
          tmp_lIdx++;
        }
        while (arr[tmp_rIdx] > pivot_item) {
          tmp_rIdx--;
        }
        if (tmp_lIdx < tmp_rIdx) {
          var t = arr[tmp_lIdx];
          arr[tmp_lIdx] = arr[tmp_rIdx];
          arr[tmp_rIdx] = t;
        }
      }
      arr[lIdx] = arr[tmp_rIdx];
      arr[tmp_rIdx] = pivot_item;
      return tmp_rIdx;
    }

    function init_sorting() {
      // console.log("Begin sorting");
      start = process.hrtime.bigint();
      currentTest++;
      firstPivotIdx = partition(inputArray, 0, ARRAY_SIZE - 1);
      resultArray[firstPivotIdx] = inputArray[firstPivotIdx];

      var data1 = inputArray.slice(0, firstPivotIdx);
      var data2 = inputArray.slice(firstPivotIdx + 1, ARRAY_SIZE);
      slicedData[0] = data1;
      slicedData[1] = data2;
      setup_workers(slicedData);
    }

    function setup_workers(slicedData) {
      

      
      const threads = Array(2);

      threads.push(Thread.fromFile(path.resolve(__dirname, 'worker.js')));
      threads.push(Thread.fromFile(path.resolve(__dirname, 'worker.js')));

      var currentData = 0;
      (async () => {
        await Promise.all(threads.map((thread) => {
          return thread.run('quicksortTab', slicedData[currentData++])
        })).then((response) => {
          for (var r in response){
            if(response[r] !== undefined){
              onmessage(response[r])
            }
          }
          onend();
        });
        threads.forEach(t => t.terminate());
      })()

      console.log(
        `Quicksort test nr ${currentTest} for Array(${ARRAY_SIZE}) and ${WORKER_NUMBER} threads...`
      );

      function onend() {
        end = process.hrtime.bigint();
        var total = Number(end - start)/1e6
        console.log("End of sorting, total time: ", total);
        var test_performance = {start: Number(start)/1e6, end: Number(end)/1e6, total: total}
        performance_results.push(test_performance);
        if(currentTest < NUMBER_OF_TESTS){
          restart();
        } else {
          console.log("all tests ended: ", performance_results)
          csvWriter.writeRecords(performance_results).then(()=> console.log("Results saved successfully"))
        }

        };

      function onmessage(msg) {
        workerNr--;
        var arr = msg.data;
        if (arr.length > 0) {
          if (resultArray[firstPivotIdx] <= arr[0]) {
            for (
              var i = firstPivotIdx + 1, j = 0, len = arr.length;
              j < len;
              i++, j++
            ) {
              resultArray[i] = arr[j];
            }
          } else {
            for (var i = 0, len = arr.length; i < len; i++) {
              resultArray[i] = arr[i];
            }
          }
        }
      };
      }
    }
  runTest();

