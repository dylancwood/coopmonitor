'use_strict';

var m2xReporter = require('./m2xReporter');
var config = require('config');

var m2xConfig = config.get('m2x');

var generateURL = function(streamName) {
    var url = [
        m2xConfig.urlSeed,
        m2xConfig.deviceId,
        'streams', 
        streamName,
        'value'
    ].join('/');
    console.log(url);
    return url;
    
};

module.exports = function(streamName, dataValue, callback) {
    var url = generateURL(streamName);
    if (!url) {
        throw new Error('No endpoint defined for streamName = ' + streamName);
    }
    return m2xReporter(url, dataValue, callback);
}
