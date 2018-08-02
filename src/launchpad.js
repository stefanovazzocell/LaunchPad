'use strict';
/*
* LaunchPad (Version 0.1.0)
* launchpad.js - main server fuction
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

/*
* Require Node dependencies
*/

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

/*
* Require custom modules
*/

const dbmanager = require('./scraps/dbmanager'); // Database manager
const ipresolver = require('./scraps/ipresolver'); // Resolve ip
const gatekeeper = require('./scraps/gatekeeper'); // Rate limiting
const server = require('./scraps/serveradmin'); // Server Admin Tools

/*
* Require Settings
*/

var { port, version } = require('./config/general');

/*
* Perform initial checks
*/

// Update port if necessary
port = process.env.PORT || port || 8080;
// Startup gatekeeper
gatekeeper.startup(server.msg, server.isDev, ipresolver.getIp);

/*
* Linking dependencies
*/
app.use(bodyParser.json());

/*
* Adding headers
*/
app.use(function (req, res, next) {
	// If the server is in development
	if (server.isDev) {
		// Allow any origin
		res.setHeader('Access-Control-Allow-Origin', '*');
		// Allow GET and POST
		res.setHeader('Access-Control-Allow-Methods', 'POST');
		// Disable cookies
		res.setHeader('Access-Control-Allow-Credentials', false);
		// Allow given Headers
		res.header('Access-Control-Allow-Headers', '*');
	}
	// Pass to next layer of middleware
	next();
});

/*
* Local helpers
*/
/*
* requestError(res, msg) - Sends a 400 error
*
* @requests res is a express response
* @requests msg string to return the user
*/
function requestError(res, msg='Something is wrong with your request, try refreshing the page') {
	res.status(400);
	res.send({'msg': msg});
}

/*
* Routes
*/

// GET not allowed
app.get('*', function (req, res) {
	if (gatekeeper.autocheck(req, res)) {
		// Get requests not allowed
		res.status(405);
		res.send('GET Requests not allowed');
	}
});

// HelloWorld
app.post('/', function (req, res) {
	if (gatekeeper.autocheck(req, res)) {
		res.send('ok');
	}
});

// Is secure?
app.post('/secure/', function (req, res) {
	if (gatekeeper.autocheck(req, res)) {
		if (server.isDev) {
			// Server is in development mode
			res.send('no');
		} else {
			// Server is in production
			res.send('yes');
		}
	}
});

// API request
app.post('/api/*', function (req, res) {
	if (gatekeeper.autocheck(req, res)) {
		// Check api version
		if (req.params[0] === version + '/' || req.params[0] === version) {
			// Valid version
			try {
				switch(req.body.type) {
					case 'get': // Get a link
						res.send('getting');
						break;
					case 'set': // Creating a new link
						res.send('setting');
						break;
					case 'edit': // Edit a link
						requestError(res, 'Not action implemented yet');
						break;
					case 'stats': // Get stats for a link
						requestError(res, 'Not action implemented yet');
						break;
					default:
						res.send('ok');
				}
			} catch(err) {
				console.log(err)
				// Invalid version message
				res.status(500);
				res.send({'msg': 'Corrupted request'});
			}
		} else {
			// Invalid version message
			res.status(501);
			res.send({'msg': 'Version not supported'});
		}	
	}
});

// Not implemented
app.post('*', function (req, res) {
	if (gatekeeper.autocheck(req, res)) {
		// Invalid method message
		res.status(404);
		res.send({'msg': 'Not Implemented'});
	}
});

/*
* Run final checks and start server
*/

// Perform checks
server.checks(dbmanager, function() {
	// Start server
	app.listen(port);
	// Log start
	server.msg('Server started on port ' + port);
});