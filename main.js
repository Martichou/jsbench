var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

const DATA_SIZE = 100000;

// Init data
let xs = Array(DATA_SIZE);
for (let i = 0; i < DATA_SIZE; i++) {
    xs[i] = i;
}
let d1 = [...Array(xs.length)].map(e => Math.random() * xs.length | 0),
    d2 = [...Array(xs.length)].map(e => Math.random() * xs.length | 0),
    d3 = [...Array(xs.length)].map(e => Math.random() * xs.length | 0),
    d4 = [...Array(xs.length)].map(e => Math.random() * xs.length | 0),
    d5 = [...Array(xs.length)].map(e => Math.random() * xs.length | 0);

// Original variant
function stack(data, omit) {
    let data2 = [];
    let accum = Array(data[0].length).fill(0);
    let bands = [];

    for (let i = 1; i < data.length; i++)
        data2.push(omit(i) ? data[i] : data[i].map((v, i) => (accum[i] += +v)));

    for (let i = 1; i < data.length; i++)
        !omit(i) && bands.push({
            series: [
                data.findIndex((s, j) => j > i && !omit(j)),
                i,
            ],
            fill: () => null,
        });

    bands = bands.filter(b => b.series[1] > -1);

    return {
        data: [data[0]].concat(data2),
        bands,
    };
}

// Optimized (pre) variant
function stack_pre_opt(data, omit) {
    let d0lenght = data[0].length;
    let accum = Array(d0lenght).fill(0);
    // Create a copy of the base x axis (data[0]) in a new array
    let stacked_data = [data[0]];
    let length = data.length;
    let bands = [];

    for (let i = 1; i < length; i++) {
        stacked_data.push(omit(i) ? data[i] : data[i].map((v, i) => (accum[i] += +v)));
    }

    for (let i = 1; i < length; i++) {
        !omit(i) && bands.push({
            series: [
                data.findIndex((_s, j) => j > i && !omit(j)),
                i,
            ]
        });
    }

    // Assure no value below -1 exists in our array
    bands = bands.filter(b => b.series[1] > -1);

    return {
        data: stacked_data,
        bands,
    };
}

// Optimized variant
function stack_opt(data, omit) {
    let d0lenght = data[0].length;
    let accum = Array(d0lenght);
    // Faster than .fill(0)
    for (let i = 0; i < d0lenght; ++i) accum[i] = 0;
    // Create a copy of the base x axis (data[0]) in a new array
    let stacked_data = [data[0]];
    let length = data.length;
    let bands = [];

    for (let i = 1; i < length; i++) {
        stacked_data.push(omit(i) ? data[i] : data[i].map((v, i) => (accum[i] += +v)));
    }

    for (let i = 1; i < length; i++) {
        !omit(i) && bands.push({
            series: [
                data.findIndex((_s, j) => j > i && !omit(j)),
                i,
            ]
        });
    }

    // Assure no value below -1 exists in our array
    bands = bands.filter(b => b.series[1] > -1);

    return {
        data: stacked_data,
        bands,
    };
}

// Benchmarks
suite.add('Stack', function() {
        stack([xs, d1, d2, d3, d4, d5], i => false);
    })
    .add('Stack_pre_opt', function() {
        stack_pre_opt([xs, d1, d2, d3, d4, d5], i => false);
    })
    .add('Stack_opt', function() {
        stack_opt([xs, d1, d2, d3, d4, d5], i => false);
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