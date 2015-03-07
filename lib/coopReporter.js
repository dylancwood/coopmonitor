'use_strict';

var m2xReporter = require('./m2xReporter');
var config = require('config');

var m2xMap = config.get('m2x.endpoints');

module.exports = function(streamName, dataValue, callback) {
    var url = m2xMap[streamName];
    if (!url) {
        throw new Error('No endpoint defined for streamName = ' + streamName);
    }
    return m2xReporter(url, dataValue, callback);
}
