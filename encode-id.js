var base32 = require("base32.js");
var ENCODING_PROTOCOL = "base32hex";
var encoder = new base32.Encoder({ type: ENCODING_PROTOCOL, lc: true });
var decoder = new base32.Decoder({ type: ENCODING_PROTOCOL, lc: true });

function encodeId(str) {
  var buffer = Buffer.from(str);
  var val = encoder.write(buffer).finalize();
  return val;
}

function decodeId(str) {
  var decodedStr = decoder.write(str).finalize().toString();
  return decodedStr;
}

module.exports = {
  encodeId,
  decodeId,
};
