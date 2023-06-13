const NULL_CODEPOINT = 0x0;
const LINE_FEED_CODEPOINT = 0xa;
const FORM_FEED_CODEPOINT = 0xc;
const CARRIAGE_RETURN_CODEPOINT = 0xd;
const REPLACEMENT_CHAR_CODEPOINT = 0xfffd;
let maybeEnc;
const encoder = () => {
  let enc;
  if (maybeEnc) {
    enc = maybeEnc;
  } else {
    enc = new TextEncoder();
    maybeEnc = enc;
  }
  return enc;
};
export const readCodepoints = (cssStr) => {
  // create encoder if not already created
  const utf8Bytes = encoder().encode(cssStr);
  const codepoints = [];
  const len = utf8Bytes.length;
  for (let i = 0; i < len; i += 1) {
    const byte = utf8Bytes.at(i);
    if (byte < 0x80) {
      // is ascii
      switch (byte) {
        case NULL_CODEPOINT: {
          codepoints.push(REPLACEMENT_CHAR_CODEPOINT);
          break;
        }
        case FORM_FEED_CODEPOINT: {
          codepoints.push(LINE_FEED_CODEPOINT);
          break;
        }
        case CARRIAGE_RETURN_CODEPOINT: {
          codepoints.push(LINE_FEED_CODEPOINT);
          if (utf8Bytes.at(i + 1) === LINE_FEED_CODEPOINT) {
            i += 1;
          }
          break;
        }
        default: {
          codepoints.push(byte);
        }
      }
    } else if (byte < 0b11100000) {
      // read codepoint encoded as 2 byte utf8
      codepoints.push(((byte << 59) >>> 53) | ((utf8Bytes[++i] << 58) >>> 58));
    } else if (byte < 0b11110000) {
      // read codepoint encoded as 3 byte utf8
      codepoints.push(
        ((byte << 60) >>> 48) | ((utf8Bytes[++i] << 58) >>> 52) | ((utf8Bytes[++i] << 58) >>> 58)
      );
    } else {
      // read codepoint encoded as 4 byte utf8
      codepoints.push(
        ((byte << 61) >>> 43) |
          ((utf8Bytes[++i] << 58) >>> 46) |
          ((utf8Bytes[++i] << 58) >>> 52) |
          ((utf8Bytes[++i] << 58) >>> 58)
      );
    }
  }
  return codepoints;
};
