'use strict';

const path = require('path');
const _ = require('lodash');

/**
 * @param {Object} entry  -   Contentstack entry
 * @param {Object} file   -   file
 * @param {Object} options-   global options
 *
 * @return {String} file name
 */

function getFileName(entry, file, options) {
  file = file || {};
  options = options || {};
  let fileName;
  const extension = (file.contentstack.tmpl_extension) ? file.fileName.split('.').pop() : 'html';

  if(file.contentstack.custom_pattern) {
    fileName = entryPattern(entry, file, options);
  } else {
    let name = file.fileName.split('.');
    name.pop();
    fileName = path.join(name.toString().replace(/,/, '.'), `${entry.uid}`);
  }
  // extension might not work for non-html files | permalinks issue
  return fileName + '.' + extension;
}


function entryPattern(entry, file, options) {
  let patternArr = file.contentstack.custom_pattern.split('/');
  let pattern = patternArr.pop();

  if(typeof pattern !== "string")
    throw new Error(`Custom url patterns should be of type string! @`, file.fileName);

  // If the custom pattern doesn't eval entry fields
  const testP = /\${\s*?(.*?)\s*?}/.test(pattern);
  if(!testP)
    return file.contentstack.custom_pattern;

  pattern = pattern.replace(/\${\s*?(entry.?)(.*?)\s*?}/g, '$2');
  pattern = _.get(entry, pattern);

  // If the mentioned prototypical hierarchy isn't present, return invalid
  if(!pattern) {
    throw new Error(`Invalid custom pattern found @`, file.fileName);
  }

  // default contentstack url fields have preceding slashes, remove them
  pattern = pattern.replace(/^\//, '');

  pattern = path.join(patternArr.toString().replace(/,/, '/'), pattern);

  if(typeof pattern === "string")
    return pattern;
  else
    throw new Error(`Invalid url`);
}

module.exports = {
  fileName: getFileName
};