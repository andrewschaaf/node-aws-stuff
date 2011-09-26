(function() {
  var S3Client, bufferize, crypto, https, postToS3, readData, strftime, url, _;
  var __slice = Array.prototype.slice;
  url = require('url');
  https = require('https');
  crypto = require('crypto');
  postToS3 = require('s3-post').postToS3;
  _ = require('underscore');
  strftime = require('strftime');
  readData = require('tafa-misc-util').readData;
  S3Client = (function() {
    function S3Client(_arg) {
      var hostname, port, protocol, _ref;
      this.customUrl = _arg.customUrl, this.bucket = _arg.bucket, this.key = _arg.key, this.secret = _arg.secret;
      if (!this.customUrl) {
        this.customUrl = "https://s3.amazonaws.com";
      }
      _ref = url.parse(this.customUrl), protocol = _ref.protocol, hostname = _ref.hostname, port = _ref.port;
      if (protocol !== "https:") {
        throw new Error("customUrl must be https://");
      }
      this.host = hostname;
      this.port = port || 443;
    }
    S3Client.prototype.get = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.getObject.apply(this, args);
    };
    S3Client.prototype.put = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.putObject.apply(this, args);
    };
    S3Client.prototype.list = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.getBucket.apply(this, args);
    };
    S3Client.prototype.postObject = function(info, callback) {
      info.data = bufferize(info.data);
      info.bucket = this.bucket;
      info.customUrl = this.customUrl;
      return postToS3(info, callback);
    };
    S3Client.prototype.putObject = function(_arg, callback) {
      var data, k, md5;
      k = _arg.k, data = _arg.data;
      data = bufferize(data);
      md5 = crypto.createHash('md5').update(data).digest('hex');
      return this.req('PUT', {
        path: "/" + k,
        data: data,
        headers: {
          'Content-MD5': md5
        }
      }, callback);
    };
    S3Client.prototype.getObject = function(_arg, callback) {
      var k, range;
      k = _arg.k, range = _arg.range;
      return this.req('GET', {
        path: "/" + k,
        range: range
      }, function(e, data, res) {
        if (res.statusCode === 404) {
          return callback("404");
        } else {
          return callback(null, data);
        }
      });
    };
    S3Client.prototype.headObject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return getObject.apply(null, args);
    };
    S3Client.prototype.deleteObject = function(_arg, callback) {
      var k;
      k = _arg.k;
      return this.req('DELETE', {
        path: "/" + k
      }, callback);
    };
    S3Client.prototype.getBucket = function(_arg, callback) {
      var delimiter, k__gte, k__prefix, maxKeys;
      delimiter = _arg.delimiter, k__gte = _arg.k__gte, k__prefix = _arg.k__prefix, maxKeys = _arg.maxKeys;
      return this.req('GET', {
        path: "/",
        GET: {
          delimiter: delimiter,
          marker: k__gte,
          prefix: k__prefix,
          'max-keys': maxKeys
        }
      }, function(e, res) {
        if (e) {
          return callback(e);
        }
        return readText(res, function(xml) {
          return callback(null, {
            xml: xml
          });
        });
      });
    };
    S3Client.prototype.req = function(method, opt, callback) {
      var req, reqData;
      opt.method = method;
      opt.host = this.host;
      opt.port = this.port;
      opt.headers || (opt.headers = {});
      opt.headers['Host'] = "" + this.bucket + ".s3.amazonaws.com";
      opt.headers['Date'] = strftime.strftimeUTC("%a, %d %b %Y %H:%M:%S GMT");
      opt.headers['Authorization'] = 'TODO';
      if (opt.range) {
        throw new Error("TODO encode Range header");
      }
      if (opt.data) {
        reqData = opt.data;
        delete opt.data;
      } else {
        reqData = null;
      }
      req = https.request(opt, function(res) {
        if (res.statusCode === 204) {
          return callback(null, new Buffer([], res));
        } else {
          return readData(res, function(data) {
            return callback(null, data, res);
          });
        }
      });
      req.on('error', function(e) {
        return callback(e);
      });
      if (reqData) {
        return req.end(reqData);
      } else {
        return req.end();
      }
    };
    return S3Client;
  })();
  bufferize = function(x) {
    if (x instanceof Buffer) {
      return x;
    } else {
      return new Buffer(x);
    }
  };
  module.exports = {
    S3Client: S3Client
  };
}).call(this);
