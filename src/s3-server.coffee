
_ = require 'underscore'
fs = require 'fs'
url = require 'url'
http = require 'http'
https = require 'https'
parted = require 'parted'
{startswith} = require 'tafa-misc-util'
{readData} = require 'tafa-misc-util'


class S3MockStorage
  constructor: () ->
    @buckets = {}
  
  _bucketItems: (bucket) ->
    if not @buckets[bucket]
      @buckets[bucket] = {}
    @buckets[bucket]
  
  put: (bucket, k, v) ->
    @_bucketItems(bucket)[k] = v
  
  get: (bucket, k) ->
    @_bucketItems(bucket)[k] or null
  
  keysInBucket: (bucket) ->
    _.keys @_bucketItems(bucket)
  
  list: (bucket, GET) ->
    
    if GET['max-keys']
      maxKeys = parseInt GET['max-keys'], 10
      throw new Error if maxKeys > 1000
    else
      maxKeys = 1000
    
    keys = []
    {prefix, marker} = GET
    for own k, i of @_bucketItems bucket
      break if keys.length >= maxKeys
      continue if not (prefix and startswith k, prefix)
      continue if not (marker and k >= marker)
      keys.push k
    
    throw new Error "XML"


class S3Server
  constructor: (@opt={}) ->
    key = fs.readFileSync "#{__dirname}/../ssl-key.pem"
    cert = fs.readFileSync "#{__dirname}/../ssl-cert.pem"
    handler = ((req, res) => @handler req, res)
    if @opt.protocol? == 'http'
      @server = http.createServer handler
    else
      @server = https.createServer key:key, cert:cert, handler
    @storage = new S3MockStorage
  
  listen: (args...) ->
    @server.listen args...
  
  handler: (req, res) ->
    {pathname, query} = url.parse req.url, true
    readData req, (data) =>
      
      if req.url == '/extras/bucket.js'
        keys = @storage.keysInBucket query.bucket
        res.writeHead 200, 'Content-Type':'text/javascript'
        res.end JSON.stringify {
          keys: keys
        }
        return
      
      if @opt.verbose
        s = "[S3Server] #{req.method} #{req.url}"
        if data.length > 0
          s += " [#{data.length}-byte body]"
        console.log s
      
      m = req.headers.host?.match /(.*)\.s3\.amazonaws\.com$/
      if not m
        res.writeHead 404, {}
        res.end '404'
      else
        bucket = m[1]
        {pathname, query} = url.parse req.url, true
        k = pathname.substr 1
        
        # GET Object
        if req.method == 'GET'
          data = @storage.get bucket, k
          if data
            res.writeHead 200, {TODO: "TODO"}
            res.end data
          else
            res.writeHead 404, {TODO: "TODO"}
            res.end '404'
        
        # PUT Object
        else if req.method == 'PUT'
          @storage.put bucket, k, data
          res.writeHead 204, {TODO: "TODO"}
          res.end()
        
        # POST Object
        else if req.method == 'POST'
          parseMultipartData req.headers['content-type'], data, (e, parts) =>
            throw e if e
            
            k = parts.key
            data = parts.file
            # other parts: policy, signature, AWSAccessKeyId
            
            @storage.put bucket, k, data
            res.writeHead 204, {TODO: "TODO"}
            res.end()
        
        else
          res.writeHead 404, {TODO: "TODO"}
          res.end '404-B'


parseMultipartData = (contentType, data, callback) ->
  
  parts = {}
  
  p = new parted contentType, {}
  
  p.on 'error', (e) ->
    callback e
  
  p.on 'part', (field, part) ->
    parts[field] = part
  
  p.on 'data', (bytes) ->
    
  
  p.on 'end', () ->
    path = parts['file']
    fs.readFile path, (e, data) ->
      fs.unlink path, () ->
      return callback e if e
      parts['file'] = data
      callback null, parts
  
  p.write data
  p.end()


module.exports =
  S3Server: S3Server
