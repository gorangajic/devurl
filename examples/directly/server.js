"use strict";

var http = require('http');
var port = process.env.PORT || 3000;
var url = 'http://localhost:' + port + '/';

http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(port);


if (process.env.NODE_ENV !== "production") {
  var devurl = require('..');
  devurl.add('dev.example.com', url);
  console.log('Server running at http://dev.example.com');
} else {
  console.log('Server running at', url);
}
