var events = require('events');
var reporter = require('./lib/coopReporter')(new events.EventEmitter())

var streamName = 'temperatureC';

reporter(streamName, 0, function(err, response) {
    if (err) { console.error(err); }
    console.log('success!');
});
