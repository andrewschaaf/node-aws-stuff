
url = require 'url'
https = require 'https'
crypto = require 'crypto'
{postToS3} = require 's3-post'
_ = require 'underscore'
strftime = require 'strftime'
{readData} = require 'tafa-misc-util'


class S3Client
  
  constructor: ({@customUrl, @bucket, @key, @secret}) ->
    if not @customUrl
      @customUrl = "https://s3.amazonaws.com"
    {protocol, hostname, port} = url.parse @customUrl
    if protocol != "https:"
      throw new Error "customUrl must be https://"
    @host = hostname
    @port = port or 443
  
  #### Shortcuts
  get: (args...) -> @getObject args...
  put: (args...) -> @putObject args...
  list: (args...) -> @getBucket args...
  
  #### [POST Object](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTObjectPOST.html)
  # {AWSAccessKeyId, policy64, signature64, bucket, key, data}
  postObject: (info, callback) ->
    info.data = bufferize info.data
    info.bucket = @bucket
    info.customUrl = @customUrl
    postToS3 info, callback
  
  #### [PUT Object](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTObjectPUT.html)
  # bucket.put k:, data:
  putObject: ({k, data}, callback) ->
    data = bufferize data
    md5 = crypto.createHash('md5').update(data).digest('hex')
    @req 'PUT', {
      path: "/#{k}"
      data:data
      headers:{'Content-MD5':md5}
    }, callback
  
  #### [GET Object](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTObjectGET.html)
  # getObject k:k, (e, res) ->
  getObject: ({k, range}, callback) ->
    @req 'GET', {
      path:"/#{k}"
      range:range
    }, (e, data, res) ->
      if res.statusCode == 404
        callback "404"
      else
        callback null, data
  
  #### [HEAD Object](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTObjectHEAD.html)
  # Same as GET Object, but without a response body.
  headObject: (args...) ->
    getObject args...
  
  #### [DELETE Object](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTObjectDELETE.html)
  deleteObject: ({k}, callback) ->
    @req 'DELETE', path:"/#{k}", callback
  
  #### [GET Bucket](http://docs.amazonwebservices.com/AmazonS3/latest/API/index.html?RESTBucketGET.html)
  # up to 1000
  getBucket: ({delimiter, k__gte, k__prefix, maxKeys}, callback) ->
    @req 'GET', {
      path:"/"
      GET: {
        delimiter: delimiter
        marker: k__gte
        prefix: k__prefix
        'max-keys': maxKeys
      }
    }, (e, res) ->
      return callback e if e
      readText res, (xml) ->
        callback null, {
          xml: xml
        }
  
  req: (method, opt, callback) ->
    opt.method = method
    opt.host = @host
    opt.port = @port
    opt.headers or= {}
    # "Wed, 01 Mar 2009 12:00:00 GMT"
    opt.headers['Host'] = "#{@bucket}.s3.amazonaws.com"
    opt.headers['Date'] = strftime.strftimeUTC("%a, %d %b %Y %H:%M:%S GMT")
    opt.headers['Authorization'] = 'TODO'
    
    if opt.range
      throw new Error "TODO encode Range header"
    
    if opt.data
      reqData = opt.data
      delete opt.data
    else
      reqData = null
    
    req = https.request opt, (res) ->
      if res.statusCode == 204
        callback null, new Buffer [], res
      else
        readData res, (data) -># TODO: error handling
          callback null, data, res
    req.on 'error', (e) ->
      callback e
    if reqData
      req.end reqData
    else
      req.end()

bufferize = (x) ->
  if x instanceof Buffer
    x
  else
    new Buffer x      


# x-amz-storage-class: REDUCED_REDUNDANCY, default:STANDARD (e.g. for PUT req)

module.exports =
  S3Client: S3Client
