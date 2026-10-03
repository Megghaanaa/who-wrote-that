// Decode a source map by hand and print every mapping.
// Usage: node src/inspect.js examples/add.min.js.map
import { readFile } from 'node:fs/promises';
import { decodeMappings, parseMappings } from './mappings.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node src/inspect.js path/to/file.map');
  process.exit(1);
}

const map = JSON.parse(await readFile(file, 'utf8'));
const raw = parseMappings(map.mappings);
const absolute = decodeMappings(map.mappings);

console.log(`mappings: ${map.mappings}\n`);
console.log('generated  ->  original                          (raw deltas)');

absolute.forEach((line, lineIndex) => {
  line.forEach((seg, i) => {
    const from = `${lineIndex + 1}:${seg.genCol + 1}`.padEnd(10);
    const to =
      seg.source === undefined
        ? '(no original position)'
        : `${map.sources[seg.source]}:${seg.origLine + 1}:${seg.origCol + 1}` +
          (seg.name === undefined ? '' : `  ${map.names[seg.name]}`);
    console.log(`${from} ->  ${to.padEnd(30)} [${raw[lineIndex][i].join(', ')}]`);
  });
});
