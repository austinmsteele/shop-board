import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createDataService,
  __testOnlyUpsertDemoTemplateFromSourceBoard,
  __testOnlyAssertTemplateSnapshotWriteAccess
} from '../server.js';

test('snapshot writes block protected template board ids for non-admin users', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-template-guard-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

  try {
    const service = createDataService({ databasePath });
    const db = service.db;

    const sourceUserId = 'user-source';
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

    const template = __testOnlyUpsertDemoTemplateFromSourceBoard(databasePath, {
      templateSlug: 'home-reno',
      title: 'Home Reno',
      sourceUserId,
      sourceBoardId,
      isDefault: true,
      isActive: true
    });
    assert.equal(template.templateBoardId, sourceBoardId);

    assert.throws(
      () => __testOnlyAssertTemplateSnapshotWriteAccess(
        databasePath,
        { id: 'someone-else', email: 'newuser@example.com' },
        { boards: [{ id: sourceBoardId, name: 'Home Reno' }] }
      ),
      /protected template/i
    );

    assert.doesNotThrow(() => __testOnlyAssertTemplateSnapshotWriteAccess(
      databasePath,
      { id: 'owner-user', email: 'austinmsteele@gmail.com' },
      { boards: [{ id: sourceBoardId, name: 'Home Reno' }] }
    ));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
