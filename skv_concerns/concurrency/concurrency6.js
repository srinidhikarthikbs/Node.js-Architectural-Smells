promise-concurrency 
Build Status

run promises in parallel with a concurrency limit.

Installation

npm install promise-concurrency
Example

The most common use case:

var promiseFactories = [5, 4, 3, 2, 1].map(function (item) {
    return function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(item);
            }, item * 100);
        });
    };
});
promiseConcurrency(promiseFactories, 2).then(function (value) {
    console.log(value); // => [5, 4, 3, 2, 1] 
});