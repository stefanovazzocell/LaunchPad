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
* requestError(res, msg) - Sends a 400 error
*
* @requests res is a express response
* @requests msg string to return the user
*/
function requestError(res, msg='Something is wrong with your request, try refreshing the page') {
	// Request does not match API standards
	gkCheck('apiError', req);
	res.status(400);
	res.send({'msg': msg});
}

/*
* isAvailable(toCheck, res) - Check if all variables in array are set
*
* @requests toCheck is array of variables to check
* @requests res is a express response
* @return bool true if all available, false otherwise
*/
function isAvailable(toCheck, res) {
	for (var i = 0; i < toCheck.length; i++) {
		if (toCheck[i] === undefined) {
			requestError(res);
			return false;
		}
	}
	return true;
}

/*
* assertTrue(toCheck, checks, res) - Check if isAvailable toCheck produces true and all the functions in array produce true
*
* @requests toCheck is array of variables to check
* @requests checks is array of functions to check
* @requests res is a express response
* @return bool true if all true, false otherwise
*/
function assertTrue(toCheck, checks, res) {
	if (isAvailable(toCheck, res)) {
		for (var i = 0; i < toCheck.length; i++) {
			if (!toCheck[i]()) {
				requestError(res);
				return false;
			}
		}
		return true;
	} else {
		return false
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
	if (assertTrue([req.body.link], [], res)) {
		res.send("ok");
	}
}

/*
* api_set(req, res) - Handle calls to 'set'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_set(req, res) {
	if (assertTrue([req.body.link, req.body.data, req.body.parameters], [], res)) {
		res.send("ok");
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
			switch(req.body.type) {
				case 'get': // Get a link
					api_get(req, res);
					break;
				case 'set': // Creating a new link
					api_set(req, res);
					break;
				case 'edit': // Edit a link
					requestError(res, 'Not action implemented yet');
					break;
				case 'stats': // Get stats for a link
					requestError(res, 'Not action implemented yet');
					break;
				default:
					res.send('ok');
			}
		} catch(err) {
			// Request does not match API standards
			gkCheck('apiError', req);
			res.status(500);
			res.send({'msg': 'Corrupted request'});
		}
	}

}