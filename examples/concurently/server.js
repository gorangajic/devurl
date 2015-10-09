'use strict';

var http = require('http');
var port = process.env.PORT || 3030;

http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(port);

console.log('Server running at http://localhost:%s/', port);
