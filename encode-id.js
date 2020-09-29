var base32 = require("base32.js");
var ENCODING_PROTOCOL = "base32hex";

function encodeId(str) {
  var encoder = new base32.Encoder({ type: ENCODING_PROTOCOL, lc: true });
  var buffer = new Buffer.from(str);
  var val = encoder.write(buffer).finalize();
  //console.log(str, "-->", val);
  return val;
}

function decodeId(str) {
  var decoder = new base32.Decoder({ type: ENCODING_PROTOCOL, lc: true });

  var decodedStr = decoder.write(str).finalize().toString();
  return decodedStr;
}

module.exports = {
  encodeId,
  decodeId,
};
