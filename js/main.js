require.config({
  paths: {
    'leaflet': 'leaflet/leaflet-src',
    'cartodb': '//libs.cartocdn.com/cartodb.js/v3/cartodb'
  },
  shim: {
    'leaflet': {
      exports: 'L'
    },
    'tilelayer.bing.pull': ['leaflet']
  }
});

require(['lib/app'], function (app) {
  'use strict';

  $(document).ready(function () {
    app.start();
  });
});
