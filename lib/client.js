"use strict";

var controlDemon = require('./controller');

var Client = function(host, url, options) {
  options = options || {};
  this.ttl = 1000;
  this.host = host;
  this.url = url;
  this.init();
};

// empty callback
var noup = function() {};

Client.prototype.add = function() {
  controlDemon.client.call('add', this.host, this.url, noup);
};

Client.prototype.init = function() {
  controlDemon.isAlive(function(alive){
    if (!alive) {
      console.log(
        ['\nproxy demon is not running to run proxy demon type',
         '$ sudo devurl start'].join('\n')
      );
      process.exit(0);
    }
    this.startInterval();
  }.bind(this));
};

Client.prototype.startInterval = function() {
  this.interval = setInterval(function() {
    this.add();
  }.bind(this), this.ttl);
};


Client.prototype.remove = function() {
  controlDemon.client.call('remove', this.host, noup);
};

module.exports = Client;
