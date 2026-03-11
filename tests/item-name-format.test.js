import test from 'node:test';
import assert from 'node:assert/strict';
import { __testOnlyFormatItemName } from '../server.js';

test('Wayfair-like page formats as Product Name by Manufacturer', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Wayfair',
    productTitle: 'Addae',
    brand: 'Wade Logan',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Addae by Wade Logan');
});

test('Home Depot-like multi-brand retailer appends manufacturer', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Home Depot',
    productTitle: 'Colinet Faucet',
    brand: 'Moen',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Colinet Faucet by Moen');
});

test('brand included in title prefix is removed before append', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Wayfair',
    productTitle: 'Wade Logan Addae',
    brand: 'Wade Logan',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Addae by Wade Logan');
});

test('brand included in title suffix is removed before append', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Wayfair',
    productTitle: 'Addae - Wade Logan',
    brand: 'Wade Logan',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Addae by Wade Logan');
});

test('IKEA suppresses redundant by-brand suffix', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'IKEA',
    productTitle: 'Malm Bed Frame',
    brand: 'IKEA',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Malm Bed Frame');
});

test('missing brand returns product title only', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Target',
    productTitle: 'Wood Nightstand',
    brand: '',
    brandConfidence: 0
  });
  assert.equal(output, 'Wood Nightstand');
});

test('low-confidence or noisy brand is suppressed', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Amazon',
    productTitle: 'Floor Lamp',
    brand: 'B0CQZJ1234',
    brandConfidence: 0.2
  });
  assert.equal(output, 'Floor Lamp');
});

test('spec-heavy title compacts to model when brand is known', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Wayfair',
    productTitle: 'Wade Logan Addae 15.7 In 3 Light Indoor Flush Mount',
    brand: 'Wade Logan',
    brandConfidence: 0.95
  });
  assert.equal(output, 'Addae by Wade Logan');
});

test('fallback strips measurements/light-count/model and keeps short descriptive name', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Home Depot',
    productTitle: '17 in. 2-Lights White Linen Flush Mount with Acrylic Diffuser CA2183-FM',
    brand: '',
    brandConfidence: 0
  });
  assert.equal(output, 'White Linen Flush Mount');
  assert.ok(output.split(/\s+/).length <= 4);
});

test('fallback prefers finish + product type for long technical titles', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'Lowes',
    productTitle: '24 in. Brushed Brass Modern LED Wall Sconce',
    brand: '',
    brandConfidence: 0
  });
  assert.equal(output, 'Brushed Brass Wall Sconce');
  assert.ok(output.split(/\s+/).length <= 4);
});

test('B&H keeps full extracted product title instead of compact fallback', () => {
  const output = __testOnlyFormatItemName({
    sellerName: 'bhphotovideo.com',
    productTitle: 'amaran COB 200x S Bi-Color LED Monolight',
    brand: 'amaran',
    brandConfidence: 0.95
  });
  assert.equal(output, 'amaran COB 200x S Bi-Color LED Monolight');
});
