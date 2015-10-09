"use strict";

var Client = require('./lib/client');
var controller = require('./lib/controller');
var clients = {};

exports.add = function(host, url) {
  if (clients[host]) {
    clients[host].remove();
  }

  clients[host] = new Client(host, url);
};

exports.remove = function(host) {
  if (clients[host]) {
    clients[host].remove();
    delete clients[host];
  }
};

exports.stop = function(callback) {
  controller.stop(callback);
};

exports.start = function(callback) {
  controller.start(callback);
};

exports.restart = function(callback) {
  controller.restart(callback);
};
