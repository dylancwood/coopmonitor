'use strict';

var events = require('events'),
    config = require('config'),
    five = require('johnny-five'),
    Edison = require('edison-io'),
    daytime = new (require('./daytime'))(),
    board = new five.Board({
        io: new Edison()
    });

function initTemperature(self) {
    // temperature sensor  on A0
    var temperature = new five.Temperature({
        controller: "GROVE",
        pin: config.get('boardPins.temperature'),
        freq: 10000
    });
    temperature.on("change", function (err, data) {
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
        pin: config.get('boardPins.battery'),
        freq: 50,
        threshold: 10
    });

    battery.scale(0,100).on('change', function () {
        self.batteryVoltage = this.value;
        self.emit('change', ['batteryVoltage']);
    });
}
function initDoor(self) {
    // door sensor on D2
    var doorSensor = new five.Button(config.get('boardPins.door'));
    doorSensor.on("press", function () {
        self.doorOpen = 0;
        self.emit('change', ['doorOpen']);
        self.checkLegality();
    });
    doorSensor.on("release", function () {
        self.doorOpen = 1;
        self.emit('change', ['doorOpen']);
        self.checkLegality();
    });
}
function initMotor(self) {
    // servo motor on D3
    self.motor = new five.Servo({
        pin: config.get('boardPins.motor'),
        startAt: 10
    });
}
module.exports = function () {
    var coop = new events.EventEmitter();

    // set defaults
    coop.doorOpen = 0;
    coop.temperatureC = 0;
    coop.batteryVoltage = 99;

    board.on('ready', function () {
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

    /**
     * Checks the legality of the coop state. Currently, this
     * only involves checking whether the door is open at night
     * or closed during the day. As a side-effect, this method
     * will also cause the coop to emit an 'illegal' if it is
     * found to be in an illegal state, with details about the
     * offense.
     * @return {Promise} a promise that resolves to true if
     * the coop is in a legal state and false otherwise.
     */
    coop.checkLegality = function () { 
        // check door state against sunrise/sunset
        return daytime.getIsDaytime()
            .then( function (isDaytime) {
                if (coop.doorOpen && !isDaytime ) {
                    coop.emit('illegal', 'Door is open at night.');
                    return false;
                } else if (!coop.doorOpen && isDaytime ) {
                    coop.emit('illegal', 'Door is closed in daytime.');
                    return false;
                } else {
                    return true;
                }
            });

    };
    return coop;
}
