import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../server.js';

async function startFeedbackServer(feedbackSender) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shopboard-feedback-'));
  const databasePath = path.join(tempRoot, 'shopping-tool.sqlite');
  const created = createServer({ databasePath, feedbackSender });
  const server = created.server;
  const port = await new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve(typeof address === 'object' && address ? address.port : 0);
    });
  });
  assert.ok(port > 0);
  return {
    tempRoot,
    server,
    baseUrl: `http://127.0.0.1:${port}`
  };
}

async function stopFeedbackServer(started) {
  if (started?.server) {
    await new Promise((resolve) => started.server.close(resolve));
  }
  if (started?.tempRoot) {
    fs.rmSync(started.tempRoot, { recursive: true, force: true });
  }
}

test('site feedback endpoint accepts valid submissions and forwards normalized payload', async () => {
  let receivedSubmission = null;
  const started = await startFeedbackServer(async (submission) => {
    receivedSubmission = submission;
  });

  try {
    const response = await fetch(`${started.baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShopBoard Feedback Test'
      },
      body: JSON.stringify({
        category: 'site bug',
        message: 'The feedback button overlaps content on mobile.',
        pageUrl: 'https://shopboard.test/terms.html',
        pageTitle: 'Terms of Use & Privacy Policy | ShopBoard'
      })
    });

    assert.equal(response.status, 202);
    const payload = await response.json();
    assert.equal(Boolean(payload?.ok), true);
    assert.ok(receivedSubmission);
    assert.equal(receivedSubmission.category, 'site bug');
    assert.equal(receivedSubmission.categoryLabel, 'Site bug');
    assert.equal(receivedSubmission.message, 'The feedback button overlaps content on mobile.');
    assert.equal(receivedSubmission.pageUrl, 'https://shopboard.test/terms.html');
    assert.equal(receivedSubmission.pageTitle, 'Terms of Use & Privacy Policy | ShopBoard');
    assert.equal(receivedSubmission.user, null);
    assert.equal(receivedSubmission.userAgent, 'ShopBoard Feedback Test');
    assert.match(String(receivedSubmission.submittedAt || ''), /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    await stopFeedbackServer(started);
  }
});

test('site feedback endpoint rejects missing message content', async () => {
  let senderCalls = 0;
  const started = await startFeedbackServer(async () => {
    senderCalls += 1;
  });

  try {
    const response = await fetch(`${started.baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'new feature',
        message: '   ',
        pageUrl: 'https://shopboard.test/'
      })
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(String(payload?.error || ''), 'Please enter your feedback message.');
    assert.equal(senderCalls, 0);
  } finally {
    await stopFeedbackServer(started);
  }
});
