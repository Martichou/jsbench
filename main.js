var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

const DATA_SIZE = 10000000;

console.log("DATA_SIZE " + DATA_SIZE);

function filledArr(len, val) {
    let arr = Array(len);

    if (typeof val == "function") {
        for (let i = 0; i < len; ++i)
            arr[i] = val(i);
    } else {
        for (let i = 0; i < len; ++i)
            arr[i] = val;
    }

    return arr;
}

// Benchmarks
suite.add('fill', function() {
        Array(DATA_SIZE).fill(0);
    })
    .add('filledArr', function() {
        filledArr(DATA_SIZE, 0);
    })
    // add listeners
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({ 'async': true });