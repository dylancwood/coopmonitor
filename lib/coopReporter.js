'use_strict';

var m2xReporter = require('./m2xReporter');
var config = require('config');

var m2xMap = config.get('m2x.endpoints');

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

function report (streamName, dataValue, callback) {
    var url = m2xMap[streamName];
    if (!url) {
        throw new Error('No endpoint defined for streamName = ' + streamName);
    }
    return m2xReporter(url, dataValue, callback);
}

module.exports = function (coop) {
    coop.on('change', function ( updatedFields ) {
        console.log('got a change');
        updatedFields.forEach( function(field) {
            report( field, coop[field], function(err, data){ 
                if(err) logMessage(err.message + ' ' + field, coop[field], 'error');
                else logMessage(field, coop[field]);
            });
        });
    });
};
