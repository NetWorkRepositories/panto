# PantoJS<sup>®</sup>
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url] [![Stories in Ready][waffle-image]][waffle-url]

[中文README](README_CN.md)

_**[PantoJS<sup>®</sup>](http://pantojs.xyz/)**_ is an ***extremely flexible*** engine transforming files. See <http://pantojs.xyz/> for more details.

It works like [Grunt](http://gruntjs.com) or [Gulp](http://gulpjs.com), but more **efficient**, **powerful** and **flexible**. It can replace [webpack](http://webpack.github.io) easily.

## Topology

![panto topology](panto.png)

## Demo

```js
const panto = require('panto');

panto.setOptions({
    cwd: 'your_project_dir',
    src: 'src',
    output: 'output' // Cannot be same to src
});

/*
 * You need to load transformers first. 
 */
require('load-panto-transformers')(panto);

// Isomorphic JavaScript
const srcJs = panto.pick('**/*.{js,jsx}').tag('js(x)').read();

srcJs.babel(clientBabelOptions).write();

srcJs.babel(serverBabelOptions).write();

// Less
panto.pick('**/*.less').tag('less').read().less().write();

// node_modules, only once
panto.pick('node_modules/**/*', true).tag('node_modules').copy();

// Others
panto.rest().tag('others').ignore().copy();

panto.on('start', buildId => {})// tasks start, for build & watch
    .on('flowstart', ({tag}, flowId) => {})// one task starts, for build & watch
    .on('flowend', ({tag}, flowId) => {})// one task ends, for build & watch
    .on('error', (err, buildId) => {})// any tasks error, for build & watch
    .on('complete', (files, buildId) => {})// tasks runnning complete, for build & watch

panto.build().then(() => {
    panto.watch();
});
```


## Boilerplate

 - [panto-best-practice](https://github.com/pantojs/panto-best-practice)

## Transformers

Some official transformers: 

 - [read](https://github.com/pantojs/panto-transformer-read)
 - [write](https://github.com/pantojs/panto-transformer-write)
 - [babel](https://github.com/pantojs/panto-transformer-babel)
 - [filter](https://github.com/pantojs/panto-transformer-filter)
 - [ignore](https://github.com/pantojs/panto-transformer-ignore)
 - [integrity](https://github.com/pantojs/panto-transformer-integrity)
 - [less](https://github.com/pantojs/panto-transformer-less)
 - [uglify](https://github.com/pantojs/panto-transformer-uglify)
 - [stamp](https://github.com/pantojs/panto-transformer-stamp)
 - [aspect](https://github.com/pantojs/panto-transformer-aspect)
 - [browserify](https://github.com/pantojs/panto-transformer-browserify)
 - [replace](https://github.com/pantojs/panto-transformer-replace)
 - [copy](https://github.com/pantojs/panto-transformer-copy)
 - [resource](https://github.com/pantojs/panto-transformer-resource)
 - [banner](https://github.com/pantojs/panto-transformer-banner)

Create your own _transformer_, just extend [panto-transformer](https://github.com/pantojs/panto-transformer), make sure _\_transform_ or _transformAll_ function returns a [Promise](https://promisesaplus.com/), override _isTorrential_ and _isCacheable_ if necessary.

```js
panto.loadTransformer('foo') // panto-transformer-foo
panto.loadTransformer('bar', require('my-bar-transformer'))

// Alias for pick
panto.$('*.js').foo(...).bar(...)
```

[npm-url]: https://npmjs.org/package/panto
[downloads-image]: http://img.shields.io/npm/dm/panto.svg
[npm-image]: http://img.shields.io/npm/v/panto.svg
[travis-url]: https://travis-ci.org/pantojs/panto
[travis-image]: http://img.shields.io/travis/pantojs/panto.svg
[david-dm-url]:https://david-dm.org/pantojs/panto
[david-dm-image]:https://david-dm.org/pantojs/panto.svg
[david-dm-dev-url]:https://david-dm.org/pantojs/panto?type=dev
[david-dm-dev-image]:https://david-dm.org/pantojs/panto/dev-status.svg
[coveralls-image]:https://coveralls.io/repos/github/pantojs/panto/badge.svg?branch=master
[coveralls-url]:https://coveralls.io/github/pantojs/panto?branch=master
[waffle-image]:https://badge.waffle.io/pantojs/panto.png?label=ready&title=Ready
[waffle-url]:https://waffle.io/pantojs/panto
