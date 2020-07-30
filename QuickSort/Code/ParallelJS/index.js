"use strict";
const Parallel = require('paralleljs');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs');
const ARRAY_SIZE = 1e3;
const WORKER_NUMBER = 2;
const NUMBER_OF_TESTS = 4;
var counter = 0;
counter++
var defaultArray = [];

const csvWriter = createCsvWriter({
  path: `./results/paralleljs-${ARRAY_SIZE}.csv`,
  header: [
    {id: 'start', title: 'start'},
    {id: 'end', title: 'end'},
    {id: 'total', title: 'total'},
  ]
});

var performance_results = [];
var currentTest = 0;

try {
  var data = fs.readFileSync(`/home/kaka/magisterka/Client/QuickSort/ParallelJS/testArrays/${ARRAY_SIZE}-tab.txt`);
  defaultArray = data.toString().split("\r\n").map((item) => +item);
} catch(e) {
  console.log(e)
}
  

var start;
var end;
var inputArray = JSON.parse(JSON.stringify(defaultArray));
var resultArray = new Array(ARRAY_SIZE);


function quicksortTab(tab) {
  function sort(arr) {
    var size = Math.floor(Math.LOG2E * Math.log(arr.length)) + 1;
    var left_side = new Array(size);
    var right_size = new Array(size);
    var p = 1;

    left_side[0] = 0;
    right_size[0] = arr.length - 1;

    while (p > 0) {
      p--;
      var left = left_side[p];
      var right = right_size[p];

      while (left < right) {
        var idx = Math.floor((left + right) / 2);
        var pivot = arr[idx];
        var i = left;
        var j = right;
        while (1) {
          while (arr[i] < pivot) i++;
          while (pivot < arr[j]) j--;
          if (j <= i) {
            break;
          } else {
            var t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
            i++;
            j--;
          }
        }
        if (i - left < right - j) {
          if (left < i) {
            left_side[p] = i;
            right_size[p] = right;
            p++;
          }
          right = i - 1;
        } else {
          if (j < right) {
            left_side[p] = left;
            right_size[p] = j;
            p++;
          }
          left = j + 1;
        }
      }
    }
  }
  sort(tab);
  return { data: tab };
}

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
      var p = new Parallel([slicedData[0], slicedData[1]], {synchronous: false, maxWorkers: WORKER_NUMBER});
      p.map(quicksortTab).then((data) => {
        for (var d in data){
          // console.log(data)
          onmessage(data[d])
        }
        onend()
      })

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
