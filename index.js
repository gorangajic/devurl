var Client = require('./client');

var clients = {};

exports.add = function(host, url) {
  if (clients[host]) {
    clients[host].remove();
  }

  clients[host] = new Client(host, url);
};


exports.remove = function(host) {
  if (client[hosts]) {
    clients[hosts].remove();
    delete clients[hosts];
  }
};
