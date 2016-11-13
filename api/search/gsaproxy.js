// Includes
let extend = require('util')._extend;
let request = require('request');
let xml2js = require('xml2js');

// Constants
let DEFAULTS = {
	searchBasepath: 'http://path-to-gsa.com/search?',
	searchParameters: {
		q: '',
		site: 'example',
		client: 'example',
		access: 'p',
		output: 'xml_no_dtd',
		getfields: '*',
		sort: 'date%3AD%3AL%3Ad1',
		lr: 'lang_en',
		oe: 'UTF-8',
		ie: 'UTF-8',
		ud: '1',
		start: '0',
		filter: 'p',
		num: '20'
	},
	avoidParameters: ['proxystylesheet'],
	cookieStr: ""
};

// Constructors
function GSAProxy(basepath, parameters, cookieStr) {
	this.config = _copy(DEFAULTS);

	if (!_isUndefined(basepath)) {
		if (basepath.indexOf('/search?', 8) !== -1) {
			this.config.searchBasepath = basepath;
		} else {
			this.config.searchBasepath = basepath.substr(0, basepath.lastIndexOf('/')) + '/search?';
		}
	}
	if (!_isUndefined(parameters)) {
		this.config.searchParameters = extend(this.config.searchParameters, parameters);
	}
	if (!_isUndefined(cookieStr)) {
		this.config.cookieStr = cookieStr;
	}
}

GSAProxy.prototype.executeJson = function(callback) {
	function xmlToJson(err, xml, setCookieHeader) {
		if (err) callback(err);
		xml2js.parseString(xml, {
			attrkey: 'attr',
			explicitArray: false,
			mergeAttrs: true
		}, (err, json) => {
			if (err) callback(err);
			// Gotta bubble up that header!
			if(setCookieHeader) {
				callback(null, json, setCookieHeader)
			} else {
				callback(null, json);
			}
		});
	}

	if(this.config.searchParameters.access === "a") {
		// If we're doing a logged-in search
		this.executeLog(this.config.cookieStr, xmlToJson);
	} else {
		// Public search
		this.executePub(xmlToJson);
	}
};

GSAProxy.prototype.executePub = function(callback) {
	request(this.buildGsaUrl(), function(err, res, body) {
		if (err) {
			callback(err);
		}
		callback(null, body);
	});
};

GSAProxy.prototype.executeLog = function(cookieStr, callback) {
	let options = {
		url: this.buildGsaUrl(),
		headers: {
			Cookie: cookieStr,
			X_GSA_USER: "Default",
			X_GSA_CREDENTIAL_GROUP: "Default"
		}
	};

	request(options, function(err, res, body) {
		if (err) {
			callback(err);
		}

		let setCookieHeader = res.headers["set-cookie"] ? res.headers["set-cookie"][0] : null;
		// If there's a set-cookie header, bubble it up
		if(setCookieHeader && setCookieHeader.startsWith("GSA_SESSION_ID")) {
			callback(null, body, setCookieHeader)
		} else {
			callback(null, body);
		}
	});
};

GSAProxy.prototype.buildGsaUrl = function() {
	return this.config.searchBasepath + _buildParameterString(this.config.searchParameters, this.config.avoidParameters);
};

// Private Functions
function _buildParameterString(parameters, avoidParameters) {
	let parameterString = '';
	for (var key in parameters) {
		if (!_contains(avoidParameters, key)) {
			parameterString += '&' + key + '=' + parameters[key];
		}
	}
	return parameterString.substr(1);
}

function _contains(array, key) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === key) {
			return true;
		}
	}
	return false;
}

function _isUndefined(obj) {
	return typeof obj === 'undefined' || obj === null;
}

function _copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

// Module
module.exports = GSAProxy;
