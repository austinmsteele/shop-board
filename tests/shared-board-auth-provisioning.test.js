import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createDataService,
  createServer,
  __testOnlyReadUserSnapshot,
  __testOnlyUpsertDemoTemplateFromSourceBoard
} from '../server.js';

function extractSessionCookie(setCookieHeader = '') {
  const raw = String(setCookieHeader || '').trim();
  if (!raw) return '';
  const [first] = raw.split(';');
  return String(first || '').trim();
}

test('shared-link sign-up skips demo template seeding and returns only requested shared board', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-shared-auth-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

  let server = null;
  try {
    const service = createDataService({ databasePath });
    const db = service.db;

    const sourceUserId = 'user-share-owner';
    const sourceBoardId = 'board-shared-public';
    const defaultTemplateBoardId = 'board-template-home-reno';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `).run(sourceUserId, 'source@example.com', 'scrypt:test:test', 'Source User');

    db.prepare(`
      INSERT INTO user_snapshots (user_id, snapshot_json)
      VALUES (?, ?)
    `).run(sourceUserId, JSON.stringify({
      boards: [
        {
          id: sourceBoardId,
          name: 'Shared Public Board',
          items: [],
          categories: [],
          fieldCategories: []
        },
        {
          id: defaultTemplateBoardId,
          name: 'Home Reno Template',
          items: [],
          categories: [],
          fieldCategories: []
        }
      ]
    }));

    service.close();

    __testOnlyUpsertDemoTemplateFromSourceBoard(databasePath, {
      templateSlug: 'home-reno',
      title: 'Home Reno Template',
      sourceUserId,
      sourceBoardId: defaultTemplateBoardId,
      isDefault: true,
      isActive: true
    });

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
    const uniqueEmail = `shared-viewer-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const guestDataResponse = await fetch(`${baseUrl}/api/data?board=${encodeURIComponent(sourceBoardId)}`);
    assert.equal(guestDataResponse.status, 200);
    const guestPayload = await guestDataResponse.json();
    const guestBoards = Array.isArray(guestPayload?.boards) ? guestPayload.boards : [];
    assert.equal(guestBoards.length, 1);
    assert.equal(String(guestBoards[0]?.id || ''), sourceBoardId);

    const signUpResponse = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        firstName: 'Shared',
        lastName: 'Viewer',
        password: 'StrongPass123!',
        skipDemoBoardProvisioning: true
      })
    });
    assert.equal(signUpResponse.status, 201);

    const sessionCookie = extractSessionCookie(signUpResponse.headers.get('set-cookie') || '');
    assert.ok(sessionCookie);

    const dataResponse = await fetch(`${baseUrl}/api/data?board=${encodeURIComponent(sourceBoardId)}`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    assert.equal(dataResponse.status, 200);
    const payload = await dataResponse.json();
    const boards = Array.isArray(payload?.boards) ? payload.boards : [];

    assert.equal(boards.length, 1);
    assert.equal(String(boards[0]?.id || ''), sourceBoardId);
    assert.equal(String(boards[0]?.name || ''), 'Shared Public Board');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('legacy seeded Home Reno boards are normalized to Home Reno Template for non-owner users', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-legacy-template-name-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

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
    const uniqueEmail = `legacy-template-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const signUpResponse = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        firstName: 'Legacy',
        lastName: 'Viewer',
        password: 'StrongPass123!',
        skipDemoBoardProvisioning: true
      })
    });
    assert.equal(signUpResponse.status, 201);
    const sessionCookie = extractSessionCookie(signUpResponse.headers.get('set-cookie') || '');
    assert.ok(sessionCookie);

    const mutator = createDataService({ databasePath });
    const mutateDb = mutator.db;
    const targetUser = mutateDb.prepare(`
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
    `).get(uniqueEmail);
    assert.ok(targetUser?.id);
    mutateDb.prepare(`
      UPDATE users
      SET has_seeded_demo_board = 1
      WHERE id = ?
    `).run(targetUser.id);
    mutateDb.prepare(`
      INSERT INTO user_snapshots (user_id, snapshot_json)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET snapshot_json = excluded.snapshot_json
    `).run(targetUser.id, JSON.stringify({
      boards: [
        {
          id: 'legacy-home-reno-board',
          name: 'Home Reno',
          items: [],
          categories: [],
          fieldCategories: []
        }
      ]
    }));
    mutator.close();

    const dataResponse = await fetch(`${baseUrl}/api/data`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    assert.equal(dataResponse.status, 200);
    const payload = await dataResponse.json();
    const boards = Array.isArray(payload?.boards) ? payload.boards : [];
    assert.equal(boards.length, 1);
    assert.equal(String(boards[0]?.name || ''), 'Home Reno Template');

    const persisted = __testOnlyReadUserSnapshot(databasePath, targetUser.id);
    const persistedBoards = Array.isArray(persisted?.boards) ? persisted.boards : [];
    assert.equal(persistedBoards.length, 1);
    assert.equal(String(persistedBoards[0]?.name || ''), 'Home Reno Template');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
