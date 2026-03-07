import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __testOnlyNormalizeCompactItemNameCandidate,
  __testOnlyPickCompactItemName
} from '../server.js';

test('compact candidate strips brand and model tokens', () => {
  const output = __testOnlyNormalizeCompactItemNameCandidate(
    'HOROW Best Floor Mounted Elongated Seat One Piece Toilet Model HWMT138',
    {
      brand: 'HOROW',
      seller: 'homedepot.com',
      sourceUrl: 'https://www.homedepot.com/p/horow-best-floor-mounted-elongated-seat-one-piece-toilet-model-hwmt138'
    }
  );
  assert.ok(output);
  assert.match(output, /toilet/i);
  assert.doesNotMatch(output, /horow/i);
  assert.doesNotMatch(output, /hwmt138/i);
});

test('final compact name stays short and avoids brand terms', async () => {
  const output = await __testOnlyPickCompactItemName(
    {
      name: 'TOTO Cotton Dual Flush Elongated Standard Height WaterSense Soft Close Toilet 12 In Rough In 1 GPF',
      brand: 'TOTO',
      seller: 'homedepot.com',
      description: 'One-piece elongated toilet with dual flush and soft-close seat.',
      specs: [],
      highlights: []
    },
    'https://www.homedepot.com/p/toto-cotton-dual-flush-elongated-standard-height-watersense-soft-close-toilet-12-in-rough-in-1-gpf'
  );
  assert.ok(output);
  assert.match(output, /toilet/i);
  assert.doesNotMatch(output, /\btoto\b/i);
  assert.ok(output.split(/\s+/).length <= 10);
});
