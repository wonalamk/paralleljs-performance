# Analysis of performance of web applications that use Parallel.js library

Repository contains results of research on the performance of web applications using Parallel.js library and similar solutions for parallel processing. 

Tests were divided into two parts where following technologies of JavaScript parallel processing were used:

* client side:
  * Web Workers,
  * [Parallel.js](https://parallel.js.org/), 
  * [Operative.js](https://github.com/padolsey/operative),
* server side: 
  * Web Workers, 
  * [Parallel.js](https://parallel.js.org/), 
  * [Hurried](https://github.com/yankouskia/hurried).

Each of used libraries is based on Web Workers technology. 

Performance tests consist of 4 tests: 

* client side: 
  * Mandelbrot set rendering, 
  * image pixelization, 
* server side: 
  * parallel quicksort,
  * pi number estimation. 
  
Repository contains code and results of each test. Total number of performed tests for different test cases equals 132. 


