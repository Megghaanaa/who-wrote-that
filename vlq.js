// Base64 VLQ: how a source map squeezes a number into a few letters.
//
// A number is split into 5-bit chunks. The lowest bit of the first chunk is the sign.
// Bit 6 (value 32) of each Base64 digit means "more digits follow".

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function encodeVLQ(value) {
  let v = value < 0 ? (-value << 1) | 1 : value << 1;
  let out = '';
  do {
    let digit = v & 31;
    v >>>= 5;
    if (v > 0) digit |= 32; // continuation bit
    out += CHARS[digit];
  } while (v > 0);
  return out;
}

// Decodes a string like "AAgBC" into its list of numbers: [0, 0, 16, 1]
export function decodeVLQ(text) {
  const values = [];
  let shift = 0;
  let result = 0;

  for (const char of text) {
    const digit = CHARS.indexOf(char);
    if (digit === -1) throw new Error(`Not a Base64 character: "${char}"`);

    result += (digit & 31) << shift;
    if (digit & 32) {
      shift += 5; // more digits to come
    } else {
      const magnitude = result >>> 1;
      values.push((result & 1 ? -magnitude : magnitude) || 0); // `|| 0` avoids -0
      result = 0;
      shift = 0;
    }
  }

  if (shift !== 0) throw new Error('Ran out of letters in the middle of a number');
  return values;
}
