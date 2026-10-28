import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger } from '../src/index.js';

const capture = (options) => {
  const lines = [];
  const logger = createLogger({
    service: 'test',
    write: (l) => lines.push(JSON.parse(l)),
    ...options,
  });
  return { logger, lines };
};

test('writes one JSON object with level, service and message', () => {
  const { logger, lines } = capture();
  logger.info('hello', { route: 'orders' });
  assert.equal(lines.length, 1);
  assert.equal(lines[0].level, 'info');
  assert.equal(lines[0].service, 'test');
  assert.equal(lines[0].message, 'hello');
  assert.equal(lines[0].route, 'orders');
  assert.ok(lines[0].time);
});

test('drops lines below the configured level', () => {
  const { logger, lines } = capture({ level: 'warn' });
  logger.debug('a');
  logger.info('b');
  logger.warn('c');
  logger.error('d');
  assert.deepEqual(
    lines.map((l) => l.message),
    ['c', 'd'],
  );
});

test('child logger adds context to every line', () => {
  const { logger, lines } = capture();
  logger.child({ correlationId: 'abc-12345' }).info('request');
  assert.equal(lines[0].correlationId, 'abc-12345');
});

test('serializes Error objects', () => {
  const { logger, lines } = capture();
  logger.error('failed', { err: new Error('boom') });
  assert.equal(lines[0].err.message, 'boom');
  assert.equal(lines[0].err.name, 'Error');
});
