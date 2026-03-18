import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createDataService, createServer } from '../server.js';

function extractSessionCookie(setCookieHeader = '') {
  const raw = String(setCookieHeader || '').trim();
  if (!raw) return '';
  const [first] = raw.split(';');
  return String(first || '').trim();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function createSessionCookie() {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return {
    cookie: `shopboard_session=${token}`,
    tokenHash
  };
}

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

async function signUpUser(baseUrl, email) {
  const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      firstName: 'First',
      lastName: 'User',
      password: 'StrongPass123!',
      skipDemoBoardProvisioning: true
    })
  });
  assert.equal(response.status, 201);
  const payload = await response.json();
  return {
    user: payload?.user || null,
    sessionCookie: extractSessionCookie(response.headers.get('set-cookie') || '')
  };
}

test('new users trigger first-link notice once and acknowledgment suppresses it permanently', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-first-link-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const started = await startServer(databasePath);
    server = started.server;
    const account = await signUpUser(started.baseUrl, `first-link-${Date.now()}@example.com`);
    assert.equal(Boolean(account.user?.firstLinkNoticeEligible), true);
    assert.ok(account.sessionCookie);

    const firstTrigger = await fetch(`${started.baseUrl}/api/first-link-notice/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: account.sessionCookie
      },
      body: '{}'
    });
    assert.equal(firstTrigger.status, 200);
    const firstTriggerPayload = await firstTrigger.json();
    assert.equal(Boolean(firstTriggerPayload?.shouldShowNotice), true);
    assert.ok(String(firstTriggerPayload?.user?.firstLinkNoticeTriggeredAt || '').trim());
    assert.equal(Boolean(firstTriggerPayload?.user?.hasSeenFirstLinkNotice), false);

    const secondTrigger = await fetch(`${started.baseUrl}/api/first-link-notice/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: account.sessionCookie
      },
      body: '{}'
    });
    assert.equal(secondTrigger.status, 200);
    const secondTriggerPayload = await secondTrigger.json();
    assert.equal(Boolean(secondTriggerPayload?.shouldShowNotice), false);

    const acknowledge = await fetch(`${started.baseUrl}/api/first-link-notice/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: account.sessionCookie
      },
      body: '{}'
    });
    assert.equal(acknowledge.status, 200);
    const acknowledgePayload = await acknowledge.json();
    assert.equal(Boolean(acknowledgePayload?.user?.hasSeenFirstLinkNotice), true);

    const sessionResponse = await fetch(`${started.baseUrl}/api/auth/session`, {
      headers: {
        Cookie: account.sessionCookie
      }
    });
    assert.equal(sessionResponse.status, 200);
    const sessionPayload = await sessionResponse.json();
    assert.equal(Boolean(sessionPayload?.user?.hasSeenFirstLinkNotice), true);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('existing users are not eligible for the first-link notice by default', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-first-link-existing-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const db = new DatabaseSync(databasePath);
    const session = createSessionCookie();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `).run('legacy-user', 'legacy@example.com', hashPassword('StrongPass123!'), 'Legacy User');
    db.prepare(`
      INSERT INTO sessions (token_hash, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(session.tokenHash, 'legacy-user', new Date(Date.now() + 60_000).toISOString());
    db.close();

    const started = await startServer(databasePath);
    server = started.server;

    const sessionResponse = await fetch(`${started.baseUrl}/api/auth/session`, {
      headers: {
        Cookie: session.cookie
      }
    });
    assert.equal(sessionResponse.status, 200);
    const sessionPayload = await sessionResponse.json();
    assert.equal(Boolean(sessionPayload?.authenticated), true);
    assert.equal(Boolean(sessionPayload?.user?.firstLinkNoticeEligible), false);

    const trigger = await fetch(`${started.baseUrl}/api/first-link-notice/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: session.cookie
      },
      body: '{}'
    });
    assert.equal(trigger.status, 200);
    const triggerPayload = await trigger.json();
    assert.equal(Boolean(triggerPayload?.shouldShowNotice), false);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
