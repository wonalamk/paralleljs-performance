const { makeExecutable } = require('hurried');

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

module.exports.estimatePI = estimatePI;

makeExecutable(estimatePI, 'estimatePI');