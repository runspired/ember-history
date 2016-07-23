/* jshint node:true */
/* global module, process */
'use strict';

var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'history',

  isDevelopingAddon: function() {
    return true;
  },

  treeForVendor: function(tree) {
    var packagePath = path.dirname(require.resolve('hammerjs'));
    var packageTree = new Funnel(this.treeGenerator(packagePath), {
      srcDir: '/',
      destDir: 'hammerjs'
    });
    return mergeTrees([tree, packageTree]);
  },

  included: function(app) {
    this._super.included(app);

    while (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.importDependencies(app);
  },

  importDependencies: function(app) {
    app.import('vendor/hammerjs/hammer.js');
    app.import('vendor/hammerjs-shim.js');
  }
};
