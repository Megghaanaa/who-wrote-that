// "My app crashed at line L, column C. Who wrote that?"
// Usage: node src/lookup.js examples/add.min.js.map 1 15
import { readFile } from 'node:fs/promises';
import { originalPositionFor } from './mappings.js';

const [file, line, column] = process.argv.slice(2);
if (!file || !line || !column) {
  console.error('Usage: node src/lookup.js path/to/file.map LINE COLUMN');
  process.exit(1);
}

const map = JSON.parse(await readFile(file, 'utf8'));
const hit = originalPositionFor(map, Number(line), Number(column));

console.log(`Crash at ${line}:${column} in the minified file`);
if (!hit) {
  console.log('No mapping found for that position.');
} else {
  console.log(`Written at ${hit.source}:${hit.line}:${hit.column}${hit.name ? `  (${hit.name})` : ''}`);
  console.log(`  ${hit.text ?? '(that line does not exist in the original file)'}`);
}
