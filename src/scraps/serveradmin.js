'use strict';
/*
* LaunchPad (Version 0.1.0)
* serveradmin.js - Logging and utilities for the server admin
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Initial Settings
const { initIsDev } = require('./../config/admin');

var isDev = 'init';

/*
* checkArgs() - checks if there are some special arguments passed
*/
function checkArgs() {
	process.argv.forEach(function (val, index, array) {
		switch (val) {
			case 'dev':
				if (initIsDev) {
					msg('Mode is set to development', 'warning');
					isDev = true;
				} else {
					msg('Mode forced to production (based on settings)');
					isDev = false;
				}
				break;
			case 'prod':
				msg('Changed mode to production', 'warning');
				isDev = false;
				break;
			default:
				msg('Unrecognized argument: ' + val, 'warning');
		}
	});
	// Require Settings if not available
	if (isDev === 'init') {
		isDev = initIsDev;
		if (isDev) {
			msg('Mode is (init) development', 'warning');
		} else {
			msg('Mode is (init) production', 'info');
		}
	}
}

/*
* modeIsDev() - produces if the mode is in development
*
* @returns true if the move is dev else otherwise
*/
function modeIsDev() {
	return isDev === 'init' ? false : isDev
}

/*
* msg(message, type) - prints a message on the console if isDev
*
* @requires msg string containing the message
* @requires type (optional) string type of message ['error','log','warning', ...]
*/
function msg(message, type='error') {
	message = (new Date()).toString() + ' - ' + message;
	if (type == 'log' || type == 'info') {
		console.log(message);
	} else if (type == 'warning' || type == 'warn') {
		console.warn(message);
	} else console.error(message);
}

// Make checks accessible
module.exports = {
	/*
	* msg(message, type) - prints a message on the console if isDev
	*
	* @requires msg string containing the message
	* @requires type (optional) string type of message ['error','log','warning', ...]
	*/
	msg: msg,
	/*
	* checks(db) - Performs multiple systems checks and tries to resolve issues
	*
	* @requires db dbmanager used to check and fix db
	* @requires databaseName to be a string indicating the name of the database to use (or create)
	* @requires callback to be the callback function
	*/
	checks: function (db, databaseName, callback) {
		// Check for arguments
		checkArgs();
		// Check the database connection
		db.connectionCheck(msg, function() {
			// Check the database
			db.check(callback, databaseName, modeIsDev());
		}, function(message, error) {
			msg(message);
			if (modeIsDev()) {
				msg(error);
			}
		});
	},
	/* Vars */
	isDev: modeIsDev
}