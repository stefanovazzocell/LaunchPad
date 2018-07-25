'use strict';
/*
* LaunchPad (Version 0.1.0)
* dbmanager.js - Utility to manage the requests to the db
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Make modules accessible
module.exports = {
	/*
	* dbConnectionCheck() - Performs a database connection check
	* 
	* @return boolean - true if connection successful, false otherwise
	*/
	connectionCheck: function () {
		// Perform database connection check
		return true; // TODO
	},
	/*
	* dbCheck() - Performs a database check
	* 
	* @return boolean - true if the database seems valid, false if issues
	*/
	check: function () {
		// Perform database check
		return true; // TODO
	},
	/*
	* rebuild() - Clears the database and rebuilds it
	*
	* @returns true if successful, false otherwise
	*/
	rebuild: function () {
		// Attempt db rebuilding
		return true;// TODO
	}
}