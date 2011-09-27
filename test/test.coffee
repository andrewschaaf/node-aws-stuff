
assert = require 'assert'
{signPolicy, postToS3} = require 's3-post'
{S3Client, S3Server} = require '../lib/aws-stuff'
{timeoutSet} = require 'tafa-misc-util'


PORT = 17299


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
    bucket: "mah-bukket"
    signature64: signature64
    policy64: policy64
    AWSAccessKeyId: "satoshi"
  }, callback


main = () ->
  server = new S3Server verbose:true
  server.listen PORT, () ->
    foo = new S3Client customUrl:"https://localhost:#{PORT}", bucket:"foo"
    post "k1", "v1", () ->
      
      foo.put k:"k1", data:"v1", (e) ->
        foo.get k:"k1", (e, data) ->
          assert.equal data.toString(), "v1"
          
          foo.get k:"404-slkdfbske", (e, data) ->
            assert.ok e, "Expected error for key that DNE"
            
            console.log "OK"
            process.exit 0


if not module.parent
  main()

module.exports =
  main: main
