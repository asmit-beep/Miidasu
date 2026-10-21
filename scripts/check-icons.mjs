import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import assert from 'node:assert/strict';

function checkPng(buffer, size) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(buffer.readUInt32BE(16), size);
  assert.equal(buffer.readUInt32BE(20), size);
  const data = [];
  let ended = false;
  for (let at = 8; at < buffer.length;) {
    assert.ok(at + 12 <= buffer.length, 'Truncated PNG chunk header');
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString('ascii', at + 4, at + 8);
    assert.ok(at + 12 + length <= buffer.length, 'Truncated PNG chunk');
    if (type === 'IDAT') data.push(buffer.subarray(at + 8, at + 8 + length));
    at += length + 12;
    if (type === 'IEND') { ended = true; assert.equal(at, buffer.length); break; }
  }
  assert.ok(ended, 'Missing PNG end marker');
  assert.ok(data.length, 'Missing PNG pixels');
  assert.ok(inflateSync(Buffer.concat(data)).length >= size * size, 'Incomplete PNG pixels');
}

for (const [name, size] of [['favicon-96.png', 96], ['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  checkPng(readFileSync(new URL('../public/' + name, import.meta.url)), size);
}
const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url));
assert.equal(ico.readUInt16LE(2), 1);
assert.equal(ico.readUInt16LE(4), 3);
for (let i = 0; i < 3; i++) {
  const at = 6 + 16 * i;
  const length = ico.readUInt32LE(at + 8);
  const offset = ico.readUInt32LE(at + 12);
  assert.ok(offset + length <= ico.length, 'Truncated ICO frame');
  checkPng(ico.subarray(offset, offset + length), ico[at] || 256);
}
console.log('Favicon checks passed: all PNGs and all three ICO frames decode.');
