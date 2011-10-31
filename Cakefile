
{noisyExec} = require 'tafa-misc-util'


task 'build', () ->
  noisyExec "coffee -co lib src"

task 'dev', () ->
  noisyExec "coffee -cwo lib src"

task 'test', () ->
  require('./test/test').main()

task 'serve', () ->
  port = 9333
  {S3Server} = require './src/s3-server'
  server = new S3Server protocol:'http'
  server.listen port, () ->
    console.log "Listening on #{port}..."

