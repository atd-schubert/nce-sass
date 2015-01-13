# SASS extension for NCE
## Description
A [SASS](http://sass-lang.com/) implementation for [nce framework](https://github.com/atd-schubert/node-nce)

## How to install
Install with npm: `npm install --save nce-sass`

Integrate in NCE with the [extension-manager](https://github.com/atd-schubert/nce-extension-manager):

```
var NCE = require("nce");
var nce = new NCE(/*{}*/);
var extMgr = require("nce-extension-manager")(nce);

var sass = extMgr.getActivatedExtension("sass");
```

## How to use
### Config settings
You are able to use the following [config-settings](https://github.com/atd-schubert/node-nce/wiki/Extension-Class#configuration) (listed with their defaults):

* `route: "/sass"`: Sub-URL to listen
* `dumpPath: process.cwd() + "/sass"`: Directory to dump files
* `cachePath: process.cwd() + "/css-cache"`: Directory to dump rendered css files
* `renderOptions:`: Settings for implemented [node-sass](https://github.com/sass/node-sass#options)
    * `includePaths: dumpPath from above as array`: Array of include paths
    * `outputStyle: compressed`: Settings for compressor
* `logger: {}`: Settings for [logger-extension](https://github.com/atd-schubert/nce-winston)


### Basic methods
#### ext.define(name, code, cb)
Define a sass-resource by its name.

##### Arguments
1. `name`[String]: A name as identifier.
1. `code`[String]: SASS code. 
1. `cb`[Function]: Callback-function form `fs.writeFile` with the arguments:
    1. `error`[Error]: Used for exceptions

#### ext.getSass(name, cb)
Get a defined sass-file.

##### Arguments
1. `name`[String]: A name as identifier
1. `cb`[Function]: Callback-function form `fs.readFile` with the arguments:
    1. `error`[Error]: Used for exceptions
    1. `code`[Buffer]: Content of file as buffer
    
#### ext.getCss(name, cb)
Get a rendered css-file (Note: You have to call ext.render(...) first!).

##### Arguments
1. `name`[String]: A name as identifier
1. `cb`[Function]: Callback-function form `fs.readFile` with the arguments:
    1. `error`[Error]: Used for exceptions
    1. `code`[Buffer]: Content of file as buffer

#### ext.getSassStream(name)
Get the sass resource as a stream.
##### Arguments
1. `name`[String]: A name as identifier

Returns a stream from `fs.createReadStream`.

#### ext.getCssStream(name)
Get the css resource as a stream.
##### Arguments
1. `name`[String]: A name as identifier

Returns a stream from `fs.createReadStream`.

#### ext.undefine(name, cb)
Remove a sass and rendered css from defined sass by its name.

##### Arguments
1. `name`[String]: A name as identifier
1. `cb`[Function]: Callback-function form `fs.readFile` with the arguments:
    1. `error`[Error]: Used for exceptions

#### ext.render(name, cb, opts)
##### Arguments
1. `name`[String]: A name as identifier
1. `cb`[Function]: Callback-function form `fs.readFile` with the arguments:
    1. `error`[Error]: Used for exceptions
    1. `result`[Object]: The result given by [node-sass](https://github.com/sass/node-sass)
1. `opts`[Object]: Options for [node-sass](https://github.com/sass/node-sass#options)