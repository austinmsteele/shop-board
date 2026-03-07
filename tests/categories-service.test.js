import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDataService } from '../server.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopping-tool-tests-'));
const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
let service = null;

function bootService() {
  service = createDataService({ databasePath });
}

function shutdownService() {
  if (!service) return;
  service.close();
  service = null;
}

test.before(() => {
  bootService();
});

test.after(() => {
  shutdownService();
  fs.rmSync(tempRoot, { recursive: true, force: true });
});

test('add, rename, and delete category with required delete guardrail', () => {
  const boardId = 'board-crud';
  const categories = service.getBoardCategories(boardId);
  assert.equal(categories.length, 6);
  const defaultFeedback = categories.find((entry) => entry.slug === 'feedback');
  assert.ok(defaultFeedback);

  const created = service.createBoardCategory(boardId, {
    label: 'Color',
    type: 'select',
    allowedOptions: ['Black', 'White']
  });
  assert.equal(created.label, 'Color');
  assert.equal(created.type, 'select');

  const renamed = service.updateBoardCategory(boardId, created.id, {
    label: 'Finish Color'
  });
  assert.equal(renamed.label, 'Finish Color');
  assert.equal(renamed.id, created.id);

  const deleted = service.deleteBoardCategory(boardId, created.id);
  assert.equal(deleted.deleted, true);

  assert.throws(
    () => service.deleteBoardCategory(boardId, defaultFeedback.id),
    /required/i
  );
});

test('custom values persist with typed number response', () => {
  const boardId = 'board-values';
  const custom = service.createBoardCategory(boardId, {
    label: 'Weight',
    type: 'number'
  });
  const updated = service.upsertItemCustomValues(boardId, 'item-1', {
    [custom.id]: {
      value: 42.5,
      source: 'user'
    }
  });
  assert.equal(updated.length, 1);
  assert.equal(updated[0].value, 42.5);
  assert.equal(updated[0].itemId, 'item-1');

  const listed = service.listBoardCustomValues(boardId);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].value, 42.5);
});

test('category order can be rearranged and persists', () => {
  const boardId = 'board-reorder';
  const categories = service.getBoardCategories(boardId);
  assert.equal(categories.length, 6);
  const imageId = categories.find((entry) => entry.slug === 'image')?.id;
  const feedbackId = categories.find((entry) => entry.slug === 'feedback')?.id;
  assert.ok(imageId);
  assert.ok(feedbackId);

  const newOrder = categories.map((entry) => entry.id).filter((id) => id !== imageId);
  newOrder.push(imageId);
  const reordered = service.reorderBoardCategories(boardId, { categoryIds: newOrder });
  assert.equal(reordered.at(-1)?.id, imageId);
  assert.equal(reordered.find((entry) => entry.id === feedbackId)?.position, newOrder.indexOf(feedbackId));

  shutdownService();
  bootService();
  const categoriesAfterRestart = service.getBoardCategories(boardId);
  assert.equal(categoriesAfterRestart.at(-1)?.id, imageId);
});

test('schema persistence survives service restart', () => {
  const boardId = 'board-persist';
  const created = service.createBoardCategory(boardId, {
    label: 'Material',
    type: 'text'
  });
  const createdId = created.id;

  shutdownService();
  bootService();

  const categoriesAfterRestart = service.getBoardCategories(boardId);
  const found = categoriesAfterRestart.find((entry) => entry.id === createdId);
  assert.ok(found);
  assert.equal(found.label, 'Material');
});
