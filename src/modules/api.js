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
	if (assertTrue(function() { return stringBetween(req.body.l, 64, 64); }, req, res)) {
		// Query the database
		query('UPDATE `links` SET `clicks`=`clicks`-1 WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();\n' +
			  'SELECT `data`, `parameters` FROM `links` WHERE `link`=? AND `clicks` > 0 AND `expiration` > NOW();',
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
					// Send response to user
					res.send({
						'f': true,
						'd': results[1][0]['data'],
						'p': results[1][0]['parameters']
					});
				}
			}, function (errorMsg, error) {
				// Error
				requestError(req, res, "Woops! Something went wrong, try again later\n" + errorMsg + "\n" + error, false, 500);
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
	if (assertTrue(function() { return (stringBetween(req.body.l, 64, 64) &&
										intBetween(req.body.c, 1000) &&
										intBetween(req.body.e, 8760) &&
										stringBetween(req.body.d, 2048) &&
										stringBetween(req.body.p, 512)); }, req, res)) {
		// Prepare server options
		var options = '';
		// Check if user requires anything
		if (req.body.o !== undefined && typeof req.body.o === 'object') {
			var settings = {};
			// Check if del allowed
			if (stringBetween(req.body.o.d, 64, 64) || stringBetween(req.body.o.d, 0, 0)) {
				settings['d'] = String(req.body.o.d);
			}
			// If some options have been used, save it
			if (Object.keys(settings).length > 0) options = JSON.stringify(settings);
		}
		query('DELETE FROM `links` WHERE `clicks` < 1 OR `expiration` <= NOW();\n' + 
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
	if (assertTrue(function() { return (stringBetween(req.body.l, 64, 64) &&
										(stringBetween(req.body.p, 64, 64) ||
										stringBetween(req.body.p, 0, 0))); }, req, res)) {
		query('DELETE FROM `links` WHERE `clicks` < 1 OR `expiration` <= NOW();\n' + 
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
				} else if (stringBetween(results[1][0]['server'],5120, 5) && JSON.parse(results[1][0]['server'])["d"] === String(req.body.p)) {
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
				requestError(req, res, "Woops! Something went wrong, try again later\n" + errorMsg + "\n" + error, false, 500);
			});
	}
}

// Make public function accessible
module.exports = {
	/*
	* setup(queryFn, msgFn, gkCheckFn) - Setup local variables
	*
	* @requires queryFn to be a database query function
	* @requires msgFn to be a msg function
	* @requires gkCheckFn to be gatekeeper's function
	*/
	setup: function(queryFn, msgFn, gkCheckFn) {
		query = queryFn;
		msg = msgFn;
		gkCheck = gkCheckFn;
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
					requestError(req, res, 'Not action implemented yet');
					break;
				case 'stats': // Get stats for a link
					requestError(req, res, 'Not action implemented yet');
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