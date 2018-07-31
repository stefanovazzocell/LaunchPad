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
	"host": "localhost", // TODO: Change this
	"user": "root",		 // TODO: Change this
	"password": "root"	 // TODO: Change this
});

// Prepare variables
var msg = function (x, y = "") {
	// Call startup to setup
}

/*
* query() - Query DB
* 
* @return boolean - true if connection successful, false otherwise
*/
function query() {
	// body...
}

// Make modules accessible
module.exports = {
	/*
	* dbConnectionCheck(msgfn) - Performs a database connection check
	* 
	* @requires msgfn to be a msg utility from serveradmin.js package
	* @return boolean - true if connection successful, false otherwise
	*/
	connectionCheck: function (msgfn) {
		// Save the msg & getIpUtil utility and the mode
		msg = msgfn;
		// Perform database connection check
		dbConnection.connect(function(err) {
			if (err) {
				msg(err);
			}
			msg("Connected to the database successfully", "log");
		});
	},
	/*
	* dbCheck() - Performs a database check
	* 
	* @return boolean - true if the database seems valid, false if issues
	*/
	check: function () {
		// Perform database check
		return true; // TODO
	},
	/*
	* rebuild() - Clears the database and rebuilds it
	*
	* @returns true if successful, false otherwise
	*/
	rebuild: function () {
		// Attempt db rebuilding
		return true;// TODO
	}
}