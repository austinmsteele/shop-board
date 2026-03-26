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
      firstName: 'Test',
      lastName: 'User',
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

    const created = createServer({
      databasePath,
      boardNotificationSender: async () => {}
    });
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

test('shared board load without owner id returns resolved owner metadata for later saves', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-shared-owner-hint-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');

  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const created = createServer({
      databasePath,
      boardNotificationSender: async () => {}
    });
    server = created.server;
    const port = await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address ? address.port : 0);
      });
    });
    assert.ok(port > 0);

    const baseUrl = `http://127.0.0.1:${port}`;
    const ownerEmail = `owner-meta-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const collaboratorEmail = `editor-meta-${Date.now()}-${Math.random().toString(16).slice(2, 8)}@example.com`;
    const owner = await signUpUser(baseUrl, ownerEmail);
    const collaborator = await signUpUser(baseUrl, collaboratorEmail);

    const boardId = 'shared-board-without-owner-param';
    const initialBoard = {
      id: boardId,
      name: 'Ownerless Shared Lookup',
      items: [
        {
          id: 'item-1',
          name: 'Desk Lamp',
          favoriteRank: '',
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
      `${baseUrl}/api/data?board=${encodeURIComponent(boardId)}`,
      {
        headers: {
          Cookie: collaborator.sessionCookie
        }
      }
    );
    assert.equal(sharedLoadResponse.status, 200);
    const sharedLoadPayload = await sharedLoadResponse.json();
    assert.equal(String(sharedLoadPayload?.sharedBoardOwnerId || ''), owner.user.id);

    const sharedBoardResponse = await fetch(
      `${baseUrl}/api/shared-board?board=${encodeURIComponent(boardId)}`,
      {
        headers: {
          Cookie: collaborator.sessionCookie
        }
      }
    );
    assert.equal(sharedBoardResponse.status, 200);
    const sharedBoardPayload = await sharedBoardResponse.json();
    assert.equal(String(sharedBoardPayload?.ownerId || ''), owner.user.id);

    const updatedSharedBoard = {
      ...initialBoard,
      items: [
        {
          ...initialBoard.items[0],
          favoriteRank: 'gold',
          feedbacks: [
            {
              id: 'fb-ownerless',
              author: 'Editor',
              text: 'This one should stick.',
              emojis: ['👍']
            }
          ]
        }
      ]
    };

    const sharedSaveResponse = await fetch(
      `${baseUrl}/api/data?board=${encodeURIComponent(boardId)}&owner=${encodeURIComponent(sharedLoadPayload.sharedBoardOwnerId)}`,
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

    const ownerSnapshot = __testOnlyReadUserSnapshot(databasePath, owner.user.id);
    const ownerBoard = (Array.isArray(ownerSnapshot?.boards) ? ownerSnapshot.boards : [])
      .find((entry) => String(entry?.id || '') === boardId);
    assert.ok(ownerBoard);
    const savedItem = (Array.isArray(ownerBoard.items) ? ownerBoard.items : [])
      .find((entry) => String(entry?.id || '') === 'item-1');
    assert.ok(savedItem);
    assert.equal(String(savedItem?.favoriteRank || ''), 'gold');
    assert.equal(String(savedItem?.feedbacks?.[0]?.text || ''), 'This one should stick.');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('collaborator edits send a board activity notification to the owner', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-shared-notify-owner-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  const notifications = [];

  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const created = createServer({
      databasePath,
      boardNotificationSender: async (payload) => {
        notifications.push(payload);
      }
    });
    server = created.server;
    const port = await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address ? address.port : 0);
      });
    });
    assert.ok(port > 0);

    const baseUrl = `http://127.0.0.1:${port}`;
    const owner = await signUpUser(baseUrl, `notify-owner-${Date.now()}@example.com`);
    const collaborator = await signUpUser(baseUrl, `notify-editor-${Date.now()}@example.com`);

    const boardId = 'board-notify-owner';
    const initialBoard = {
      id: boardId,
      name: 'Primary Renovation Board',
      items: [
        {
          id: 'item-1',
          name: 'Walnut Vanity',
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

    const updatedSharedBoard = {
      ...initialBoard,
      items: [
        ...initialBoard.items,
        {
          id: 'item-2',
          name: 'Brass Mirror',
          comments: [],
          feedbacks: [
            {
              id: 'feedback-2',
              author: collaborator.user.displayName,
              text: 'This mirror feels like the best fit.'
            }
          ]
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
    assert.equal(notifications.length, 1);

    const [notification] = notifications;
    assert.equal(String(notification?.recipient?.id || ''), owner.user.id);
    assert.equal(String(notification?.actor?.id || ''), collaborator.user.id);
    assert.equal(String(notification?.board?.id || ''), boardId);
    assert.equal(notification?.changes?.addedItems?.length, 1);
    assert.equal(String(notification?.changes?.addedItems?.[0]?.itemName || ''), 'Brass Mirror');
    assert.equal(notification?.changes?.addedFeedbacks?.length, 1);
    assert.equal(String(notification?.changes?.addedFeedbacks?.[0]?.text || ''), 'This mirror feels like the best fit.');
    assert.match(String(notification?.boardUrl || ''), new RegExp(`board=${boardId}`));
    assert.match(String(notification?.boardUrl || ''), new RegExp(`owner=${owner.user.id}`));
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('owner edits send a board activity notification to shared collaborators', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-shared-notify-collab-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  const notifications = [];

  let server = null;
  try {
    const bootstrap = createDataService({ databasePath });
    bootstrap.close();

    const created = createServer({
      databasePath,
      boardNotificationSender: async (payload) => {
        notifications.push(payload);
      }
    });
    server = created.server;
    const port = await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address ? address.port : 0);
      });
    });
    assert.ok(port > 0);

    const baseUrl = `http://127.0.0.1:${port}`;
    const owner = await signUpUser(baseUrl, `notify-owner-edit-${Date.now()}@example.com`);
    const collaborator = await signUpUser(baseUrl, `notify-collab-edit-${Date.now()}@example.com`);

    const boardId = 'board-notify-collaborator';
    const initialBoard = {
      id: boardId,
      name: 'Kitchen Fixtures',
      items: [
        {
          id: 'item-1',
          name: 'Bridge Faucet',
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
    notifications.length = 0;

    const ownerUpdatedBoard = {
      ...initialBoard,
      items: [
        {
          ...initialBoard.items[0],
          comments: [
            {
              id: 'comment-owner-1',
              author: owner.user.displayName,
              text: "Let's compare this against one more option."
            }
          ],
          feedbacks: []
        }
      ]
    };

    const ownerSaveResponse = await fetch(`${baseUrl}/api/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: owner.sessionCookie
      },
      body: JSON.stringify({ boards: [ownerUpdatedBoard] })
    });
    assert.equal(ownerSaveResponse.status, 200);
    assert.equal(notifications.length, 1);

    const [notification] = notifications;
    assert.equal(String(notification?.recipient?.id || ''), collaborator.user.id);
    assert.equal(String(notification?.actor?.id || ''), owner.user.id);
    assert.equal(notification?.changes?.addedItems?.length, 0);
    assert.equal(notification?.changes?.addedComments?.length, 1);
    assert.equal(String(notification?.changes?.addedComments?.[0]?.itemName || ''), 'Bridge Faucet');
    assert.equal(
      String(notification?.changes?.addedComments?.[0]?.text || ''),
      "Let's compare this against one more option."
    );
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
