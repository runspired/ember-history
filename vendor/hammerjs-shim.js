/* globals define, Hammer */

(function() {
  function generateModule(name, values) {
    define(name, [], function() {
      'use strict';

      return values;
    });
  }

  generateModule('hammerjs', Hammer);
})();
