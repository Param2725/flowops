import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, NotFoundError, TooManyRequestsError } from '../src/index.js';

test('NotFoundError has status 404 and default message', () => {
  const err = new NotFoundError();
  assert.equal(err.statusCode, 404);
  assert.equal(err.code, 'NOT_FOUND');
  assert.equal(err.message, 'Resource not found');
  assert.equal(err.name, 'NotFoundError');
});

test('subclasses are instances of AppError and Error', () => {
  const err = new TooManyRequestsError('slow down', { retryAfter: 5 });
  assert.ok(err instanceof AppError);
  assert.ok(err instanceof Error);
  assert.equal(err.statusCode, 429);
});

test('toResponse returns the public error shape', () => {
  const err = new NotFoundError('User not found', { id: '42' });
  assert.deepEqual(err.toResponse(), {
    error: { code: 'NOT_FOUND', message: 'User not found', details: { id: '42' } },
  });
});

test('toResponse omits details when none given', () => {
  assert.deepEqual(new NotFoundError().toResponse(), {
    error: { code: 'NOT_FOUND', message: 'Resource not found' },
  });
});
