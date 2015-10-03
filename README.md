# devurl

> convert your ugly urls dev urls from ```http://localhost:3000``` to ```http://dev.myapp.com```

```
$ npm install -g devurl
```

if you are running devurl for the first time you need to start it using root, because devurl need privilege to listen on port 80 and change hosts file. After first run root demon will be started so next time you can run devurl without sudo


```
sudo devurl dev.awesomesite.com https://localhost:3000
```


### usage examples

#### with [concurrently](https://www.npmjs.com/package/concurrently)

example package.json

```json
  "scripts": {
    "start-dev": "concurrent "npm run-script server" "npm run-script friendly-url",
    "friendly-url": "devurl dev.newapp.com https://localhost:3000",
    "server": "node server.js --port 3000"
  }
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


