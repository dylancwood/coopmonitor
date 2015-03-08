var events = require('events'),
    five = require('johnny-five'),
    Edison = require("edison-io"),
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
        console.log('got a press');
        self.doorOpen = 0;
        self.emit('change', ['doorOpen']);
    });
    doorSensor.on("release", function() {
        console.log('got a release');
        self.doorOpen = 1;
        self.emit('change', ['doorOpen']);
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
    var coop = new events.EventEmitter()

    // set defaults
    coop.doorOpen = 0;
    coop.temperatureC = 0;
    coop.batteryVoltage = 99;

    board.on('ready', function() {
        initTemperature(coop);
        initBattery(coop);
        //initMotor(coop);
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
    }
    coop.closeDoor = function () {
        coop.motor.to(100);
    }
    return coop;
}
