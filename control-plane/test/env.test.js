import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEnv } from '../src/config/env.js';

test('applies defaults', () => {
  const env = loadEnv({ MONGO_URI: 'mongodb://x/y' });
  assert.equal(env.port, 4000);
  assert.equal(env.nodeEnv, 'development');
  assert.equal(env.logLevel, 'info');
  assert.deepEqual(env.corsOrigins, ['http://localhost:5173']);
});

test('splits and trims multiple cors origins', () => {
  const env = loadEnv({ MONGO_URI: 'mongodb://x/y', CORS_ORIGIN: 'http://a.test, http://b.test ' });
  assert.deepEqual(env.corsOrigins, ['http://a.test', 'http://b.test']);
});

test('throws when MONGO_URI is missing', () => {
  assert.throws(() => loadEnv({}), /MONGO_URI is required/);
});

test('throws on an invalid port', () => {
  assert.throws(() => loadEnv({ MONGO_URI: 'mongodb://x/y', PORT: 'abc' }), /Invalid PORT/);
  assert.throws(() => loadEnv({ MONGO_URI: 'mongodb://x/y', PORT: '70000' }), /Invalid PORT/);
});
