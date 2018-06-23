/*
* LaunchPad (Version 0.1.0)
* serveradmin.js - Logging and utilities for the server admin
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Settings
const { isDev } = require('./config/admin');

function message(msg, type='error') {
	if (isDev) {
		let timestamp = (new Date()).toString() + ' - ';
		if (type == 'log' || type == 'info') {
			console.log(timestamp + msg);
		} else if (type == 'warning') {
			console.warn(timestamp + msg);
		} else console.error(timestamp + msg);
	}
}

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
				message('Unrecognized argument: ' + val, 'warning');
		}
	});
}

// Check for arguments
checkArgs();