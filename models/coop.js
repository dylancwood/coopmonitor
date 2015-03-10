'use strict';

var events = require('events'),
    five = require('johnny-five'),
    Edison = require('edison-io'),
    request = require('request'),
    config = require('config'),
    weatherUrl = 'http://api.wunderground.com/api/'
        config.get('wunderground.apiKey'),
        + '/astronomy/q/97133.json',
    board = new five.Board({
        io: new Edison()
    });

function initTemperature(self) {
    // temperature sensor  on A0
    var temperature = new five.Temperature({
        controller: "GROVE",
        pin: "A0",
        freq: 10000
    });
    temperature.on("change", function(err, data) {
        var newVal = Math.round(temperature.celsius);
        if (self.temperatureC != newVal) {
            self.temperatureC = newVal;
            self.emit('change', ['temperatureC']);
        }
    });
}
function initBattery(self) {
    // battery sensor on A1
    var battery = new five.Sensor({
        pin: 'A1',
        freq: 50,
        threshold: 10
    });

    battery.scale(0,100).on('change', function() {
        self.batteryVoltage = this.value;
        self.emit('change', ['batteryVoltage']);
    });
}
function initDoor(self) {
    // door sensor on D2
    var doorSensor = new five.Button(2);
    doorSensor.on("press", function() {
        self.doorOpen = 0;
        self.emit('change', ['doorOpen']);
        self.checkLegality();
    });
    doorSensor.on("release", function() {
        self.doorOpen = 1;
        self.emit('change', ['doorOpen']);
        self.checkLegality();
    });
}
function initMotor(self) {
    // servo motor on D3
    self.motor = new five.Servo({
        pin: 3,
        startAt: 10
    });
}
module.exports = function() {
    var coop = new events.EventEmitter();

    // set defaults
    coop.doorOpen = 0;
    coop.temperatureC = 0;
    coop.batteryVoltage = 99;

    board.on('ready', function() {
        initTemperature(coop);
        initBattery(coop);
        initMotor(coop);
        initDoor(coop);
    });
    coop.toString = function () {
        return JSON.stringify({
            doorOpen: coop.doorOpen,
            temperatureC: coop.temperatureC,
            batteryVoltage: coop.batteryVoltage,
        });
    };
    coop.openDoor = function () {
        coop.motor.to(10);
        coop.doorOpen = 1;
        coop.emit('change', ['doorOpen']);
        coop.checkLegality();
    };
    coop.closeDoor = function () {
        coop.motor.to(100);
        coop.doorOpen = 0;
        coop.emit('change', ['doorOpen']);
        coop.checkLegality();
    };

    coop.checkLegality = function ( callback ) { 
        // check door state against sunrise/sunset
	if (!callback) {
            callback = function() { return; };
        }
        coop.getIsDaytime( function( isDaytime ) {
            if (coop.doorOpen && !isDaytime ) {
                coop.emit('illegal', 'Door is open at night.');
                callback(false);
            } else if (!coop.doorOpen && isDaytime ) {
                coop.emit('illegal', 'Door is closed in daytime.');
                callback(false);
            } else {
                callback (true);
            }
        });


    };
    coop.getIsDaytime = function( callback ) {
        request(weatherUrl, function(error, response, body){
            var sun = JSON.parse(body).sun_phase;
            var time = new Date();

            callback(
              ( time.getHours() > sun.sunrise.hours
                || time.getHours() == sun.sunrise.hours
                   && time.getMinutes() > sun.sunrise.minutes)
              &&
              ( time.getHours() < sun.sunset.hours
                || time.getHours() == sun.sunrise.hours
                   && time.getMinutes() < sun.sunrise.minutes  ));
        });
    };

    return coop;
}
