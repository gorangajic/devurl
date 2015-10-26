"use strict";

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var axon = require('axon');
var rpc = require('axon-rpc');
var isRoot = require('is-root');
var demonPath = path.join(__dirname, '..', 'bin', 'devurl-proxy');
var _ = require('underscore');
var req = axon.socket('req');
var port = process.env.DEVURL_PORT || 4987;
req.connect(port);
var client = new rpc.Client(req);
var log = path.join(process.env.HOME || process.env.USERPROFILE, '.devurl-err.out');
function isAlive(callback) {
  callback = _.once(callback);
  client.call('ping', function(){
    callback(true);
  });

  setTimeout(function() {
    callback(false);
  }, 1000);
}

exports.isAlive = isAlive;

function spawnDemon(wait, callback) {
  if (typeof wait === "function") {
    callback = wait;
    wait = false;
  }

  var message = [
    "\nplease run command as root",
    "so process can bind on the port 80",
    "and change host files",
    "runing as root is needed only first time to run a demon\n"
  ].join('\n');
  if (!isRoot()) {
    console.log(message);
    process.exit(0);
  }

  var env = process.env;
  var cwd = process.cwd;

  var cpOpt = {
    stdio: ['ignore', 'ignore', fs.openSync(log, 'w')],
    env: env,
    cwd: cwd,
    detached: true
  };
  var args = [demonPath];
  if (wait) {
    args.push('wait');
  }
  var child = spawn(process.execPath, args, cpOpt);
  child.unref();
  callback && callback();
}

exports.spawnDemon = spawnDemon;

function start(wait, callback) {
  if (typeof wait === "function") {
    callback = wait;
    wait = false;
  }

  if (!wait) {
    isAlive(function(alive){
      if (alive) {
        console.log('\ndevurl proxy already running\n');
        callback && callback();
        return false;
      }
      spawnDemon(wait, callback);
    });
    return false;
  }

  spawnDemon(wait, callback);
}

exports.start = start;

function stop(callback) {
  isAlive(function(alive){
    if (!alive) {
      console.log('\ncan\'t stop someting that is not running\n');
      callback && callback();
      return false;
    }
    console.log('\ndevurl proxy stoped\n');
    client.call('kill', callback);
  });
}

exports.stop = stop;

function restart(callback) {
  isAlive(function(alive){
    if (!alive) {
      console.log('\ndevurl proxy demon not running\n');
      callback && callback();
      return false;
    }
    console.log('\ndevurl proxy restarted\n');
    client.call('restart', callback);
  });
}

exports.restart = restart;

exports.client = client;
