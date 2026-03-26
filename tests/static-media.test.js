import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDataService, createServer } from '../server.js';

async function startServer(databasePath) {
  const created = createServer({ databasePath });
  const server = created.server;
  const port = await new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve(typeof address === 'object' && address ? address.port : 0);
    });
  });
  assert.ok(port > 0);
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`
  };
}

test('static MP4 responses advertise video content type and support byte ranges', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-static-media-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const started = await startServer(databasePath);
    server = started.server;

    const response = await fetch(`${started.baseUrl}/media/sequence-01.mp4`, {
      headers: {
        Range: 'bytes=0-31'
      }
    });

    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.match(String(response.headers.get('content-range') || ''), /^bytes 0-31\/\d+$/);

    const payload = new Uint8Array(await response.arrayBuffer());
    assert.equal(payload.length, 32);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('static MP4 responds to HEAD requests with video headers', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-static-media-head-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const started = await startServer(databasePath);
    server = started.server;

    const response = await fetch(`${started.baseUrl}/media/sequence-01.mp4`, {
      method: 'HEAD'
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.ok(Number(response.headers.get('content-length')) > 0);

    const payload = new Uint8Array(await response.arrayBuffer());
    assert.equal(payload.length, 0);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
