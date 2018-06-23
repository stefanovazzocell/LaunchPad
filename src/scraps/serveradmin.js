/*
* LaunchPad (Version 0.1.0)
* serveradmin.js - Logging and utilities for the server admin
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Settings
const { isDev } = require('./../config/admin');

/*
* checkArgs() - checks if there are some special arguments passed
*/
function checkArgs() {
	process.argv.forEach(function (val, index, array) {
		switch (val) {
			case 'dev':
				isDev = true;
				break;
			case 'prod':
				isDev = false;
				break;
			default:
				msg('Unrecognized argument: ' + val, 'warning');
		}
	});
}

// Make checks accessible
module.exports = {
	/*
	* msg(message, type) - prints a message on the console if isDev
	*
	* @requires msg string containing the message
	* @requires type (optional) string type of message ['error','log','warning', ...]
	*/
	msg: function (message, type='error') {
		if (isDev) {
			message = (new Date()).toString() + ' - ' + message;
			if (type == 'log' || type == 'info') {
				console.log(message);
			} else if (type == 'warning' || type == 'warn') {
				console.warn(message);
			} else console.error(message);
		}
	},
	/*
	* checks(db) - Performs multiple systems checks and tries to resolve issues
	*
	* @requires db dbmanager used to check and fix db
	*/
	checks: function (db) {
		// Check for arguments
		this.checkArgs();
		// Check the database connection
		if (! db.connectionCheck(db)) {
			msg('DB Connection Error');
			process.exit(201);
		}
		// Check the database
		if (db.check(db)) {
			// Try to reconstruct the database
			if (db.rebuild()) {
				this.msg('DB Rebuild Successful', 'log');
			} else {
				this.msg('DB Rebuild Failed');
				process.exit(202);
			}
		}
	}
}