

for name in ['s3-server', 's3-client']
  for own k, v of require("./#{name}")
    exports[k] = v

