/*globals define: true */

define(function (require) {
  'use strict';
  var raw = window.location.hash.slice(1);
  return JSON.parse(window.atob(raw));
});
