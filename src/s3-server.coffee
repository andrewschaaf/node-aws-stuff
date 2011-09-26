
fs = require 'fs'
url = require 'url'
https = require 'https'
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
  constructor: () ->
    @server = https.createServer {
      key: fs.readFileSync "#{__dirname}/../ssl-key.pem"
      cert: fs.readFileSync "#{__dirname}/../ssl-cert.pem"
    }, ((req, res) => @handler req, res)
    @storage = new S3MockStorage
  
  listen: (args...) ->
    @server.listen args...
  
  handler: (req, res) ->
    readData req, (data) =>
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
          @storage.put bucket, k, data
          res.writeHead 204, {TODO: "TODO"}
          res.end()
        
        else
          res.writeHead 404, {TODO: "TODO"}
          res.end '404-B'


module.exports =
  S3Server: S3Server
