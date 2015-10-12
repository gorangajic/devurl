"use strict";

var fs = require('fs');
var rpc = require('axon-rpc');
var axon = require('axon');
var httpProxy = require('http-proxy');
var http = require('http');
var _ = require('underscore');
var os = require('os');
var eol = os.platform() === 'win32' ? '\r\n' : '\n';
var isRoot = require('is-root');
var controller = require('./controller');

function Demon(options) {
  options = options || {};

  this.port = options.port || 4987;
  this.ttl = options.ttl || 1000;
  this.lifetime = 1000 * 60 * 60 * 24 * 3; // 3 days
  this.died = Date.now();
  this.domains = {};
  this.hostsPath = options.hostsPath || '/etc/hosts';
  this.serverOpen = false;
}

Demon.prototype.init = function() {
  this.checkRoot();
  this.initProxy();
  this.initRpc();
  this.refresh();
  this.interval = setInterval(function() {
    this.flush();
  }.bind(this), this.ttl * 2);
};

Demon.prototype.checkRoot = function() {
  if (process.env.NODE_ENV === "test") {
    return false;
  }
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
};

Demon.prototype.initProxy = function() {

  this.proxy = httpProxy.createProxyServer();
  this.server = http.createServer(function(req, res) {
    var host = req.headers.host;
    if (this.domains[host]) {
      this.proxy.web(req, res, { target: this.domains[host].url });
      return;
    }
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Error: hostname ' + host + ' is not found');
  }.bind(this));

  this.proxy.on('error', function(err, req, res){
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err.toString());
  });

};

Demon.prototype.initRpc = function() {
  var rep = axon.socket('rep');
  this.rpcServer = new rpc.Server(rep);
  rep.bind(this.port);
  this.rpcServer.expose({
    ping: this.ping.bind(this),
    add: this.add.bind(this),
    remove: this.remove.bind(this),
    kill: this.kill.bind(this),
    restart: this.restart.bind(this)
  });
};

Demon.prototype.ping = function(ok) {
  ok(null, 'pong');
};

Demon.prototype.add = function(host, url, callback) {
  var alreadyExist = !!this.domains[host];
  this.domains[host] = {
    url: url,
    added: Date.now()
  };
  if (alreadyExist) {
    return false;
  }
  this.addToHosts(host);
  this.refresh(callback);
};

Demon.prototype.remove = function(host, callback) {
  this.domains[host] = undefined;
  delete this.domains[host];
  this.removeFromHosts(host);
  this.refresh(callback);
};

Demon.prototype.refresh = function(callback) {
  var keys = Object.keys(this.domains);
  if (keys.length === 0 && this.serverOpen) {
    this.server.close();
    this.serverOpen = false;
    this.died = Date.now();
  } else if(keys.length > 0 && !this.serverOpen) {
    this.server.listen(80);
    this.serverOpen = true;
    this.died = null;
  }
  this.keysCound = keys.length;
  callback && callback(null, 'ok');
};

Demon.prototype.flush = function() {
  // quit demon if nothing is happening for 2 days
  if (this.died && (this.died + this.lifetime) < Date.now() ) {
    process.exit(0);
  }
  var shouldRefresh = false;

  _.each(this.domains, function(domain, key) {
    if (domain.added + this.ttl < Date.now()) {
      shouldRefresh = true;
      this.removeFromHosts(key);
      delete this.domains[key];
    }
  }, this);

  if (shouldRefresh) {
    this.refresh();
  }
};

Demon.prototype.addToHosts = function(host, callback) {
  fs.readFile(this.hostsPath, 'utf-8', function(err, fileContent) {
    if (err) {
      callback && callback(err);
      return false;
    }
    var lines = fileContent.split(eol);

    var alreadyExist = _.find(lines, function(line) {
      // ignore comments
      if (line.indexOf('#') === 0) {
        return false;
      }

      return line.split(/\s+/g)[1] === host;
    });

    if (alreadyExist) {
      callback && callback();
      return false;
    }

    lines.push('127.0.0.1 ' + host);

    fs.writeFile(this.hostsPath, lines.join(eol), 'utf-8', callback);
  }.bind(this));
};

Demon.prototype.removeFromHosts = function(host, callback) {
  if (typeof host === "undefined") {
    callback && callback();
    return false;
  }
  fs.readFile(this.hostsPath, 'utf-8', function(err, fileContent) {
    if (err) {
      callback && callback(err);
      return false;
    }
    var lines = fileContent.split(eol);
    var deleted = false;
    lines = _.filter(lines, function(line) {
      // ignore comments
      if (line.indexOf('#') === 0) {
        return true;
      }

      if (line.split(/\s+/g)[1] === host) {
        deleted = true;
        return false;
      }
      return true;
    });

    if (!deleted) {
      callback && callback();
      return false;
    }

    fs.writeFile(this.hostsPath, lines.join(eol), 'utf-8', callback);
  }.bind(this));
};

Demon.prototype.kill = function(callback) {
  callback(null, 'die');
  process.exit(0);
};

Demon.prototype.restart = function(callback) {
  controller.spawnDemon(true, function() {
    callback(null);
    process.exit(0);
  });
};

module.exports = Demon;
