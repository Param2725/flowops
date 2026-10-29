import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, createApiClient } from './apiClient.js';

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const setup = (handler, options = {}) => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return handler(calls.length, init);
  };
  const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl, ...options });
  return { client, calls };
};

test('get parses JSON and drops empty query values', async () => {
  const { client, calls } = setup(() => jsonResponse({ ok: true }));
  const data = await client.get('/api/plans', { query: { page: 2, search: '', role: undefined } });
  assert.deepEqual(data, { ok: true });
  assert.equal(calls[0].url, 'http://api.test/api/plans?page=2');
});

test('post sends a JSON body and content type', async () => {
  const { client, calls } = setup(() => jsonResponse({ id: 1 }, 201));
  await client.post('/api/plans', { name: 'Free' });
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.body, JSON.stringify({ name: 'Free' }));
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
});

test('attaches the bearer token when one exists', async () => {
  const { client, calls } = setup(() => jsonResponse({}), { getAccessToken: () => 'tok123' });
  await client.get('/api/users/me');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok123');
});

test('maps the error body to an ApiError', async () => {
  const { client } = setup(() =>
    jsonResponse({ error: { code: 'NOT_FOUND', message: 'No such plan' } }, 404),
  );
  await assert.rejects(client.get('/api/plans/9'), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 404);
    assert.equal(err.code, 'NOT_FOUND');
    assert.equal(err.message, 'No such plan');
    return true;
  });
});

test('returns null for 204 responses', async () => {
  const { client } = setup(() => new Response(null, { status: 204 }));
  assert.equal(await client.delete('/api/keys/1'), null);
});

test('on 401 it refreshes once and retries with the new token', async () => {
  let token = 'old';
  const { client, calls } = setup(
    (n) => (n === 1 ? jsonResponse({}, 401) : jsonResponse({ ok: 1 })),
    {
      getAccessToken: () => token,
      onUnauthorized: async () => {
        token = 'new';
        return true;
      },
    },
  );
  assert.deepEqual(await client.get('/api/keys'), { ok: 1 });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].init.headers.Authorization, 'Bearer new');
});

test('retries only once if the second attempt is also 401', async () => {
  const { client, calls } = setup(() => jsonResponse({ error: { code: 'UNAUTHORIZED' } }, 401), {
    onUnauthorized: async () => true,
  });
  await assert.rejects(client.get('/api/keys'), (err) => err.status === 401);
  assert.equal(calls.length, 2);
});

test('skipAuthRetry never calls onUnauthorized', async () => {
  let called = false;
  const { client } = setup(() => jsonResponse({}, 401), {
    onUnauthorized: async () => {
      called = true;
      return true;
    },
  });
  await assert.rejects(client.post('/api/auth/login', {}, { skipAuthRetry: true }));
  assert.equal(called, false);
});

test('network failures become NETWORK_ERROR', async () => {
  const { client } = setup(() => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(client.get('/health'), (err) => {
    assert.equal(err.code, 'NETWORK_ERROR');
    assert.equal(err.status, 0);
    return true;
  });
});

test('timeouts become TIMEOUT', async () => {
  const { client } = setup(() => {
    throw new DOMException('timed out', 'TimeoutError');
  });
  await assert.rejects(client.get('/health'), (err) => err.code === 'TIMEOUT');
});
