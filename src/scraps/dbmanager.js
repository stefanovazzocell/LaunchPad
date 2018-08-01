'use strict';
/*
* LaunchPad (Version 0.1.0)
* dbmanager.js - Utility to manage the requests to the db
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Dependencies
var mysql = require('mysql');

// Load credentials
var dbConnection = mysql.createConnection({
	host: 'localhost', // TODO: Change this
	user: 'root',		 // TODO: Change this
	password: 'root',	 // TODO: Change this
	database : ''
});

// Prepare variables
var msg = function (x, y = '') {
	// Call startup to setup
}

/*
* query(query, data, onSuccess, onError) - Query DB
* 
* @requires query is a query string
* @requires data is a query options
* @requires onSuccess is a callback function
* @requires onError is a callback function
*/
function query(query, data, onSuccess, onError) {
	// body...
}

/*
* rebuild() - Clears the database and rebuilds it
*
* @requires callback to be the callback function
*/
function rebuild(callback) {
	// Attempt db rebuilding
	if (true) {
		callback(); // TODO
	} else {
		this.msg('DB Rebuild Failed');
		process.exit(202);
	}
}

// Make modules accessible
module.exports = {
	/*
	* dbConnectionCheck(msgfn) - Performs a database connection check
	* 
	* @requires msgfn to be a msg utility from serveradmin.js package
	* @requires callback to be the callback function
	*/
	connectionCheck: function (msgfn, callback) {
		// Save the msg & getIpUtil utility and the mode
		msg = msgfn;
		// Perform database connection check
		dbConnection.connect(function(err) {
			if (err) {
				msg('DB Connection Error, error:');
				msg(err);
				process.exit(201);
			} else {
				msg('Connected to the database successfully', 'log');
				callback();
			}
		});
	},
	/*
	* dbCheck() - Performs a database check
	* 
	* @requires callback to be the callback function
	* @requires databaseName to be a string indicating the name of the database to use (or create)
	* @requires rebuildIfNA bool true if db should be rebuild if not available
	*/
	check: function (callback, databaseName = 'launchpad', rebuildIfNA = false) {
		// Perform database check
		if (true) {
			callback(); // TODO
		} else {
			if (rebuildIfNA) {
				rebuild(callback);
			} else {
				msg('DB Rebuild Failed: not allowed (in prod mode)');
				process.exit(202);
			}
		}
	}
}