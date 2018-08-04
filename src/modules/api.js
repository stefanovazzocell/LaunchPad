'use strict';
/*
* LaunchPad (Version 0.1.0)
* api.js - Utility to handle the API requests
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Prepare variables
var query;
var msg;
var gkCheck;
var getLocation;

/*
* Helpers
*/

/*
* requestError(req, res, msg, apiError, errorStatus) - Sends a 400 error
*
* @requires req is a express request
* @requires res is a express response
* @requires msg string to return the user
* @requires apiError bool true if is an api error, false if not
* @requires errorStatus to be a number indicating what status to return to the user
*/
function requestError(req, res, msg='Something is wrong with your request, try refreshing the page', apiError=true, errorStatus=400) {
	// Request does not match API standards
	if (apiError) gkCheck('api_error', req);
	res.status(errorStatus);
	res.send({'msg': msg});
}

/*
* intBetween(number, max, min) - Checks if the number is an int between the given values included
*
* @requires number is number to check
* @requires max is max value
* @requires max is min value
* @return bool true if conditions match, false otherwise
*/
function intBetween(number, max, min = 1) {
	return number !== undefined && parseInt(number) && parseInt(number) >= min && parseInt(number) <= max;
}

/*
* stringBetween(text, max, min) - Checks if the text is has a length between the given values included
*
* @requires text is string to check
* @requires max is max value
* @requires max is min value
* @return bool true if conditions match, false otherwise
*/
function stringBetween(text, max, min = 50) {
	return text !== undefined && (String(text)).length >= min && (String(text)).length <= max;
}

/*
* assertTrue(checks, req, res) - Check if a check function produces true
*
* @requires checks is function to check
* @requires req is a express request
* @requires res is a express response
* @return bool true if all true, false otherwise
*/
function assertTrue(checks, req, res) {
	try {
		if (checks()) {
			return true;
		} else {
			requestError(req, res);
			return false;
		}
	} catch(err) {
		requestError(req, res);
		return false;
	}
}

/*
* Calls
*/

