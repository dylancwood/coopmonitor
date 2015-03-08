var Coop = require('./models/coop'),
    coopReporter = require('./lib/coopReporter'),
    smsReporter = require('./lib/smsReporter'),
    socket = require('socket.io-client')('http://localhost:3000'),
    myCoop = new Coop();

// set up reporter
coopReporter(myCoop);
smsReporter(myCoop);

// log the coop state every second for testing
setInterval(function() {
    console.log('toString',myCoop.toString());
}, 1000);

// send heartbeat to log
setInterval(function() {
    console.log('heartbeat');
    myCoop.trigger('heartbeat');
}, 1000 * 5); // todo: send heartbeat every 10 minutes

socket.on('doorOpen', function() {
    myCoop.openDoor();
});
socket.on('doorClose', function() {
    myCoop.closeDoor();
});
