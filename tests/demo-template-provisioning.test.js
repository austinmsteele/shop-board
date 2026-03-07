import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createDataService,
  __testOnlyProvisionDemoBoardForUser,
  __testOnlyReadUserSnapshot,
  __testOnlyUpsertDemoTemplateFromSourceBoard
} from '../server.js';

test('default demo template is deep-cloned once per user and preserves source board integrity', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-demo-template-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

  try {
    const service = createDataService({ databasePath });
    const db = service.db;

    const sourceUserId = 'user-source';
    const targetUserId = 'user-target';
    const sourceBoardId = 'board-renovation-master';
    const sourceCategoryNodeId = 'category-kitchen-source';
    const sourceItemId = 'item-pendant-source';
    const sourceFieldImageId = 'field-image-source';
    const sourceFieldBudgetId = 'field-budget-source';

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run(sourceUserId, 'owner@example.com', 'scrypt:test:test', 'Owner');
    insertUser.run(targetUserId, 'newuser@example.com', 'scrypt:test:test', 'New User');

    const sourceBoard = {
      id: sourceBoardId,
      name: 'Home Renovation Shopping Board',
      items: [],
      categories: [
        {
          id: sourceCategoryNodeId,
          name: 'Kitchen Lighting',
          children: [],
          items: [
            {
              id: sourceItemId,
              name: 'Pendant Light',
              brand: 'Lumina',
              image: 'https://cdn.example.com/light-main.jpg',
              images: [
                'https://cdn.example.com/light-main.jpg',
                'https://cdn.example.com/light-alt.jpg'
              ],
              notes: 'Looks best over the island.',
              rank: 'gold',
              comments: [
                {
                  id: 'comment-1',
                  author: 'Owner',
                  text: 'Top choice for style and warmth.'
                }
              ],
              feedbacks: [
                {
                  id: 'feedback-1',
                  author: 'Owner',
                  text: 'Keep this in final 3.'
                }
              ],
              customFieldValues: {
                [sourceFieldBudgetId]: {
                  value: 500,
                  source: 'user'
                }
              }
            }
          ]
        }
      ],
      previewImages: ['https://cdn.example.com/light-main.jpg'],
      fieldCategories: [
        {
          id: sourceFieldImageId,
          label: 'Image',
          slug: 'image',
          type: 'text',
          allowedOptions: [],
          isDefault: true,
          isDeletable: false,
          position: 0
        },
        {
          id: sourceFieldBudgetId,
          label: 'Budget',
          slug: 'budget',
          type: 'number',
          allowedOptions: [],
          isDefault: false,
          isDeletable: true,
          position: 1
        }
      ]
    };

    db.prepare(`
      INSERT INTO user_snapshots (user_id, snapshot_json)
      VALUES (?, ?)
    `).run(sourceUserId, JSON.stringify({ boards: [sourceBoard] }));

    const insertCategory = db.prepare(`
      INSERT INTO categories (
        id,
        scope_type,
        scope_id,
        label,
        slug,
        type,
        allowed_options_json,
        is_default,
        is_deletable,
        position
      ) VALUES (?, 'board', ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCategory.run(sourceFieldImageId, sourceBoardId, 'Image', 'image', 'text', '[]', 1, 0, 0);
    insertCategory.run(sourceFieldBudgetId, sourceBoardId, 'Budget', 'budget', 'number', '[]', 0, 1, 1);

    db.prepare(`
      INSERT INTO item_custom_values (
        board_id,
        item_id,
        category_id,
        value_type,
        value_text,
        value_number,
        value_boolean,
        value_select,
        source,
        confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sourceBoardId, sourceItemId, sourceFieldBudgetId, 'number', null, 500, null, null, 'user', null);

    service.close();

    const template = __testOnlyUpsertDemoTemplateFromSourceBoard(databasePath, {
      templateSlug: 'renovation-demo',
      title: 'Demo Renovation Board',
      sourceUserId,
      sourceBoardId,
      isDefault: true,
      isActive: true
    });

    assert.equal(template.slug, 'renovation-demo');
    assert.equal(template.sourceBoardId, sourceBoardId);

    const firstProvision = __testOnlyProvisionDemoBoardForUser(databasePath, targetUserId, {});
    assert.equal(firstProvision.seeded, true);
    assert.equal(firstProvision.reason, 'first-time-seed');
    assert.ok(firstProvision.board);

    const clonedBoard = firstProvision.board;
    assert.notEqual(clonedBoard.id, sourceBoardId);
    assert.equal(clonedBoard.name, 'Demo Renovation Board');

    const clonedCategoryNode = clonedBoard.categories[0];
    assert.ok(clonedCategoryNode);
    assert.notEqual(clonedCategoryNode.id, sourceCategoryNodeId);

    const clonedItem = clonedCategoryNode.items[0];
    assert.ok(clonedItem);
    assert.notEqual(clonedItem.id, sourceItemId);
    assert.equal(clonedItem.rank, 'gold');
    assert.equal(clonedItem.notes, 'Looks best over the island.');
    assert.equal(clonedItem.comments.length, 1);

    const clonedBudgetCategory = clonedBoard.fieldCategories.find((entry) => entry.slug === 'budget');
    assert.ok(clonedBudgetCategory);
    assert.notEqual(clonedBudgetCategory.id, sourceFieldBudgetId);
    assert.equal(clonedItem.customFieldValues[clonedBudgetCategory.id]?.value, 500);

    const targetSnapshotAfterFirst = __testOnlyReadUserSnapshot(databasePath, targetUserId);
    assert.equal(targetSnapshotAfterFirst.boards.length, 1);
    assert.equal(targetSnapshotAfterFirst.boards[0].id, clonedBoard.id);

    const secondProvision = __testOnlyProvisionDemoBoardForUser(databasePath, targetUserId, {});
    assert.equal(secondProvision.seeded, false);
    assert.equal(secondProvision.reason, 'already-seeded');

    const targetSnapshotAfterSecond = __testOnlyReadUserSnapshot(databasePath, targetUserId);
    assert.equal(targetSnapshotAfterSecond.boards.length, 1);

    const manualProvision = __testOnlyProvisionDemoBoardForUser(databasePath, targetUserId, {
      force: true,
      templateSlug: 'renovation-demo',
      boardName: 'Sample Renovation Board'
    });

    assert.equal(manualProvision.seeded, true);
    assert.equal(manualProvision.reason, 'manual-clone');

    const targetSnapshotAfterManual = __testOnlyReadUserSnapshot(databasePath, targetUserId);
    assert.equal(targetSnapshotAfterManual.boards.length, 2);
    assert.equal(targetSnapshotAfterManual.boards[0].name, 'Sample Renovation Board');

    const verificationService = createDataService({ databasePath });
    const verifyDb = verificationService.db;

    const clonedFieldRows = verifyDb.prepare(`
      SELECT id, slug
      FROM categories
      WHERE scope_type = 'board' AND scope_id = ?
      ORDER BY position ASC
    `).all(clonedBoard.id);

    assert.equal(clonedFieldRows.length, 2);
    const clonedBudgetRow = clonedFieldRows.find((row) => row.slug === 'budget');
    assert.ok(clonedBudgetRow);
    assert.notEqual(clonedBudgetRow.id, sourceFieldBudgetId);

    const clonedValueRows = verifyDb.prepare(`
      SELECT item_id, category_id, value_number
      FROM item_custom_values
      WHERE board_id = ?
    `).all(clonedBoard.id);

    assert.equal(clonedValueRows.length, 1);
    assert.equal(clonedValueRows[0].value_number, 500);
    assert.notEqual(clonedValueRows[0].item_id, sourceItemId);
    assert.notEqual(clonedValueRows[0].category_id, sourceFieldBudgetId);

    const sourceValueRows = verifyDb.prepare(`
      SELECT item_id, category_id, value_number
      FROM item_custom_values
      WHERE board_id = ?
    `).all(sourceBoardId);

    assert.equal(sourceValueRows.length, 1);
    assert.equal(sourceValueRows[0].item_id, sourceItemId);
    assert.equal(sourceValueRows[0].category_id, sourceFieldBudgetId);
    assert.equal(sourceValueRows[0].value_number, 500);

    const sourceSnapshotAfterAll = __testOnlyReadUserSnapshot(databasePath, sourceUserId);
    assert.equal(sourceSnapshotAfterAll.boards.length, 1);
    assert.equal(sourceSnapshotAfterAll.boards[0].id, sourceBoardId);

    verificationService.close();
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
