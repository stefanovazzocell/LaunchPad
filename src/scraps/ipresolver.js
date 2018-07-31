'use strict';
/*
* LaunchPad (Version 0.1.0)
* ipresolver.js - Utility to resolve the user's ip
* by Stefano Vazzoler (stefanovazzocell@gmail.com)
* https://stefanovazzoler.com/
*/

// Load config
var { use_connection_ip, use_proxy, use_cloudflare } = require('./config/ipresolver');

/*
* getCloudflare(req) - gets the ip from cloudflare if allowed or the next available option
*
* @requires req to be a valid express request
* @returns ip string
*/
function getCloudflare(req) {
	// body...
}

/*
* getProxy(req) - gets the ip from the proxy if allowed or the next available option
*
* @requires req to be a valid express request
* @returns ip string
*/
function getProxy(req) {
	// body...
}

/*
* getRequest(req) - gets the ip from the request if allowed or returns "unknown"
*
* @requires req to be a valid express request
* @returns ip string
*/
function getRequest(req) {
	// body...
}

// Make public function accessible
module.exports = {
	// When the users requires an ip, start looking for cloudflare
	getIp: getCloudflare
}