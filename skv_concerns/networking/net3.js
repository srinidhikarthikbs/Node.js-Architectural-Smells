
network-js

A JavaScript library, entirely written in ES6, to measure various aspects of a connection. It can accurately estimate a bandwidth/latency between a client (using a web browser) and a server (running a specific script).
Installation

User Bower or download a ZIP file:

bower install network-js

<script src="bower_components/network-js/dist/network.min.js"></script>

How to use

// Create a new Network instance by providing an optional object. 
var settings = {
    // The settings list is available below. 
};
 
var net = new Network(settings);
 
// Listen for the "end" event which provides the calculated latencies. 
net.latency.on('end', function(averageLatency, allLatencies) {
    // "allLatencies" is an array containing the five calculated latencies in 
    // milliseconds. They're used to determine an average latency. 
    console.log('end', averageLatency, allLatencies);
});
 
// Once all the configuration is done, start the requests for this module. 
net.latency.start();
 
// It is possible to chain functions for all the modules, here's an example with the 
// upload module. 
net.upload
     .on('start', function(dataSize) {
         console.log('start', dataSize);
     })
     .on('progress', function(averageSpeed, instantSpeed) {
         // Every bandwidth measure are in Mega BYTES per second! 
         console.log('progress', averageSpeed, instantSpeed);
     })
     .on('restart', function(dataSize) {
         // The restart event is triggered when the module didn't have time 
         // (according to the `delay` option) to take all the measures. A new 
         // request will start with data size increased by the multiplier value. 
         console.log('restart', dataSize);
     })
     .on('end', function(averageSpeed, allInstantSpeeds) {
         console.log('end', averageSpeed, allInstantSpeeds);
     })
     .start();
 
// You can also cancel a request (except for the "latency" module). 
net.upload.abort();
 
net.download
     .on('start', function(dataSize) {
         console.log('start', dataSize);
     })
     .on('progress', function(averageSpeed, instantSpeed) {
         console.log('progress', averageSpeed, instantSpeed);
     })
     .on('restart', function(dataSize) {
         console.log('restart', dataSize);
     })
     .on('end', function(averageSpeed, allInstantSpeeds) {
         console.log('end', averageSpeed, allInstantSpeeds);
     })
     .start();
 
net.download.abort();

Settings

The available settings with their default values:

{
    latency: {
        // Where is located your `network.php` file. 
        endpoint: './network.php',
        // How many measures should be returned. 
        measures: 5,
        // How much attempts to get a valid value should be done for each measure. 
        attempts: 3
    },
 
    upload: {
        // Where is located your `network.php` file. 
        endpoint: './network.php',
        // The delay while you want to take measures. 
        delay: 8000,
 
        data: {
            // The amount of data to initially use. 
            size: 2 * 1024 * 1024, // 2 MB 
 
            // If the measure period can't reach the delay defined in the settings, 
            // the data amount is multiplied by the following value. 
            multiplier: 2
        }
    },
 
    download: {
        // Where is located your `network.php` file. 
        endpoint: './network.php',
        // The delay while you want to take measures. 
        delay: 8000,
 
        data: {
            // The amount of data to initially use. 
            size: 10 * 1024 * 1024, // 10 MB 
 
            // If the measure period can't reach the delay defined in the settings, 
            // the data amount is multiplied by the following value. 
            multiplier: 2
        }
    }
}

Here is an example usage:

var net = new Network({
    // If you define a value at the top level of the object, 
    // it will be applied to every module. 
    endpoint: './my-new-endpoint/',
 
    download: {
        data: {
            multiplier: 2.5
        }
    }
});

You can also redefine settings whenever you want:

// The `settings()` method takes an object in parameter. 
net.settings({
    endpoint: './my-second-new-endpoint'
});
 
// Without any parameters, it will return the current settings. 
console.log(net.settings()); // Prints the current settings in the console. 
 
// Each module has a `settings()` method that works the same way. 
net.latency.settings({
    measures: 10
});
console.log(net.latency.settings());

Compatibility

Network.js is based on two browser features: Resource Timing and XMLHttpRequest (v2). While the first one can be polyfilled, the second one is a requirement.

Thus, Network.js should be compatible with:
Browser 	Partial support (polyfill) 	Native support
IE 10+ 		✔
Firefox 35+ 		✔
Chrome 29+ 		✔
Opera 15+ 		✔
Android Browser 4.4+ 		✔
		
Safari 5+ 	✔ 	
iOS Safari 5.1+ 	✔ 	
Firefox 12+ 	✔ 	
Opera 12.1+ 	✔ 	
Android Browser 3+ 	✔ 	

Latency measures can be very far from reality if the browser doesn't support Resource Timing and uses the provided polyfill. You can determine if the browser uses the latter:

if (Network.supportsResourceTiming) {
    // Resource Timing is available. 
} else {
    // The polyfill will be used, expect some weird latency measures. 
}

Caveats

    Chrome cannot upload a ~128 MB file, which will mainly affect fiber users.

Compilation

To compile the project, install the latest version of Node and run these commands inside a terminal:

git clone https://github.com/nesk/network.js.git
cd network.js
npm install
npm run build

There's also a watch script which compiles the project whenever a file is changed:

npm run watch

To check if the project passes all the tests, run:

npm test