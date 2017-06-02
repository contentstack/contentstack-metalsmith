const _ = require('lodash');

/**
 * Validate the options passed via files AND|OR global options
 * @param  {String} fileName 			Name of the file being processed
 * @param  {Object} file     			File object of the file being processed
 * @param  {Object} options  			Global config options
 * @return {Null}
 */
function options(fileName, file, options) {
	file = file || {},
	options = options || {};

	// Check file options
	if(file.api_key && file.access_token && file.environment && file.content_type) {
		if(typeof file.api_key === "undefined" || typeof file.access_token === "undefined" || typeof file.environment === "undefined")
		  throw new Error(`Missing file Stack keys:
		    Please provide proper values in ${fileName}
		    ex:
		      contentstack:
		        api_key: '<< API KEY >>'
		        access_token: '<< ACCESS TOKEN >>'
		    `);
		else
		  console.log('Building:', fileName, ' off file options');
		// Check Global config options (will be redundant - checked multiple times)
	} else if (options.api_key && options.access_token && options.environment) {
		if(typeof options.api_key === "undefined" || typeof options.access_token === "undefined" || typeof options.environment === "undefined")
		  throw new Error(`Missing important keys in global config:
		    Please provide proper values under index.js
		    ex:
		      .use(contentstack({
		        api_key: '<< API KEY >>',
		        access_token: '<< ACCESS TOKEN >>',
		        environment: '<< ENV >>'
		        ..
		    `);
		else
		  console.log('Building:', fileName, ' off global options');
		// No complete details have been provided either in file or in global config!
		// Error time!
	} else {
	throw new Error(`Please provide valid Stack details either in your file ${fileName} OR global config
	  Under ${fileName} you can add as:
	  contentstack:
	    api_key: '<< API KEY >>'
	    access_token: '<< ACCESS TOKEN >>'
	  OR
	  Under global config as:
	    .use(contentstack({
	      api_key: '<< API KEY >>',
	      access_token: '<< ACCESS TOKEN >>',
	      environment: '<< ENV >>'
	      ..`);
	}

	// Add option for `singleton`
	if((file.entry_template || file.entry_layout) && file.entry_id) {
		throw new Error(`Please provide either entry_template/entry_layout OR entry_id only @${fileName}`);
	}
}


/**
 * Check if the passed argument is empty
 * @param  {-}  argument
 * @return {Null}
 */

function isEmpty (argument) {
	if(typeof argument === "undefined" && _.isEmpty(argument)) {
		throw new Error(`${argument} is Undefined OR Empty!`);
	}
}

module.exports = {
	options: options,
	isEmpty: isEmpty
}
