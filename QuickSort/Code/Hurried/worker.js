const { makeExecutable } = require('hurried');

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
  // console.log(tab)
  // console.log(tab);
  return { data: tab };
}
module.exports.quicksortTab = quicksortTab;

makeExecutable(quicksortTab, 'quicksortTab');