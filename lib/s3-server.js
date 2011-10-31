(function() {
  var S3MockStorage, S3Server, fs, http, https, parseMultipartData, parted, readData, startswith, url, _;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  _ = require('underscore');
  fs = require('fs');
  url = require('url');
  http = require('http');
  https = require('https');
  parted = require('parted');
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
    S3MockStorage.prototype.keysInBucket = function(bucket) {
      return _.keys(this._bucketItems(bucket));
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
    function S3Server(opt) {
      var cert, key, _handler;
      this.opt = opt != null ? opt : {};
      key = fs.readFileSync("" + __dirname + "/../ssl-key.pem");
      cert = fs.readFileSync("" + __dirname + "/../ssl-cert.pem");
      _handler = __bind(function(req, res) {
        return this.handler(req, res);
      }, this);
      if ((this.opt.protocol != null) && this.opt.protocol === 'http') {
        this.server = http.createServer(_handler);
      } else {
        this.server = https.createServer({
          key: key,
          cert: cert
        }, _handler);
      }
      this.storage = new S3MockStorage;
    }
    S3Server.prototype.listen = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.server).listen.apply(_ref, args);
    };
    S3Server.prototype.handler = function(req, res) {
      var keys, pathname, query, _ref;
      _ref = url.parse(req.url, true), pathname = _ref.pathname, query = _ref.query;
      if (pathname === '/extras/bucket.js') {
        keys = this.storage.keysInBucket(query.bucket);
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        res.end(JSON.stringify({
          keys: keys
        }));
        return;
      }
      return readData(req, __bind(function(data) {
        var bucket, k, m, s, _ref2, _ref3;
        if (this.opt.verbose) {
          s = "[S3Server] " + req.method + " " + req.url;
          if (data.length > 0) {
            s += " [" + data.length + "-byte body]";
          }
          console.log(s);
        }
        m = (_ref2 = req.headers.host) != null ? _ref2.match(/(.*)\.s3\.amazonaws\.com$/) : void 0;
        if (!m) {
          res.writeHead(404, {});
          return res.end('404');
        } else {
          bucket = m[1];
          _ref3 = url.parse(req.url, true), pathname = _ref3.pathname, query = _ref3.query;
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
            return parseMultipartData(req.headers['content-type'], data, __bind(function(e, parts) {
              if (e) {
                throw e;
              }
              k = parts.key;
              data = parts.file;
              this.storage.put(bucket, k, data);
              res.writeHead(204, {
                TODO: "TODO"
              });
              return res.end();
            }, this));
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
  parseMultipartData = function(contentType, data, callback) {
    var p, parts;
    parts = {};
    p = new parted(contentType, {});
    p.on('error', function(e) {
      return callback(e);
    });
    p.on('part', function(field, part) {
      return parts[field] = part;
    });
    p.on('data', function(bytes) {});
    p.on('end', function() {
      var path;
      path = parts['file'];
      return fs.readFile(path, function(e, data) {
        fs.unlink(path, function() {});
        if (e) {
          return callback(e);
        }
        parts['file'] = data;
        return callback(null, parts);
      });
    });
    p.write(data);
    return p.end();
  };
  module.exports = {
    S3Server: S3Server
  };
}).call(this);
