// Builds examples/add.min.js and add.min.js.map.
//
// HONEST NOTE: this example is hand-made, not produced by a real minifier.
// The minified line is written by hand and the segments below say which piece
// of it came from which place in add.js. A real bundle is a TODO.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { encodeMappings } from '../src/mappings.js';

const here = dirname(fileURLToPath(import.meta.url));
const original = await readFile(join(here, 'add.js'), 'utf8');
const minified = 'function a(n){return n+1}console.log(a(41));';

// [where it sits in the minified line, original line, original column, name index]
// (zero-based). Names: 0 = addOne, 1 = value
const pieces = [
  [minified.indexOf('function'), 0, 0],
  [minified.indexOf('a(n)'), 0, 9, 0],
  [minified.indexOf('(n)') + 1, 0, 16, 1],
  [minified.indexOf('return'), 1, 2],
  [minified.indexOf('n+1'), 1, 9, 1],
  [minified.indexOf('+'), 1, 15],
  [minified.indexOf('+') + 1, 1, 17],
  [minified.indexOf('}'), 2, 0],
  [minified.indexOf('console'), 4, 0],
  [minified.indexOf('(a(') + 1, 4, 12, 0],
  [minified.indexOf('41'), 4, 19],
];

const segments = pieces.map(([genCol, origLine, origCol, name]) => ({
  genCol,
  source: 0,
  origLine,
  origCol,
  ...(name === undefined ? {} : { name }),
}));

const map = {
  version: 3,
  file: 'add.min.js',
  sources: ['add.js'],
  sourcesContent: [original],
  names: ['addOne', 'value'],
  mappings: encodeMappings([segments]),
};

await writeFile(join(here, 'add.min.js'), `${minified}\n//# sourceMappingURL=add.min.js.map\n`);
await writeFile(join(here, 'add.min.js.map'), `${JSON.stringify(map, null, 2)}\n`);
console.log(`Wrote add.min.js and add.min.js.map`);
console.log(`mappings: ${map.mappings}`);
