import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDataService, createServer } from '../server.js';

test('sign up requires first and last name and stores full display name', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-auth-name-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  const uniqueEmail = `auth-name-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;

  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const created = createServer({ databasePath });
    server = created.server;
    const port = await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address ? address.port : 0);
      });
    });
    assert.ok(port > 0);

    const baseUrl = `http://127.0.0.1:${port}`;
    const missingNameResponse = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'missing-name@example.com',
        password: 'StrongPass123!',
        skipDemoBoardProvisioning: true
      })
    });
    assert.equal(missingNameResponse.status, 400);
    const missingNamePayload = await missingNameResponse.json();
    assert.equal(String(missingNamePayload?.error || ''), 'First and last name are required.');

    const successResponse = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        firstName: 'Austin',
        lastName: 'Steele',
        password: 'StrongPass123!',
        skipDemoBoardProvisioning: true
      })
    });
    assert.equal(successResponse.status, 201);
    const successPayload = await successResponse.json();
    assert.equal(String(successPayload?.user?.displayName || ''), 'Austin Steele');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
