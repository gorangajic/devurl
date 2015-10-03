#!/usr/bin/env node


var devurl = require('../');


if (process.argv.length < 4) {
  console.log("----");
  console.log("==> Help");
  console.log("==> point your dev env app to the friendly url without ports using node-proxy");
  console.log('==> example usage:')
  console.log('==> devurl dev.yourawesomesite.com http://localhost:5000');
  console.log('----');
  process.exit();
}

var host = process.argv[2];
var url = process.argv[3];

devurl.add(host, url);
console.log("----");
console.log('==> proxying request %s => %s', 'http://' + host + '/', url);
console.log('----');
