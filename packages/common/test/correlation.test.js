import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateCorrelationId, resolveCorrelationId } from '../src/index.js';

test('generateCorrelationId returns unique values', () => {
  assert.notEqual(generateCorrelationId(), generateCorrelationId());
});

test('resolveCorrelationId keeps a safe incoming id', () => {
  assert.equal(resolveCorrelationId('req-12345678'), 'req-12345678');
});

test('resolveCorrelationId replaces unsafe or missing ids', () => {
  const bad = ['{"x":1}\nINJECT', 'short', '', undefined, 123];
  for (const value of bad) {
    const id = resolveCorrelationId(value);
    assert.notEqual(id, value);
    assert.match(id, /^[A-Za-z0-9_-]{8,64}$/);
  }
});
