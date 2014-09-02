define(function (require) {
  'use strict';

  var $ = require('jquery');
  var L = require('leaflet');
  var map = require('lib/map');
  var mt = require('lib/maptiles');

  var app = {};
  app.start = function start() {
    app.map = map.init('map-div');
    window.map = map;
  };

  return app;
});