/*
* api_get(req, res) - Handle calls to 'get'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_get(req, res) {
	if (assertTrue(function() { return stringBetween(req.body.l, 88, 88); }, req, res)) {
		// Check if tracking requested
		var trackUser = (req.body.track !== undefined && req.body.track === true);
		var dbQueryRequested = '`data`, `parameters`';
		if (trackUser) dbQueryRequested += ', `server`';
		// Query the database
		query('UPDATE `links` SET `clicks`=`clicks`-1 WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();\n' +
			  'SELECT ' + dbQueryRequested + ' FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
			[String(req.body.l), String(req.body.l)],
			function (results) {
				if (results[1].length < 1) {
					// Not Found
					// Update the user credits
					gkCheck('get_invalid', req);
					// Let the user know
					res.send({
						'f': false
					});
				} else {
					// Found
					// Update the user credits
					gkCheck('get_valid', req);
					// Check if tracking required
					if (trackUser && stringBetween(results[1][0]['server'],5120, 5) && JSON.parse(results[1][0]['server'])['t'] !== undefined) {
						// Track
						var serverResponse = JSON.parse(results[1][0]['server']);
						// Get country
						var userCountry = getLocation(req);
						// Search country
						var currentValue = serverResponse['t'][userCountry];
						if (intBetween(currentValue, 1000, 1)) {
							// If exists, add to it
							currentValue++;
						} else currentValue = 1; // Otherwise start from 1
						// Insert the value back
						serverResponse['t'][userCountry] = currentValue;
						// Query the DB
						query('UPDATE `links` SET `server`=? WHERE `link`=?',
							[JSON.stringify(serverResponse), String(req.body.l)],
							function(updateResults) {
								res.send({
									'f': true,
									'd': results[1][0]['data'],
									'p': results[1][0]['parameters']
									});
								},
							function(updateError, updateErr) {
								res.send({
									'f': true,
									'd': results[1][0]['data'],
									'p': results[1][0]['parameters']
								});
							});
					} else {
						// No tracking
						// Send response to user
						res.send({
							'f': true,
							'd': results[1][0]['data'],
							'p': results[1][0]['parameters']
						});
					}
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, 'Woops! Something went wrong, try again later\n' + errorMsg + '\n' + error, false, 500);
			});
	}
}

/*
* api_set(req, res) - Handle calls to 'set'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_set(req, res) {
	var maxDataSize = 2048;
	// Check if big data
	var bigDataSize = (req.body.bd !== undefined && req.body.bd === true);
	var bdchecks = true;
	// If is bigdata
	if (bigDataSize) {
		// Ban user (but still perform task)
		gkCheck('set_bigDataSize', req);
		// Set limits on clicks and expiration
		req.body.c = 1;
		req.body.e = 1;
		// Increase max size
		maxDataSize = 55000;
	}
	if (assertTrue(function() { return (stringBetween(req.body.l, 88, 88) &&
										intBetween(req.body.c, 1000) &&
										intBetween(req.body.e, 8760) &&
										stringBetween(req.body.d, maxDataSize) &&
										stringBetween(req.body.p, 512)); }, req, res)) {
		// Prepare server options
		var options = '';
		// Check if user requires special options (Limitation: bigDataSize must be disabled)
		if (bigDataSize === false && req.body.o !== undefined && typeof req.body.o === 'object') {
			var settings = {};
			// Check if del allowed
			if (stringBetween(req.body.o.d, 88, 88) || stringBetween(req.body.o.d, 0, 0)) {
				settings['d'] = String(req.body.o.d);
			}
			// Check if stats allowed
			if ((stringBetween(req.body.o.s, 88, 88) || stringBetween(req.body.o.s, 0, 0)) &&
				stringBetween(req.body.o.e, 88, 88) === false &&
				intBetween(req.body.c, 1000, 10)) {
				settings['s'] = String(req.body.o.s);
				settings['t'] = {};
				intBetween(req.body.c, 1000);
			} else if (stringBetween(req.body.o.e, 88, 88)) { // Check if edit allowed
				settings['e'] = String(req.body.o.e);
			}
			// If some options have been used, save it
			if (Object.keys(settings).length > 0) options = JSON.stringify(settings);
		}
		query('DELETE FROM `links` WHERE `clicks` < 2 OR `expiration` <= NOW();\n' + 
			  'INSERT INTO `links`(`link`, `data`, `parameters`, `clicks`, `expiration`, `server`) VALUES (?,?,?,?,DATE_ADD(NOW(), INTERVAL ? HOUR),?);',
			[String(req.body.l), String(req.body.d), String(req.body.p), parseInt(req.body.c) + 1, parseInt(req.body.e), options],
			function(results) {
				// Success
				// Update the user credits
				gkCheck('set_valid', req);
				// Let the user know
				res.send({
					'a': true
				});
			}, function(errorMsg, error) {
				// Link not available
				// Update the user credits
				gkCheck('set_invalid', req);
				// Let the user know
				res.send({
					'a': false
				});
			});
	}
}

/*
* api_del(req, res) - Handle calls to 'del'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_del(req, res) {
	if (assertTrue(function() { return (stringBetween(req.body.l, 88, 88) &&
										(stringBetween(req.body.p, 88, 88) ||
										stringBetween(req.body.p, 0, 0))); }, req, res)) {
		query('DELETE FROM `links` WHERE `clicks` < 2 OR `expiration` <= NOW();\n' + 
			  'SELECT `server` FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
			[String(req.body.l)],
			function(results) {
				// Success
				// Check if something was found
				if (results[1].length < 1) {
					// Not Found
					// Update the user credits
					gkCheck('del_invalid', req);
					// Let the user know
					res.send({
						'f': false,
						'msg': 'Link not found'
					});
				} else if (stringBetween(results[1][0]['server'],5120, 5) && JSON.parse(results[1][0]['server'])['d'] === String(req.body.p)) {
					// Update the user credits
					gkCheck('del_valid', req);
					// Trigger deletion
					query('DELETE FROM `links` WHERE `link`=?;',
						[String(req.body.l)], function() {
						// Successful
						// Send response to user
						res.send({
							'f': true,
							'p': true,
							'msg': 'Deleted Successfully'
						});
					}, function() {
						// Unsuccessful
						// Let the user know
						res.send({
							'f': true,
							'p': true,
							'msg': 'Deleted Unsuccessfully'
						});
					})
				} else {
					// Found but invalid
					// Update the user credits
					gkCheck('del_invalid', req);
					// Let the user know
					res.send({
						'f': true,
						'p': false,
						'msg': 'Wrong password'
					});
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, 'Woops! Something went wrong, try again later\n' + errorMsg + '\n' + error, false, 500);
			});
	}
}

/*
* api_edit(req, res) - Handle calls to 'edit'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_edit(req, res) {
	if (assertTrue(function() { return (stringBetween(req.body.l, 88, 88) &&
										stringBetween(req.body.p, 88, 88) &&
										(intBetween(req.body.e.c, 1000) ||
										 (stringBetween(req.body.e.d, 2048) &&
										  stringBetween(req.body.e.p, 512)))); }, req, res)) {
		query('DELETE FROM `links` WHERE `clicks` < 2 OR `expiration` <= NOW();\n' + 
			  'SELECT `server` FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
			[String(req.body.l)],
			function(results) {
				// Success
				// Check if something was found
				if (results[1].length < 1) {
					// Not Found
					// Update the user credits
					gkCheck('edit_invalid', req);
					// Let the user know
					res.send({
						'f': false,
						'msg': 'Link not found'
					});
				} else if (stringBetween(results[1][0]['server'],5120, 70) && JSON.parse(results[1][0]['server'])['e'] === String(req.body.p)) {
					// Update the user credits
					gkCheck('edit_valid', req);
					// Identify what type of edit it is
					var isDataEdit = (stringBetween(req.body.e.d, 2048) && stringBetween(req.body.e.p, 512));
					var isClicksEdit = intBetween(req.body.e.c, 1000);
					var queryString = 'UPDATE `links` SET `clicks`=? WHERE `link`=?';
					var queryData = [parseInt(req.body.e.c) + 1, String(req.body.l)];
					if (isDataEdit && isClicksEdit) {
						queryString = 'UPDATE `links` SET `data`=?,`parameters`=?,`clicks`=? WHERE `link`=?';
						queryData = [String(req.body.e.d), String(req.body.e.p), parseInt(req.body.e.c) + 1, String(req.body.l)];
					} else if (isDataEdit) {
						queryString = 'UPDATE `links` SET `data`=?,`parameters`=? WHERE `link`=?';
						queryData = [String(req.body.e.d), String(req.body.e.p), String(req.body.l)];
					}
					// Trigger deletion
					query(queryString,
						queryData, function() {
						// Successful
						// Send response to user
						res.send({
							'f': true,
							'p': true,
							'msg': 'Edited Successfully'
						});
					}, function() {
						// Unsuccessful
						// Let the user know
						res.send({
							'f': true,
							'p': true,
							'msg': 'Edited Unsuccessfully'
						});
					})
				} else {
					// Found but invalid
					// Update the user credits
					gkCheck('edit_invalid', req);
					// Let the user know
					res.send({
						'f': true,
						'p': false,
						'msg': 'Wrong password'
					});
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, 'Woops! Something went wrong, try again later\n' + errorMsg + '\n' + error, false, 500);
			});
	}
}

/*
* api_stats(req, res) - Handle calls to 'stats'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_stats(req, res) {
	if (assertTrue(function() { return (stringBetween(req.body.l, 88, 88) &&
										(stringBetween(req.body.p, 88, 88) ||
										stringBetween(req.body.p, 0, 0))); }, req, res)) {
		query('DELETE FROM `links` WHERE `clicks` < 2 OR `expiration` <= NOW();\n' + 
			  'SELECT `server` FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
			[String(req.body.l)],
			function(results) {
				// Success
				// Check if something was found
				if (results[1].length < 1) {
					// Not Found
					// Update the user credits
					gkCheck('stats_invalid', req);
					// Let the user know
					res.send({
						'f': false,
						'msg': 'Link not found'
					});
				} else if (stringBetween(results[1][0]['server'],5120, 5) && JSON.parse(results[1][0]['server'])['s'] === String(req.body.p)) {
					// Update the user credits
					gkCheck('stats_valid', req);
					// Return the stats to the user
					res.send({
						'f': true,
						'p': true,
						's': JSON.parse(results[1][0]['server'])['t']
					});
				} else {
					// Found but invalid
					// Update the user credits
					gkCheck('stats_invalid', req);
					// Let the user know
					res.send({
						'f': true,
						'p': false,
						'msg': 'Wrong password'
					});
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, 'Woops! Something went wrong, try again later\n' + errorMsg + '\n' + error, false, 500);
			});
	}
}

/*
* api_opt(req, res) - Handle calls to 'opt'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_opt(req, res) {
	if (assertTrue(function() { return stringBetween(req.body.l, 88, 88); }, req, res)) {
		query('DELETE FROM `links` WHERE `clicks` < 2 OR `expiration` <= NOW();\n' + 
			  'SELECT `server` FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
			[String(req.body.l)],
			function(results) {
				// Success
				// Check if something was found
				if (results[1].length < 1) {
					// Not Found
					// Update the user credits
					gkCheck('opt_invalid', req);
					// Let the user know
					res.send({
						'f': false,
						'msg': 'Link not found'
					});
				} else if (stringBetween(results[1][0]['server'],5120, 5)) {
					// Update the user credits
					gkCheck('opt_valid', req);
					// Prepare to add options
					var serverOptions = JSON.parse(results[1][0]['server']);
					var userOptions = [];
					// Check every option
					if (serverOptions.hasOwnProperty('e')) userOptions.push('e'); // Edit
					if (serverOptions.hasOwnProperty('d')) userOptions.push('d'); // Delete
					if (serverOptions.hasOwnProperty('s')) userOptions.push('s'); // Stats
					// if (serverOptions.hasOwnProperty('e') && String(serverOptions['e']).length === 0) userOptions.push('_e'); // Public Edit
					if (serverOptions.hasOwnProperty('d') && String(serverOptions['e']).length === 0) userOptions.push('_d'); // Public Delete
					if (serverOptions.hasOwnProperty('s') && String(serverOptions['e']).length === 0) userOptions.push('_s'); // Public Stats
					// Return the stats to the user
					res.send({
						'f': true,
						'p': true,
						'o': userOptions
					});
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, 'Woops! Something went wrong, try again later\n' + errorMsg + '\n' + error, false, 500);
			});
	}
}

// Make public function accessible
module.exports = {
	/*
	* setup(queryFn, msgFn, gkCheckFn, getLocationFn) - Setup local variables
	*
	* @requires queryFn to be a database query function
	* @requires msgFn to be a msg function
	* @requires gkCheckFn to be gatekeeper's function
	* @requires getLocationFn to be a function that takes a request and returns an |ISO 3166-1 Alpha 2| location or '??'
	*/
	setup: function(queryFn, msgFn, gkCheckFn, getLocationFn) {
		query = queryFn;
		msg = msgFn;
		gkCheck = gkCheckFn;
		getLocation = getLocationFn;
	},
	/*
	* api(req, res) - Handle API Calls
	*
	* @requires req from expressjs' request
	* @requires res from expressjs' request
	*/
	api: function(req, res) {
		try {
			switch(String(req.body.t)) {
				case 'get': // Get a link
					api_get(req, res);
					break;
				case 'set': // Creating a new link
					api_set(req, res);
					break;
				case 'del': // Delete a link
					api_del(req, res);
					break;
				case 'edit': // Edit a link
					api_edit(req, res);
					break;
				case 'stats': // Get stats for a link
					api_stats(req, res);
					break;
				case 'opt': // Get options for a link
					api_opt(req, res);
					break;
				default:
					res.send('ok');
			}
		} catch(err) {
			// Request does not match API standards
			requestError(req, res);
		}
	}

}