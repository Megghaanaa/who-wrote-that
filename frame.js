// Frame the map: change ONE number and watch the debugger lie with total confidence.
// Usage: node src/frame.js
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { originalPositionFor, parseMappings, stringifyMappings } from './mappings.js';

const here = dirname(fileURLToPath(import.meta.url));
const map = JSON.parse(await readFile(join(here, '../examples/add.min.js.map'), 'utf8'));

// Two "crashes": the `return` and the `console.log` call.
const crashes = [
  { label: 'the return statement', line: 1, column: 15 },
  { label: 'the console.log call', line: 1, column: 28 },
];

function show(title, theMap) {
  console.log(title);
  for (const { label, line, column } of crashes) {
    const hit = originalPositionFor(theMap, line, column);
    const where = hit ? `${hit.source}:${hit.line}:${hit.column}` : 'nowhere';
    const text = hit ? (hit.text ?? '(past the end of the file!)') : '';
    console.log(`  crash at ${line}:${column} (${label}) -> ${where}   ${text}`);
  }
  console.log('');
}

show('THE HONEST MAP', map);

// Take the raw deltas and bump a single number: the "original line" field of segment 4.
const raw = parseMappings(map.mappings);
raw[0][3][2] += 3;
const lying = { ...map, mappings: stringifyMappings(raw) };

show('THE SAME MAP, ONE NUMBER CHANGED', lying);

// Show exactly which letters changed.
const a = map.mappings;
const b = lying.mappings;
console.log(`before: ${a}`);
console.log(`after:  ${b}`);
console.log(`        ${[...b].map((ch, i) => (ch === a[i] ? ' ' : '^')).join('')}`);
console.log('\nOne edit, and every position after it is off by the same amount.');
console.log('Nothing warned us. The map is still perfectly valid.');
