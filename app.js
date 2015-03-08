var Coop = require('./models/coop'),
    coopReporter = require('./lib/coopReporter'),
    smsReporter = require('./lib/smsReporter'),
    socket = require('socket.io-client')('http://coopmonitor.azurewebsites.net'),
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
    myCoop.emit('heartbeat');
}, 1000 * 10); // todo: send heartbeat every 10 minutes 

socket.on('doorChangePlease', function( cmd ) {
    console.log('got socket doorchange event');
    if (cmd.action === 'open') {
        myCoop.openDoor();
    } else {
        myCoop.closeDoor();
    }
});

myCoop.on('change', function() {
    console.log('emitting state change');
    socket.emit('coopStateChanged', { test: 0 });
});
