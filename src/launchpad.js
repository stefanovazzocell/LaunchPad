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
const app = express();

/*
* Require Settings
*/
const { port } = require('./config/general');

/*
* Require custom modules
*/
const dbmanager = require('./scraps/dbmanager'); // Database manager
const serveradmin = require('./scraps/ipresolver'); // Resolve ip
const gatekeeper = require('./scraps/gatekeeper'); // Rate limiting
const serveradmin = require('./scraps/serveradmin'); // Server Admin Tools

/*
* Routes
*/
app.get('*', function (req, res) {
	// Get requests not allowed
	res.status(405);
	res.send('GET Requests not allowed');
});

app.post('/', function (req, res) {
	res.send('ok');
});

// Update port if necessary
port = process.env.PORT || port;

// Start server
app.listen(port);