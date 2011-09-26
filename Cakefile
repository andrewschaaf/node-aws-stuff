
{noisyExec} = require 'tafa-misc-util'


task 'build', () ->
  noisyExec "coffee -co lib src"

task 'dev', () ->
  noisyExec "coffee -cwo lib src"

task 'test', () ->
  require('./test/test').main()
