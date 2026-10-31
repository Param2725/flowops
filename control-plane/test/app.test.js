import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

let server;

before(async () => {
  server = await startTestServer();
});

after(async () => {
  await server.close();
});

test('GET /health returns ok', async () => {
  const res = await fetch(`${server.baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'control-plane');
});

test('GET /ready returns 503 when the database is not connected', async () => {
  const res = await fetch(`${server.baseUrl}/ready`);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { status: 'unavailable', database: 'disconnected' });
});

test('generates a correlation id when none is sent', async () => {
  const res = await fetch(`${server.baseUrl}/health`);
  assert.match(res.headers.get('x-correlation-id'), /^[A-Za-z0-9_-]{8,64}$/);
});

test('echoes a safe incoming correlation id', async () => {
  const res = await fetch(`${server.baseUrl}/health`, {
    headers: { 'x-correlation-id': 'trace-abc12345' },
  });
  assert.equal(res.headers.get('x-correlation-id'), 'trace-abc12345');
});

test('replaces an unsafe incoming correlation id', async () => {
  const res = await fetch(`${server.baseUrl}/health`, {
    headers: { 'x-correlation-id': 'bad id!' },
  });
  assert.notEqual(res.headers.get('x-correlation-id'), 'bad id!');
});

test('unknown routes return a JSON 404', async () => {
  const res = await fetch(`${server.baseUrl}/nope`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('invalid JSON bodies return a 400', async () => {
  const res = await fetch(`${server.baseUrl}/health`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{bad',
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'BAD_REQUEST');
});

test('cors allows the configured origin and blocks others', async () => {
  const allowed = await fetch(`${server.baseUrl}/health`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const blocked = await fetch(`${server.baseUrl}/health`, {
    headers: { Origin: 'http://evil.test' },
  });
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
});

test('logs one structured line per request with the correlation id', async () => {
  const res = await fetch(`${server.baseUrl}/health`, {
    headers: { 'x-correlation-id': 'trace-log12345' },
  });
  await res.text();
  await new Promise((resolve) => setTimeout(resolve, 25));

  const line = server.logs.find(
    (entry) => entry.message === 'request completed' && entry.correlationId === 'trace-log12345',
  );
  assert.ok(line, 'expected a request log line');
  assert.equal(line.method, 'GET');
  assert.equal(line.path, '/health');
  assert.equal(line.status, 200);
});

test('serves the static page from /public', async () => {
  const res = await fetch(`${server.baseUrl}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
});
