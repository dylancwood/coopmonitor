'use strict';

var Promise = require('promise'),
    request = require('request'),
    config = require('config'),
    weatherUrl = 'http://api.wunderground.com/api/' +
        config.get('wunderground.apiKey') +
        '/astronomy/q/' +
        config.get('wunderground.zipCode') + '.json';

/**
 * A class to get details about the local daylight based on
 * the wunderground API's astronomy object. Caches the value 
 * for the rest of the day once queried.
 */
var Daytime = function () {
    // set a default sunrise/set
    var sunPhase = {
        sunrise: {
            hours: '7',
            minutes: '0'
        },
        sunset: {
            hours: '19',
            minutes: '0'
        }
    };
    var lastCheck = '20150101'; // default to the past

    // create date string for easy comparison
    var getDateStr = function (date) {
        var m = date.getMonth() + 1; // fix 0-offset 
        var d = date.getDate();

        return  '' + 
            date.getFullYear() +
            (m<10 ? '0' : '') + m +
            (d<10 ? '0' : '') + d;
    }
    // create time string for easy comparison
    var getTimeStr = function (date) {
        var h = date.getHours();
        var M = date.getMinutes();

        return  '' + 
            (h<10 ? '0' : '') + h +
            (M<10 ? '0' : '') + M;
    }

    // construct and return public members:
    var daytime = {};
    /**
     * Get the sun phase, with cached values if possible.
     * @return {Promise} a promise resolving with an object
     * containing today's sun phase.
     */
    daytime.getSunPhase = function() {
        return new Promise( function (resolve, reject) {

            var today = getDateStr(new Date());

            // if the sun phase was queried before today, refresh the cache
            if (today > lastCheck) {
                request(weatherUrl, function (error, response, body) {
                    if (!error) {
                        lastCheck = today;
                        sunPhase = JSON.parse(body).sun_phase;
                    }
                    resolve(sunPhase);
                });
            } else {
                resolve(sunPhase);
            }
        });
    };
    /**
     * Determine if it is currently daytime.
     * @return {Promise} a promise that resolves with a value of 
     * true if the current time is between sunrise and sunset; 
     * false otherwise.
     */
    daytime.getIsDaytime = function () {
        return new Promise( function (resolve, reject) {
            daytime.getSunPhase()
            .then( function (sun) {
                // get HHMM string for comparing current time
                var currentTime = getTimeStr(new Date());

                var time = new Date();

                // get HHMM stirng for cmparing sunrise
                time.setHours(sun.sunset.hours, sun.sunset.minutes);
                var sunset = getTimeStr(time);


                // get HHMM stirng for cmparing sunset
                time.setHours(sun.sunrise.hours, sun.sunrise.minutes);
                var sunrise = getTimeStr(time);

                resolve( currentTime > sunrise && currentTime < sunset );
            });
        });
    }
    return daytime;
};

