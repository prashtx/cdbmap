require.config({
  paths: {
    'leaflet': 'leaflet/leaflet-src'
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
