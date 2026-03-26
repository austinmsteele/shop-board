import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../server.js';

async function startServer() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'interview-project-sharing-'));
  const databasePath = path.join(tempRoot, 'sharing.sqlite');
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
    tempRoot,
    server,
    baseUrl: `http://127.0.0.1:${port}`
  };
}

async function stopServer(started) {
  if (started?.server) {
    await new Promise((resolve) => started.server.close(resolve));
  }
  if (started?.tempRoot) {
    fs.rmSync(started.tempRoot, { recursive: true, force: true });
  }
}

test('interview project endpoints persist shared project metadata', async () => {
  const started = await startServer();

  try {
    const createResponse = await fetch(`${started.baseUrl}/api/interview-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    assert.equal(createResponse.status, 201);
    const createdPayload = await createResponse.json();
    const projectId = String(createdPayload?.project?.id || '');
    assert.match(projectId, /^[a-f0-9-]{30,}$/i);
    assert.equal(createdPayload?.sharePath, `/?project=${encodeURIComponent(projectId)}`);

    const saveResponse = await fetch(`${started.baseUrl}/api/interview-projects/${encodeURIComponent(projectId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'Steve Interview',
        transcriptFileName: 'steve.txt',
        transcriptWarning: '',
        speakerEditorOpen: false,
        speakerAssignments: [
          {
            key: 'speaker 3',
            label: 'Speaker 3',
            name: 'Steve',
            draft: 'Steve'
          }
        ],
        bites: [
          {
            id: 'bite-1',
            startSeconds: 0,
            endSeconds: 15,
            text: 'The first bite',
            tone: 'red',
            speakerKey: 'speaker 3',
            speakerLabel: 'Speaker 3'
          }
        ]
      })
    });

    assert.equal(saveResponse.status, 200);
    const savedPayload = await saveResponse.json();
    assert.equal(savedPayload?.project?.projectName, 'Steve Interview');
    assert.equal(savedPayload?.project?.version, 1);
    assert.equal(savedPayload?.project?.speakerAssignments?.[0]?.name, 'Steve');
    assert.equal(savedPayload?.project?.bites?.[0]?.text, 'The first bite');

    const loadResponse = await fetch(`${started.baseUrl}/api/interview-projects/${encodeURIComponent(projectId)}`);
    assert.equal(loadResponse.status, 200);
    const loadedPayload = await loadResponse.json();
    assert.equal(loadedPayload?.project?.id, projectId);
    assert.equal(loadedPayload?.project?.projectName, 'Steve Interview');
    assert.equal(loadedPayload?.project?.speakerEditorOpen, false);
    assert.equal(loadedPayload?.project?.bites?.length, 1);
  } finally {
    await stopServer(started);
  }
});

test('interview project audio endpoint supports byte range playback', async () => {
  const started = await startServer();

  try {
    const createResponse = await fetch(`${started.baseUrl}/api/interview-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    const createdPayload = await createResponse.json();
    const projectId = String(createdPayload?.project?.id || '');
    const audioBytes = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]);

    const uploadResponse = await fetch(
      `${started.baseUrl}/api/interview-projects/${encodeURIComponent(projectId)}/audio?filename=steve.mp3`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'audio/mpeg'
        },
        body: audioBytes
      }
    );
    assert.equal(uploadResponse.status, 200);

    const audioResponse = await fetch(
      `${started.baseUrl}/api/interview-projects/${encodeURIComponent(projectId)}/audio`,
      {
        headers: {
          Range: 'bytes=2-5'
        }
      }
    );

    assert.equal(audioResponse.status, 206);
    assert.equal(audioResponse.headers.get('content-type'), 'audio/mpeg');
    assert.equal(audioResponse.headers.get('accept-ranges'), 'bytes');
    assert.equal(audioResponse.headers.get('content-range'), 'bytes 2-5/8');
    const receivedBytes = new Uint8Array(await audioResponse.arrayBuffer());
    assert.deepEqual(Array.from(receivedBytes), [2, 3, 4, 5]);
  } finally {
    await stopServer(started);
  }
});
