var reporter = require('./lib/coopReporter');

var streamName = 'temperatureC';

reporter(streamName, 0, function(err, response) {
    if (err) { console.error(err); }
    console.log('success!');
});
