'use strict';
/*
* LaunchPad (Version 0.1.0)
* gatekeeper.js - Rate limiting utility
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Config
const { points, resetTime, banTime } = require('./../config/gatekeeper');
// NOTE: Bantime and ResetTime are in minutes

// Users that are being 
var access = {};
var banned = {};

/*
* addToUser(id, points) - Add (or remove) a given amount of points to an user
*
* @requires id to be a user id string
* @requires points to be a numeric value
*/
function addToUser(id, points = -50) {
	// body...
}

/*
* isBanned(id) - Checks if id is banned
*
* @return true if banned, false otherwise
*/
function isBanned(id) {
	// body...
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
				// Ban
				ban(id);
			}
			return false;
		}
	}
}
