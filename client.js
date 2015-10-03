var spawn = require('child_process').spawn;
var path = require('path');
var _ = require('underscore');
var rpc = require('axon-rpc');
var axon = require('axon');
var isRoot = require('is-root');

var Client = function(host, url, options) {
  var req = axon.socket('req');

  options = options || {};

  this.port = options.port || 4987;
  this.ttl = 1000;
  this.host = host;
  this.url = url;
  this.clientRpc = new rpc.Client(req);
  req.connect(this.port);
  this.init();
};

Client.prototype.add = function() {
  this.clientRpc.call('add', this.host, this.url, function() {});
};

Client.prototype.isAlive = function(callback) {
  callback = _.once(callback);
  this.clientRpc.call('ping', function(err, reply){
    callback(true);
  });

  setTimeout(function() {
    callback(false);
  }, 1000);
};

Client.prototype.init = function() {
  this.isAlive(function(alive){
    if (!alive) {
      this.spawnDemon();
    }
    this.startInterval();
  }.bind(this));
};

Client.prototype.startInterval = function() {
  this.interval = setInterval(function() {
    this.add();
  }.bind(this), this.ttl);
};

Client.prototype.spawnDemon = function() {
  var message = [
    "please run command as root",
    "so process can bind on the port 80",
    "and change host files",
    "runing as root is needed only first time to run a demon"
  ].join('\n');
  if (!isRoot()) {
    console.log(message);
    process.exit(0);
  }
  var stdout = 'ignore';
  var stderr = 'ignore';
  var env = process.env;
  var cwd = process.cwd;

  var cp_opt = {
    stdio: ['ignore', 'ignore', 'ignore'],
    env: env,
    cwd: cwd,
    detached: true
  };

  var demonPath = path.join(__dirname, 'demon.js');
  var child = spawn(process.execPath, [demonPath], cp_opt);
  child.unref();
};


Client.prototype.remove = function() {
  this.clientRpc.call('remove', this.host, function() {});
};

module.exports = Client;
