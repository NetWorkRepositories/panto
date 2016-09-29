/**
 * Copyright (C) 2016 panto.xyz
 * test.js
 *
 * changelog
 * 2016-06-21[19:03:41]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0-alpha.1
 * @since 0.0.1
 */
'use strict';

const Panto = require('../src/panto');
const panto = require('../');
const fs = require('fs');
const assert = require('assert');
const Transformer = require('panto-transformer');
const isFunction = require('lodash/isFunction');

/*global describe,it*/
/*eslint no-console: ["error", { allow: ["error"] }] */
describe('panto', () => {
    describe('#constructor', () => {
        it('should define frozen "options"', () => {
            assert.ok('Stream' in panto, '"Stream" in panto');
            assert.ok('options' in panto, '"options" in panto');
            assert.ok(!!panto.options.get('output'), '"output" in panto.options');
            assert.deepEqual(panto.options.get('cwd'), process.cwd(), '"cwd" in panto.options');
            assert.ok('' === panto.options.get('binary_resource'),
                '"binary_resource" in panto.options');
            assert.throws(() => {
                panto.options = 1;
            }, 'set "panto.options"');
            assert.throws(() => {
                delete panto.options;
            }, 'delete "panto.options"');
        });
        it('should define frozen "file"', () => {
            assert.ok('file' in panto);
            assert.throws(() => {
                delete panto.file;
            }, '"panto.file" is frozen');
        });
        it('should define frozen "util"', () => {
            assert.ok('util' in panto, '"util" in panto');
            assert.ok('_' in panto, '"_" in panto');
            assert.throws(() => {
                delete panto._;
            }, '"panto._" is frozen');
        });
    });
    describe('#setOptions#getOption', () => {
        it('should set to the options', () => {
            const panto = new Panto();
            panto.setOptions({
                cwd: 'xyz'
            });
            assert.deepEqual(panto.getOption('cwd'), 'xyz', '"panto.options.cwd" equals "xyz"');
            assert.deepEqual(panto.getOption('noexist', 'default'), 'default', 'get default');
        });
    });
    describe('#getFiles', () => {
        it('should get the files', done => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            panto.getFiles().then(filenames => {
                assert.ok(filenames.indexOf('javascripts/a.js') > -1,
                    'found "javascripts/a.js"');
                assert.ok(filenames.indexOf('javascripts/b.js') > -1,
                    'found "javascripts/b.js"');
                done();
            });
        });
        it('should throw if src and output are same', () => {
            const panto = new Panto();
            panto.setOptions({
                cwd: '.',
                src: 'foo',
                output: './foo'
            });
            assert.throws(() => {
                panto.getFiles();
            }, 'throws error');
        });
    });

    describe('#build', function () {
        this.timeout(5e3);
        it('should get all the files', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            panto.pick(['**/*.js']).tag('js');
            panto.pick(['**/*.css']).tag('css');

            return panto.build().then(files => {
                assert.ok(files.some(file => file.filename === 'javascripts/a.js'),
                    'match "javascripts/a.js"');
                assert.ok(files.some(file => file.filename === 'javascripts/b.js'),
                    'match "javascripts/a.js"');
                assert.ok(files.some(file => file.filename === 'stylesheets/a.css'),
                    'match "stylesheets/a.css"');
                assert.ok(files.some(file => file.filename === 'stylesheets/b.css'),
                    'match "stylesheets/b.css"');
            });
        });
        it('should support equative src & output', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname,
                src: '/fixtures/',
                output: 'out'
            });

            const filename = `r/r-${Date.now()}.txt`;

            return panto.file.write(filename, 'out').then(() => {
                assert.ok(fs.existsSync(__dirname + '/out/' + filename));
                return panto.file.rimraf('r', {
                    force: true
                });
            });
        });
        it('should support serial src&output', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname,
                src: '/fixtures/',
                output: 'fixtures/out'
            });

            const filename = `r/r-${Date.now()}.txt`;

            return panto.file.write(filename, 'out').then(() => {
                assert.ok(fs.existsSync(__dirname + '/fixtures/out/' + filename));
                return panto.file.rimraf('r', {
                    force: true
                });
            });
        });
        it('should throw if src and output are same', done => {
            const panto = new Panto();
            panto.setOptions({
                cwd: '.',
                src: 'foo',
                output: './foo'
            });
            panto.build().catch(() => {
                done();
            });
        });
        it('should emit start event', done => {
            const panto = new Panto();
            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });
            panto.$('**/*').tag('ALL');
            panto.on('start', id => {
                assert.ok(id);
                done();
            });
            panto.build();
        });
        it('should emit complete event', done => {
            const panto = new Panto();
            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });
            panto.$('**/*').tag('ALL');
            panto.on('complete', (files, id) => {
                assert.ok(files);
                assert.ok(id);
                done();
            });
            panto.build();
        });
        it('should emit flowstart event', done => {
            const panto = new Panto();
            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });
            panto.$('**/*').tag('ALL');
            panto.on('flowstart', ({
                tag
            }, fid, bid) => {
                assert.ok(tag);
                assert.ok(fid);
                assert.ok(bid);
                done();
            });
            panto.build();
        });
        it('should emit flowend event', done => {
            const panto = new Panto();
            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });
            panto.$('**/*').tag('ALL');
            panto.on('flowend', ({
                tag
            }, fid, bid) => {
                assert.ok(tag);
                assert.ok(fid);
                assert.ok(bid);
                done();
            });
            panto.build();
        });
        it('should emit error event', done => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            class ErrorTransformer extends Transformer {
                _transform() {
                    return Promise.reject(new Error('normal error'));
                }
            }

            panto.pick('**/*.js').tag('js').pipe(new ErrorTransformer());

            panto.on('error', (err, id) => {
                assert.ok(err);
                assert.ok(id);
                done();
            });

            panto.build();
        });
        it('should operate only once when multiple reading on a file', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            let readInvoked = 0;

            class ReadTransformer extends Transformer {
                _transform(file) {
                    const {
                        filename,
                        content
                    } = file;
                    // use cache if possible
                    if (!panto._.isNil(content)) {
                        return Promise.resolve(file);
                    } else {
                        readInvoked += 1;
                        return panto.file.read(filename).then(content => {
                            file.content = content;
                            return file;
                        });
                    }
                }
                isCacheable() {
                    return false;
                }
            }

            panto.loadTransformer('read', ReadTransformer);

            panto.$('**/a.js').read();
            panto.$('**/a.js').read();
            return panto.build().then(() => {
                assert.deepEqual(readInvoked, 1, 'reading a.js only once');
            });
        });
        it('should skip dormant streams', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            let invoked = 0;

            class TestTransformer extends Transformer {
                transformAll(files) {
                    invoked += 1;
                    return super.transformAll(files);
                }
                isTorrential() {
                    return true;
                }
                isCacheable() {
                    return false;
                }
            }

            panto.$('**/a.js');
            panto.$('**/b.js', true).pipe(new TestTransformer());
            return panto.build().then(() => {
                return panto.build();
            }).then(() => {
                assert.deepEqual(invoked, 1, 'skip dormant streams');
            });
        });
    });

    describe('#clear', function () {
        this.timeout(2e3);
        it('should clear streams', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            panto.pick('**/*.js').tag('js');

            return panto.build().then(files => {
                assert.ok(files.some(file => file.filename === 'javascripts/a.js'),
                    'match "javascripts/a.js"');
                assert.ok(files.some(file => file.filename === 'javascripts/b.js'),
                    'match "javascripts/a.js"');
            }).then(() => {
                assert.deepEqual(panto.clear(), panto, 'clear() return self');
                return panto.build();
            }).then(files => {
                assert.deepEqual(files, [], 'no files due to no streams');
            });
        });
    });

    describe('#rest', function () {
        this.timeout(3e3);
        it('should pick the rest', () => {
            const restFiles = [];

            class FinalTransformer extends Transformer {
                _transform(file) {
                    this.options.collection.push(file);
                    return super._transform(file);
                }
            }

            const panto = new Panto();
            const Stream = panto.Stream;

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            panto.rest().tag('rest').connect(new Stream(new FinalTransformer({
                collection: restFiles
            })));

            panto.pick('**/*.js').tag('js');
            panto.pick('**/*.css').tag('css');

            return panto.build().then(() => {
                assert.ok(restFiles.some(file => file.filename === 'README.md'),
                    '"README.md" rested');
            });
        });
    });
    describe('#onFileDiff', function () {
        this.timeout(5e3);
        it('add and remove', () => {
            const panto = new Panto();

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            panto.pick('**/*.js').tag('js');
            panto.rest().tag('rest');

            return panto.build().then(() => {
                return panto._onFileDiff({
                    filename: 'javascripts/c.js',
                    cmd: 'add'
                });
            }).then(files => {
                assert.ok(files.some(file => file.filename === 'javascripts/c.js'),
                    '"javascripts/c.js" added');
                return panto._onFileDiff({
                    filename: 'javascripts/c.js',
                    cmd: 'remove'
                });
            }).then(files => {
                assert.ok(!files.some(file => file.filename === 'javascripts/c.js'),
                    '"javascripts/c.js" removed');
            }).then(() => {
                return panto._onFileDiff({
                    filename: 'rest.txt',
                    cmd: 'add'
                });
            }).then(files => {
                assert.ok(files.some(file => file.filename === 'rest.txt'),
                    '"rest.txt" added');
                return panto._onFileDiff({
                    filename: 'rest.txt',
                    cmd: 'remove'
                });
            }).then(files => {
                assert.ok(!files.some(file => file.filename === 'rest.txt'),
                    '"rest.txt" remove');
            });

        });
    });

    describe('#reportDependencies', function () {
        it('should transform dependencies too', done => {
            const panto = new Panto();
            const Stream = panto.Stream;

            panto.setOptions({
                cwd: __dirname + '/fixtures/'
            });

            let readInvoked = 0;

            class ReadTransformer extends Transformer {
                _transform(file) {
                    const {
                        filename,
                        content
                    } = file;
                    // use cache if possible
                    if (!panto._.isNil(content)) {
                        return Promise.resolve(file);
                    } else {
                        readInvoked += 1;
                        panto.log.debug(file);
                        return panto.file.read(filename).then(content => {
                            file.content = content;
                            return file;
                        });
                    }
                }
                isCacheable() {
                    return false;
                }
            }

            panto.loadTransformer('read', ReadTransformer);

            let jsInvoked = 0;

            class ModifyTransformer extends Transformer {
                _transform(file) {
                    if (file.filename !== 'javascripts/a.js') {
                        return super._transform(file);
                    }
                    return Promise.resolve(panto._.extend(file, {
                        content: Date.now()
                    }));
                }
                isCacheable() {
                    return false;
                }
            }

            class JsTransformer extends Transformer {
                _transform(file) {
                    jsInvoked += 1;
                    return super._transform(file);
                }
                isTorrential() {
                    return false;
                }
                isCacheable() {
                    return true;
                }
            }

            panto.pick('**/*.css').tag('css');
            panto.pick('**/*.js').tag('js').read().connect(new Stream(new ModifyTransformer()))
                .connect(new Stream(new JsTransformer()));

            panto.build().then(() => {
                panto.reportDependencies('javascripts/a.js', 'stylesheets/a.css');
                return panto._onFileDiff({
                    filename: 'stylesheets/a.css',
                    cmd: 'change'
                });
            }).then(() => {
                assert.deepEqual(readInvoked, 3, 'read three times');
                assert.deepEqual(jsInvoked, 3);
            }).then(() => done()).catch(e => console.error(e));
        });
    });
    describe('#loadTransformer', () => {
        it('should load the Transformer', () => {
            const panto = new Panto();
            const Stream = panto.Stream;
            class Foo {}
            panto.loadTransformer('foo', Foo);
            assert.ok(isFunction(new Stream().foo), '"new Stream().foo" is function');
            assert.ok(new Stream().foo() instanceof Stream,
                '"new Stream().foo()" is an instance of "Foo"');
        });
    });
});