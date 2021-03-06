'use strict';
/*
* LaunchPad (Version 0.1.0)
* gatekeeper.js - Rate limiting utility
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Config
const { points, resetTime, banTime, bantrigger, SysStatus, bypass } = require('./../config/gatekeeper');
// NOTE: Bantime and ResetTime are in minutes

// Users that are being 
var access = {};
var banned = [];
var isDev = false;
var msg = function (x, y = '') {
	// Call startup to setup
}
var getIp = function (x) {
	// Call startup to setup
	return 'uninitialized';
}

/*
* addToUser(id, value) - Add (or remove) a given amount of points to an user
*
* @requires id to be a user id string
* @requires value to be a numeric value
*/
function addToUser(id, value = -50) {
	// Check if it's a new ID
	if (! access.hasOwnProperty(id)) {
		// Add id to list and update value
		access[id] = points['start'] + value;
	} else {
		// Update id value
		access[id] += value;
	}
}

/*
* isBanned(id) - Checks if id is banned
*
* @return true if banned, false otherwise
*/
function isBanned(id) {
	return banned.includes(id);
}

/*
* isMaxed(id) - Checks if id has reached maxed
*
* @return true if maxed, false otherwise
*/
function isMaxed(id) {
	return (access[id] < 0);
}

/*
* isToBeBanned(id) - Checks if id is to be banned
*
* @return true if to be banned, false otherwise
*/
function isToBeBanned(id) {
	return (access[id] + bantrigger < 0);
}

/*
* ban(id) - Bans given id
*/
function ban(id) {
	banned.push(id);
}

/*
* resetAccess() - Resets Access DB
*/
function resetAccess() {
	access = {};
}

/*
* resetBan() - Resets Ban DB
*/
function resetBan() {
	banned = [];
}

/*
* checkBypass(ip, query) -Checks if IP has special treatment
*
* @requires ip String to be valid ip to check
* @requires query String to be valid query type
*/
function checkBypass(ip = 'undefined', query = 'start') {
	// Check if the bypass is enabled, and query is valid
	if (bypass['enabled'] && bypass['types'].includes(query)) {
		// Search if IP match
		for (let i = 0; i < bypass['ips'].length; i++) {
			// Check if valid
			if ((new RegExp(bypass['ips'][i])).test(ip)) {
				// If found, return new value
				return bypass['ips']['newpoints'];
			}
		}
	}
	// If not enabled or not found, ignore
	return false;
}

/*
* SysCheck() - Writes a report for the admin
*/
function SysCheck() {
	// General Status Report
	var report = '\n==================\n';
	report += 'Status\n';
	var users = Object.keys(access);
	report += 'Access: ' + users.length + ' IPs\n';
	report += 'Banned: ' + banned.length + ' IPs\n';
	// Add more stats if isDev
	if (isDev) {
		// Log up to 1000 Banned Users
		report += '==================\n';
		report += 'Banned\n';
		report += '[ ';
		for (let i = ((banned.length < 1001) ? (banned.length - 1) : 999); i >= 0; i--) {
			report += banned[i] + ', ';
		}
		report += ']\n';
		// Log up to 100 users
		report += '==================\n';
		report += 'Users\n';
		report += '{ ';
		for (let i = ((users.length < 101) ? (users.length - 1) : 99); i >= 0; i--) {
			report += '"' + users[i] + '": ' + access[users[i]] + ' , ';
		}
		report += '}\n';
	}
	report += '==================\n';
	// Send report to the admin
	msg('Gatekeeper - SysCheck() - Status Report\n' + report, 'log');
}

/*
* check(id, type) - Counts visit and checks if user is allowed
*
* @requires id to be a user id string
* @requires type to be a valid string query on settings
* @requires req to be null or valid expressjs request
* @return true if user is allowed, false otherwise
*/
function check(type = 'query', req = null, id = 'unknown') {
	if (req !== null && (id === 'unknown')) {
		id = getIp(req);
	}
	// Check if user is banned or maxed
	if (isBanned(id)) {
		return false;
	}
	// Check if bypass is required
	if (checkBypass(id, type)) {
		// IF SO, custom points
		addToUser(id, checkBypass(id, type));
	} else {
		// IF NOT, Increase the counter for user
		addToUser(id, points[type]);
	}
	if (isMaxed(id)) {
		// Check if it is to be banned
		if (isToBeBanned(id)) {
			if (isDev) {
				msg('User "' + id + '" has been banned', 'log');
			} else {
				msg('User has been banned', 'log');
			}
			// Ban
			ban(id);
		}
		return false;
	} else {
		// All clear
		return true;
	}
}

// Making public functions available
module.exports = {
	// Passthrough for check
	check: check,
	/*
	* autocheck(req, res, type) - Check if user allowed, auto ban otherwise
	*
	* @requires req to be a valid express request
	* @requires res to be a valid express response
	* @requires type to be a valid string query on settings
	* @returns true if user is allowed, false otherwise
	*/
	autocheck: function (req, res, type = 'query') {
		var ip = getIp(req);
		if (check(type, req)) {
			// Continue execution
			return true;
		} else {
			res.status(403);
			if (isBanned(ip)) {
				// Banned [ignore user]
			} else {
				// Rate limited
				res.send({'msg': 'Rate limited, try again later'});
			}
			// End connection
			res.end();
			// Stop execution
			return false;
		}
	},
	/*
	* startup(msgfn, modeIsDev, getIp) - Starts up gatekeeper's resets
	*
	* @requires msgfn to be a msg utility from serveradmin.js package
	* @requires modeIsDev to be a bool indicating if is in development mode
	* @requires getIpUtil to be a getIp utility from ipresolver.js package
	*/
	startup: function (msgfn, modeIsDev, getIpUtil) {
		// Save the msg & getIpUtil utility and the mode
		msg = msgfn;
		isDev = modeIsDev;
		getIp = getIpUtil;
		// Initialize random component
		var random = 120
		if (isDev) random = 2;
		// At some random time (between 0 and 120 seconds) set ban timer
		setTimeout(function () {
			// Start Reset Ban Timer
			setInterval(resetBan, banTime * 60 * 1000);
			if (isDev) msg('Started resetBan interval', 'log');
		}, (Math.random() * random * 1000));
		// At some random time (between 0 and 120 seconds) set access timer
		setTimeout(function () {
			// Start Reset Access Timer
			setInterval(resetAccess, resetTime * 60 * 1000);
			if (isDev) msg('Started resetAccess interval', 'log');
		}, (Math.random() * random * 1000));
		// If is dev and it requires logging, do logging
		if (isDev && SysStatus > 0) {
			SysCheck();
			setInterval(SysCheck, SysStatus * 1000);
		}
		// Give warning if is in production and bypass is enabled
		if (bypass['enabled'] && !isDev) {
			msg('Bypass feature is enabled', 'warning');
		} 
		// Report completed startup
		msg('Startup of gatekeeper initiated', 'log');
	}
}
