// The `mappings` string, decoded.
//
//   ";"  separates generated lines
//   ","  separates segments within a line
//   each segment is 1, 4 or 5 numbers (all stored as deltas, i.e. relative):
//     [generated column, source index, original line, original column, name index]
//   the generated column resets to 0 on every new line;
//   the other four carry over from the previous segment, even across lines.
import { decodeVLQ, encodeVLQ } from './vlq.js';

// Step 1: letters -> raw numbers (still deltas). Handy for "change one number" demos.
export function parseMappings(mappings) {
  return mappings
    .split(';')
    .map((line) => (line === '' ? [] : line.split(',').map(decodeVLQ)));
}

export function stringifyMappings(raw) {
  return raw.map((line) => line.map((seg) => seg.map(encodeVLQ).join('')).join(',')).join(';');
}

// Step 2: add the deltas up into absolute positions (all zero-based, as in the spec).
export function decodeMappings(mappings) {
  let source = 0;
  let origLine = 0;
  let origCol = 0;
  let name = 0;

  return parseMappings(mappings).map((line) => {
    let genCol = 0; // resets on every generated line
    return line.map((fields) => {
      genCol += fields[0];
      const segment = { genCol };
      if (fields.length >= 4) {
        source += fields[1];
        origLine += fields[2];
        origCol += fields[3];
        Object.assign(segment, { source, origLine, origCol });
        if (fields.length >= 5) {
          name += fields[4];
          segment.name = name;
        }
      }
      return segment;
    });
  });
}

// The reverse: absolute positions -> mappings string. Used to build the example.
export function encodeMappings(lines) {
  let source = 0;
  let origLine = 0;
  let origCol = 0;
  let name = 0;

  const raw = lines.map((line) => {
    let genCol = 0;
    return line.map((seg) => {
      const fields = [seg.genCol - genCol];
      genCol = seg.genCol;
      if (seg.source !== undefined) {
        fields.push(seg.source - source, seg.origLine - origLine, seg.origCol - origCol);
        source = seg.source;
        origLine = seg.origLine;
        origCol = seg.origCol;
        if (seg.name !== undefined) {
          fields.push(seg.name - name);
          name = seg.name;
        }
      }
      return fields;
    });
  });
  return stringifyMappings(raw);
}

// "My app crashed at line L, column C": where is that in the code I wrote?
// Line and column are 1-based, exactly like a stack trace prints them.
export function originalPositionFor(map, line, column) {
  const segments = decodeMappings(map.mappings)[line - 1] ?? [];
  const genCol = column - 1;

  let best = null;
  for (const seg of segments) {
    if (seg.genCol <= genCol && seg.source !== undefined) best = seg;
  }
  if (!best) return null;

  const lines = map.sourcesContent?.[best.source]?.split('\n');
  return {
    source: map.sources[best.source],
    line: best.origLine + 1,
    column: best.origCol + 1,
    name: best.name !== undefined ? map.names[best.name] : null,
    text: lines ? (lines[best.origLine] ?? null) : null, // null = line is past the end of the file
  };
}
