"use strict";

var fs = require('fs');
var path = require('path');
var hostsPath = path.join(__dirname, 'fixtures', 'hosts.txt');
var tmpHosts = path.join(__dirname, 'tmp', 'hosts');
var hostsContent = fs.readFileSync(hostsPath, 'utf-8');
var chai = require("chai");
chai.should();
var Demon = require('../lib/demon');
var _ = require('underscore');

var noup = function() {};

describe('Demon', function() {
  var demon;

  describe('#add', function() {
    beforeEach(function(done) {
      demon = new Demon({hostsPath: tmpHosts, port: 5502, httpPort: 3035});
      demon.init();
      fs.writeFile(tmpHosts, hostsContent, 'utf-8', done);
    });

    afterEach(function(done) {
        demon.cleanup(done);
    });

    it('should add host', function() {
      demon.refresh = noup;
      var host = 'dev.example.com';
      var url = 'http://localhost.com';
      demon.add(host, url);
      demon.domains[host].should.be.present;
      demon.domains[host].url.should.be.equal(url);
      demon.domains[host].added.should.be.closeTo(Date.now(), 100);
    });

    it('should add host to hosts file', function(done) {
      demon.q.push({add: 'dev.example.com'}, function(err) {
        if (err) { return done(err); }
        fs.readFile(tmpHosts, 'utf-8', function(err, content){
          if (err) { return done(err); }
          content.indexOf('dev.example.com').should.be.gt(-1);
          done();
        });
      });
    });


    it('should add 127.0.0.1 as host destination', function(done) {

      demon.q.push({add: 'dev.example.com'}, function(err) {
        if (err) { return done(err); }

        fs.readFile(tmpHosts, 'utf-8', function(err, content){
          if (err) { return done(err); }

          var line = _.find(content.split('\n'), function(line){
            return line.indexOf('dev.example.com') > -1;
          });
          line.indexOf('127.0.0.1').should.be.gt(-1);
          done();
        });

      });

    });

  });

  describe('#removeFromHosts', function() {

    beforeEach(function(done) {
      demon = new Demon({hostsPath: tmpHosts, port: 5502, httpPort: 3035});
      demon.init();
      fs.writeFile(tmpHosts, hostsContent, 'utf-8', function() {
        demon.q.push({ remove: 'dev.example.com' }, function(err) {
          demon.q.push({ remove: 'dev3.example.com' }, function(err) {
            done(err);
          });
        });
      });
    });
    afterEach(function(done) {
      demon.cleanup(done);
    });
    it('should remove host name from the file', function(done) {
      demon.q.push({remove: 'dev.example.com'}, function(err){
        if(err) { return done(err); }

        fs.readFile(tmpHosts, 'utf-8', function(err, content) {
          if(err) { return done(err); }
          content.indexOf('dev.example.com').should.be.equal(-1);
          done();
        });
      });
    });

    it('should remove and add new host in the same time', function(done) {

      var test = _.after(4, function(err) {
        if (err) {
          return done(err);
        }
        fs.readFile(tmpHosts, 'utf-8', function(err, content){
          content.indexOf('dev1.example.com').should.be.not.equal(-1);
          content.indexOf('dev.example.com').should.be.equal(-1);
          done();
        });
      });
      demon.q.push({remove: 'dev.example.com'}, test);
      demon.q.push({remove: 'dev3.example.com'}, test);
      demon.q.push({add:'dev1.example.com'}, test);
      demon.q.push({add:'dev2.example.com'}, test);
    });
  });

  after(function() {
    fs.unlinkSync(tmpHosts);
  });
});


