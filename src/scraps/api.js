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
	}
}