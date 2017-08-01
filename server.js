// server.js
// set up ======================================================================
require('dotenv').config();
const coindesk = require('node-coindesk-api')
var request = require("request");
var dateFormat = require('dateformat');
var CronJob = require('cron').CronJob;

var twilio = require('twilio');
var client = new twilio (process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN); 

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var now = new Date();
// var start = '2016-08-01';
// var end = '2016-08-25';

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our local database



// Database configuration with Mongoose ========================================
// Define local MongoDB URI 
var databaseUri = "mongodb://localhost/passport";
  	if (process.env.MONGODB_URI) {
// THIS EXCUTES IF THIS IS BEING EXCUTED IN HEROKU APP 	
    	mongoose.connect(process.env.MONGODB_URI);
    }else{
// THIS EXCUTES IF THIS IS BEING EXCUTED ON LOCAL MACHINE 
    	mongoose.connect(databaseUri);
  	}
// End of Database configuration ===============================================

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use( express.static( "public" ) );
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ----------------------------------------------------------------------
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ----------------------------------------------------------------------
app.listen(port);
console.log('The magic happens on port ' + port);


// // CoinDesk API ================================================================
// var dateLabels = [];
// var rangePrice = [];

// var queryUrl = "http://api.coindesk.com/v1/bpi/historical/close.json?start="+start+"&end="+end;
// request(queryUrl, function(error, response, body) {

// var JSONObject = JSON.parse(body);
// var historicalPrice = JSONObject["bpi"];

// 	for (key in historicalPrice) {
//     	if (historicalPrice.hasOwnProperty(key)) {
//     	dateLabels.push(key);	
// 		rangePrice.push(historicalPrice[key]);
//     	}
// 	}
  
// 		//console.log(dateLabels);
// 		//console.log(rangePrice);
// });// End of function  =========================================================

// Code used for testing code 
		//console.log(key, body.bpi[key]);
		// Object.keys(body.bpi).forEach(function(key) {
 		// 		console.log(key, body.bpi[key]);
		// });


// CoinBase API ================================================================
var queryUrl = "https://api.coinbase.com/v2/prices/BTC-USD/buy";
var Coin = require('coinbase').Client;
var coin = new Coin({'apiKey': process.env.API_KEY,
                         'apiSecret': process.env.API_SECRET});

	// coin.getSpotPrice({'currencyPair': 'ETH-USD', 'date':'2010-01-01'}, function(err, price) {
	//   console.log(price);
	// });

var textMessage = "null";
var entryPrice = 2429;

// Function to check current price via CoinBase ================================
function checkCurrentPrice(){
	request(queryUrl, function(error, response, body) {
	
	// If user has empty input 
 	if(!error && response.statusCode === 200) {
 	// Display output 
    	var currentPrice = JSON.parse(body).data.amount;
    	var ans = ((currentPrice - entryPrice)/entryPrice) *100;
    	var percentChange = Math.round(ans*100)/100;
    
    	if (ans <= 0) {
      		var textMessage = dateFormat(now) + "\n" + "percent change "+ percentChange + "%"+ "\n" +
                      "Current Price $" + currentPrice + "\n" + " Buy now!";
      		console.log(percentChange);
      		console.log(textMessage);
      		sendMessage(textMessage);

    // if ans is greater than 20 then "Sell now!"   		
    	}else if (ans >= 20){
      		var textMessage = dateFormat(now) + "\n"+ "percent change " + percentChange +"%"+ "\n" +
                      "Current Price $" + currentPrice + "\n" + " Sell now!";
      		console.log(percentChange);
      		console.log(textMessage);
      		sendMessage(textMessage);
    	}else{ 
    		return;  // No action taken
    		}
		}
	});
};// End of function  =============================================================

// Function to send text message via Twilio =======================================
function sendMessage(textMessage){
console.log(process.env.TWILIO_PHONE)
client.messages.create({
    body: textMessage, 
    to: process.env.MY_PHONE,  // Text this number
    from: process.env.TWILIO_PHONE // From a valid Twilio number
})
.then((message) => console.log(message.sid))
}// End of function  ==============================================================


// Cron Scheduling Job ============================================================
new CronJob('30 * * * * *', function() {
  checkCurrentPrice();
  //console.log('You will see this message every hour');
}, null, true, 'America/Los_Angeles');
// End of function  ===============================================================

