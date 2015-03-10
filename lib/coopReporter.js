'use_strict';

var m2xReporter = require('./m2xReporter');
var config = require('config');

var m2xConfig = config.get('m2x');

var winston = require('winston');

// Helper functions
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/coopReporter.log' })
    ]
});

var logMessage = function(streamName, dataValue, logLevel) {
    var logLine = streamName + ' = ' + dataValue;
    logLevel = logLevel || 'info';
    logger.log(logLevel, logLine);
};

var generateURL = function(streamName) {
    var url = [
        m2xConfig.urlSeed,
        m2xConfig.deviceId,
        'streams', 
        streamName,
        'value'
    ].join('/');
    return url;
};

function report (streamName, dataValue, callback) {
    var url = generateURL(streamName);
    if (!url) {
        throw new Error('No endpoint defined for streamName = ' + streamName);
    }
    return m2xReporter(url, dataValue, callback);
}

module.exports = function (coop) {
    coop.on('change', function ( updatedFields ) {
        updatedFields.forEach( function(field) {
            report( field, coop[field], function(err, data){ 
                if(err) logMessage(err.message + ' ' + field, coop[field], 'error');
                else logMessage(field, coop[field]);
            });
        });
    });

    // for a heartbeat, just update the temperature
    coop.on('heartbeat', function () {
        console.log('heartbeat');
        coop.checkLegality().then( function (isLegal) {
            report('aok', isLegal ? 1 : 0, function() { return; });
        });
    });
    return report;
};
