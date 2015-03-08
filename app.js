require('babel/register');
var Coop = require('./models/coop');

var myCoop = new Coop();

// log the coop state every second for testing
setInterval(function() {
    console.log('toString',myCoop.toString());
}, 1000);
