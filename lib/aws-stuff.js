(function() {
  var k, name, v, _i, _len, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty;
  _ref = ['s3-server', 's3-client'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    _ref2 = require("./" + name);
    for (k in _ref2) {
      if (!__hasProp.call(_ref2, k)) continue;
      v = _ref2[k];
      exports[k] = v;
    }
  }
}).call(this);
