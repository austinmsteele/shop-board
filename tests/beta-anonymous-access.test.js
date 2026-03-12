import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createDataService,
  createServer,
  __testOnlyUpsertDemoTemplateFromSourceBoard
} from '../server.js';

test('beta anonymous data path returns only a cloned template board', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-beta-anon-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

  let server = null;
  try {
    const service = createDataService({ databasePath });
    const db = service.db;

    const sourceUserId = 'user-beta-owner';
    const sourceBoardId = 'board-home-reno-master';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `).run(sourceUserId, 'owner@example.com', 'scrypt:test:test', 'Owner');

    db.prepare(`
      INSERT INTO user_snapshots (user_id, snapshot_json)
      VALUES (?, ?)
    `).run(sourceUserId, JSON.stringify({
      boards: [
        {
          id: sourceBoardId,
          name: 'Home Reno',
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
      sourceBoardId,
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

    const response = await fetch(`http://127.0.0.1:${port}/api/data?beta=1`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    const boards = Array.isArray(payload?.boards) ? payload.boards : [];

    assert.equal(boards.length, 1);
    assert.equal(String(boards[0]?.name || ''), 'Home Reno Template');
    assert.notEqual(String(boards[0]?.id || ''), sourceBoardId);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
