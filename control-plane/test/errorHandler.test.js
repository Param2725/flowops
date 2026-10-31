import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, NotFoundError } from '@flowops/common';
import { errorHandler } from '../src/middleware/errorHandler.js';

const logger = createLogger({ service: 'test', write: () => {} });

const run = (err, res = {}) => {
  const response = {
    statusCode: 0,
    body: null,
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    ...res,
  };
  let forwarded = null;
  errorHandler(logger)(err, { log: logger }, response, (e) => {
    forwarded = e;
  });
  return { response, forwarded };
};

test('returns the status and body of an AppError', () => {
  const { response } = run(new NotFoundError('No such plan'));
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { error: { code: 'NOT_FOUND', message: 'No such plan' } });
});

test('hides details of unknown errors behind a generic 500', () => {
  const { response } = run(new Error('db password is hunter2'));
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error.code, 'INTERNAL_ERROR');
  assert.equal(response.body.error.message, 'Internal server error');
  assert.ok(!JSON.stringify(response.body).includes('hunter2'));
});

test('delegates to express when headers were already sent', () => {
  const err = new Error('late');
  const { forwarded } = run(err, { headersSent: true });
  assert.equal(forwarded, err);
});
