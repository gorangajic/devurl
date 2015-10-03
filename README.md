# devurl
point your dev env app to the friendly url using node-proxy


```
$ npm install -g devurl
```

if you are running devurl for the first time you need to start it using root, because devurl need privilege to listen on port 80 and change hosts file. After first run root demon will be started so next time you can run devurl without sudo


```
sudo devurl dev.awesomesite.com https://localhost:3000
```


