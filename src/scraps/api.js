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
	res.status(400);
	res.send({'msg': msg});
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
	//
}

/*
* api_set(req, res) - Handle calls to 'set'
*
* @requires req from expressjs' request
* @requires res from expressjs' request
*/
function api_set(req, res) {
	//
}

// Make public function accessible
module.exports = {
	/*
	* setup(queryFn, msgFn) - Setup local variables
	*
	* @requires queryFn to be a database query function
	* @requires msgFn to be a msg function
	*/
	setup: function(queryFn, msgFn) {
		query = queryFn;
		msg = msgFn;
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
			msg(err)
			// Invalid version message
			res.status(500);
			res.send({'msg': 'Corrupted request'});
		}
	}

}