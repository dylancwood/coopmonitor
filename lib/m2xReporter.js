'use_strict';

var request = require('request');
var config = require('config');

module.exports = function(url, dataValue, callback) {
    var options = {
        method: 'PUT',
        uri: url,
        headers: {
            'content-type': 'application/json',
            'X-M2X-KEY': config.get('m2x.apiKey')
        },
        body: JSON.stringify({ value: dataValue })
    }
    var preCallback = function(err, response, body) {
        if (err) {
            return callback(err);
        }
        if (response.statusCode === 202) {
            return callback(null, response);
        } else {
            var error = new Error('Expected 202 status code, but got ' + response.statusCode);
            return callback(error);
        }
    };

    // validate callback
    if (typeof callback !== 'function') {
        throw new Error ('Expected callback to be a function, but got ' + typeof callback);
    }
    request(options, preCallback); 
};
