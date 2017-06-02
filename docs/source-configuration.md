## Source File Configuration Options

You can add your source files under your `./src` folder with an  `.md` or `.html` extension. A simple source file, `./src/home.md`, would look something like this:

```markdown
---
title: Sample demo.
contentstack:
    content_type: home
layout: home-layout.html
---
```

The above example would create a list page at `/build/home.html`. When you add the `contentstack` key to your source file, you will be able to fetch entries of the mentioned content type from Built.io Contentstack.


### Other Configuration options

Apart from the default configuration, the following options are supported by the `contentstack-metalsmith` plugin.

`entry_layout` *(optional)*

You can add a template that will be bound to each entry fetched from the mentioned content type. Consider a sample code snippet,  `./src/posts.md`, as follows

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entry_layout: post.html
layout: posts-layout.html
---
```

The above code snippet will create a list page at `/build/posts.html` and create entry pages for specific entry uid at `/build/posts/*{{entry_id}}*.html`.

`entry_id` *(optional)*

This option allows you to build single entry pages. You will need to provide the particular content type’s entry uid as its value. Consider a sample code snippet, `./src/posts.md`, as follows

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entry_id: blt1231234asd12
layout: posts-layout.html
---
```
> **Note**: You can include either `entry_layout` or `entry_id` to bind single entries to the template. Adding both `entry_layout` and `entry_id` option will throw an error!

`custom_pattern` *(optional)*

By passing custom_pattern you can set the build of the entries of the mentioned content type to the specified pattern. Consider a sample code snippet, `./src/posts.md`, as follows

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entry_layout: post.html
    custom_pattern: posts/${entry.url}
layout: posts-layout.html
---
```

In the above example, entries of the `post` content type will be created under the `posts` folder and will follow the folder structure of the `entry.url` post of the entry.
So, if your entry follows the folder structure `url: /builtio/contentstack`, the build will be created at `/build/posts/builtio/contentstack.html`.

`partials` *(optional)*

This option allows you to fetch partial content type data with the specified content type’s uid. Its an array field whose keys refer to the one’s mentioned under the partials of the global configuration file. Consider a sample code snippet, `./src/posts.md`, as follows:

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entry_layout: post.html
    partials: [header, footer]
layout: posts-layout.html
---
```

In the above example, the `header` and `footer` content blocks *(if mentioned under global configuration as well)* will be bound along with the entries fetched from the `post` content type. You will be able to access the partial data using the same keys at the specified layout. For example, `posts-layout.html` and `post.html`, use `{{header.keyName}}` and `{{footer.keyName}}`.

`filters` *(optional)*

The `filters` option allows you to add Built.io Contentstack’s SDK filters which will be applied when fetching entries from Built.io Contentstack for the mentioned content type. Consider a sample code snippet, `./src/posts.md`, as follows:

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entry_layout: post.html
    filters:
        limit: 10
        skip: 5
layout: posts-layout.html
---
```

You can find more information on Built.io Contentstack’s SDK filter options [here](../README.md).

### Hooks

You can add hooks to modify the entries and data fetched from Built.io Contentstack. The `contentstack-metalsmith` plugin provides two hooks:

`entryHooks` *(optional)*

The entry hooks can be used to directly modify the entries fetched from Built.io Contentstack. The entryHooks methods need to be defined at the global configuration file which can then be referred in source files using the method names as keys. Consider a sample code snippet, `./src/posts.md`, as follows:

```markdown
---
title: Sample demo.
contentstack:
    content_type: post
    entryHooks: [consoleHook]
layout: posts-layout.html
---
```
Check global configuration for `entryHooks` definition [here](../README.md)

`postHooks` *(optional)*

The post hooks is used as a plugin. You can modify entire sets of data using this hook. You need to define postHooks at the global configuration file and refer the source files to them using the method names as keys. Consider a sample code snippet, `./src/posts.md`, as follows:

```markdown
---
title: contentstack-metalsmith sample demo
contentstack:
  content_type: posts
  postHooks: [mergeAllFileData]
layout: index.html
---
```

Check global configuration for `postHooks` definition [here](../README.md)