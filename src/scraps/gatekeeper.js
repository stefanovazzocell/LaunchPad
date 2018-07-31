'use strict';
/*
* LaunchPad (Version 0.1.0)
* gatekeeper.js - Rate limiting utility
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Config
const { points, resetTime, banTime, bantrigger } = require('./../config/gatekeeper');
// NOTE: Bantime and ResetTime are in minutes

// Users that are being 
var access = {};
var banned = [];
var isDev = false;
var msg = function (x, y = "") {
	// Call startup to setup
}
var getIp = function (x) {
	// Call startup to setup
	return "uninitialized";
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
		access[id] = points["start"] + value;
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
* check(id, type) - Counts visit and checks if user is allowed
*
* @requires id to be a user id string
* @requires type to be a valid string query on settings
* @return true if user is allowed, false otherwise
*/
function check(id = "unknown",type = "query") {
	// Increase the counter for user
	addToUser(id, points[type])
	// Check if user is banned or maxed
	if (isBanned(id)) {
		return false;
	} else if (isMaxed(id)) {
		// Check if it is to be banned
		if (isToBeBanned(id)) {
			if (isDev) {
				msg("User \"" + id + "\" has been banned", "log");
			} else {
				msg("User has been banned", "log");
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
	autocheck: function (req, res, type) {
		var ip = getIp(req);
		if (check(ip, type)) {
			// Continue execution
			return true;
		} else {
			res.status(403);
			if (isBanned(ip)) {
				// Banned [ignore user]
			} else {
				// Rate limited
				res.send('Rate limited, try again later');
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
			if (isDev) msg("Started resetBan interval", "log");
		}, (Math.random() * random * 1000));
		// At some random time (between 0 and 120 seconds) set access timer
		setTimeout(function () {
			// Start Reset Access Timer
			setInterval(resetAccess, resetTime * 60 * 1000);
			if (isDev) msg("Started resetAccess interval", "log");
		}, (Math.random() * random * 1000));
		msg("Startup of gatekeeper initiated", "log");
	}
}
