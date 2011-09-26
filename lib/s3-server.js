(function() {
  var S3MockStorage, S3Server, fs, https, readData, startswith, url;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  fs = require('fs');
  url = require('url');
  https = require('https');
  startswith = require('tafa-misc-util').startswith;
  readData = require('tafa-misc-util').readData;
  S3MockStorage = (function() {
    function S3MockStorage() {
      this.buckets = {};
    }
    S3MockStorage.prototype._bucketItems = function(bucket) {
      if (!this.buckets[bucket]) {
        this.buckets[bucket] = {};
      }
      return this.buckets[bucket];
    };
    S3MockStorage.prototype.put = function(bucket, k, v) {
      return this._bucketItems(bucket)[k] = v;
    };
    S3MockStorage.prototype.get = function(bucket, k) {
      return this._bucketItems(bucket)[k] || null;
    };
    S3MockStorage.prototype.list = function(bucket, GET) {
      var i, k, keys, marker, maxKeys, prefix, _ref;
      if (GET['max-keys']) {
        maxKeys = parseInt(GET['max-keys'], 10);
        if (maxKeys > 1000) {
          throw new Error;
        }
      } else {
        maxKeys = 1000;
      }
      keys = [];
      prefix = GET.prefix, marker = GET.marker;
      _ref = this._bucketItems(bucket);
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        i = _ref[k];
        if (keys.length >= maxKeys) {
          break;
        }
        if (!(prefix && startswith(k, prefix))) {
          continue;
        }
        if (!(marker && k >= marker)) {
          continue;
        }
        keys.push(k);
      }
      throw new Error("XML");
    };
    return S3MockStorage;
  })();
  S3Server = (function() {
    function S3Server() {
      this.server = https.createServer({
        key: fs.readFileSync("" + __dirname + "/../ssl-key.pem"),
        cert: fs.readFileSync("" + __dirname + "/../ssl-cert.pem")
      }, (__bind(function(req, res) {
        return this.handler(req, res);
      }, this)));
      this.storage = new S3MockStorage;
    }
    S3Server.prototype.listen = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.server).listen.apply(_ref, args);
    };
    S3Server.prototype.handler = function(req, res) {
      return readData(req, __bind(function(data) {
        var bucket, k, m, pathname, query, _ref, _ref2;
        m = (_ref = req.headers.host) != null ? _ref.match(/(.*)\.s3\.amazonaws\.com$/) : void 0;
        if (!m) {
          res.writeHead(404, {});
          return res.end('404');
        } else {
          bucket = m[1];
          _ref2 = url.parse(req.url, true), pathname = _ref2.pathname, query = _ref2.query;
          k = pathname.substr(1);
          if (req.method === 'GET') {
            data = this.storage.get(bucket, k);
            if (data) {
              res.writeHead(200, {
                TODO: "TODO"
              });
              return res.end(data);
            } else {
              res.writeHead(404, {
                TODO: "TODO"
              });
              return res.end('404');
            }
          } else if (req.method === 'PUT') {
            this.storage.put(bucket, k, data);
            res.writeHead(204, {
              TODO: "TODO"
            });
            return res.end();
          } else if (req.method === 'POST') {
            this.storage.put(bucket, k, data);
            res.writeHead(204, {
              TODO: "TODO"
            });
            return res.end();
          } else {
            res.writeHead(404, {
              TODO: "TODO"
            });
            return res.end('404-B');
          }
        }
      }, this));
    };
    return S3Server;
  })();
  module.exports = {
    S3Server: S3Server
  };
}).call(this);
