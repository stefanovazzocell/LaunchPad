'use strict';
/*
* LaunchPad (Version 0.1.0)
* dbmanager.js - Utility to manage the requests to the db
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Require Dependencies and settings
var mysql = require('mysql');
const { dbName, makeTable, setPrimary } = require('./../config/database');

// Credentials Storage
const hostname = 'localhost'; // TODO: Change Me!
const username = 'root';      // TODO: Change Me!
const authPassword = 'root';  // TODO: Change Me!

// Prepare connections pool variable
var dbConnectionsPool;

// Prepare variables
var msg = function (x, y = '') {
	// Call startup to setup
}

/*
* updateConnection() - Updates the connection with the requested DB Name
*/
function updateConnection() {
	dbConnectionsPool = mysql.createPool({
		host: hostname,
		user: username,
		password: authPassword,
		database : dbName,
		multipleStatements: true,
		queueLimit: 10
	});
	msg('DB Connection updated', 'log');
}

/*
* rollbackConnection(init) - Rollback the connection to work without db name
* 
* @requires init is bool true if initial config, false otherwise
*/
function rollbackConnection(init=false) {
	dbConnectionsPool = mysql.createPool({
		host: hostname,
		user: username,
		password: authPassword,
		multipleStatements: true,
		queueLimit: 1
	});
	if (!init) {
		msg('DB Connection rolled back', 'warn');
	}
}

// Use rollbackConnection to configure dbConnectionsPool
rollbackConnection(true);

/*
* query(query, param, onSuccess, onError) - Query DB
* 
* @requires query is a query string
* @requires param are the query parameters
* @requires onSuccess(results) is a callback function
* @requires onError(message, error) is a callback function
*/
function query(query, param=null, onSuccess, onError) {
	dbConnectionsPool.getConnection(function(err, connection) {
		if (err) {
			try {
				// Try to destroy the faulty connection
				connection.destroy();
			} catch(error) {
				// Attempt failed
			}
			onError('Connection to DB failed', err);
		} else {
			// Use the connection
			connection.query(query, param, function (error, results, fields) {

				// When done with the connection, release it.
				connection.release();

				if (error) {
					// Handle Error
					onError('Issues with the database', error);
				} else if (err) {
					// Handle Error
					onError('Issues with the database', err);
				} else {
					// Return the results
					onSuccess(results);
				}
			});
		}
	});
}

/*
* performDbCleanup() - Performs a DB cleanup
*/
function performDbCleanup() {
	query("DELETE FROM `links` WHERE `clicks` <= 0 OR `expiration` <= NOW()", null, function() {
		setTimeout(performDbCleanup, 600000); // 1000 * 60 * 10
	}, function (err) {
		msg('DB Cleanup Failed, retrying in 1 minute', 'warn');
		setTimeout(performDbCleanup, 60000); // 1000 * 60 * 1
	})
}

/*
* rebuild() - Clears the database and rebuilds it
*
* @requires callback to be the callback function
*/
function rebuild(callback) {
	// Rollback connection
	rollbackConnection();
	// Create database
	query('CREATE DATABASE IF NOT EXISTS `' + dbName + '`', null, function() {
		// DB Created
		msg('DB Created, attempting to build table next', 'log');
		try {
			// Update the Connection
			updateConnection();
			// Build Table and set permissions
			query(makeTable, null, function () {
				msg('DB Table Created, attempting to set primary key next', 'log');
				// Successful
				query(setPrimary, null, function () {
					msg('DB Table Primary key set, rebuild successful', 'log');
					// Successful
					callback();
				}, function (errorMsg, err) {
					msg('DB Rebuild Failed (Failed to set primary key)');
					msg(err);
					process.exit(202);
				});
			}, function (errorMsg, err) {
				msg('DB Rebuild Failed (Table creation failed)');
				msg(err);
				process.exit(202);
			});
		} catch(err) {
			msg('DB Rebuild Failed (Unknown Error)');
			msg(err);
			process.exit(202);
		}
	}, function(errorMsg, err) {
		// Couldn't create
		msg('DB Rebuild Failed (Could not create database, check permissions)');
		msg(err);
		process.exit(202);
	});
}

// Make modules accessible
module.exports = {
	// Make performDbCleanup publicly available
	performDbCleanup: performDbCleanup,
	// Make query publicly available
	query: query,
	/*
	* connectionCheck(msgfn, onSuccess, onError) - Performs a database connection check
	* 
	* @requires msgfn to be a msg utility from serveradmin.js package
	* @requires onSuccess to be the callback function
	* @requires onError(message, error) to be the error callback function
	*/
	connectionCheck: function (msgfn, onSuccess, onError) {
		// Save the msg & getIpUtil utility and the mode
		msg = msgfn;
		// Perform database connection check
		dbConnectionsPool.getConnection(function(err, connection) {
			if (err) {
				try {
					// Try to destroy the faulty connection
					connection.destroy();
				} catch(error) {
					// Attempt failed
				}
				// Connection failed
				onError('Connection to DB failed', err);
				process.exit(202);
			} else {
				msg('DB Connection established', 'log');
				onSuccess();
			}
		});
	},
	/*
	* dbCheck() - Performs a database check
	* 
	* @requires callback to be the callback function
	* @requires databaseName to be a string indicating the name of the database to use (or create)
	* @requires rebuildIfNA bool true if db should be rebuild if not available
	*/
	check: function (callback, rebuildIfNA=false) {
		// Attempt to connect
		try {
			// Update the connection
			updateConnection();
			// Perform database check
			query("SELECT * FROM `links` WHERE 1 LIMIT 1", null, function (results) {
				// If the DB Check was successful, callback
				callback();
			}, function (err) {
				// If some error occurred, check if should rebuild
				if (rebuildIfNA) {
					// If rebuild allowed update the user and rebuild
					msg('DB Check failed, attempting to rebuild', "warn");
					rebuild(callback);
				} else {
					// If not allowed, inform the user and quit
					msg('DB Check and Rebuild Failed: rebuild not allowed (in prod mode)');
					process.exit(202);
				}
			});
		} catch(err) {
			// If something breaks, attemp to rebuild (and/or inform the user)
			if (rebuildIfNA) {
				rebuild(callback);
			} else {
				msg('DB Check and Rebuild Failed: rebuild not allowed (in prod mode)');
				process.exit(202);
			}
		}
	}
}