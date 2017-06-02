'use strict';

const contentstack = require('./lib');


/**
 * Plugin function
 * @param {Object|undefined} options
 * @return {Function} Function to be used in metalsmith process
 */

function plugin (options) {
  options = options || {};

  /**
   * Function to process all read files by metalsmith
   * @param  {Object}   files      file map
   * @param  {Object}   metalsmith metalsmith
   * @param  {Function} done       success callback
   */

  return (files, metalsmith, done) => {
    // Global metadata
    options.metadata = metalsmith.metadata();

    return new Promise(resolve => {
      const fileNames = Object.keys(files);
      return Promise.all(
        fileNames.map(fileName => {
          if(files[fileName].custom_url)
            files[fileName].fileName = files[fileName].custom_url;
          else
            files[fileName].fileName = fileName;

          // layouts
          if(files[fileName].template) {
            files[fileName].layout = files[fileName].layout || files[fileName].template;
            delete files[fileName].template;
          }
          return contentstack.worker(files[fileName], options);
        })
      )
      .then(values => {
        // User defined plugins
        values = contentstack.postHooks(values, options);
        // Remove value objects, that query Contentstack but have no layouts
        values = values.map(file => {
          if(file === true)
            return file;
          return contentstack.remove(file);
        });
        // Remove file objects, that query Contentstack but have no layouts
        files = contentstack.remove(files);
        // Add bind partials
        resolve(contentstack.getPartials(values, options));
      })
    })
    .then(bindedContent => {
      bindedContent.forEach(content => {
        Object.assign(files, content);
      })
      done();
    })
    .catch((error) => {
      done(error);
    })
  }
}

module.exports = plugin;