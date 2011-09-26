
## S3Server
<pre>
{S3Server} = require 'aws-stuff'

server = new S3Server
server.listen PORT, () ->
  console.log "Listening on #{PORT}..."
</pre>


## S3Client
<pre>
{S3Client} = require 'aws-stuff'

b = new S3Client {
  bucket:     "takin-mah-bukket"
  key:        "..."
  secret:     "..."
  # Optional:
  customUrl:  "https://localhost:12345"
}

# data: Buffer or string (strings get UTF-8 encoded)
b.put k:"k1", data:"v1", (e) ->

b.get k:"k1", (e, data) ->
</pre>
