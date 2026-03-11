import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createDataService,
  createServer,
  __testOnlyReadUserSnapshot
} from '../server.js';

function extractSessionCookie(setCookieHeader = '') {
  const raw = String(setCookieHeader || '').trim();
  if (!raw) return '';
  const [first] = raw.split(';');
  return String(first || '').trim();
}

async function signUpUser(baseUrl, email) {
  const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'StrongPass123!',
      skipDemoBoardProvisioning: true
    })
  });
  assert.equal(response.status, 201);
  const payload = await response.json();
  const user = payload?.user || null;
  assert.ok(user?.id);
  const sessionCookie = extractSessionCookie(response.headers.get('set-cookie') || '');
  assert.ok(sessionCookie);
  return {
    user,
    sessionCookie
  };
}

test('shared board edits persist to owner snapshot and remain visible to owner', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-shared-collab-'));
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
    const ownerEmail = `owner-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const collaboratorEmail = `editor-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const owner = await signUpUser(baseUrl, ownerEmail);
    const collaborator = await signUpUser(baseUrl, collaboratorEmail);

    const boardId = 'shared-camera-board';
    const initialBoard = {
      id: boardId,
      name: 'Camera Equipment',
      items: [
        {
          id: 'item-1',
          name: 'Sony A7 IV',
          feedbacks: [],
          comments: []
        }
      ],
      categories: [],
      fieldCategories: []
    };

    const seedResponse = await fetch(`${baseUrl}/api/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: owner.sessionCookie
      },
      body: JSON.stringify({ boards: [initialBoard] })
    });
    assert.equal(seedResponse.status, 200);

    const sharedLoadResponse = await fetch(
      `${baseUrl}/api/data?board=${encodeURIComponent(boardId)}&owner=${encodeURIComponent(owner.user.id)}`,
      {
        headers: {
          Cookie: collaborator.sessionCookie
        }
      }
    );
    assert.equal(sharedLoadResponse.status, 200);
    const sharedLoadPayload = await sharedLoadResponse.json();
    const sharedLoadBoards = Array.isArray(sharedLoadPayload?.boards) ? sharedLoadPayload.boards : [];
    assert.ok(sharedLoadBoards.some((entry) => String(entry?.id || '') === boardId));

    const updatedSharedBoard = {
      ...initialBoard,
      items: [
        ...initialBoard.items,
        {
          id: 'item-2',
          name: 'Sigma 24-70mm Lens',
          feedbacks: [
            {
              id: 'fb-1',
              author: 'Editor',
              text: 'Great lens option for this kit.',
              emojis: ['👍'],
              createdAt: '2026-03-11T14:00:00.000Z'
            }
          ],
          comments: []
        }
      ]
    };

    const sharedSaveResponse = await fetch(
      `${baseUrl}/api/data?board=${encodeURIComponent(boardId)}&owner=${encodeURIComponent(owner.user.id)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: collaborator.sessionCookie
        },
        body: JSON.stringify({ boards: [updatedSharedBoard] })
      }
    );
    assert.equal(sharedSaveResponse.status, 200);
    const sharedSavePayload = await sharedSaveResponse.json();
    assert.equal(String(sharedSavePayload?.mode || ''), 'shared-board');

    const ownerSnapshot = __testOnlyReadUserSnapshot(databasePath, owner.user.id);
    const ownerBoard = (Array.isArray(ownerSnapshot?.boards) ? ownerSnapshot.boards : [])
      .find((entry) => String(entry?.id || '') === boardId);
    assert.ok(ownerBoard);
    const ownerItems = Array.isArray(ownerBoard.items) ? ownerBoard.items : [];
    assert.equal(ownerItems.length, 2);
    const addedItem = ownerItems.find((entry) => String(entry?.id || '') === 'item-2');
    assert.ok(addedItem);
    const addedFeedback = Array.isArray(addedItem.feedbacks) ? addedItem.feedbacks : [];
    assert.equal(addedFeedback.length, 1);
    assert.equal(String(addedFeedback[0]?.text || ''), 'Great lens option for this kit.');

    const collaboratorSnapshot = __testOnlyReadUserSnapshot(databasePath, collaborator.user.id);
    const collaboratorBoards = Array.isArray(collaboratorSnapshot?.boards) ? collaboratorSnapshot.boards : [];
    assert.ok(!collaboratorBoards.some((entry) => String(entry?.id || '') === boardId));

    const ownerReloadResponse = await fetch(`${baseUrl}/api/data`, {
      headers: {
        Cookie: owner.sessionCookie
      }
    });
    assert.equal(ownerReloadResponse.status, 200);
    const ownerReloadPayload = await ownerReloadResponse.json();
    const ownerReloadBoard = (Array.isArray(ownerReloadPayload?.boards) ? ownerReloadPayload.boards : [])
      .find((entry) => String(entry?.id || '') === boardId);
    assert.ok(ownerReloadBoard);
    const ownerReloadItems = Array.isArray(ownerReloadBoard.items) ? ownerReloadBoard.items : [];
    assert.equal(ownerReloadItems.length, 2);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
