
assert = require 'assert'
{signPolicy, postToS3} = require 's3-post'
{S3Client, S3Server} = require '../lib/aws-stuff'
{timeoutSet} = require 'tafa-misc-util'


PORT = 17299
BUCKET = "takin-mah-bukket"


policy = {}
secretKey = "foo"
{signature64, policy64} = signPolicy secretKey, policy
post = (key, data, callback) ->
  if typeof data == 'string'
    data = new Buffer data
  postToS3 {
    key: key
    data: data
    customUrl: "https://localhost:#{PORT}"
    bucket: BUCKET
    signature64: signature64
    policy64: policy64
    AWSAccessKeyId: "satoshi"
  }, callback


throwe = (callback) ->
  (e, args...) ->
    throw e if e
    callback e, args...


main = () ->
  server = new S3Server verbose:true
  server.listen PORT, () ->
    foo = new S3Client customUrl:"https://localhost:#{PORT}", bucket:BUCKET
    
    # POST, GET
    post "k1", "v1", () ->
      foo.get {k:"k1"}, throwe (e, data) ->
        assert.equal data.toString(), "v1"
        
        # PUT, GET
        foo.put {k:"k2", data:"v2"}, throwe (e) ->
          foo.get {k:"k2"}, throwe (e, data) ->
            assert.equal data.toString(), "v2"
            
            # GET 404
            foo.get {k:"404-slkdfbske"}, (e, data) ->
              assert.ok e, "Expected error for key that DNE"
              
              console.log "OK"
              process.exit 0


if not module.parent
  main()

module.exports =
  main: main
