import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  decodeMappings,
  encodeMappings,
  originalPositionFor,
  parseMappings,
  stringifyMappings,
} from '../src/mappings.js';

const here = dirname(fileURLToPath(import.meta.url));
const map = JSON.parse(await readFile(join(here, '../examples/add.min.js.map'), 'utf8'));

test('parse then stringify gives back the same string', () => {
  assert.equal(stringifyMappings(parseMappings(map.mappings)), map.mappings);
});

test('decode then encode gives back the same string', () => {
  assert.equal(encodeMappings(decodeMappings(map.mappings)), map.mappings);
});

test('generated column resets on each line, the other fields carry over', () => {
  // line 1: "EAGI" = [2, 0, 3, 4] -> generated column 2, source 0, line 3, column 4
  // line 2: "CACC" = [1, 0, 1, 1] -> generated column 1, then one line and one column further on
  const lines = decodeMappings('EAGI;CACC');
  assert.equal(lines.length, 2);
  assert.equal(lines[0][0].genCol, 2);
  assert.equal(lines[1][0].genCol, 1); // reset, not 2 + 1
  assert.equal(lines[1][0].origLine, lines[0][0].origLine + 1); // carried over
});

test('a crash at the return statement maps to the return statement', () => {
  const hit = originalPositionFor(map, 1, 15);
  assert.equal(hit.source, 'add.js');
  assert.equal(hit.line, 2);
  assert.equal(hit.column, 3);
  assert.equal(hit.text.trim(), 'return value + 1;');
});

test('names come through', () => {
  const hit = originalPositionFor(map, 1, 10); // the `a` in `function a(n)`
  assert.equal(hit.name, 'addOne');
});

test('one wrong delta shifts every later position by the same amount', () => {
  const raw = parseMappings(map.mappings);
  raw[0][3][2] += 3; // bump the original-line delta of the `return` segment
  const lying = { ...map, mappings: stringifyMappings(raw) };

  const honest = originalPositionFor(map, 1, 15);
  const wrong = originalPositionFor(lying, 1, 15);
  assert.equal(wrong.line, honest.line + 3);

  const honestLater = originalPositionFor(map, 1, 28);
  const wrongLater = originalPositionFor(lying, 1, 28);
  assert.equal(wrongLater.line, honestLater.line + 3); // later positions drift too
});

test('a position with no mapping returns null', () => {
  assert.equal(originalPositionFor(map, 5, 1), null);
});
