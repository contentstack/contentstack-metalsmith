## contentstack-metalsmith

A metalsmith plugin to create a static website using [Built.io Contentstack](https://contentstack.built.io).


### Example

In order to get started using `contentstack-metalsmith`, you can checkout our sample app at [`contentstack-metalsmith-static-site-demo`](https://github.com/builtio-contentstack/contentstack-metalsmith-demo)

### Installation

To install `contentstack-metalsmith`, run the following command in a terminal:

```bash
  $ npm install contentstack-metalsmith
```

Once you’re done with the installation, you will need to edit the `index.js` file under the root directory in order to use Built.io Contentstack with Metalsmith.

### Configuring Globals

The Built.io Contentstack configuration added in the `index.js` file of the site will be available throughout the site and will be substituted in files where no other Built.io Contentstack specific configuration is provided.

When using the Metalsmith CLI, you’ll need to add `contentstack-metalsmith` in your `metalsmith.json` file and provide the API Key and access token of your stack along with the stack environment. This can be done as follows:

```javascript
  {
    "source": "src",
    "destination": "build",
    "plugins": {
      "contentstack-metalsmith": {
        "api_key": "<<Contentstack Api Key>>",
        "access_token": "<<Contentstack Access Token>>",
        "environment": "<<Stack Environment>>"
      }
    }
  }
```

In case you are using Metalsmith’s JS API, you will need to add `contentstack-metalsmith` to the plugins section as follows:

```javascript
  .use(require('contentstack-metalsmith') ({
      "api_key": "<<Contentstack Api Key>>",
      "access_token": "<<Contentstack Access Token>>",
      "environment": "<< Environment >>"
   }));
```

Please refer the following to get more information on configuring your global configuration file.
{ [Global configuration](https://github.com/builtio-contentstack/contentstack-metalsmith/blob/master/docs/global-configuration.md) }

### Configuring Source Files

Make the necessary configuration changes in your source files which are located under the `src/` directory, in the manner: `./src/home.md`. Your source file can be of type: .md, .html, etc.:

```markdown
---
title: contentstack-metalsmith sample demo
contentstack:
  content_type: posts
  entry_layout: post.html
  partials: [header, footer]
layout: index.html
---
```

The above code snippet will use the configuration provided in your global configuration stack details, and query the stack for **content_type: posts**.
Furthermore, each entry from posts will be rendered using the `post.html` layout under the `layouts/ directory`.
You will also be able to access the `header` and `footer` content types via the `header` and `footer` keys in `posts.html`.
Please refer the following to get more information on configuring your source configuration file.
{ [Source configuration](https://github.com/builtio-contentstack/contentstack-metalsmith/blob/master/docs/source-configuration.md) }

### Configuring layouts files

Consider the following code snippet of the `./layouts/post.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{title}}</title>
</head>
<body>
    <div class=”header”>{{header.title}}</div>
    <div class=”container”>
        <p>Post title: {{entry.title}}</p>
        <p>Post author: {{entry.author}}</p>
    </div>
</body>
</html>
```

You can use the `entry` key to access single entry properties (refer above example). Whereas, in `index.html` pages, you can access data using the `entries` key, which will be a collection of all entries.