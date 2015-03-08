let five = require('johnny-five'),
    Edison = require("edison-io"),
    board = new five.Board({
        io: new Edison()
    });

let doorOpen = Symbol('doorOpen');
let temperatureC = Symbol('temperatureC');
let batteryVoltage = Symbol('batteryVoltage');
let motor = Symbol('motor');

function initTemperature(self) {
    // temperature sensor  on A0
    let temperature = new five.Temperature({
        controller: "GROVE",
        pin: "A0"
    });
    temperature.on("change", function(err, data) {
        self[temperatureC] = Math.round(temperature.celcius);
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
        self[batteryVoltage] = this.value;
    });
}
function initDoor(self) {
    // door sensor on D2
    let doorSensor = new five.Button(2);
    doorSensor.on("press", function() {
        self[doorOpen] = false;
    });
    doorSensor.on("release", function() {
        self[doorOpen] = true;
    });
}
function initMotor(self) {
    // servo motor on D3
    self[motor] = new five.Servo(3);
}
class Coop {
    constructor() {
        // set defaults
        this[doorOpen] = false;
        this[temperatureC] = 0;
        this[batteryVoltage] = 99;

        board.on('ready', () => {
          initTemperature(this);
          initBattery(this);
          initDoor(this);

        });
    }
    toString() {
        var self = this;
        return JSON.stringify({
            doorOpen: self[doorOpen],
            temperatureC: self[temperatureC],
            batteryVoltage: self[batteryVoltage],
        });
    }
    get doorOpen() { return this[doorOpen]; }
    get temperatureC() { return this[temperatureC]; }
    get batteryVoltage() { return this[batteryVoltage]; }
}

module.exports = Coop;
