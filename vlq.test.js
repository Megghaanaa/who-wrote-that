import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeVLQ, encodeVLQ } from '../src/vlq.js';

test('known values decode the way the format says', () => {
  assert.deepEqual(decodeVLQ('A'), [0]);
  assert.deepEqual(decodeVLQ('C'), [1]);
  assert.deepEqual(decodeVLQ('D'), [-1]);
  assert.deepEqual(decodeVLQ('gB'), [16]);
  assert.deepEqual(decodeVLQ('hB'), [-16]);
  assert.deepEqual(decodeVLQ('2H'), [123]);
  assert.deepEqual(decodeVLQ('AAgBC'), [0, 0, 16, 1]);
});

test('known values encode the way the format says', () => {
  assert.equal(encodeVLQ(0), 'A');
  assert.equal(encodeVLQ(1), 'C');
  assert.equal(encodeVLQ(-1), 'D');
  assert.equal(encodeVLQ(16), 'gB');
  assert.equal(encodeVLQ(123), '2H');
});

test('encode then decode gives back the same number', () => {
  for (let n = -5000; n <= 5000; n++) {
    assert.deepEqual(decodeVLQ(encodeVLQ(n)), [n], `failed for ${n}`);
  }
});

test('rejects characters that are not Base64', () => {
  assert.throws(() => decodeVLQ('A!'), /Not a Base64 character/);
});

test('rejects a number that is cut off', () => {
  assert.throws(() => decodeVLQ('g'), /middle of a number/);
});
