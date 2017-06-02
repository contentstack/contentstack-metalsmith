'use strict'

const contentstack = require('contentstack');
const _ = require('lodash');
const helper = require('./helper');
const validate = require('./validations');

let client = {};


/**
 * Create Contentstack client
 * @param  {String} api_key       Contentstack Stack api_key
 * @param  {String} access_token  Contentstack Stack access_token
 * @return {Object}               Contentstack SDK client object
 */

function getClient(api_key, access_token, environment) {
  if (!client[api_key]) {
    client[api_key] = contentstack.Stack({
      api_key: api_key,
      access_token: access_token,
      environment: environment
    })
  }
  return client[api_key];
}


/**
 * Custom hooks modify entries fetched off Contentstack
 * @param  {Object} entries   Collection of entry objects off file.contentstack.content_type
 * @param  {Object} file      File object being processed
 * @param  {Object} options   Global config object
 * @return {Object}           Return a collection of entry object after applying hook
 */

function entryHooks(entries, file, options) {
  if(file.contentstack.entryHooks && options.entryHooks) {
    const fileHooks = file.contentstack.entryHooks;
    for(let key in fileHooks) {
      if(typeof options['entryHooks'][fileHooks[key]] === "function") {
        entries.forEach(function (entry) {
          entry = options['entryHooks'][fileHooks[key]](entry);
        })
      }
    }
  }
  return entries;
}


/**
 * Custom plugins
 * @param  {Object} file      File object being processed (from metalsmith & Contentstack)
 * @param  {Object} options   Global config object
 * @return {Object}           Return a collection of entry object after applying hook
 */

function postHooks(files, options) {
  files.map(file => {
    if(file === true)
      return file;

    const fileNames = _.keys(file);

    fileNames.map(fileName => {
      if(file[fileName] && file[fileName].contentstack && file[fileName].contentstack.postHooks && options.postHooks) {
        const filePostHooks = file[fileName].contentstack.postHooks;
        for(let key in filePostHooks) {
          if(typeof options['postHooks'][filePostHooks[key]] === "function") {
            file[fileName] = options['postHooks'][filePostHooks[key]](file[fileName], files, options);
          }
        }
      }
    })
  });
  return files;
}

/**
 * Assign file names to entries fetched off Contentstack
 * @param  {Object} entries   Collection of entry objects off file.contentstack.content_type
 * @param  {Object} file      File object being processed
 * @param  {Object} options   Global config object
 * @return {Object}           Return a collection of entry object after setting their filenames
 */

function getEntriesFileNames(entries, file, options) {
  if(file.contentstack.entry_layout || file.contentstack.entry_template) {
    return entries.map(entry => {
      entry.fileName = helper.fileName(entry, file, options);
      return entry;
    })
  }
  return entries;
}


/**
 * Assign each entry object with parent file details
 * @param  {Object} entries   Collection of entry objects off file.contentstack.content_type
 * @param  {Object} file      File object being processed, read by metalsmith
 * @param  {Object} options   Global config object
 * @return {Object}           Return processed file, with data binded off Contentstack
 */

function getEntriesContent(entries, file, options) {
  const files = {};
  files[file.fileName] = file;

  if(file.contentstack.singleton === true)
    file.entry = entries[0];
  else if(file.contentstack.entry_id || (file.contentstack.filters && file.contentstack.filters.query && file.contentstack.filters.query.uid))
    file.entry = entries[0];
  else
    file.entries = entries;

  if (file.contentstack.entry_layout || file.contentstack.entry_template) {
    return entries.reduce((fileMap, entry) => {
      fileMap[ entry.fileName ] = Object.assign({
        title: file.title,
        contents: file.contents,
        entry: entry,
        contentstack: file.contentstack,
        layout: file.contentstack.entry_layout || file.contentstack.entry_template,
        fileName: entry.fileName
      }, options.metadata);

      return fileMap;
    }, files);
  }

  file.metadata = options.metadata;
  console.log(file.fileName, ' with Contentstack dependecies is complete, build success!');
  return files;
}


/**
 * Process each file and get data from Contentstack
 * @param {Object} file       File object being processed, read by metalsmith
 * @param {Object} options    Global config object
 * @return {Boolean|Promise}
 */

