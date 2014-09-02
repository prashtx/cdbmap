/*jslint nomen: true */
/*globals define: true */

define(function (require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');
  var L = require('leaflet');
  var Promise = require('bluebird');
  var bingLayer = require('tilelayer.bing.pull');
  var settings = require('lib/settings');

  var exports = {};

  var map, marker;
  var circle = null;
  var markers = {};
  var geoLayerGroup = new L.LayerGroup();
  var cdbLayer;

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

    exports.updateCDBMap({ data: { size: 11 } });
    window.go = function go(a, b, type, size) {
      var url;
      if (type) {
        url = exports.urls[type];
      }
      if (size === undefined) {
        size = 11;
      }
      exports.updateCDBMap({
        url: url,
        data: {
          day_min: a,
          day_max: a + b,
          size: size
        }
      });
    };
  };

  exports.urls = {
    day: 'http://prashtx.cartodb.com/api/v1/map/named/prashtx@fourweeks_byday',
    hour: 'http://prashtx.cartodb.com/api/v1/map/named/prashtx@fourweeks_byhour'
  };

  exports.updateCDBMap = function (options) {
    var url = options.url;
    if (!url) {
      url = exports.urls.hour;
    }

    return Promise.resolve($.ajax({
      url: url,
      method: 'POST',
      crossOrigin: true,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(options.data)
    })).then(function (data) {
      var url = 'http://prashtx.cartodb.com/api/v1/map/' + data.layergroupid + '/{z}/{x}/{y}.png';
      if (cdbLayer) {
        cdbLayer.setUrl(url);
      } else {
        cdbLayer = new L.tileLayer(url);
        map.addLayer(cdbLayer);
      }
    }).catch(function (error) {
      console.log(error);
      console.log(error.statusText);
    });
  };

  function createFeatureCollection(data, options) {
    var features;
    var color;
    if (options) {
      color = options.color;
    }

    if (data.type === 'FeatureCollection') {
      features = data.features;
    } else if (data.type === 'Feature') {
      if (color) {
        data.properties.color = color;
      }
      features = [data];
    } else {
      features = [{
        type: 'Feature',
        geometry: data,
        properties: { color: color }
      }];
    }
    var fc = {
      type: 'FeatureCollection',
      features: features
    };

    return fc;
  }

  exports.addGeoJSON = function (data, color) {
    var geoJSONLayer = new L.geoJson(createFeatureCollection(data), {
      style: geoJSONStyle(color)
    });

    // Add the layer to the layergroup.
    geoLayerGroup.addLayer(geoJSONLayer);
    map.fitBounds(geoJSONLayer.getBounds());
  };

  exports.pullGeoJSON = function (file) {
    var url = 'js/data/';
    if (file) {
      url += file;
    } else {
      url += 'parcels-geo.json';
    }
    $.ajax({
      url: url
    }).done(function (featureCollection) {
      exports.addGeoJSON(featureCollection);
    });
  };

  exports.plotBBox = function (bbox) {
    var layer = L.rectangle([[bbox[0][1], bbox[0][0]], [bbox[1][1], bbox[1][0]]], {color: "#ff7800", weight: 1});
    map.addLayer(layer);
    map.fitBounds(layer.getBounds());
  };

  exports.addFeatureAPI = function addFeatureAPI(url) {
    var group = L.layerGroup();
    map.addLayer(group);

    function addRemoteLayer() {
      var bounds = map.getBounds();
      $.ajax({
        url: url.replace('{{bbox}}', bounds.toBBoxString())
      }).then(function (data) {
        var geoJSONLayer = L.geoJson(createFeatureCollection(data, { color: 'blue' }), {
          style: geoJSONStyle('blue')
        });

        // Add the layer to the layergroup.
        group.clearLayers();
        group.addLayer(geoJSONLayer);
      }).fail(function () {
        console.error('Failed to retrieve objects for bounding box ' + bounds.toBBoxString());
        console.log(arguments);
      });
    }

    map.on('moveend', function (e) {
      addRemoteLayer();
    });

    addRemoteLayer();
  };

  return exports;
});
