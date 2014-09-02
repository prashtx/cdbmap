/*jslint nomen: true */
/*globals define: true */

define(function (require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');
  var L = require('leaflet');
  var bingLayer = require('tilelayer.bing.pull');
  var settings = require('lib/settings');
  var cdb = require('lib/cdb');

  var exports = {};

  var map, marker;
  var circle = null;
  var markers = {};
  var geoLayerGroup = new L.LayerGroup();

  function geoJSONStyle(defaultColor) {
    if (!defaultColor) {
      defaultColor = 'yellow';
    }
    return function (feature) {
      var color = defaultColor;
      if (feature.properties && feature.properties.color) {
        color = feature.properties.color;
      }
      return {
        opacity: 1,
        fillOpacity: 0.25,
        weight: 3,
        color: color,
        fillColor: color,
        dashArray: '1'
      };
    };
  }

  exports.init = function init(id) {
    console.log('Initializing map');
    map = new L.Map(id, {
      minZoom:8,
      maxZoom:21,
      center: [37.78397752550851, -122.40805864334105],
      zoom: 15
    });
    exports.map = map;

    map.on('click', function (e) {
      console.log([e.latlng.lng, e.latlng.lat]);
    });

    map.addLayer(geoLayerGroup);

    // Add bing maps
    var bing = new L.BingLayer(settings.bing_key, {maxZoom:21, type:'AerialWithLabels'});
    map.addLayer(bing);

    cdb.map = map;

    cdb.updateCDBMap({
      type: 'daterange',
      data: {}
    });
  };

  return exports;
});
