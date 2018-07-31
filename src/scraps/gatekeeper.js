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
var banned = {};
var msg = function (x, y = "") {
	// Call startup to setup
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
		// 
		access[id] = points["start"] + value;
	} else {
		access[id] += value;
	}
}

/*
* isBanned(id) - Checks if id is banned
*
* @return true if banned, false otherwise
*/
function isBanned(id) {
	banned.hasOwnProperty(id);
}

/*
* isMaxed(id) - Checks if id has reached maxed
*
* @return true if maxed, false otherwise
*/
function isMaxed(id) {
	// body...
}

/*
* isToBeBanned(id) - Checks if id is to be banned
*
* @return true if to be banned, false otherwise
*/
function isToBeBanned(id) {
	// body...
}

/*
* ban(id) - Bans given id
*/
function ban(id) {
	// body...
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
	banned = {};
}

// Making public functions available
module.exports = {
	/*
	* check(id, type) - Counts visit and checks if user is allowed
	*
	* @requires id to be a user id string
	* @requires type to be a valid string query on settings
	* @return true if user is allowed, false otherwise
	*/
	check: function (id = "unknown",type = "query") {
		// Increase the counter for user
		addToUser(id, points[type])
		// Check if user is banned or maxed
		if (isBanned(id)) {
			return false;
		} else if (isMaxed(id)) {
			// Check if it is to be banned
			if (isToBeBanned(id)) {
				msg("User has been banned", "log");
				// Ban
				ban(id);
			}
			return false;
		}
	},
	/*
	* startup(msgfn) - Starts up gatekeeper's resets
	*
	* @requires msg to be a msg utility from serveradmin.js package
	*/
	startup: function (msgfn) {
		// Save teh msg util
		msg = msgfn;
		// At some random time (between 0 and 120 seconds) set ban timer
		setTimeout(function () {
			// Start Reset Ban Timer
			setInterval(resetBan, banTime * 60);
			msg("Started resetBan interval", "log");
		}, (Math.random() * 120));
		// At some random time (between 0 and 120 seconds) set access timer
		setTimeout(function () {
			// Start Reset Access Timer
			setInterval(resetAccess, resetTime * 60);
			msg("Started resetAccess interval", "log");
		}, (Math.random() * 120));
		msg("Startup of gatekeeper initiated", "log");
	}
}
