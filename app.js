var Coop = require('./models/coop');

var coopReporter = require('./lib/coopReporter');
var smsReporter = require('./lib/smsReporter');

// build coop
var myCoop = new Coop();

// set up reporter
coopReporter(myCoop);
//smsReporter(myCoop);

// log the coop state every second for testing
setInterval(function() {
    console.log('toString',myCoop.toString());
}, 1000);
