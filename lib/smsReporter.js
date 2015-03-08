'use_strict';

var config = require('config');
var twilioCredentials = config.get('twilioCredentials');
var recipients = config.get('test.smsRecipients');
var client = require('twilio')(twilioCredentials.sid, twilioCredentials.token);
var winston = require('winston');

// Helper functions
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/smsReporter.log' })
    ]
});

var logMessage = function(message, recipient, logLevel) {
    var logLine = message + ' - recipient = ' + recipient;
    logLevel = logLevel || 'info';
    logger.log(logLevel, logLine);
};

// Send an SMS text message
/**
 * send an SMS message to registered recipients
 * @param {string} message is the message to send. will be prefixed with 'Coop Monitor Says: '
 * @return {Promise} a promise that resolves to an array of the results of sending the message
 *   to each recipient.
 */
module.exports = function(message) {
    var promises = recipients.map(function(recipient) {
        return client.sendMessage({
            to:'+1' + recipient,
            from: '+1' + twilioCredentials.from,
            body: 'Coop Monitor Says: ' + message
        })
        .then(function(result) {
            logMessage(message, recipient);
            return result;
        })
        .catch(function(err) {
            logMessage(err.message, recipient, 'error');
        });
    });
    
    return Promise.all(promises);
};


