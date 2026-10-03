<p align="center">
  <img src="icon.svg" width="120" alt="A long strip of minified code with one block pointing to a neat line of original code">
</p>

<h1 align="center">🗺️ Line 1, Column 48,213: Who Wrote That?</h1>

<p align="center">
  <em>Decoding source maps by hand: Base64 VLQ, delta-encoded mappings, and what happens when one number is wrong.</em>
</p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-work%20in%20progress-orange">
  <img alt="node" src="https://img.shields.io/badge/node-%3E%3D18-brightgreen">
  <img alt="javascript" src="https://img.shields.io/badge/made%20with-JavaScript-f7df1e">
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-none-blue">
</p>

> 🚧 **Work in progress** for a conference talk proposal. The core decoder works and is tested, but the example map is hand-made, not from a real build. The checklist below shows exactly what is done.

## 🔍 The idea

Your app crashed at line 1, column 48,213. Nobody wrote that line, nobody can read it, and yet your debugger finds your code anyway.

The secret is the source map: a JSON file whose `mappings` string looks like a cat walked across the keyboard. It is Base64 VLQ, with each position stored as a delta from the previous one. This project decodes one by hand, then breaks one on purpose.

## 🗺️ The investigation

1. **Visit the crime scene.** Take a minified file and its source map, and pin down the crash position.
2. **Crack the code.** A tiny Base64 VLQ decoder turns letters into numbers (`src/vlq.js`).
3. **Follow the deltas.** Walk the `mappings` one segment at a time until we land on the original file, line and column (`src/mappings.js`).
4. **Frame the map.** Change a single number and watch the lookup point at the wrong line, and every later position drift too (`src/frame.js`).

## ✅ Status

- [x] Project set up
- [x] ✅ Base64 VLQ encoder and decoder, with tests
- [x] ✅ Decode `mappings` into absolute positions, with tests
- [x] ✅ Look up the original position for a crash position
- [x] ✅ "Frame the map" demo: one changed number moves every later position
- [x] ✅ Command-line tools to decode a map and look up a position
- [ ] Run it on a real minified bundle from a real build (the example here is hand-made)
- [ ] Detect a map that is valid but doesn't match its bundle
- [ ] Check the decoder against the examples in the ECMA-426 spec

## ▶️ Run it

Needs [Node.js](https://nodejs.org) 18 or newer. There are no dependencies to install.

```bash
git clone https://github.com/<your-username>/who-wrote-that.git
cd who-wrote-that

# Decode every mapping in the example, with the raw deltas
npm run decode

# Where was the code that crashed at line 1, column 15?
npm run lookup

# Break the map with one changed number
npm run frame

# Run the tests
npm test
```

You can point the tools at any source map: `node src/lookup.js path/to/file.map LINE COLUMN`. Line and column are 1-based, like a stack trace.

## 📁 What's here

| Path | What it does |
| --- | --- |
| `src/vlq.js` | Base64 VLQ encode and decode |
| `src/mappings.js` | Parse and decode the `mappings` string, and look up an original position |
| `src/inspect.js` | Print every mapping in a source map |
| `src/lookup.js` | "Crashed at line L, column C. Who wrote that?" |
| `src/frame.js` | The one-wrong-number demo |
| `examples/` | A tiny hand-made bundle, its source map, and the script that builds them |
| `test/` | Tests for the decoder and the lookup |
| `assets/icon.svg` | The icon above |

## ⚠️ Honest notes

- The example in `examples/` is **hand-made**: I wrote the minified line myself and described which part came from where. It is not the output of a real minifier.
- A source map can be perfectly valid and still be wrong, for example if it belongs to a different build. Detecting that is still on the checklist.

## 📚 Learn more

Source maps have an official specification, ECMA-426, published by Ecma International.

## 🧭 Notes

Personal project, made in my own time using public specs.
