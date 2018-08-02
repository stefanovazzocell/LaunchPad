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
const api = require('./scraps/api');

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
			api.api(req, res);
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
	// Startup API
	api.setup(dbmanager.query, server.msg);
	// Start server
	app.listen(port);
	// Log start
	server.msg('Server started on port ' + port);
});