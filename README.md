# devurl

> convert your ugly urls dev urls from ```http://localhost:3000``` to ```http://dev.myapp.com```

```
$ npm install -g devurl
```

before get started you need to start devurl proxy, it need to be done as a root because devurl need privilege to listen on port 80 and change hosts file.

> currently it only works with local machine (see issue [#1](https://github.com/gorangajic/devurl/issues/1))

### start devurl proxy demon

```
sudo devurl start
```

### stop devurl proxy demon

```
devurl stop
```

### proxy app 

```
devurl dev.awesomesite.com http://localhost:3000
```

## usage examples

#### with [concurrently](https://www.npmjs.com/package/concurrently)

example package.json

```json
  "scripts": {
    "start-dev": "concurrent \"npm run-script server\" \"npm run-script friendly-url\"",
    "friendly-url": "devurl dev.newapp.com http://localhost:3030",
    "server": "PORT=3030 node server.js"
  },
```


#### using directly

example server.js

```javascript
  var http = require('http');
  var port = process.env.PORT || 3000;
  var url = 'http://localhost:' + port +'/';
  http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
  }).listen(port);


  if (process.env.NODE_ENV != "production") {
    var devurl = require('devurl');
    devurl.add('dev.example.com', url);
    console.log('Server running at http://dev.example.com');
  } else {
    console.log('Server running at', url);
  }

```

## facts

* devurl proxy demon listen on port 80 only if there is active app running
* if proxy demon is not active for more than 3 days it will die automaticly so you need to start it again