function worker(file, options) {
  try {

    // Return in case file doesn't require data from Contentstack
    if (!file.contentstack) {
      console.log(file.fileName, ' has no Contentstack dependecies, build success!');
      return true;
    }

    validate.options(file.fileName, file.contentstack, options);

    const api_key = file.contentstack.api_key || options.api_key;
    const access_token = file.contentstack.access_token || options.access_token;
    const environment = file.contentstack.environment || options.environment;
    const content_type = file.contentstack.content_type || options.content_type;
    // GET Contentstack Client
    const Stack = getClient(api_key, access_token, environment);

    let Query = Stack.ContentType(content_type).Query();

    validate.isEmpty(Query);

    let filters;
    // Apply filters, if they exist
    if(options.filters || file.contentstack.filters)
      filters = Object.assign({}, options.filters, file.contentstack.filters); // options.filters, will that get modified?!

    // Check for single entry queries
    if(filters && file.contentstack.entry_id) {
      filters.limit = 1;
      filters.query = Object.assign({}, filters.query, {"uid": file.contentstack.entry_id});
    }
    else if(!filters && file.contentstack.entry_id) {
      filters = {};
      filters.limit = 1;
      filters.query = {"uid": file.contentstack.entry_id};
    } else {}

    // POC (edit uid, and the query fails)
    // {"author": {"$exists": true}, "uid": "blt3f82f8ee7c12081a"}

    if(filters) {
      const filterKeys = Object.keys(filters);
      filterKeys.forEach(filter => {
        Query[filter](filters[filter])
      })
    }

    // Make SDK calls
    return Query.toJSON().find().spread(function success(result) {
      console.log('Fetched entries off Contentstack setting data to', file.fileName);
      return result;
    }, function error(err) {
      throw new Error(`Failed while making SDK calls
        ${err}`);
      return file;
    })
    // Hooks
    .then(entries => entryHooks(entries, file, options))
    // Attaching filename
    .then(entries => getEntriesFileNames(entries, file, options))
    // Set data to files and differentiate
    .then(entries => getEntriesContent(entries, file, options))
    // Handle errors
    .catch(error => {
      console.error(`Error processing file ${file.fileName}
        Reason: ${error}`);
    });
  } catch (error) {
    console.error(`Build for ${file.fileName} failed!
      ${error}`);
  }
}


/**
 * Query partials & set them to files|entry's
 * @param  {Object} values    Collection of files|entries
 * @param  {Object} options   Global config object
 * @return {Object}           Return values, after setting partials
 */

function getPartials (files, options) {
  // Return if no partials are mentioned in global config
  if(!options.partials) {
    return files;
  }

  // GET Contentstack Client
  const Stack = getClient(options.api_key, options.access_token, options.environment);

  // Query partials and bind with entries
  let query = [];
  options.partials.forEach(partial => {
    query.push(Stack.ContentType(partial)
      .Query()
      .toJSON()
      .find()
      .spread(function success(result) {
        return { content_type_uid: partial, result: result[0]};
      }, function error(err) {
        throw new Error(err);
      }));
  });

  return Promise.all(query)
    .then(result => {
      files = files.map(file => {

        if(file === true)
          return file;

        const fileNames = Object.keys(file);
        fileNames.forEach(fileName => {
          if(file[fileName].hasOwnProperty('contentstack') && file[fileName]['contentstack'].hasOwnProperty('partials')) {
            file[fileName]['contentstack']['partials'].forEach(partial => {
              result.forEach(csPartial => {
                if(csPartial.content_type_uid === partial) {
                  file[fileName][csPartial['content_type_uid']] = csPartial.result;
                }
              })
            })
          }
        });
        return file;
      });
      return files;
    })
    .catch(error => {
      console.error(`Error loading partials ${options.partials}:
        Reason: ${error}`);
    });
}


/**
 * Removes object files that query Contentstack but do not hold layouts page
 * @param  {Object} file          Object file
 * @return {Object}
 */

function remove (file) {
    const fileNames = Object.keys(file);
    fileNames.map(fileName => {
      if(file[fileName] && file[fileName].contentstack && !file[fileName].layout)
        delete file[fileName];
    });
    return file;
}

module.exports = {
  worker: worker,
  getPartials: getPartials,
  postHooks: postHooks,
  remove: remove
};