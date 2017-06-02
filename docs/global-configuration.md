## Global Configuration Options

Your default configuration would look something similar to this

```javascript
.source('src')
.destination('build')
.use(require('contentstack-metalsmith') ({
    "api_key": "<<Contentstack Api Key>>",
    "access_token": "<<Contentstack Access Token>>",
    "environment": process.env.NODE_ENV || "<< Environment >>"
 }));
```

Let's look at the above configuration code in detail

`api_key` *(optional)*

This is the stack's API key, which is used to identify your stack in Built.io Contentstack. You can define your stack’s API key in the global config file or under your source files.
> **Note**: It’s recommended to add the API key in your global config file, and then override on your source files, whenever necessary.

`access_token` *(optional)*

This is the Stack’s access token, which is used to access your stack in Built.io Contentstack’s stack. You can define your stack’s access token here in the global config or under your source files.
> **Note**: It’s recommended to add an access_token on your global, and then override on your source files, whenever necessary.

`environment` *(optional)*

This is the environment of which the data you wish to retrieve. Similar to api_key and access_token, you can either define them under your global config or under your source file.

### Other Configuration options

Apart from the default configuration, the following options are supported by the `contentstack-metalsmith` plugin.

`partials` *(optional)*

This is an array of content type uids that will act as partials. All the partials content types being used in the project need to be defined here. The source files that need partials can refer them using the content type uid.

`filters` *(optional)*

The filters are similar to SDK query filters used in Built.io Contentstack. You can define your filters here in the global configuration or in your source config as follows:

```javascript
filters: {
    limit: 10,
    query: {"author": {"$exists": true}}
}
```

`entryHooks` *(optional)*

Using this option, you can manipulate the entries fetched from Built.io Contentstack. You will need to define your `entryHooks` methods in the global configuration and then your source files can refer to them using the hook’s method name.

```javascript
entryHooks: {
  /**
  * Removes mentioned keys from the passed entries
  * @param  {Object} entries  Collection of entry objects
  * @param  {Object} file     file read by metalsmith
  * @param  {Object} options  Global config options
  * @return {Object}          Return collection of entry objects after their keys have been deleted
  */
  removeKeys: (entries, file, options) => {
      const keys = ['publish_details', 'ACL', 'created_by', 'updated_by', '_version'];
          if(Array.isArray(entries)) {
              entries.forEach(entry => {
                  keys.forEach(key => {
                      if(entry[key])
                          delete entry[key];
                  });
              });
          }
      return entries;
  }
}
```
> **Note**: It's important to return the entries once the manipulations have been made.

Any source file that’d refer to the above hook would need to refer to it in the following manner:

```markdown
---
title: contentstack-metalsmith sample demo
contentstack:
  content_type: posts
  entryHooks: [removeKeys]
layout: index.html
---
```

`postHooks` *(optional)*

This optionis similar to entryHooks, except that they allow you to work on the entire data fetched from Built.io Contentstack. The source files can refer to them using their method as keys.

```javascript
postHooks: {
  /**
   * Allows the file calling this hook to get entries from Contentstack's products content type
   * @param  {Object} currFile The current file invoking the hook.
   * @param  {Object} files    Collection of all files
   * @param  {Object} options  Global config options
   * @return {Object}          Contents of current file after applying the `hook's` logic.
   */
  fetchProducts: (currFile, files, options) => {
      currFile.products = [];
      files.forEach(file => {
          if(file === true)
              return file;
          const fileNames = _.keys(file);
          fileNames.forEach(fileName => {
              if(file[fileName] && file[fileName].contentstack && file[fileName].contentstack.content_type === "products" && file[fileName].entries) {
                  currFile.products = file[fileName].entries;
              }
          });
      });
      return currFile;
  }
}
```
> **Note**: It's important to return the file contents once the manipulations have been made.

Any source file that would refer to the above hook, would need to refer to it in the following manner:

```markdown
---
title: contentstack-metalsmith sample demo
contentstack:
  content_type: posts
  postHooks: [mergeAllFileData]
layout: index.html
---
```