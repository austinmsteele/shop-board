import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import * as nodeCrypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDotEnvFile(envPath) {
  if (!fsSync.existsSync(envPath)) return;
  const raw = fsSync.readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(path.join(__dirname, '.env'));
const publicDir = path.join(__dirname, 'public');
const migrationsDir = path.join(__dirname, 'migrations');
const renderPersistentDataDir = '/var/data';
const runningOnRender = Boolean(
  process.env.RENDER
  || process.env.RENDER_SERVICE_ID
  || process.env.RENDER_EXTERNAL_URL
);
const defaultDataDir = runningOnRender && fsSync.existsSync(renderPersistentDataDir)
  ? path.join(renderPersistentDataDir, 'shopboard')
  : path.join(__dirname, 'data');
const dataDir = process.env.DATA_DIR ? String(process.env.DATA_DIR).trim() : defaultDataDir;
const dbPath = process.env.DATA_DB_PATH || path.join(dataDir, 'shopping-tool.sqlite');
const appDataPath = process.env.APP_DATA_PATH || path.join(dataDir, 'app-data.json');
const PORT = process.env.PORT || 3000;
const AUTH_COOKIE_NAME = 'shopboard_session';
const SESSION_MAX_AGE_SECONDS = Math.max(60 * 60, Number(process.env.SESSION_MAX_AGE_SECONDS || 60 * 60 * 24 * 45));
const BETA_WELCOME_GATE_ENABLED = String(process.env.ENABLE_BETA_WELCOME_GATE || 'true').trim().toLowerCase() !== 'false';
const ITEM_NAME_MAX_LENGTH = 200;
const DEFAULT_DEMO_TEMPLATE_SLUG = String(process.env.DEMO_TEMPLATE_DEFAULT_SLUG || 'renovation-demo').trim().toLowerCase() || 'renovation-demo';
const DEFAULT_DEMO_BOARD_NAME = String(process.env.DEMO_TEMPLATE_BOARD_NAME || 'Demo Renovation Board').trim() || 'Demo Renovation Board';
const DEMO_TEMPLATE_OWNER_EMAIL = String(process.env.DEMO_TEMPLATE_OWNER_EMAIL || '').trim().toLowerCase();
const LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME = 'Home Reno';
const DEMO_TEMPLATE_OWNER_BOARD_NAME = String(
  process.env.DEMO_TEMPLATE_OWNER_BOARD_NAME || LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME
).trim() || LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME;
const DEMO_TEMPLATE_OWNER_TEMPLATE_BOARD_NAME = String(
  process.env.DEMO_TEMPLATE_OWNER_TEMPLATE_BOARD_NAME || 'Home Reno Template'
).trim() || 'Home Reno Template';
const DEMO_TEMPLATE_OWNER_TEMPLATE_SLUG = String(process.env.DEMO_TEMPLATE_OWNER_TEMPLATE_SLUG || DEFAULT_DEMO_TEMPLATE_SLUG).trim() || DEFAULT_DEMO_TEMPLATE_SLUG;
const DEMO_TEMPLATE_ADMIN_EMAILS = new Set(
  String(process.env.DEMO_TEMPLATE_ADMIN_EMAILS || '')
    .split(',')
    .map((entry) => String(entry || '').trim().toLowerCase())
    .filter(Boolean)
);
const CATEGORY_TYPES = new Set(['text', 'number', 'boolean', 'select']);
const DEFAULT_CATEGORIES = [
  { slug: 'image', label: 'Image', type: 'text' },
  { slug: 'item_name', label: 'Item Name', type: 'text' },
  { slug: 'seller', label: 'Seller (Website)', type: 'text' },
  { slug: 'price', label: 'Price', type: 'text' },
  { slug: 'highlights', label: 'Highlights', type: 'text' },
  { slug: 'feedback', label: 'Feedback', type: 'text' }
];
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const ZYTE_API_KEY = process.env.ZYTE_API_KEY?.trim();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const OPENAI_ITEM_NAME_MODEL = process.env.OPENAI_ITEM_NAME_MODEL?.trim() || 'gpt-4.1-mini';
const OPENAI_API_BASE = (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/+$/, '');
const OPENAI_ITEM_NAME_TIMEOUT_MS = Math.max(1500, Number(process.env.OPENAI_ITEM_NAME_TIMEOUT_MS || 6000));
const ITEM_NAME_WORD_LIMIT = 10;
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const FEEDBACK_EMAIL_TO = String(process.env.FEEDBACK_EMAIL_TO || 'austinmsteel@gmail.com').trim() || 'austinmsteel@gmail.com';
const FEEDBACK_EMAIL_FROM = String(process.env.FEEDBACK_EMAIL_FROM || 'ShopBoard Feedback <onboarding@resend.dev>').trim() || 'ShopBoard Feedback <onboarding@resend.dev>';
const BOARD_ACTIVITY_EMAIL_FROM = String(process.env.BOARD_ACTIVITY_EMAIL_FROM || FEEDBACK_EMAIL_FROM).trim() || FEEDBACK_EMAIL_FROM;
const APP_ORIGIN = String(process.env.APP_ORIGIN || process.env.RENDER_EXTERNAL_URL || '').trim().replace(/\/+$/, '');
const SITE_FEEDBACK_CATEGORY_OPTIONS = new Map([
  ['site bug', 'Site bug'],
  ['new feature', 'New feature'],
  ['other', 'Other']
]);
const BRAND_APPEND_CONFIDENCE_MIN = 0.7;
const MULTI_BRAND_SELLER_KEYS = new Set([
  'wayfair',
  'allmodern',
  'jossandmain',
  'birchlane',
  'perigold',
  'homedepot',
  'lowes',
  'target',
  'walmart',
  'amazon',
  'costco',
  'overstock'
]);
const SINGLE_BRAND_SELLER_KEYS = new Set([
  'ikea'
]);
const BRAND_SOURCE_CONFIDENCE = Object.freeze({
  json_ld: 0.95,
  visible_labeled: 0.88,
  visible_byline: 0.82,
  breadcrumb: 0.78,
  metadata: 0.62,
  inferred: 0.45,
  unknown: 0.76
});
const AUTH_PROVIDER = String(process.env.AUTH_PROVIDER || 'local').trim().toLowerCase();
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = String(process.env.SUPABASE_ANON_KEY || '').trim();
const SUPABASE_AUTH_TIMEOUT_MS = Math.max(1500, Number(process.env.SUPABASE_AUTH_TIMEOUT_MS || 10_000));
const SUPABASE_AUTH_ENABLED = AUTH_PROVIDER === 'supabase' && Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (AUTH_PROVIDER === 'supabase' && !SUPABASE_AUTH_ENABLED) {
  console.warn('AUTH_PROVIDER is set to "supabase" but SUPABASE_URL or SUPABASE_ANON_KEY is missing. Falling back to local auth.');
}

function maskEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const atIndex = normalized.indexOf('@');
  if (atIndex <= 0) return normalized ? '***' : '';
  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);
  const head = local.slice(0, 2);
  return `${head || '*'}***@${domain || '***'}`;
}

function authLog(level, event, details = {}) {
  const payload = {
    event,
    provider: isSupabaseAuthEnabled() ? 'supabase' : 'local',
    ...details
  };
  if (level === 'warn') {
    console.warn('[auth]', payload);
    return;
  }
  console.log('[auth]', payload);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function ensureDirectory(dirPath) {
  if (fsSync.existsSync(dirPath)) return;
  fsSync.mkdirSync(dirPath, { recursive: true });
}

function normalizeAppDataSnapshot(value) {
  const parsed = value && typeof value === 'object' ? value : {};
  const boards = Array.isArray(parsed.boards) ? parsed.boards : [];
  return { boards };
}

async function readAppDataSnapshot(filePath = appDataPath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return normalizeAppDataSnapshot(safeJsonParse(raw, {}));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return { boards: [] };
    }
    throw error;
  }
}

let appDataWriteChain = Promise.resolve();
function writeAppDataSnapshot(snapshot, filePath = appDataPath) {
  const normalized = normalizeAppDataSnapshot(snapshot);
  const payload = JSON.stringify(normalized);
  appDataWriteChain = appDataWriteChain.then(async () => {
    ensureDirectory(path.dirname(filePath));
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, payload, 'utf8');
    await fs.rename(tempPath, filePath);
  });
  return appDataWriteChain;
}

function normalizeInterviewProjectPayload(value) {
  const parsed = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    projectName: String(parsed.projectName || '').trim().slice(0, 200),
    transcriptFileName: String(parsed.transcriptFileName || '').trim().slice(0, 240),
    transcriptWarning: String(parsed.transcriptWarning || '').trim().slice(0, 1_000),
    speakerEditorOpen: parsed.speakerEditorOpen !== false,
    speakerAssignments: normalizeInterviewSpeakerAssignments(parsed.speakerAssignments),
    bites: normalizeInterviewProjectBites(parsed.bites)
  };
}

function normalizeInterviewSpeakerAssignments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 10)
    .map((entry) => {
      const parsed = entry && typeof entry === 'object' ? entry : {};
      return {
        key: String(parsed.key || '').trim().slice(0, 120),
        label: String(parsed.label || '').trim().slice(0, 120),
        name: String(parsed.name || '').trim().slice(0, 120),
        draft: String(parsed.draft || '').trim().slice(0, 120)
      };
    })
    .filter((entry) => entry.key || entry.label || entry.name || entry.draft);
}

function normalizeInterviewProjectBites(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 2_500)
    .map((entry) => normalizeInterviewProjectBite(entry))
    .filter(Boolean);
}

function normalizeInterviewProjectBite(value) {
  const parsed = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const tone = String(parsed.tone || 'none').trim().toLowerCase();
  const normalizedTone = tone === 'red' || tone === 'yellow' || tone === 'green' ? tone : 'none';
  const comments = Array.isArray(parsed.comments)
    ? parsed.comments
        .map((comment) => String(comment || '').trim().slice(0, 1_000))
        .filter(Boolean)
        .slice(0, 100)
    : [];
  return {
    id: String(parsed.id || crypto.randomUUID()).trim().slice(0, 120) || crypto.randomUUID(),
    startSeconds: normalizeInterviewProjectTimeValue(parsed.startSeconds),
    endSeconds: normalizeInterviewProjectTimeValue(parsed.endSeconds),
    text: String(parsed.text || '').replace(/\r\n/g, '\n').trim().slice(0, 20_000),
    tone: normalizedTone,
    speakerKey: String(parsed.speakerKey || '').trim().slice(0, 120),
    speakerLabel: String(parsed.speakerLabel || '').trim().slice(0, 120),
    comments
  };
}

function normalizeInterviewProjectTimeValue(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return numeric;
}

function serializeInterviewProjectRow(row) {
  if (!row) return null;
  const payload = normalizeInterviewProjectPayload(safeJsonParse(row.payload_json || '{}', {}));
  const id = String(row.id || '').trim();
  const version = Math.max(0, Number(row.version) || 0);
  const audioAvailable = Math.max(0, Number(row.audio_bytes) || 0) > 0;
  return {
    id,
    version,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    audioFileName: String(row.audio_filename || '').trim(),
    audioAvailable,
    ...payload
  };
}

function readInterviewProjectRow(db, projectId) {
  return db.prepare(`
    SELECT
      id,
      payload_json,
      audio_filename,
      version,
      created_at,
      updated_at,
      CASE WHEN audio_blob IS NOT NULL THEN length(audio_blob) ELSE 0 END AS audio_bytes
    FROM interview_projects
    WHERE id = ?
  `).get(projectId);
}

function createInterviewProjectRecord(db) {
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO interview_projects (id, payload_json) VALUES (?, ?)').run(id, '{}');
  return serializeInterviewProjectRow(readInterviewProjectRow(db, id));
}

function readInterviewProjectRecord(db, projectId) {
  return serializeInterviewProjectRow(readInterviewProjectRow(db, projectId));
}

function writeInterviewProjectPayload(db, projectId, payload) {
  const normalized = normalizeInterviewProjectPayload(payload);
  const info = db.prepare(`
    UPDATE interview_projects
    SET
      payload_json = ?,
      version = version + 1,
      updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    WHERE id = ?
  `).run(JSON.stringify(normalized), projectId);
  if (!info.changes) {
    throw createHttpError('Shared project not found.', 404);
  }
  return readInterviewProjectRecord(db, projectId);
}

function writeInterviewProjectAudio(db, projectId, buffer, filename, mimeType) {
  const normalizedFilename = String(filename || 'audio').trim().slice(0, 240) || 'audio';
  const normalizedMimeType = String(mimeType || 'application/octet-stream').trim().slice(0, 120) || 'application/octet-stream';
  const info = db.prepare(`
    UPDATE interview_projects
    SET
      audio_blob = ?,
      audio_filename = ?,
      audio_mime_type = ?
    WHERE id = ?
  `).run(buffer, normalizedFilename, normalizedMimeType, projectId);
  if (!info.changes) {
    throw createHttpError('Shared project not found.', 404);
  }
}

function readInterviewProjectAudio(db, projectId) {
  const row = db.prepare(`
    SELECT
      audio_blob,
      audio_filename,
      audio_mime_type
    FROM interview_projects
    WHERE id = ?
  `).get(projectId);
  if (!row?.audio_blob) return null;
  return {
    buffer: Buffer.from(row.audio_blob),
    filename: String(row.audio_filename || '').trim(),
    mimeType: String(row.audio_mime_type || 'application/octet-stream').trim() || 'application/octet-stream'
  };
}

async function resolveAnonymousSnapshot(db) {
  const sharedSnapshot = await readAppDataSnapshot();
  if (boardSnapshotHasBoards(sharedSnapshot)) {
    return sharedSnapshot;
  }
  const template = resolveProvisioningTemplate(db, '');
  if (!template) {
    return sharedSnapshot;
  }
  const templateBoard = safeJsonParse(template.board_json || '{}', {});
  if (!templateBoard || typeof templateBoard !== 'object' || Array.isArray(templateBoard)) {
    return sharedSnapshot;
  }
  const normalizedBoard = cloneJson(templateBoard, {}) || {};
  const normalizedName = String(normalizedBoard.name || '').trim();
  if (!normalizedName) {
    normalizedBoard.name = String(template.title || DEFAULT_DEMO_BOARD_NAME).trim() || DEFAULT_DEMO_BOARD_NAME;
  }
  if (isOwnerTemplateBoardName(normalizedBoard.name)) {
    normalizedBoard.name = getPreferredOwnerTemplateBoardName();
  }
  return normalizeAppDataSnapshot({
    boards: [normalizedBoard]
  });
}

function resolveAnonymousBetaSnapshot(db) {
  const template = resolveProvisioningTemplate(db, '');
  if (!template) {
    return { boards: [] };
  }
  const cloned = cloneBoardFromTemplateRecord(template, {
    boardName: getPreferredOwnerTemplateBoardName()
  });
  if (!cloned?.board) {
    return { boards: [] };
  }
  return normalizeAppDataSnapshot({
    boards: [cloned.board]
  });
}

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
  if (!fsSync.existsSync(migrationsDir)) return;
  const files = fsSync
    .readdirSync(migrationsDir)
    .filter((entry) => entry.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
  const hasMigration = db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?');
  const insertMigration = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)');
  for (const file of files) {
    if (hasMigration.get(file)) continue;
    const sql = fsSync.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      insertMigration.run(file);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

function openDatabase(filePath = dbPath) {
  ensureDirectory(path.dirname(filePath));
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);
  return db;
}

function normalizeCategoryType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_TYPES.has(normalized) ? normalized : 'text';
}

function normalizeAllowedOptions(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of value) {
    const text = String(raw || '').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function slugifyCategoryKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function respondJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache'
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error('Request body too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      resolve(safeJsonParse(body, {}));
    });
    req.on('error', reject);
  });
}

function readBinaryBody(req, maxBytes = 100_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    req.on('data', (chunk) => {
      const nextChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += nextChunk.length;
      if (totalBytes > maxBytes) {
        reject(createHttpError('Request body too large.', 413));
        req.destroy();
        return;
      }
      chunks.push(nextChunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

function respondBuffer(req, res, buffer, mimeType = 'application/octet-stream') {
  const payload = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || '');
  const baseHeaders = {
    'Content-Type': mimeType,
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes'
  };
  const totalBytes = payload.length;
  const rangeHeader = String(req.headers.range || '').trim();
  const rangeMatch = rangeHeader.match(/^bytes=(\d*)-(\d*)$/i);

  if (rangeMatch) {
    const startRaw = rangeMatch[1];
    const endRaw = rangeMatch[2];
    let start = startRaw ? Number.parseInt(startRaw, 10) : NaN;
    let end = endRaw ? Number.parseInt(endRaw, 10) : NaN;

    if (!startRaw) {
      const suffixLength = Number.parseInt(endRaw, 10);
      if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${totalBytes}`
        });
        res.end();
        return;
      }
      start = Math.max(totalBytes - suffixLength, 0);
      end = Math.max(totalBytes - 1, 0);
    } else {
      if (!Number.isInteger(start) || start < 0 || start >= totalBytes) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${totalBytes}`
        });
        res.end();
        return;
      }
      if (!endRaw || !Number.isInteger(end) || end >= totalBytes) {
        end = Math.max(totalBytes - 1, 0);
      }
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
      res.writeHead(416, {
        ...baseHeaders,
        'Content-Range': `bytes */${totalBytes}`
      });
      res.end();
      return;
    }

    res.writeHead(206, {
      ...baseHeaders,
      'Content-Range': `bytes ${start}-${end}/${totalBytes}`,
      'Content-Length': String(end - start + 1)
    });
    if ((req.method || 'GET').toUpperCase() === 'HEAD') {
      res.end();
      return;
    }
    res.end(payload.subarray(start, end + 1));
    return;
  }

  res.writeHead(200, {
    ...baseHeaders,
    'Content-Length': String(totalBytes)
  });
  if ((req.method || 'GET').toUpperCase() === 'HEAD') {
    res.end();
    return;
  }
  res.end(payload);
}

function createHttpError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeSiteFeedbackCategory(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return SITE_FEEDBACK_CATEGORY_OPTIONS.has(normalized) ? normalized : '';
}

function normalizeSiteFeedbackMessage(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, 2_000);
}

function normalizeSiteFeedbackPageUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).toString().slice(0, 500);
  } catch {
    return raw.slice(0, 500);
  }
}

function collectRequestIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').trim();
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || '';
  }
  return String(req.socket?.remoteAddress || '').trim();
}

function normalizeSiteFeedbackSubmission(body = {}, context = {}) {
  const category = normalizeSiteFeedbackCategory(body?.category);
  if (!category) {
    throw createHttpError('Please choose a feedback type.', 400);
  }

  const message = normalizeSiteFeedbackMessage(body?.message);
  if (!message) {
    throw createHttpError('Please enter your feedback message.', 400);
  }

  return {
    category,
    categoryLabel: SITE_FEEDBACK_CATEGORY_OPTIONS.get(category) || 'Other',
    message,
    pageUrl: normalizeSiteFeedbackPageUrl(body?.pageUrl),
    pageTitle: String(body?.pageTitle || '').trim().slice(0, 200),
    submittedAt: new Date().toISOString(),
    userAgent: String(context?.userAgent || '').trim().slice(0, 500),
    ipAddress: String(context?.ipAddress || '').trim().slice(0, 200),
    user: context?.user
      ? {
          id: String(context.user.id || '').trim(),
          email: String(context.user.email || '').trim(),
          displayName: String(context.user.displayName || '').trim()
        }
      : null
  };
}

function formatSiteFeedbackEmailText(submission = {}) {
  const lines = [
    `Category: ${submission.categoryLabel || 'Other'}`,
    `Submitted At: ${submission.submittedAt || ''}`,
    `Page Title: ${submission.pageTitle || '(not provided)'}`,
    `Page URL: ${submission.pageUrl || '(not provided)'}`,
    `User Name: ${submission.user?.displayName || '(anonymous)'}`,
    `User Email: ${submission.user?.email || '(anonymous)'}`,
    `User ID: ${submission.user?.id || '(anonymous)'}`,
    `IP Address: ${submission.ipAddress || '(unavailable)'}`,
    `User Agent: ${submission.userAgent || '(unavailable)'}`,
    '',
    'Message:',
    submission.message || ''
  ];
  return lines.join('\n');
}

async function sendSiteFeedbackEmail(submission = {}) {
  if (!RESEND_API_KEY) {
    throw createHttpError('Feedback email is not configured on the server yet.', 503);
  }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        from: FEEDBACK_EMAIL_FROM,
        to: [FEEDBACK_EMAIL_TO],
        subject: `ShopBoard feedback: ${submission.categoryLabel || 'Other'}`,
        text: formatSiteFeedbackEmailText(submission)
      })
    });
  } catch (error) {
    console.error('Feedback email request failed:', error);
    throw createHttpError('Feedback could not be sent right now. Please try again later.', 502);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Feedback email delivery failed:', {
      status: response.status,
      detail: detail.slice(0, 500)
    });
    throw createHttpError('Feedback could not be sent right now. Please try again later.', 502);
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeBoardActivityText(value, maxLength = 500) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function deriveBoardItemName(item, fallback = 'Untitled item') {
  const candidate = normalizeBoardActivityText(
    item?.name || item?.title || item?.itemName || item?.label || '',
    160
  );
  return candidate || fallback;
}

function buildBoardItemKey(item, index = 0) {
  const itemId = String(item?.id || '').trim();
  if (itemId) return `id:${itemId}`;
  const name = deriveBoardItemName(item, '').toLowerCase();
  return `fallback:${index}:${name}`;
}

function normalizeBoardDiscussionEntry(entry, index = 0) {
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    const id = String(entry.id || '').trim();
    const author = normalizeBoardActivityText(entry.author || entry.user || entry.displayName || '', 120);
    const text = normalizeBoardActivityText(entry.text || entry.comment || entry.message || entry.body || '', 800);
    const createdAt = String(entry.createdAt || entry.created_at || '').trim().slice(0, 80);
    const fingerprint = id || `${author}|${text}|${createdAt}|${index}`;
    return {
      id,
      author,
      text,
      createdAt,
      fingerprint
    };
  }

  const text = normalizeBoardActivityText(entry, 800);
  return {
    id: '',
    author: '',
    text,
    createdAt: '',
    fingerprint: `text:${text}|${index}`
  };
}

function summarizeAddedBoardEntries(previousEntries, nextEntries) {
  const previousFingerprints = new Set(
    (Array.isArray(previousEntries) ? previousEntries : [])
      .map((entry, index) => normalizeBoardDiscussionEntry(entry, index).fingerprint)
      .filter(Boolean)
  );
  return (Array.isArray(nextEntries) ? nextEntries : [])
    .map((entry, index) => normalizeBoardDiscussionEntry(entry, index))
    .filter((entry) => entry.text && !previousFingerprints.has(entry.fingerprint));
}

function summarizeBoardActivityChanges(previousBoard, nextBoard) {
  const previousItems = listBoardItems(previousBoard);
  const nextItems = listBoardItems(nextBoard);
  const previousItemsByKey = new Map(previousItems.map((item, index) => [buildBoardItemKey(item, index), item]));
  const addedItems = [];
  const addedFeedbacks = [];
  const addedComments = [];

  for (const [index, item] of nextItems.entries()) {
    const itemKey = buildBoardItemKey(item, index);
    const previousItem = previousItemsByKey.get(itemKey);
    const itemName = deriveBoardItemName(item);
    const itemId = String(item?.id || '').trim();

    if (!previousItem) {
      addedItems.push({ itemId, itemName });
    }

    for (const feedback of summarizeAddedBoardEntries(previousItem?.feedbacks, item?.feedbacks)) {
      addedFeedbacks.push({
        itemId,
        itemName,
        author: feedback.author,
        text: feedback.text
      });
    }

    for (const comment of summarizeAddedBoardEntries(previousItem?.comments, item?.comments)) {
      addedComments.push({
        itemId,
        itemName,
        author: comment.author,
        text: comment.text
      });
    }
  }

  return {
    addedItems,
    addedFeedbacks,
    addedComments,
    hasChanges: Boolean(addedItems.length || addedFeedbacks.length || addedComments.length)
  };
}

function formatBoardActivityListLines(entries, formatter, maxEntries = 8) {
  const lines = entries.slice(0, maxEntries).map((entry) => `- ${formatter(entry)}`);
  const remaining = entries.length - Math.min(entries.length, maxEntries);
  if (remaining > 0) {
    lines.push(`- ${remaining} more`);
  }
  return lines;
}

function formatBoardActivityEmailText(notification = {}) {
  const boardName = normalizeBoardActivityText(notification?.board?.name || 'Untitled board', 160) || 'Untitled board';
  const actorName = normalizeBoardActivityText(notification?.actor?.displayName || notification?.actor?.email || 'Someone', 120) || 'Someone';
  const lines = [
    `${actorName} updated "${boardName}" on ShopBoard.`,
    ''
  ];

  if (notification?.changes?.addedItems?.length) {
    lines.push('Items added:');
    lines.push(...formatBoardActivityListLines(notification.changes.addedItems, (entry) => entry.itemName));
    lines.push('');
  }

  if (notification?.changes?.addedFeedbacks?.length) {
    lines.push('Feedback added:');
    lines.push(...formatBoardActivityListLines(notification.changes.addedFeedbacks, (entry) => {
      const authorPrefix = entry.author ? `${entry.author}: ` : '';
      return `${entry.itemName} - ${authorPrefix}${entry.text}`;
    }));
    lines.push('');
  }

  if (notification?.changes?.addedComments?.length) {
    lines.push('Comments added:');
    lines.push(...formatBoardActivityListLines(notification.changes.addedComments, (entry) => {
      const authorPrefix = entry.author ? `${entry.author}: ` : '';
      return `${entry.itemName} - ${authorPrefix}${entry.text}`;
    }));
    lines.push('');
  }

  lines.push(`View board: ${notification.boardUrl || ''}`);
  return lines.join('\n');
}

function formatBoardActivityEmailHtml(notification = {}) {
  const boardName = escapeHtml(notification?.board?.name || 'Untitled board');
  const actorName = escapeHtml(notification?.actor?.displayName || notification?.actor?.email || 'Someone');
  const sections = [`<p>${actorName} updated <strong>${boardName}</strong> on ShopBoard.</p>`];

  const renderList = (title, entries, formatter) => {
    if (!entries.length) return;
    const items = formatBoardActivityListLines(entries, formatter)
      .map((line) => `<li>${escapeHtml(line.replace(/^- /, ''))}</li>`)
      .join('');
    sections.push(`<p><strong>${escapeHtml(title)}</strong></p><ul>${items}</ul>`);
  };

  renderList('Items added', notification?.changes?.addedItems || [], (entry) => entry.itemName);
  renderList('Feedback added', notification?.changes?.addedFeedbacks || [], (entry) => {
    const authorPrefix = entry.author ? `${entry.author}: ` : '';
    return `${entry.itemName} - ${authorPrefix}${entry.text}`;
  });
  renderList('Comments added', notification?.changes?.addedComments || [], (entry) => {
    const authorPrefix = entry.author ? `${entry.author}: ` : '';
    return `${entry.itemName} - ${authorPrefix}${entry.text}`;
  });

  if (notification.boardUrl) {
    sections.push(`<p><a href="${escapeHtml(notification.boardUrl)}">View board</a></p>`);
  }

  return sections.join('');
}

async function sendBoardActivityEmail(notification = {}) {
  if (!RESEND_API_KEY) {
    return { skipped: true, reason: 'missing-resend-api-key' };
  }

  const recipientEmail = normalizeEmailAddress(notification?.recipient?.email || '');
  if (!recipientEmail) {
    return { skipped: true, reason: 'missing-recipient-email' };
  }

  const actorName = normalizeBoardActivityText(notification?.actor?.displayName || notification?.actor?.email || 'Someone', 120) || 'Someone';
  const boardName = normalizeBoardActivityText(notification?.board?.name || 'Untitled board', 160) || 'Untitled board';

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        from: BOARD_ACTIVITY_EMAIL_FROM,
        to: [recipientEmail],
        subject: `${actorName} updated ${boardName}`,
        text: formatBoardActivityEmailText(notification),
        html: formatBoardActivityEmailHtml(notification)
      })
    });
  } catch (error) {
    console.error('Board activity email request failed:', error);
    throw createHttpError('Board activity email could not be sent right now.', 502);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Board activity email delivery failed:', {
      status: response.status,
      detail: detail.slice(0, 500)
    });
    throw createHttpError('Board activity email could not be sent right now.', 502);
  }

  return { ok: true };
}

function rowToCategory(row) {
  return {
    id: row.id,
    label: row.label,
    slug: row.slug,
    key: row.slug,
    type: row.type,
    allowedOptions: safeJsonParse(row.allowed_options_json || '[]', []),
    isDefault: Boolean(row.is_default),
    isDeletable: Boolean(row.is_deletable),
    position: Number(row.position || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scope: {
      type: row.scope_type,
      id: row.scope_id
    }
  };
}

function listCategoriesForScope(db, scopeType, scopeId) {
  const rows = db.prepare(`
    SELECT id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position, created_at, updated_at
    FROM categories
    WHERE scope_type = ? AND scope_id = ?
    ORDER BY position ASC, created_at ASC
  `).all(scopeType, scopeId);
  return rows.map(rowToCategory);
}

function ensureDefaultCategories(db, scopeType, scopeId) {
  const existingRows = db.prepare(`
    SELECT id, slug, label, type, allowed_options_json, is_default, is_deletable, position, created_at, updated_at, scope_type, scope_id
    FROM categories
    WHERE scope_type = ? AND scope_id = ?
    ORDER BY position ASC, created_at ASC
  `).all(scopeType, scopeId);
  if (!existingRows.length) {
    const insert = db.prepare(`
      INSERT INTO categories (
        id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
    `);
    const nowDefaults = DEFAULT_CATEGORIES.map((entry, index) => ({
      id: crypto.randomUUID(),
      scopeType,
      scopeId,
      label: entry.label,
      slug: entry.slug,
      type: entry.type,
      position: index
    }));
    db.exec('BEGIN');
    try {
      for (const entry of nowDefaults) {
        insert.run(
          entry.id,
          entry.scopeType,
          entry.scopeId,
          entry.label,
          entry.slug,
          entry.type,
          JSON.stringify([]),
          entry.position
        );
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    return listCategoriesForScope(db, scopeType, scopeId);
  }

  const existingBySlug = new Map(existingRows.map((row) => [row.slug, row]));
  const missing = DEFAULT_CATEGORIES.filter((entry) => !existingBySlug.has(entry.slug));
  if (missing.length) {
    const getMaxPosition = db.prepare(`
      SELECT COALESCE(MAX(position), -1) AS max_position
      FROM categories
      WHERE scope_type = ? AND scope_id = ?
    `).get(scopeType, scopeId);
    let nextPosition = Number(getMaxPosition?.max_position || -1) + 1;
    const insert = db.prepare(`
      INSERT INTO categories (
        id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
    `);
    db.exec('BEGIN');
    try {
      for (const entry of missing) {
        insert.run(
          crypto.randomUUID(),
          scopeType,
          scopeId,
          entry.label,
          entry.slug,
          entry.type,
          JSON.stringify([]),
          nextPosition
        );
        nextPosition += 1;
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  return listCategoriesForScope(db, scopeType, scopeId);
}

function parseTypedValue(type, rawValue, allowedOptions = []) {
  if (rawValue == null || rawValue === '') return { hasValue: false, value: null, stored: {} };
  if (type === 'number') {
    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric)) {
      throw new Error('Invalid number value.');
    }
    return {
      hasValue: true,
      value: numeric,
      stored: { value_number: numeric }
    };
  }
  if (type === 'boolean') {
    let boolValue = null;
    if (typeof rawValue === 'boolean') {
      boolValue = rawValue;
    } else {
      const normalized = String(rawValue).trim().toLowerCase();
      if (normalized === 'true' || normalized === 'yes') boolValue = true;
      if (normalized === 'false' || normalized === 'no') boolValue = false;
    }
    if (typeof boolValue !== 'boolean') {
      throw new Error('Invalid boolean value.');
    }
    return {
      hasValue: true,
      value: boolValue,
      stored: { value_boolean: boolValue ? 1 : 0 }
    };
  }
  if (type === 'select') {
    const text = String(rawValue || '').trim();
    if (!text) return { hasValue: false, value: null, stored: {} };
    if (allowedOptions.length && !allowedOptions.some((entry) => entry.toLowerCase() === text.toLowerCase())) {
      throw new Error('Select value must be one of allowedOptions.');
    }
    const matched = allowedOptions.find((entry) => entry.toLowerCase() === text.toLowerCase()) || text;
    return {
      hasValue: true,
      value: matched,
      stored: { value_select: matched }
    };
  }
  const text = String(rawValue || '').trim();
  if (!text) return { hasValue: false, value: null, stored: {} };
  return {
    hasValue: true,
    value: text,
    stored: { value_text: text }
  };
}

function decodeStoredValue(row) {
  if (!row) return null;
  if (row.value_type === 'number') return row.value_number;
  if (row.value_type === 'boolean') return Boolean(row.value_boolean);
  if (row.value_type === 'select') return row.value_select;
  return row.value_text;
}

class ExtractError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ExtractError';
    this.status = status;
  }
}

function safeJsonParse(raw, fallback = {}) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function parseCookieHeader(rawCookie) {
  const out = {};
  const text = String(rawCookie || '');
  if (!text) return out;
  const pairs = text.split(';');
  for (const pair of pairs) {
    const [nameRaw, ...valueParts] = pair.split('=');
    const name = String(nameRaw || '').trim();
    if (!name) continue;
    const value = valueParts.join('=').trim();
    if (!value) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

function appendSetCookieHeader(res, cookieValue) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieValue]);
    return;
  }
  res.setHeader('Set-Cookie', [String(existing), cookieValue]);
}

function isSecureRequest(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  if (forwardedProto) return forwardedProto === 'https';
  return Boolean(req.socket && 'encrypted' in req.socket && req.socket.encrypted);
}

function createSessionCookie(token, req) {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(String(token || ''))}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`
  ];
  if (isSecureRequest(req)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function createClearSessionCookie(req) {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];
  if (isSecureRequest(req)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function normalizeEmailAddress(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized || normalized.length > 320) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return '';
  return normalized;
}

function deriveDisplayNameFromEmail(email) {
  const local = String(email || '').split('@')[0] || 'ShopBoard User';
  const cleaned = local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  if (!cleaned) return 'ShopBoard User';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((entry) => entry[0].toUpperCase() + entry.slice(1))
    .join(' ');
}

function normalizeDisplayName(value, email = '') {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return deriveDisplayNameFromEmail(email);
  return text.slice(0, 60);
}

function normalizePersonNamePart(value, maxLength = 30) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function requireFullName(payload = {}) {
  const firstName = normalizePersonNamePart(payload.firstName);
  const lastName = normalizePersonNamePart(payload.lastName);
  if (!firstName || !lastName) {
    throw new DataError('First and last name are required.', 400);
  }
  return {
    firstName,
    lastName,
    displayName: normalizeDisplayName(`${firstName} ${lastName}`.trim())
  };
}

function validatePassword(value) {
  const password = String(value || '');
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  if (password.length > 256) {
    return { valid: false, error: 'Password is too long.' };
  }
  return { valid: true, password };
}

function hashPassword(password) {
  const salt = nodeCrypto.randomBytes(16).toString('hex');
  const hash = nodeCrypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const normalizedHash = String(passwordHash || '');
  const parts = normalizedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = parts[1];
  const expectedHex = parts[2];
  if (!salt || !expectedHex) return false;
  try {
    const actual = nodeCrypto.scryptSync(String(password || ''), salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (expected.length !== actual.length) return false;
    return nodeCrypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function createSessionToken() {
  return nodeCrypto.randomBytes(32).toString('base64url');
}

function hashSessionToken(token) {
  return nodeCrypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function isSupabaseAuthEnabled() {
  return SUPABASE_AUTH_ENABLED;
}

function parseSupabaseErrorMessage(payload, fallback = 'Could not authenticate.') {
  const parsed = payload && typeof payload === 'object' ? payload : {};
  const message = String(
    parsed.error_description
    || parsed.msg
    || parsed.message
    || parsed.error
    || fallback
  ).trim();
  return message || fallback;
}

async function requestSupabaseAuth(pathname, options = {}) {
  if (!isSupabaseAuthEnabled()) {
    throw new DataError('Supabase authentication is not configured.', 500);
  }
  const endpoint = `${SUPABASE_URL}${pathname}`;
  const method = String(options.method || 'GET').toUpperCase();
  const body = options.body == null ? undefined : JSON.stringify(options.body);
  const supabaseHeaders = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  // Legacy anon keys are JWTs and can be sent as bearer tokens.
  // New publishable keys are not JWTs and should not be used as Authorization bearer.
  const keyLooksLikeJwt = SUPABASE_ANON_KEY.split('.').length === 3;
  if (keyLooksLikeJwt) {
    supabaseHeaders.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_AUTH_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method,
      headers: supabaseHeaders,
      body,
      signal: controller.signal
    });
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    if (!response.ok) {
      throw new DataError(
        parseSupabaseErrorMessage(payload, 'Could not authenticate with Supabase.'),
        response.status === 401 ? 401 : response.status
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof DataError) throw error;
    if (String(error?.name || '') === 'AbortError') {
      throw new DataError('Supabase request timed out. Try again.', 504);
    }
    throw new DataError('Could not reach Supabase authentication service.', 502);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeSupabaseIdentity(payload = {}, fallbackEmail = '') {
  const parsed = payload && typeof payload === 'object' ? payload : {};
  const user = parsed.user && typeof parsed.user === 'object' ? parsed.user : parsed;
  const metadata = user?.user_metadata && typeof user.user_metadata === 'object'
    ? user.user_metadata
    : {};
  const email = normalizeEmailAddress(user?.email || fallbackEmail);
  return {
    id: String(user?.id || '').trim(),
    email,
    displayName: normalizeDisplayName(
      metadata.display_name || metadata.full_name || metadata.name || '',
      email
    )
  };
}

async function signUpWithSupabase(payload = {}) {
  const email = normalizeEmailAddress(payload.email);
  if (!email) {
    throw new DataError('Enter a valid email address.', 400);
  }
  const fullName = requireFullName(payload);
  const passwordResult = validatePassword(payload.password);
  if (!passwordResult.valid) {
    throw new DataError(passwordResult.error, 400);
  }
  try {
    const result = await requestSupabaseAuth('/auth/v1/signup', {
      method: 'POST',
      body: {
        email,
        password: passwordResult.password,
        data: {
          first_name: fullName.firstName,
          last_name: fullName.lastName,
          full_name: fullName.displayName,
          display_name: fullName.displayName
        }
      }
    });
    const hasSession = Boolean(
      result?.session?.access_token
      || result?.access_token
      || result?.session?.refresh_token
      || result?.refresh_token
    );
    if (!hasSession) {
      throw new DataError('Account created. Check your email to confirm your account, then sign in.', 403);
    }
    return normalizeSupabaseIdentity(result, email);
  } catch (error) {
    if (error instanceof DataError) {
      const message = String(error.message || '').toLowerCase();
      if (error.status === 422 || message.includes('already')) {
        throw new DataError('An account with that email already exists.', 409);
      }
    }
    throw error;
  }
}

async function signInWithSupabase(payload = {}) {
  const email = normalizeEmailAddress(payload.email);
  const password = String(payload.password || '');
  if (!email || !password) {
    throw new DataError('Email and password are required.', 400);
  }
  try {
    const result = await requestSupabaseAuth('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: {
        email,
        password
      }
    });
    return normalizeSupabaseIdentity(result, email);
  } catch (error) {
    if (error instanceof DataError) {
      const message = String(error.message || '').toLowerCase();
      if (message.includes('email not confirmed') || message.includes('email not verified')) {
        throw new DataError('Please confirm your email, then sign in.', 401);
      }
      if (error.status === 400 || error.status === 401) {
        throw new DataError('Invalid email or password.', 401);
      }
    }
    throw error;
  }
}

function rowToPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || deriveDisplayNameFromEmail(row.email),
    hasSeenBetaWelcome: Boolean(row.has_seen_beta_welcome),
    betaAccessAcknowledgedAt: row.beta_access_acknowledged_at || null,
    hasSeenFirstLinkNotice: Boolean(row.has_seen_first_link_notice),
    firstLinkNoticeEligible: Boolean(row.first_link_notice_eligible),
    firstLinkNoticeTriggeredAt: row.first_link_notice_triggered_at || null,
    hasSeededDemoBoard: Boolean(row.has_seeded_demo_board),
    demoBoardSeededAt: row.demo_board_seeded_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readPublicUserById(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) return null;
  const row = db.prepare(`
    SELECT
      id,
      email,
      display_name,
      has_seen_beta_welcome,
      beta_access_acknowledged_at,
      has_seen_first_link_notice,
      first_link_notice_eligible,
      first_link_notice_triggered_at,
      has_seeded_demo_board,
      demo_board_seeded_at,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `).get(normalizedUserId);
  return rowToPublicUser(row);
}

function tableExists(db, tableName) {
  const normalizedName = String(tableName || '').trim();
  if (!normalizedName) return false;
  const row = db.prepare(`
    SELECT 1
    FROM sqlite_master
    WHERE type = 'table' AND name = ?
    LIMIT 1
  `).get(normalizedName);
  return Boolean(row);
}

function readPublicUserByEmail(db, email) {
  const normalizedEmail = normalizeEmailAddress(email);
  if (!normalizedEmail) return null;
  const row = db.prepare(`
    SELECT
      id,
      email,
      display_name,
      has_seen_beta_welcome,
      beta_access_acknowledged_at,
      has_seen_first_link_notice,
      first_link_notice_eligible,
      first_link_notice_triggered_at,
      has_seeded_demo_board,
      demo_board_seeded_at,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `).get(normalizedEmail);
  return rowToPublicUser(row);
}

function resolveAppOrigin(req) {
  if (APP_ORIGIN) return APP_ORIGIN;
  const host = String(req?.headers?.host || '').trim();
  if (!host) return 'http://localhost:3000';
  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').trim();
  const protocol = forwardedProto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function buildBoardUrl(req, boardId, ownerUserId = '') {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) return resolveAppOrigin(req);
  const url = new URL('/', `${resolveAppOrigin(req)}/`);
  url.searchParams.set('board', normalizedBoardId);
  if (String(ownerUserId || '').trim()) {
    url.searchParams.set('owner', String(ownerUserId).trim());
  }
  return url.toString();
}

function upsertSharedBoardParticipant(db, boardId, ownerUserId, userId) {
  const normalizedBoardId = String(boardId || '').trim();
  const normalizedOwnerId = String(ownerUserId || '').trim();
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedBoardId || !normalizedOwnerId || !normalizedUserId) return false;
  if (normalizedOwnerId === normalizedUserId) return false;
  db.prepare(`
    INSERT INTO shared_board_participants (board_id, owner_user_id, user_id, first_accessed_at, last_accessed_at)
    VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(board_id, owner_user_id, user_id) DO UPDATE SET
      last_accessed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `).run(normalizedBoardId, normalizedOwnerId, normalizedUserId);
  return true;
}

function listSharedBoardParticipantUsers(db, boardId, ownerUserId) {
  const normalizedBoardId = String(boardId || '').trim();
  const normalizedOwnerId = String(ownerUserId || '').trim();
  if (!normalizedBoardId || !normalizedOwnerId) return [];
  const rows = db.prepare(`
    SELECT
      u.id,
      u.email,
      u.display_name,
      u.has_seen_beta_welcome,
      u.beta_access_acknowledged_at,
      u.has_seen_first_link_notice,
      u.first_link_notice_eligible,
      u.first_link_notice_triggered_at,
      u.has_seeded_demo_board,
      u.demo_board_seeded_at,
      u.created_at,
      u.updated_at
    FROM shared_board_participants p
    JOIN users u ON u.id = p.user_id
    WHERE p.board_id = ? AND p.owner_user_id = ?
    ORDER BY p.last_accessed_at DESC
  `).all(normalizedBoardId, normalizedOwnerId);
  return rows.map((row) => rowToPublicUser(row)).filter(Boolean);
}

async function notifyBoardActivityRecipients({
  db,
  req,
  notificationSender,
  actorUser,
  ownerUserId,
  previousBoard,
  nextBoard
}) {
  const boardId = String(nextBoard?.id || previousBoard?.id || '').trim();
  const normalizedOwnerId = String(ownerUserId || '').trim();
  if (!actorUser || !boardId || !normalizedOwnerId) return;

  const changes = summarizeBoardActivityChanges(previousBoard, nextBoard);
  if (!changes.hasChanges) return;

  const recipientsById = new Map();
  const ownerUser = readPublicUserById(db, normalizedOwnerId);
  if (ownerUser?.id) {
    recipientsById.set(ownerUser.id, ownerUser);
  }
  for (const participant of listSharedBoardParticipantUsers(db, boardId, normalizedOwnerId)) {
    if (participant?.id) {
      recipientsById.set(participant.id, participant);
    }
  }
  recipientsById.delete(String(actorUser.id || '').trim());

  if (!recipientsById.size) return;

  const boardUrl = buildBoardUrl(req, boardId, normalizedOwnerId);
  const notificationJobs = [];
  for (const recipient of recipientsById.values()) {
    notificationJobs.push(
      notificationSender({
        recipient,
        actor: actorUser,
        owner: ownerUser,
        board: {
          id: boardId,
          name: String(nextBoard?.name || previousBoard?.name || '').trim()
        },
        changes,
        boardUrl
      }).catch((error) => {
        console.warn('Could not send board activity notification:', {
          boardId,
          ownerUserId: normalizedOwnerId,
          recipientUserId: recipient?.id || '',
          error: error instanceof Error ? error.message : String(error || '')
        });
      })
    );
  }
  await Promise.all(notificationJobs);
}

function normalizeBoardNameForMatch(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findBoardIdByName(snapshot, boardName) {
  const targetName = normalizeBoardNameForMatch(boardName);
  if (!targetName) return '';
  const boards = Array.isArray(snapshot?.boards) ? snapshot.boards : [];
  for (const board of boards) {
    if (normalizeBoardNameForMatch(board?.name) !== targetName) continue;
    const boardId = String(board?.id || '').trim();
    if (boardId) return boardId;
  }
  return '';
}

function findBoardIdByNames(snapshot, boardNames = []) {
  if (!Array.isArray(boardNames) || !boardNames.length) return '';
  for (const name of boardNames) {
    const found = findBoardIdByName(snapshot, name);
    if (found) return found;
  }
  return '';
}

function normalizeOwnerBoardNameCandidates(candidates = []) {
  const out = [];
  const seen = new Set();
  for (const rawName of candidates) {
    const normalizedName = normalizeDemoBoardName(rawName, '');
    if (!normalizedName) continue;
    const key = normalizeBoardNameForMatch(normalizedName);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(normalizedName);
  }
  return out;
}

function getOwnerMasterBoardNameCandidates() {
  return normalizeOwnerBoardNameCandidates([
    DEMO_TEMPLATE_OWNER_BOARD_NAME,
    LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME
  ]);
}

function getOwnerTemplateBoardNameCandidates() {
  return normalizeOwnerBoardNameCandidates([
    DEMO_TEMPLATE_OWNER_TEMPLATE_BOARD_NAME,
    ...getOwnerMasterBoardNameCandidates()
  ]);
}

function getPreferredOwnerMasterBoardName() {
  return getOwnerMasterBoardNameCandidates()[0] || LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME;
}

function getPreferredOwnerTemplateBoardName() {
  return getOwnerTemplateBoardNameCandidates()[0] || LEGACY_DEMO_TEMPLATE_OWNER_BOARD_NAME;
}

function getLegacyOwnerTemplateBoardNameCandidates() {
  const preferredKey = normalizeBoardNameForMatch(getPreferredOwnerTemplateBoardName());
  return getOwnerTemplateBoardNameCandidates().filter((candidate) => {
    const key = normalizeBoardNameForMatch(candidate);
    return Boolean(key && key !== preferredKey);
  });
}

function isOwnerTemplateBoardName(value) {
  const target = normalizeBoardNameForMatch(value);
  if (!target) return false;
  return getOwnerTemplateBoardNameCandidates().some(
    (candidate) => normalizeBoardNameForMatch(candidate) === target
  );
}

function tryAutoSyncOwnerTemplateFromSnapshot(db, userId, snapshot) {
  if (!tableExists(db, 'board_templates')) return;
  const ownerEmail = normalizeEmailAddress(DEMO_TEMPLATE_OWNER_EMAIL);
  if (!ownerEmail) return;
  const ownerBoardNames = getOwnerMasterBoardNameCandidates();
  const templateBoardName = getPreferredOwnerTemplateBoardName();
  if (!ownerBoardNames.length || !templateBoardName) return;

  const user = readPublicUserById(db, userId);
  if (!user) return;
  if (normalizeEmailAddress(user.email) !== ownerEmail) return;

  const sourceBoardId = findBoardIdByNames(snapshot, ownerBoardNames);
  if (!sourceBoardId) return;

  try {
    upsertBoardTemplateFromSourceBoard(db, {
      templateSlug: DEMO_TEMPLATE_OWNER_TEMPLATE_SLUG,
      title: templateBoardName,
      sourceBoardId,
      sourceUserId: user.id,
      sourceUserEmail: user.email,
      isDefault: true,
      isActive: true
    });
  } catch (error) {
    console.warn('Could not auto-sync owner template board:', error);
  }
}

function ensureLocalUserForSupabaseIdentity(db, identity = {}) {
  const normalizedEmail = normalizeEmailAddress(identity.email);
  if (!normalizedEmail) {
    throw new DataError('Supabase account is missing a valid email address.', 400);
  }
  const existing = readPublicUserByEmail(db, normalizedEmail);
  if (existing) return existing;

  const preferredId = String(identity.id || '').trim();
  let userId = preferredId || crypto.randomUUID();
  const displayName = normalizeDisplayName(identity.displayName, normalizedEmail);
  const placeholderPasswordHash = hashPassword(nodeCrypto.randomBytes(24).toString('hex'));
  const insertAccount = db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, first_link_notice_eligible)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      insertAccount.run(userId, normalizedEmail, placeholderPasswordHash, displayName);
      return readPublicUserById(db, userId);
    } catch (error) {
      const message = String(error?.message || '');
      if (message.includes('users.email')) {
        return readPublicUserByEmail(db, normalizedEmail);
      }
      if (message.includes('users.id') && attempt === 0) {
        userId = crypto.randomUUID();
        continue;
      }
      throw error;
    }
  }

  throw new DataError('Could not create local profile for Supabase account.', 500);
}

function readUserSnapshot(db, userId) {
  const accountId = String(userId || '').trim();
  if (!accountId) return { boards: [] };
  const row = db.prepare(`
    SELECT snapshot_json
    FROM user_snapshots
    WHERE user_id = ?
  `).get(accountId);
  if (!row?.snapshot_json) return { boards: [] };
  return normalizeAppDataSnapshot(safeJsonParse(row.snapshot_json, {}));
}

function writeUserSnapshot(db, userId, snapshot) {
  const accountId = String(userId || '').trim();
  if (!accountId) return { boards: [] };
  const normalized = normalizeAppDataSnapshot(snapshot);
  db.prepare(`
    INSERT INTO user_snapshots (user_id, snapshot_json, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(user_id) DO UPDATE SET
      snapshot_json = excluded.snapshot_json,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `).run(accountId, JSON.stringify(normalized));
  tryAutoSyncOwnerTemplateFromSnapshot(db, accountId, normalized);
  return normalized;
}

function normalizeLegacyOwnerTemplateBoardNamesForUser(db, userId, snapshot = null) {
  const accountId = String(userId || '').trim();
  if (!accountId) {
    return {
      changed: false,
      snapshot: normalizeAppDataSnapshot(snapshot)
    };
  }
  const user = readPublicUserById(db, accountId);
  const nextSnapshot = snapshot ? normalizeAppDataSnapshot(snapshot) : readUserSnapshot(db, accountId);
  const boards = Array.isArray(nextSnapshot?.boards) ? nextSnapshot.boards : [];
  if (!user || !user.hasSeededDemoBoard || !boards.length) {
    return { changed: false, snapshot: nextSnapshot };
  }

  const ownerEmail = normalizeEmailAddress(DEMO_TEMPLATE_OWNER_EMAIL);
  if (ownerEmail && normalizeEmailAddress(user.email) === ownerEmail) {
    return { changed: false, snapshot: nextSnapshot };
  }

  const preferredName = getPreferredOwnerTemplateBoardName();
  const preferredKey = normalizeBoardNameForMatch(preferredName);
  if (!preferredName || !preferredKey) {
    return { changed: false, snapshot: nextSnapshot };
  }
  const legacyKeys = new Set(
    getLegacyOwnerTemplateBoardNameCandidates()
      .map((name) => normalizeBoardNameForMatch(name))
      .filter(Boolean)
  );
  if (!legacyKeys.size) {
    return { changed: false, snapshot: nextSnapshot };
  }

  let changed = false;
  const normalizedBoards = boards.map((board) => {
    if (!board || typeof board !== 'object' || Array.isArray(board)) return board;
    const boardName = String(board.name || '').trim();
    const boardKey = normalizeBoardNameForMatch(boardName);
    if (!boardKey || !legacyKeys.has(boardKey)) return board;
    changed = true;
    return {
      ...board,
      name: preferredName
    };
  });

  if (!changed) {
    return { changed: false, snapshot: nextSnapshot };
  }

  const normalizedSnapshot = normalizeAppDataSnapshot({ boards: normalizedBoards });
  writeUserSnapshot(db, accountId, normalizedSnapshot);
  return {
    changed: true,
    snapshot: normalizedSnapshot
  };
}

function normalizeTemplateSlug(value, fallback = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  if (normalized) return normalized;
  return String(fallback || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeDemoBoardName(value, fallback = DEFAULT_DEMO_BOARD_NAME) {
  const candidate = String(value || '').trim().replace(/\s+/g, ' ');
  if (candidate) return candidate.slice(0, 120);
  const fallbackText = String(fallback || DEFAULT_DEMO_BOARD_NAME).trim().replace(/\s+/g, ' ');
  return (fallbackText || DEFAULT_DEMO_BOARD_NAME).slice(0, 120);
}

function cloneJson(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function boardSnapshotHasBoards(snapshot) {
  return Array.isArray(snapshot?.boards) && snapshot.boards.length > 0;
}

function findBoardInSnapshot(snapshot, boardId) {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) return null;
  const boards = Array.isArray(snapshot?.boards) ? snapshot.boards : [];
  return boards.find((entry) => String(entry?.id || '').trim() === normalizedBoardId) || null;
}

function findBoardRecordInAnyUserSnapshot(db, boardId, ownerUserId = '') {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) return null;
  const normalizedOwnerId = String(ownerUserId || '').trim();
  if (!tableExists(db, 'user_snapshots')) return null;

  if (normalizedOwnerId) {
    const ownerSnapshot = readUserSnapshot(db, normalizedOwnerId);
    const board = findBoardInSnapshot(ownerSnapshot, normalizedBoardId);
    return board
      ? {
          board,
          ownerId: normalizedOwnerId
        }
      : null;
  }

  const rows = db.prepare(`
    SELECT user_id, snapshot_json
    FROM user_snapshots
    ORDER BY updated_at DESC
  `).all();
  for (const row of rows) {
    const snapshot = normalizeAppDataSnapshot(safeJsonParse(row?.snapshot_json || '{}', {}));
    const board = findBoardInSnapshot(snapshot, normalizedBoardId);
    if (board) {
      return {
        board,
        ownerId: String(row?.user_id || '').trim()
      };
    }
  }
  return null;
}

function findBoardInAnyUserSnapshot(db, boardId, ownerUserId = '') {
  return findBoardRecordInAnyUserSnapshot(db, boardId, ownerUserId)?.board || null;
}

async function resolveSharedBoardRecordById(db, boardId, ownerUserId = '') {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) return null;
  const normalizedOwnerId = String(ownerUserId || '').trim();

  if (normalizedOwnerId) {
    const ownerRecord = findBoardRecordInAnyUserSnapshot(db, normalizedBoardId, normalizedOwnerId);
    if (ownerRecord?.board) {
      return {
        board: cloneJson(ownerRecord.board, ownerRecord.board),
        ownerId: ownerRecord.ownerId
      };
    }
  }

  const anyUserRecord = findBoardRecordInAnyUserSnapshot(db, normalizedBoardId);
  if (anyUserRecord?.board) {
    return {
      board: cloneJson(anyUserRecord.board, anyUserRecord.board),
      ownerId: anyUserRecord.ownerId
    };
  }

  const anonymousSnapshot = await resolveAnonymousSnapshot(db);
  const anonymousBoard = findBoardInSnapshot(anonymousSnapshot, normalizedBoardId);
  if (anonymousBoard) {
    return {
      board: cloneJson(anonymousBoard, anonymousBoard),
      ownerId: ''
    };
  }
  return null;
}

async function resolveSharedBoardById(db, boardId, ownerUserId = '') {
  return resolveSharedBoardRecordById(db, boardId, ownerUserId).then((record) => record?.board || null);
}

function mergeSharedBoardIntoSnapshot(snapshot, board) {
  const normalizedSnapshot = normalizeAppDataSnapshot(snapshot);
  const normalizedBoardId = String(board?.id || '').trim();
  if (!normalizedBoardId) return normalizedSnapshot;
  const sharedBoard = cloneJson(board, board);
  const existingBoards = Array.isArray(normalizedSnapshot.boards) ? normalizedSnapshot.boards : [];
  const remainingBoards = existingBoards.filter(
    (entry) => String(entry?.id || '').trim() !== normalizedBoardId
  );
  return normalizeAppDataSnapshot({
    boards: [sharedBoard, ...remainingBoards]
  });
}

function replaceBoardInSnapshot(snapshot, board, options = {}) {
  const normalizedSnapshot = normalizeAppDataSnapshot(snapshot);
  const nextBoardId = String(board?.id || '').trim();
  if (!nextBoardId) {
    return {
      snapshot: normalizedSnapshot,
      replaced: false
    };
  }
  const insertIfMissing = options?.insertIfMissing === true;
  const incomingBoard = cloneJson(board, board);
  const boards = Array.isArray(normalizedSnapshot?.boards) ? normalizedSnapshot.boards : [];
  let replaced = false;
  const nextBoards = boards.map((entry) => {
    const entryId = String(entry?.id || '').trim();
    if (entryId !== nextBoardId) return entry;
    replaced = true;
    return incomingBoard;
  });
  if (!replaced && insertIfMissing) {
    nextBoards.unshift(incomingBoard);
    replaced = true;
  }
  return {
    snapshot: normalizeAppDataSnapshot({ boards: nextBoards }),
    replaced
  };
}

function listBoardItems(board) {
  const items = [];
  const seenIds = new Set();
  const pushItem = (item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return;
    const itemId = String(item.id || '').trim();
    if (itemId) {
      if (seenIds.has(itemId)) return;
      seenIds.add(itemId);
    }
    items.push(item);
  };

  const rootItems = Array.isArray(board?.items) ? board.items : [];
  for (const item of rootItems) {
    pushItem(item);
  }

  const walkCategories = (nodes) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (!node || typeof node !== 'object' || Array.isArray(node)) continue;
      const nodeItems = Array.isArray(node.items) ? node.items : [];
      for (const item of nodeItems) {
        pushItem(item);
      }
      walkCategories(node.children);
    }
  };
  walkCategories(board?.categories);
  return items;
}

function normalizeTemplateFieldCategory(entry, index = 0) {
  const slugSeed = entry?.slug || entry?.key || entry?.label || `field_${index + 1}`;
  const slug = slugifyCategoryKey(slugSeed) || `field_${index + 1}`;
  const optionsRaw = Array.isArray(entry?.allowedOptions)
    ? entry.allowedOptions
    : Array.isArray(entry?.allowed_options)
      ? entry.allowed_options
      : safeJsonParse(entry?.allowed_options_json || '[]', []);
  const isDefault = Boolean(entry?.isDefault || entry?.is_default);
  const hasExplicitDeletable = typeof entry?.isDeletable === 'boolean' || typeof entry?.is_deletable === 'number';
  const isDeletable = hasExplicitDeletable
    ? Boolean(typeof entry?.isDeletable === 'boolean' ? entry.isDeletable : entry.is_deletable)
    : !isDefault;
  const rawPosition = Number(entry?.position);
  return {
    id: String(entry?.id || `template-field-${slug}-${index + 1}`),
    label: String(entry?.label || slugSeed || 'Field').trim() || 'Field',
    slug,
    type: normalizeCategoryType(entry?.type || 'text'),
    allowedOptions: normalizeAllowedOptions(optionsRaw),
    isDefault,
    isDeletable,
    position: Number.isFinite(rawPosition) ? rawPosition : index
  };
}

function normalizeTemplateFieldCategories(rawCategories, board = null) {
  const sourceList = Array.isArray(rawCategories) && rawCategories.length
    ? rawCategories
    : Array.isArray(board?.fieldCategories) && board.fieldCategories.length
      ? board.fieldCategories
      : DEFAULT_CATEGORIES.map((entry, index) => ({
        id: `template-default-${entry.slug}`,
        label: entry.label,
        slug: entry.slug,
        type: entry.type,
        allowedOptions: [],
        isDefault: true,
        isDeletable: false,
        position: index
      }));

  const normalized = sourceList.map((entry, index) => normalizeTemplateFieldCategory(entry, index));
  const seenIds = new Set();
  const seenSlugs = new Set();

  return normalized.map((entry, index) => {
    const next = { ...entry };
    let nextId = String(next.id || `template-field-${index + 1}`).trim() || `template-field-${index + 1}`;
    let idSuffix = 2;
    while (seenIds.has(nextId)) {
      nextId = `${next.id || `template-field-${index + 1}`}-${idSuffix}`;
      idSuffix += 1;
    }
    seenIds.add(nextId);
    next.id = nextId;

    const baseSlug = slugifyCategoryKey(next.slug || next.label || `field_${index + 1}`) || `field_${index + 1}`;
    let nextSlug = baseSlug;
    let slugSuffix = 2;
    while (seenSlugs.has(nextSlug)) {
      nextSlug = `${baseSlug}_${slugSuffix}`;
      slugSuffix += 1;
    }
    seenSlugs.add(nextSlug);
    next.slug = nextSlug;
    next.position = index;
    if (!next.isDefault && !next.isDeletable) next.isDeletable = true;
    if (next.type !== 'select') next.allowedOptions = [];
    return next;
  });
}

function normalizeTemplateCustomValueEntries(values) {
  const list = Array.isArray(values) ? values : [];
  const normalized = [];
  for (const entry of list) {
    const itemId = String(entry?.itemId || entry?.item_id || '').trim();
    const categoryId = String(entry?.categoryId || entry?.category_id || '').trim();
    if (!itemId || !categoryId) continue;
    const hasValueField = entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, 'value');
    const source = entry?.source === 'scraped' ? 'scraped' : 'user';
    const confidence = source === 'scraped' && Number.isFinite(Number(entry?.confidence))
      ? Math.max(0, Math.min(1, Number(entry.confidence)))
      : null;
    normalized.push({
      itemId,
      categoryId,
      value: hasValueField ? cloneJson(entry.value, entry.value) : null,
      source,
      confidence
    });
  }
  return normalized;
}

function collectCustomValuesFromBoardSnapshot(board, fieldCategories = []) {
  const byCategoryId = new Map(fieldCategories.map((entry) => [String(entry.id || '').trim(), entry]));
  const out = [];
  const items = listBoardItems(board);
  for (const item of items) {
    const itemId = String(item?.id || '').trim();
    if (!itemId) continue;
    const values = item?.customFieldValues;
    if (!values || typeof values !== 'object' || Array.isArray(values)) continue;
    for (const [categoryIdRaw, rawEntry] of Object.entries(values)) {
      const categoryId = String(categoryIdRaw || '').trim();
      if (!categoryId || !byCategoryId.has(categoryId)) continue;
      const hasWrappedValue = rawEntry && typeof rawEntry === 'object' && Object.prototype.hasOwnProperty.call(rawEntry, 'value');
      const value = hasWrappedValue ? rawEntry.value : rawEntry;
      if (value == null || value === '') continue;
      const source = rawEntry?.source === 'scraped' ? 'scraped' : 'user';
      const confidence = source === 'scraped' && Number.isFinite(Number(rawEntry?.confidence))
        ? Math.max(0, Math.min(1, Number(rawEntry.confidence)))
        : null;
      out.push({
        itemId,
        categoryId,
        value: cloneJson(value, value),
        source,
        confidence
      });
    }
  }
  return out;
}

function rowToBoardTemplateSummary(row) {
  if (!row) return null;
  const sourceTitle = String(row.title || '').trim();
  const title = isOwnerTemplateBoardName(sourceTitle)
    ? getPreferredOwnerTemplateBoardName()
    : sourceTitle;
  return {
    id: row.id,
    slug: row.slug,
    title: title || sourceTitle,
    description: row.description || '',
    templateBoardId: row.template_board_id,
    sourceUserId: row.source_user_id || null,
    sourceBoardId: row.source_board_id || null,
    isActive: Boolean(row.is_active),
    isDefault: Boolean(row.is_default),
    isReadOnly: Boolean(row.is_read_only),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readBoardTemplateBySlug(db, templateSlug, { activeOnly = true } = {}) {
  const normalizedSlug = normalizeTemplateSlug(templateSlug);
  if (!normalizedSlug) return null;
  const activeClause = activeOnly ? 'AND is_active = 1' : '';
  const row = db.prepare(`
    SELECT
      id,
      slug,
      title,
      description,
      template_board_id,
      source_user_id,
      source_board_id,
      board_json,
      field_categories_json,
      item_custom_values_json,
      is_active,
      is_default,
      is_read_only,
      created_at,
      updated_at
    FROM board_templates
    WHERE slug = ?
    ${activeClause}
    LIMIT 1
  `).get(normalizedSlug);
  return row || null;
}

function readDefaultBoardTemplate(db) {
  const row = db.prepare(`
    SELECT
      id,
      slug,
      title,
      description,
      template_board_id,
      source_user_id,
      source_board_id,
      board_json,
      field_categories_json,
      item_custom_values_json,
      is_active,
      is_default,
      is_read_only,
      created_at,
      updated_at
    FROM board_templates
    WHERE is_active = 1 AND is_default = 1
    ORDER BY updated_at DESC
    LIMIT 1
  `).get();
  return row || null;
}

function listActiveBoardTemplateSummaries(db) {
  const rows = db.prepare(`
    SELECT
      id,
      slug,
      title,
      description,
      template_board_id,
      source_user_id,
      source_board_id,
      is_active,
      is_default,
      is_read_only,
      created_at,
      updated_at
    FROM board_templates
    WHERE is_active = 1
    ORDER BY is_default DESC, updated_at DESC, created_at DESC
  `).all();
  return rows.map(rowToBoardTemplateSummary);
}

function resolveProvisioningTemplate(db, templateSlug = '') {
  const explicitSlug = normalizeTemplateSlug(templateSlug);
  if (explicitSlug) {
    return readBoardTemplateBySlug(db, explicitSlug, { activeOnly: true });
  }
  const configuredDefaultSlug = normalizeTemplateSlug(DEFAULT_DEMO_TEMPLATE_SLUG);
  const defaultTemplate = readDefaultBoardTemplate(db);
  if (defaultTemplate) return defaultTemplate;
  if (configuredDefaultSlug) {
    return readBoardTemplateBySlug(db, configuredDefaultSlug, { activeOnly: true });
  }
  return null;
}

function cloneTemplateItemNode(rawItem, fieldCategoryIdMap, itemIdMap) {
  const sourceItem = rawItem && typeof rawItem === 'object' && !Array.isArray(rawItem) ? rawItem : {};
  const cloned = cloneJson(sourceItem, {}) || {};
  const oldItemId = String(sourceItem.id || '').trim();
  const nextItemId = crypto.randomUUID();
  if (oldItemId) {
    itemIdMap.set(oldItemId, nextItemId);
  }
  cloned.id = nextItemId;
  const customValues = sourceItem.customFieldValues;
  if (customValues && typeof customValues === 'object' && !Array.isArray(customValues)) {
    const remapped = {};
    for (const [rawCategoryId, rawValue] of Object.entries(customValues)) {
      const sourceCategoryId = String(rawCategoryId || '').trim();
      if (!sourceCategoryId) continue;
      const mappedCategoryId = fieldCategoryIdMap.get(sourceCategoryId) || sourceCategoryId;
      remapped[mappedCategoryId] = cloneJson(rawValue, rawValue);
    }
    cloned.customFieldValues = remapped;
  } else {
    cloned.customFieldValues = {};
  }
  return cloned;
}

function cloneTemplateCategoryNode(rawNode, fieldCategoryIdMap, itemIdMap) {
  const sourceNode = rawNode && typeof rawNode === 'object' && !Array.isArray(rawNode) ? rawNode : {};
  const cloned = cloneJson(sourceNode, {}) || {};
  cloned.id = crypto.randomUUID();
  const sourceItems = Array.isArray(sourceNode.items) ? sourceNode.items : [];
  cloned.items = sourceItems.map((item) => cloneTemplateItemNode(item, fieldCategoryIdMap, itemIdMap));
  const sourceChildren = Array.isArray(sourceNode.children) ? sourceNode.children : [];
  cloned.children = sourceChildren.map((child) => cloneTemplateCategoryNode(child, fieldCategoryIdMap, itemIdMap));
  return cloned;
}

function cloneBoardFromTemplateRecord(templateRecord, options = {}) {
  const sourceBoard = safeJsonParse(templateRecord?.board_json || '{}', {});
  if (!sourceBoard || typeof sourceBoard !== 'object' || Array.isArray(sourceBoard)) {
    throw new DataError('Template board payload is invalid.', 500);
  }

  const sourceCategoriesRaw = safeJsonParse(templateRecord?.field_categories_json || '[]', []);
  const sourceFieldCategories = normalizeTemplateFieldCategories(sourceCategoriesRaw, sourceBoard);
  const sourceCustomValuesRaw = safeJsonParse(templateRecord?.item_custom_values_json || '[]', []);
  const sourceCustomValues = normalizeTemplateCustomValueEntries(sourceCustomValuesRaw);
  const fallbackCustomValues = sourceCustomValues.length
    ? sourceCustomValues
    : collectCustomValuesFromBoardSnapshot(sourceBoard, sourceFieldCategories);

  const fieldCategoryIdMap = new Map();
  const clonedFieldCategories = sourceFieldCategories.map((entry, index) => {
    const oldId = String(entry.id || '').trim();
    const nextId = crypto.randomUUID();
    if (oldId) {
      fieldCategoryIdMap.set(oldId, nextId);
    }
    return {
      id: nextId,
      label: entry.label,
      slug: entry.slug,
      type: entry.type,
      allowedOptions: normalizeAllowedOptions(entry.allowedOptions || []),
      isDefault: Boolean(entry.isDefault),
      isDeletable: Boolean(entry.isDeletable),
      position: index
    };
  });

  const itemIdMap = new Map();
  const sourceRootItems = Array.isArray(sourceBoard.items) ? sourceBoard.items : [];
  const sourceCategories = Array.isArray(sourceBoard.categories) ? sourceBoard.categories : [];
  const clonedBoard = cloneJson(sourceBoard, {}) || {};
  clonedBoard.id = crypto.randomUUID();
  clonedBoard.name = normalizeDemoBoardName(
    options.boardName || templateRecord?.title || sourceBoard.name || DEFAULT_DEMO_BOARD_NAME,
    templateRecord?.title || DEFAULT_DEMO_BOARD_NAME
  );
  clonedBoard.items = sourceRootItems.map((item) => cloneTemplateItemNode(item, fieldCategoryIdMap, itemIdMap));
  clonedBoard.categories = sourceCategories.map((node) => cloneTemplateCategoryNode(node, fieldCategoryIdMap, itemIdMap));
  clonedBoard.fieldCategories = clonedFieldCategories.map((entry) => ({
    id: entry.id,
    label: entry.label,
    slug: entry.slug,
    type: entry.type,
    allowedOptions: [...entry.allowedOptions],
    isDefault: entry.isDefault,
    isDeletable: entry.isDeletable,
    position: entry.position
  }));

  const clonedCustomValues = [];
  for (const entry of fallbackCustomValues) {
    const sourceItemId = String(entry?.itemId || '').trim();
    const sourceCategoryId = String(entry?.categoryId || '').trim();
    const mappedItemId = itemIdMap.get(sourceItemId);
    const mappedCategoryId = fieldCategoryIdMap.get(sourceCategoryId) || sourceCategoryId;
    if (!mappedItemId || !mappedCategoryId) continue;
    clonedCustomValues.push({
      itemId: mappedItemId,
      categoryId: mappedCategoryId,
      value: cloneJson(entry?.value, entry?.value),
      source: entry?.source === 'scraped' ? 'scraped' : 'user',
      confidence: entry?.source === 'scraped' && Number.isFinite(Number(entry?.confidence))
        ? Math.max(0, Math.min(1, Number(entry.confidence)))
        : null
    });
  }

  return {
    board: clonedBoard,
    fieldCategories: clonedFieldCategories,
    customValues: clonedCustomValues
  };
}

function replaceBoardFieldCategories(db, boardId, categories = []) {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) throw new DataError('Invalid board id.', 400);
  const normalizedCategories = normalizeTemplateFieldCategories(categories);
  const removeValues = db.prepare(`DELETE FROM item_custom_values WHERE board_id = ?`);
  const removeCategories = db.prepare(`
    DELETE FROM categories
    WHERE scope_type = 'board' AND scope_id = ?
  `);
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
      position,
      created_at,
      updated_at
    ) VALUES (?, 'board', ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  `);
  removeValues.run(normalizedBoardId);
  removeCategories.run(normalizedBoardId);
  for (let index = 0; index < normalizedCategories.length; index += 1) {
    const category = normalizedCategories[index];
    insertCategory.run(
      category.id,
      normalizedBoardId,
      category.label,
      category.slug,
      category.type,
      JSON.stringify(category.allowedOptions || []),
      category.isDefault ? 1 : 0,
      category.isDeletable ? 1 : 0,
      index
    );
  }
  return normalizedCategories.map((entry, index) => ({
    ...entry,
    position: index
  }));
}

function replaceBoardCustomValues(db, boardId, values = [], categories = []) {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) throw new DataError('Invalid board id.', 400);
  const categoryMap = new Map((Array.isArray(categories) ? categories : []).map((entry) => [String(entry.id || ''), entry]));
  const normalizedValues = normalizeTemplateCustomValueEntries(values);
  if (!normalizedValues.length) return [];
  const insert = db.prepare(`
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
      confidence,
      last_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  `);
  let inserted = 0;
  for (const entry of normalizedValues) {
    const category = categoryMap.get(entry.categoryId);
    if (!category) continue;
    const parsed = parseTypedValue(category.type, entry.value, category.allowedOptions || []);
    if (!parsed.hasValue) continue;
    const source = entry.source === 'scraped' ? 'scraped' : 'user';
    const confidence = source === 'scraped' && Number.isFinite(Number(entry.confidence))
      ? Math.max(0, Math.min(1, Number(entry.confidence)))
      : null;
    insert.run(
      normalizedBoardId,
      entry.itemId,
      category.id,
      category.type,
      parsed.stored.value_text ?? null,
      parsed.stored.value_number ?? null,
      parsed.stored.value_boolean ?? null,
      parsed.stored.value_select ?? null,
      source,
      confidence
    );
    inserted += 1;
  }
  return inserted;
}

function readUserDemoProvisioningState(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return {
      hasSeededDemoBoard: false,
      demoBoardSeededAt: null
    };
  }
  const row = db.prepare(`
    SELECT has_seeded_demo_board, demo_board_seeded_at
    FROM users
    WHERE id = ?
  `).get(normalizedUserId);
  return {
    hasSeededDemoBoard: Boolean(row?.has_seeded_demo_board),
    demoBoardSeededAt: row?.demo_board_seeded_at || null
  };
}

function markUserDemoBoardSeeded(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) return;
  db.prepare(`
    UPDATE users
    SET
      has_seeded_demo_board = 1,
      demo_board_seeded_at = COALESCE(demo_board_seeded_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `).run(normalizedUserId);
}

function isUserTemplateAdmin(user) {
  if (!user) return false;
  const normalizedEmail = normalizeEmailAddress(user.email);
  if (!normalizedEmail) return false;
  const ownerEmail = normalizeEmailAddress(DEMO_TEMPLATE_OWNER_EMAIL);
  if (ownerEmail && normalizedEmail === ownerEmail) return true;
  return DEMO_TEMPLATE_ADMIN_EMAILS.has(normalizedEmail);
}

function isProtectedTemplateBoardId(db, boardId) {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) return false;
  const row = db.prepare(`
    SELECT 1
    FROM board_templates
    WHERE template_board_id = ? OR source_board_id = ?
    LIMIT 1
  `).get(normalizedBoardId, normalizedBoardId);
  return Boolean(row);
}

function assertTemplateBoardWriteAccess(db, user, boardId) {
  if (!boardId) return;
  if (isUserTemplateAdmin(user)) return;
  if (!isProtectedTemplateBoardId(db, boardId)) return;
  throw new DataError('This board is a protected template and cannot be edited.', 403);
}

function assertTemplateSnapshotWriteAccess(db, user, snapshot) {
  if (isUserTemplateAdmin(user)) return;
  const boards = Array.isArray(snapshot?.boards) ? snapshot.boards : [];
  for (const board of boards) {
    const boardId = String(board?.id || '').trim();
    if (!boardId) continue;
    assertTemplateBoardWriteAccess(db, user, boardId);
  }
}

function resolveUserIdByEmail(db, rawEmail) {
  const email = normalizeEmailAddress(rawEmail);
  if (!email) return '';
  const row = db.prepare(`
    SELECT id
    FROM users
    WHERE email = ?
    LIMIT 1
  `).get(email);
  return String(row?.id || '').trim();
}

function upsertBoardTemplateFromSourceBoard(db, options = {}) {
  const sourceBoardId = String(options?.sourceBoardId || '').trim();
  if (!sourceBoardId) throw new DataError('sourceBoardId is required.', 400);
  const templateSlug = normalizeTemplateSlug(options?.templateSlug || options?.slug || DEFAULT_DEMO_TEMPLATE_SLUG, DEFAULT_DEMO_TEMPLATE_SLUG);
  if (!templateSlug) throw new DataError('templateSlug is required.', 400);
  const sourceUserIdFromEmail = resolveUserIdByEmail(db, options?.sourceUserEmail);
  const sourceUserId = String(options?.sourceUserId || sourceUserIdFromEmail || '').trim();
  if (!sourceUserId) throw new DataError('sourceUserId or sourceUserEmail is required.', 400);

  const snapshot = readUserSnapshot(db, sourceUserId);
  const sourceBoard = findBoardInSnapshot(snapshot, sourceBoardId);
  if (!sourceBoard) {
    throw new DataError('Source board was not found on the source account.', 404);
  }

  const categoriesFromDb = listCategoriesForScope(db, 'board', sourceBoardId);
  const templateFieldCategories = normalizeTemplateFieldCategories(categoriesFromDb, sourceBoard);
  const customValuesFromDb = listItemCustomValues(db, sourceBoardId).map((entry) => ({
    itemId: entry.itemId,
    categoryId: entry.categoryId,
    value: cloneJson(entry.value, entry.value),
    source: entry.source === 'scraped' ? 'scraped' : 'user',
    confidence: entry.source === 'scraped' && Number.isFinite(Number(entry.confidence))
      ? Math.max(0, Math.min(1, Number(entry.confidence)))
      : null
  }));
  const templateCustomValues = customValuesFromDb.length
    ? customValuesFromDb
    : collectCustomValuesFromBoardSnapshot(sourceBoard, templateFieldCategories);

  const sourceBoardName = String(sourceBoard?.name || '').trim();
  const requestedTitle = String(options?.title || '').trim();
  let title = normalizeDemoBoardName(requestedTitle || sourceBoardName || DEFAULT_DEMO_BOARD_NAME);
  const normalizedTemplateSlug = normalizeTemplateSlug(templateSlug, templateSlug);
  const ownerTemplateSlug = normalizeTemplateSlug(DEMO_TEMPLATE_OWNER_TEMPLATE_SLUG, DEFAULT_DEMO_TEMPLATE_SLUG);
  if (normalizedTemplateSlug && ownerTemplateSlug && normalizedTemplateSlug === ownerTemplateSlug && isOwnerTemplateBoardName(title)) {
    title = getPreferredOwnerTemplateBoardName();
  }
  const description = String(options?.description || '').trim().slice(0, 500);
  const requestedActive = typeof options?.isActive === 'boolean' ? options.isActive : true;
  const existing = readBoardTemplateBySlug(db, templateSlug, { activeOnly: false });
  const hasDefaultTemplate = Boolean(readDefaultBoardTemplate(db));
  const requestedDefault = typeof options?.isDefault === 'boolean'
    ? options.isDefault
    : existing
      ? Boolean(existing.is_default)
      : !hasDefaultTemplate;
  const templateId = existing?.id || crypto.randomUUID();
  const templateBoardId = String(sourceBoard?.id || sourceBoardId).trim() || sourceBoardId;

  db.exec('BEGIN IMMEDIATE');
  try {
    if (requestedDefault) {
      db.prepare(`
        UPDATE board_templates
        SET
          is_default = 0,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE slug <> ?
      `).run(templateSlug);
    }

    if (existing) {
      db.prepare(`
        UPDATE board_templates
        SET
          title = ?,
          description = ?,
          template_board_id = ?,
          source_user_id = ?,
          source_board_id = ?,
          board_json = ?,
          field_categories_json = ?,
          item_custom_values_json = ?,
          is_active = ?,
          is_default = ?,
          is_read_only = 1,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
      `).run(
        title,
        description,
        templateBoardId,
        sourceUserId,
        sourceBoardId,
        JSON.stringify(cloneJson(sourceBoard, sourceBoard)),
        JSON.stringify(templateFieldCategories),
        JSON.stringify(templateCustomValues),
        requestedActive ? 1 : 0,
        requestedDefault ? 1 : 0,
        templateId
      );
    } else {
      db.prepare(`
        INSERT INTO board_templates (
          id,
          slug,
          title,
          description,
          template_board_id,
          source_user_id,
          source_board_id,
          board_json,
          field_categories_json,
          item_custom_values_json,
          is_active,
          is_default,
          is_read_only,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      `).run(
        templateId,
        templateSlug,
        title,
        description,
        templateBoardId,
        sourceUserId,
        sourceBoardId,
        JSON.stringify(cloneJson(sourceBoard, sourceBoard)),
        JSON.stringify(templateFieldCategories),
        JSON.stringify(templateCustomValues),
        requestedActive ? 1 : 0,
        requestedDefault ? 1 : 0
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return rowToBoardTemplateSummary(readBoardTemplateBySlug(db, templateSlug, { activeOnly: false }));
}

function provisionDemoBoardForUser(db, userId, options = {}) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) throw new DataError('Invalid account.', 400);
  const force = Boolean(options?.force);

  const initialState = readUserDemoProvisioningState(db, normalizedUserId);
  const initialSnapshot = readUserSnapshot(db, normalizedUserId);
  const initialHasBoards = boardSnapshotHasBoards(initialSnapshot);

  if (!force && (initialState.hasSeededDemoBoard || initialHasBoards)) {
    if (initialHasBoards && !initialState.hasSeededDemoBoard) {
      markUserDemoBoardSeeded(db, normalizedUserId);
    }
    return {
      seeded: false,
      reason: initialState.hasSeededDemoBoard ? 'already-seeded' : 'has-existing-boards',
      snapshot: initialSnapshot,
      board: null,
      template: null
    };
  }

  const template = resolveProvisioningTemplate(db, options?.templateSlug || '');
  if (!template) {
    return {
      seeded: false,
      reason: 'template-not-configured',
      snapshot: initialSnapshot,
      board: null,
      template: null
    };
  }

  const requestedBoardName = String(options?.boardName || '').trim();
  let clonedBoardName = requestedBoardName;
  if (!clonedBoardName && isOwnerTemplateBoardName(template?.title || '')) {
    clonedBoardName = getPreferredOwnerTemplateBoardName();
  }
  const cloned = cloneBoardFromTemplateRecord(template, {
    boardName: clonedBoardName
  });

  db.exec('BEGIN IMMEDIATE');
  try {
    const latestState = readUserDemoProvisioningState(db, normalizedUserId);
    const latestSnapshot = readUserSnapshot(db, normalizedUserId);
    const latestHasBoards = boardSnapshotHasBoards(latestSnapshot);

    if (!force && (latestState.hasSeededDemoBoard || latestHasBoards)) {
      if (latestHasBoards && !latestState.hasSeededDemoBoard) {
        markUserDemoBoardSeeded(db, normalizedUserId);
      }
      db.exec('COMMIT');
      return {
        seeded: false,
        reason: latestState.hasSeededDemoBoard ? 'already-seeded' : 'has-existing-boards',
        snapshot: latestSnapshot,
        board: null,
        template: rowToBoardTemplateSummary(template)
      };
    }

    const nextSnapshot = {
      boards: [cloned.board, ...(Array.isArray(latestSnapshot.boards) ? latestSnapshot.boards : [])]
    };
    writeUserSnapshot(db, normalizedUserId, nextSnapshot);
    const insertedCategories = replaceBoardFieldCategories(db, cloned.board.id, cloned.fieldCategories);
    replaceBoardCustomValues(db, cloned.board.id, cloned.customValues, insertedCategories);
    markUserDemoBoardSeeded(db, normalizedUserId);
    db.exec('COMMIT');

    return {
      seeded: true,
      reason: force ? 'manual-clone' : 'first-time-seed',
      snapshot: nextSnapshot,
      board: cloned.board,
      template: rowToBoardTemplateSummary(template)
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

async function ensureOwnerMasterBoardAttached(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return { attached: false, reason: 'invalid-user' };
  }
  const ownerEmail = normalizeEmailAddress(DEMO_TEMPLATE_OWNER_EMAIL);
  if (!ownerEmail) {
    return { attached: false, reason: 'owner-not-configured' };
  }
  const user = readPublicUserById(db, normalizedUserId);
  if (!user) {
    return { attached: false, reason: 'user-not-found' };
  }
  if (normalizeEmailAddress(user.email) !== ownerEmail) {
    return { attached: false, reason: 'not-owner' };
  }

  const ownerBoardNames = getOwnerTemplateBoardNameCandidates();
  const ownerBoardName = getPreferredOwnerMasterBoardName();
  const existingSnapshot = readUserSnapshot(db, normalizedUserId);
  if (findBoardIdByNames(existingSnapshot, ownerBoardNames)) {
    return { attached: false, reason: 'owner-board-exists' };
  }

  let cloned = null;
  try {
    const sharedSnapshot = await readAppDataSnapshot();
    const sourceBoardId = findBoardIdByNames(sharedSnapshot, ownerBoardNames);
    const sourceBoard = sourceBoardId ? findBoardInSnapshot(sharedSnapshot, sourceBoardId) : null;
    if (sourceBoard) {
      const sourceFieldCategories = normalizeTemplateFieldCategories([], sourceBoard);
      const sourceCustomValues = collectCustomValuesFromBoardSnapshot(sourceBoard, sourceFieldCategories);
      cloned = cloneBoardFromTemplateRecord({
        title: ownerBoardName,
        board_json: JSON.stringify(cloneJson(sourceBoard, sourceBoard)),
        field_categories_json: JSON.stringify(sourceFieldCategories),
        item_custom_values_json: JSON.stringify(sourceCustomValues)
      }, {
        boardName: ownerBoardName
      });
    }
  } catch (error) {
    console.warn('Could not inspect anonymous snapshot for owner board attach:', error);
  }

  if (!cloned) {
    const ownerTemplateSlug = normalizeTemplateSlug(DEMO_TEMPLATE_OWNER_TEMPLATE_SLUG, DEFAULT_DEMO_TEMPLATE_SLUG);
    const ownerTemplate = readBoardTemplateBySlug(db, ownerTemplateSlug, { activeOnly: true })
      || readBoardTemplateBySlug(db, ownerTemplateSlug, { activeOnly: false })
      || resolveProvisioningTemplate(db, ownerTemplateSlug)
      || resolveProvisioningTemplate(db, '');
    if (!ownerTemplate) {
      return { attached: false, reason: 'no-owner-source-board' };
    }
    cloned = cloneBoardFromTemplateRecord(ownerTemplate, {
      boardName: ownerBoardName
    });
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const latestSnapshot = readUserSnapshot(db, normalizedUserId);
    if (findBoardIdByNames(latestSnapshot, ownerBoardNames)) {
      db.exec('COMMIT');
      return { attached: false, reason: 'owner-board-exists' };
    }
    const nextSnapshot = {
      boards: [cloned.board, ...(Array.isArray(latestSnapshot.boards) ? latestSnapshot.boards : [])]
    };
    writeUserSnapshot(db, normalizedUserId, nextSnapshot);
    const insertedCategories = replaceBoardFieldCategories(db, cloned.board.id, cloned.fieldCategories);
    replaceBoardCustomValues(db, cloned.board.id, cloned.customValues, insertedCategories);
    markUserDemoBoardSeeded(db, normalizedUserId);
    db.exec('COMMIT');
    return {
      attached: true,
      reason: 'owner-board-attached',
      boardId: cloned.board.id
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function lookupAuthContext(db, req) {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  const token = String(cookies[AUTH_COOKIE_NAME] || '').trim();
  if (!token) {
    return { authenticated: false, user: null, sessionToken: '' };
  }
  const tokenHash = hashSessionToken(token);
  const row = db.prepare(`
    SELECT
      s.token_hash,
      s.user_id,
      s.expires_at,
      u.id,
      u.email,
      u.display_name,
      u.has_seen_beta_welcome,
      u.beta_access_acknowledged_at,
      u.has_seen_first_link_notice,
      u.first_link_notice_eligible,
      u.first_link_notice_triggered_at,
      u.has_seeded_demo_board,
      u.demo_board_seeded_at,
      u.created_at,
      u.updated_at
    FROM sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `).get(tokenHash);
  if (!row) {
    return { authenticated: false, user: null, sessionToken: token };
  }

  const expiresAt = Date.parse(String(row.expires_at || ''));
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash);
    return { authenticated: false, user: null, sessionToken: token };
  }

  db.prepare(`
    UPDATE sessions
    SET last_seen_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE token_hash = ?
  `).run(tokenHash);

  return {
    authenticated: true,
    user: rowToPublicUser(row),
    sessionToken: token
  };
}

async function createAccount(db, payload = {}) {
  if (isSupabaseAuthEnabled()) {
    try {
      const identity = await signUpWithSupabase(payload);
      return ensureLocalUserForSupabaseIdentity(db, identity);
    } catch (error) {
      authLog('warn', 'sign_up_failed', {
        email: maskEmail(payload?.email),
        status: Number(error?.status || 500),
        reason: error instanceof Error ? error.message : 'unknown-error'
      });
      throw error;
    }
  }

  const email = normalizeEmailAddress(payload.email);
  if (!email) {
    throw new DataError('Enter a valid email address.', 400);
  }
  const fullName = requireFullName(payload);
  const passwordResult = validatePassword(payload.password);
  if (!passwordResult.valid) {
    throw new DataError(passwordResult.error, 400);
  }
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(passwordResult.password);
  try {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, first_link_notice_eligible)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, email, passwordHash, fullName.displayName);
  } catch (error) {
    if (String(error?.message || '').includes('users.email')) {
      authLog('warn', 'sign_up_failed_duplicate_email', {
        email: maskEmail(email),
        status: 409
      });
      throw new DataError('An account with that email already exists.', 409);
    }
    authLog('warn', 'sign_up_failed', {
      email: maskEmail(email),
      status: Number(error?.status || 500),
      reason: error instanceof Error ? error.message : 'unknown-error'
    });
    throw error;
  }
  return readPublicUserById(db, id);
}

async function authenticateAccount(db, payload = {}) {
  if (isSupabaseAuthEnabled()) {
    try {
      const identity = await signInWithSupabase(payload);
      return ensureLocalUserForSupabaseIdentity(db, identity);
    } catch (error) {
      authLog('warn', 'sign_in_failed', {
        email: maskEmail(payload?.email),
        status: Number(error?.status || 500),
        reason: error instanceof Error ? error.message : 'unknown-error'
      });
      throw error;
    }
  }

  const email = normalizeEmailAddress(payload.email);
  const password = String(payload.password || '');
  if (!email || !password) {
    throw new DataError('Email and password are required.', 400);
  }
  const row = db.prepare(`
    SELECT id, email, display_name, password_hash, has_seen_beta_welcome, beta_access_acknowledged_at, has_seen_first_link_notice, first_link_notice_eligible, first_link_notice_triggered_at, has_seeded_demo_board, demo_board_seeded_at, created_at, updated_at
    FROM users
    WHERE email = ?
  `).get(email);
  if (!row || !verifyPassword(password, row.password_hash)) {
    authLog('warn', 'sign_in_failed_invalid_credentials', {
      email: maskEmail(email),
      status: 401,
      accountFound: Boolean(row)
    });
    throw new DataError('Invalid email or password.', 401);
  }
  return rowToPublicUser(row);
}

function createSessionForUser(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) throw new DataError('Invalid account.', 400);
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(tokenHash, normalizedUserId, expiresAt);
  return { token, expiresAt };
}

function clearSessionFromRequest(db, req) {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  const token = String(cookies[AUTH_COOKIE_NAME] || '').trim();
  if (!token) return;
  db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashSessionToken(token));
}

function markUserBetaWelcomeAcknowledged(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) throw new DataError('Invalid account.', 400);
  db.prepare(`
    UPDATE users
    SET
      has_seen_beta_welcome = 1,
      beta_access_acknowledged_at = COALESCE(beta_access_acknowledged_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `).run(normalizedUserId);
  return readPublicUserById(db, normalizedUserId);
}

function triggerFirstLinkNotice(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) throw new DataError('Invalid account.', 400);
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE users
    SET
      first_link_notice_triggered_at = COALESCE(first_link_notice_triggered_at, ?),
      updated_at = CASE
        WHEN first_link_notice_eligible = 1
          AND has_seen_first_link_notice = 0
          AND first_link_notice_triggered_at IS NULL
        THEN ?
        ELSE updated_at
      END
    WHERE id = ?
      AND first_link_notice_eligible = 1
      AND has_seen_first_link_notice = 0
      AND first_link_notice_triggered_at IS NULL
  `).run(now, now, normalizedUserId);
  return {
    shouldShowNotice: result.changes > 0,
    user: readPublicUserById(db, normalizedUserId)
  };
}

function acknowledgeFirstLinkNotice(db, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) throw new DataError('Invalid account.', 400);
  db.prepare(`
    UPDATE users
    SET
      has_seen_first_link_notice = 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
      AND first_link_notice_triggered_at IS NOT NULL
      AND has_seen_first_link_notice = 0
  `).run(normalizedUserId);
  return readPublicUserById(db, normalizedUserId);
}

function normalizeIncomingUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : value.startsWith('//')
      ? `https:${value}`
      : `https://${value}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function stripTags(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function getHostnameFromUrl(value) {
  try {
    return new URL(String(value || '')).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isAmazonHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  if (!host) return false;
  return (
    /(^|\.)amazon\.[a-z.]+$/.test(host) ||
    host === 'smile.amazon.com' ||
    /(^|\.)media-amazon\.com$/.test(host) ||
    /(^|\.)ssl-images-amazon\.com$/.test(host)
  );
}

function isAmazonUrl(value) {
  return isAmazonHost(getHostnameFromUrl(value));
}

function parseMetaTags(html) {
  const meta = {};
  const metaRegex = /<meta\s+[^>]*>/gi;
  const attrRegex = /(property|name|itemprop|content)\s*=\s*(["'])(.*?)\2/gi;

  const tags = html.match(metaRegex) || [];

  for (const tag of tags) {
    let key = null;
    let content = null;
    let match;

    while ((match = attrRegex.exec(tag)) !== null) {
      const attr = match[1].toLowerCase();
      const value = match[3].trim();
      if ((attr === 'property' || attr === 'name' || attr === 'itemprop') && !key) key = value.toLowerCase();
      if (attr === 'content') content = value;
    }

    attrRegex.lastIndex = 0;

    if (key && content) {
      meta[key] = decodeHtmlEntities(content.trim());
    }
  }

  return meta;
}

function parseTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) return '';
  return decodeHtmlEntities(stripTags(titleMatch[1]));
}

function extractAmazonProductTitleFromHtml(html) {
  const doc = String(html || '');
  if (!doc) return '';
  const productTitleSpan = doc.match(/<span[^>]*id=(["'])productTitle\1[^>]*>([\s\S]*?)<\/span>/i);
  if (productTitleSpan?.[2]) return decodeHtmlEntities(stripTags(productTitleSpan[2]));
  const h1WithProductId = doc.match(/<h1[^>]*(?:id|data-automation-id)=(["'])(?:title|product-title)\1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1WithProductId?.[2]) return decodeHtmlEntities(stripTags(h1WithProductId[2]));
  return '';
}

function parsePrimaryHeading(html, { sourceUrl = '' } = {}) {
  if (isAmazonUrl(sourceUrl)) {
    const amazonTitle = extractAmazonProductTitleFromHtml(html);
    if (amazonTitle) return amazonTitle;
  }
  const h1Matches = [...String(html || '').matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (!h1Matches.length) return '';
  const candidates = h1Matches
    .map((match) => decodeHtmlEntities(stripTags(match[1] || '')))
    .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (!candidates.length) return '';
  return chooseBestNameCandidate(candidates, sourceUrl) || candidates[0] || '';
}

function resolveJsonLdImageCandidate(candidate) {
  if (!candidate) return '';
  if (typeof candidate === 'string') return candidate.trim();
  if (Array.isArray(candidate)) {
    for (const entry of candidate) {
      const resolved = resolveJsonLdImageCandidate(entry);
      if (resolved) return resolved;
    }
    return '';
  }
  if (typeof candidate === 'object') {
    // Prefer direct binary asset fields over generic URL fields.
    const fields = ['contentUrl', 'thumbnailUrl', 'url', 'src', 'image'];
    for (const field of fields) {
      const resolved = resolveJsonLdImageCandidate(candidate[field]);
      if (resolved) return resolved;
    }
  }
  return '';
}

function resolveJsonLdOfferNode(node) {
  if (!node || typeof node !== 'object') return null;
  const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
  if (!offers || typeof offers !== 'object') return null;
  return offers;
}

function parseJsonLdProductNode(node) {
  if (!node || typeof node !== 'object') return null;
  const type = String(node['@type'] || '').toLowerCase();
  if (!type.includes('product')) return null;

  const offers = resolveJsonLdOfferNode(node);
  const rawBrandNode = node.brand;
  const rawManufacturerNode = node.manufacturer;
  const rawBrand = typeof rawBrandNode === 'string'
    ? rawBrandNode
    : rawBrandNode?.name || rawBrandNode?.brand || rawBrandNode?.label || '';
  const rawManufacturer = typeof rawManufacturerNode === 'string'
    ? rawManufacturerNode
    : rawManufacturerNode?.name || rawManufacturerNode?.brand || rawManufacturerNode?.label || '';
  const rawImages = Array.isArray(node.image) ? node.image : node.image ? [node.image] : [];
  const imageCandidates = rawImages
    .map((entry) => resolveJsonLdImageCandidate(entry))
    .filter(Boolean);
  const offerPrice = offers?.price || offers?.lowPrice || offers?.highPrice || '';
  const specs = [];

  if (typeof node.weight === 'string') specs.push(`Weight: ${node.weight}`);
  if (Array.isArray(node.additionalProperty)) {
    for (const prop of node.additionalProperty) {
      const key = prop?.name || prop?.propertyID || '';
      const value = prop?.value || prop?.description || '';
      if (key && value) specs.push(`${key}: ${value}`);
    }
  }

  return {
    name: String(node.name || '').trim(),
    brand: String(rawBrand || rawManufacturer || '').trim(),
    image: imageCandidates[0] || '',
    images: imageCandidates,
    seller: String(offers?.seller?.name || '').trim(),
    price: offerPrice ? `${offers?.priceCurrency ? `${offers.priceCurrency} ` : ''}${offerPrice}`.trim() : '',
    description: typeof node.description === 'string' ? node.description.trim() : '',
    dimensions: normalizeDetailList([
      typeof node.size === 'string' ? node.size : '',
      typeof node.width === 'string' ? `Width ${node.width}` : '',
      typeof node.height === 'string' ? `Height ${node.height}` : '',
      typeof node.depth === 'string' ? `Depth ${node.depth}` : ''
    ], 8),
    materials: normalizeDetailList([
      typeof node.material === 'string' ? node.material : '',
      ...(Array.isArray(node.material) ? node.material : [])
    ], 8),
    specs: normalizeDetailList(specs, 12),
    productUrl: String(node.url || '').trim(),
    offerUrl: String(offers?.url || '').trim()
  };
}

function urlPathSignature(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || ''));
    return parsed.pathname.replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase();
  } catch {
    return '';
  }
}

function scoreJsonLdProductCandidate(candidate, { sourceUrl = '', primaryHeading = '', pageTitle = '' } = {}) {
  if (!candidate) return Number.NEGATIVE_INFINITY;
  const name = cleanExtractedItemName(candidate.name || '');
  let score = 0;

  if (!name) score -= 160;
  if (isRetailerOnlyName(name)) score -= 120;
  if (isWeakName(name, sourceUrl)) score -= 70;

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 16) score += 20;
  if (words.length >= 3 && words.length <= 10) score += 10;
  if (normalizePrice(candidate.price)) score += 25;
  if (looksLikeProductImage(candidate.image)) score += 18;
  if (candidate.description && candidate.description.length >= 30) score += 8;

  const sourcePath = urlPathSignature(sourceUrl);
  const candidatePath = urlPathSignature(candidate.productUrl || candidate.offerUrl);
  if (sourcePath && candidatePath) {
    if (sourcePath === candidatePath) score += 60;
    else if (sourcePath.includes(candidatePath) || candidatePath.includes(sourcePath)) score += 35;
  }

  const contextTokens = tokenizeForSimilarity([titleFromUrl(sourceUrl), primaryHeading, pageTitle].join(' '));
  const nameTokens = tokenizeForSimilarity(name);
  let overlap = 0;
  for (const token of nameTokens) {
    if (contextTokens.has(token)) overlap += 1;
  }
  if (overlap) score += Math.min(70, overlap * 16);

  if (/\b(related|similar|sponsored|recommended|collection|shop more)\b/i.test(name)) score -= 60;
  if (isIkeaUrl(sourceUrl) && !isIkeaCandidateRelevant(sourceUrl, { productTitleRaw: name, name })) {
    score -= 160;
  }
  return score;
}

function selectBestJsonLdProductCandidate(candidates, context = {}) {
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    const score = scoreJsonLdProductCandidate(candidate, context);
    if (!best || score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function parseJsonLd(html, { sourceUrl = '', primaryHeading = '', pageTitle = '' } = {}) {
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const aggregated = {
    name: '',
    brand: '',
    image: '',
    images: [],
    seller: '',
    price: '',
    description: '',
    dimensions: [],
    materials: [],
    specs: []
  };
  const productCandidates = [];
  const fallbackImages = [];

  for (const script of scripts) {
    const contentMatch = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (!contentMatch) continue;
    const parsed = safeJsonParse(contentMatch[1].trim(), null);
    if (!parsed) continue;

    const nodes = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed['@graph'])
        ? parsed['@graph']
        : [parsed];

    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const productCandidate = parseJsonLdProductNode(node);
      if (productCandidate) {
        productCandidates.push(productCandidate);
        continue;
      }
      const topImage = resolveJsonLdImageCandidate(node.image || node.thumbnailUrl || node.contentUrl || node.url);
      if (topImage) fallbackImages.push(topImage);
    }
  }

  const selected = selectBestJsonLdProductCandidate(productCandidates, {
    sourceUrl,
    primaryHeading,
    pageTitle
  });
  if (selected) {
    aggregated.name = selected.name;
    aggregated.brand = selected.brand;
    aggregated.image = selected.image;
    aggregated.seller = selected.seller;
    aggregated.price = selected.price;
    aggregated.description = selected.description;
    aggregated.dimensions = normalizeDetailList(selected.dimensions, 8);
    aggregated.materials = normalizeDetailList(selected.materials, 8);
    aggregated.specs = normalizeDetailList(selected.specs, 12);
    aggregated.images = [
      ...(Array.isArray(selected.images) ? selected.images : []),
      selected.image
    ];
  } else {
    aggregated.images = fallbackImages;
  }

  aggregated.images = Array.from(
    new Set(
      aggregated.images
        .map((entry) => String(entry || '').trim())
        .filter(Boolean)
    )
  );
  if (!aggregated.image && aggregated.images.length) aggregated.image = aggregated.images[0];
  return aggregated;
}

function looksLikeProductImage(url) {
  const text = String(url || '').trim();
  const lower = text.toLowerCase();
  if (!lower) return false;
  if (!/^https?:\/\//i.test(lower)) return false;
  if (
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('favicon') ||
    lower.includes('sprite') ||
    lower.includes('avatar') ||
    lower.includes('placeholder') ||
    lower.includes('badge') ||
    lower.includes('verified') ||
    lower.includes('watermark') ||
    lower.includes('stamp') ||
    lower.includes('seal') ||
    lower.includes('swatch') ||
    lower.includes('captcha') ||
    lower.includes('perimeterx') ||
    lower.includes('px-captcha') ||
    lower.includes('px-cloud') ||
    lower.includes('/error/') ||
    lower.includes('images/g/01/error/') ||
    lower.includes('diagram') ||
    lower.includes('line-art') ||
    lower.includes('outline') ||
    lower.includes('glyph') ||
    lower.includes('payment-credit-card') ||
    lower.includes('oldiemessage')
  ) {
    return false;
  }
  try {
    const parsed = new URL(text);
    const path = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();
    if (host.includes('contentgrid.thdstatic.com')) return false;
    if (/\/images\/oldiemessage\//i.test(path)) return false;
    if (/\.svg(?:$|\?)/i.test(path)) return false;
    if (/\/(?:icons?|logos?|sprites?|badges?)\//i.test(path)) return false;
    if (isAmazonHost(parsed.hostname)) {
      if (!/\/images\/i\//i.test(path)) return false;
      const combined = `${path} ${parsed.search.toLowerCase()}`;
      if (/(amazonprime|primevideo|exploreprimevideo|sponsored|sims-|\/gp\/slredirect)/i.test(combined)) return false;
    }
  } catch {
    return false;
  }
  return true;
}

function extractUrlsFromDynamicImagePayload(rawPayload) {
  const out = [];
  const push = (value) => {
    const normalized = normalizeImageCandidateUrl(value);
    if (!normalized) return;
    out.push(normalized);
  };

  const decoded = decodeHtmlEntities(String(rawPayload || ''))
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&');
  if (!decoded) return out;

  const parsed = safeJsonParse(decoded, null);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    for (const key of Object.keys(parsed)) {
      if (/^https?:\/\//i.test(key)) push(key);
    }
  }

  const direct = decoded.match(/https?:\/\/(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\/images\/I\/[^\s"',<>)]+/gi) || [];
  for (const candidate of direct) push(candidate);
  return out;
}

function normalizeImageCandidateUrl(rawUrl) {
  const text = String(rawUrl || '')
    .trim()
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&');
  if (!text) return '';
  try {
    const url = new URL(text);
    const resizeParams = [
      'w',
      'h',
      'width',
      'height',
      'size',
      's',
      'fit',
      'crop',
      'dpr',
      'thumb',
      'thumbnail'
    ];
    for (const key of resizeParams) {
      if (url.searchParams.has(key)) url.searchParams.delete(key);
    }
    if (isAmazonHost(url.hostname)) {
      url.pathname = url.pathname.replace(/\._[^.]+_\.(jpg|jpeg|png|webp)$/i, '._SL1500_.$1');
    }
    return url.toString();
  } catch {
    return text;
  }
}

function isLikelyImageResourceUrl(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return false;
  return (
    /\.(?:jpe?g|png|webp|avif)(?:$|[?#])/i.test(text) ||
    /\/(?:productimages?|images?)\//i.test(text)
  );
}

function isIkeaUrl(rawUrl = '') {
  try {
    const host = new URL(String(rawUrl || '')).hostname.toLowerCase();
    return /(^|\.)ikea\.com$/.test(host);
  } catch {
    return false;
  }
}

function isIkeaProductPathUrl(rawUrl = '') {
  if (!isIkeaUrl(rawUrl)) return false;
  try {
    const parts = String(new URL(String(rawUrl || '')).pathname || '')
      .split('/')
      .filter(Boolean)
      .map((part) => part.toLowerCase());
    const productIndex = parts.findIndex((part) => part === 'p');
    return productIndex >= 0 && productIndex + 1 < parts.length;
  } catch {
    return false;
  }
}

function isIkeaProductImageUrl(rawUrl = '') {
  try {
    const parsed = new URL(String(rawUrl || ''));
    const host = parsed.hostname.toLowerCase();
    return /(^|\.)ikea\.com$/.test(host) && /\/images\/products\//i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function extractIkeaProductImageTokens(sourceUrl = '') {
  if (!isIkeaUrl(sourceUrl)) {
    return {
      slug: '',
      articleNumbers: [],
      slugParts: []
    };
  }

  try {
    const parsed = new URL(sourceUrl);
    const parts = String(parsed.pathname || '')
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part).trim().toLowerCase());
    const productIndex = parts.findIndex((part) => part === 'p');
    const rawSlug = productIndex >= 0 ? String(parts[productIndex + 1] || '') : '';
    const slug = rawSlug
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    const articleNumbers = Array.from(
      new Set(
        [...slug.matchAll(/(?:^|-)(?:s)?(\d{8})(?:-|$)/g)]
          .map((match) => String(match[1] || '').trim())
          .filter(Boolean)
      )
    );
    const slugParts = slug
      .split('-')
      .map((part) => part.trim())
      .filter((part) => /^[a-z]{3,}$/.test(part));
    return {
      slug,
      articleNumbers,
      slugParts
    };
  } catch {
    return {
      slug: '',
      articleNumbers: [],
      slugParts: []
    };
  }
}

function scoreIkeaProductImageMatch(sourceUrl = '', imageUrl = '') {
  const tokens = extractIkeaProductImageTokens(sourceUrl);
  if (!tokens.slug && !tokens.articleNumbers.length) return 0;
  const identityTokens = extractIkeaIdentityTokens(sourceUrl);

  try {
    const parsed = new URL(String(imageUrl || ''));
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    if (!/(^|\.)ikea\.com$/.test(host)) return 0;
    if (!/\/images\/products\//i.test(path)) return 0;

    const normalizedPath = path.replace(/[^a-z0-9/._-]+/g, '-');
    let score = 0;
    if (tokens.slug) {
      if (
        normalizedPath.includes(`/${tokens.slug}__`) ||
        normalizedPath.includes(`/${tokens.slug}_`) ||
        normalizedPath.includes(`/${tokens.slug}.`) ||
        normalizedPath.includes(`/${tokens.slug}-`)
      ) {
        score = Math.max(score, 90);
      }
    }

    for (const articleNumber of tokens.articleNumbers) {
      if (normalizedPath.includes(articleNumber)) score = Math.max(score, 80);
    }

    if (identityTokens.length) {
      const matchedIdentity = identityTokens.filter((part) => normalizedPath.includes(part));
      if (matchedIdentity.length >= 2) score = Math.max(score, 70);
      if (matchedIdentity.length && matchedIdentity.includes(identityTokens[0])) score = Math.max(score, 60);
    }

    if (tokens.slugParts.length >= 3) {
      const matchedParts = tokens.slugParts.filter((part) => normalizedPath.includes(part));
      if (matchedParts.length >= 3) score = Math.max(score, 50);
      else if (matchedParts.length >= 2) score = Math.max(score, 40);
    }
    return score;
  } catch {
    return 0;
  }

  return 0;
}

function filterIkeaProductImages(sourceUrl = '', imageUrls = []) {
  if (!isIkeaUrl(sourceUrl)) return Array.isArray(imageUrls) ? imageUrls : [];
  const tokens = extractIkeaProductImageTokens(sourceUrl);
  if (!tokens.slug && !tokens.articleNumbers.length) return [];
  const normalized = (Array.isArray(imageUrls) ? imageUrls : [])
    .map((entry) => normalizeImageCandidateUrl(entry))
    .filter((entry) => isIkeaProductImageUrl(entry));
  const scored = normalized
    .map((imageUrl) => ({
      imageUrl,
      score: scoreIkeaProductImageMatch(sourceUrl, imageUrl)
    }))
    .filter((entry) => entry.score >= 60);
  const bestScore = scored.reduce((max, entry) => Math.max(max, entry.score), 0);
  const filtered = scored
    .filter((entry) => entry.score === bestScore)
    .map((entry) => entry.imageUrl);
  if (filtered.length) return filtered;
  return [];
}

function extractIkeaIdentityTokens(sourceUrl = '') {
  const { slugParts } = extractIkeaProductImageTokens(sourceUrl);
  if (!slugParts.length) return [];
  const genericParts = new Set([
    'table', 'tables', 'desk', 'desks', 'chair', 'chairs', 'stool', 'stools', 'bench', 'benches',
    'cabinet', 'cabinets', 'shelf', 'shelves', 'bookcase', 'bookcases', 'bed', 'beds', 'frame', 'frames',
    'sofa', 'sofas', 'lamp', 'lamps', 'storage', 'unit', 'units', 'side', 'coffee', 'dining', 'console',
    'tv', 'media', 'nightstand', 'outdoor', 'indoor', 'round', 'square', 'rectangular', 'oak', 'pine',
    'veneer', 'white', 'black', 'brown', 'gray', 'grey', 'green', 'blue', 'red', 'yellow', 'dark', 'light'
  ]);
  const identity = [];
  for (const part of slugParts) {
    if (genericParts.has(part)) {
      if (identity.length) break;
      continue;
    }
    identity.push(part);
    if (identity.length >= 3) break;
  }
  return identity.length ? identity : slugParts.slice(0, Math.min(2, slugParts.length));
}

function isIkeaCandidateRelevant(sourceUrl = '', candidate = {}) {
  if (!isIkeaUrl(sourceUrl)) return true;
  const identityTokens = extractIkeaIdentityTokens(sourceUrl);
  if (!identityTokens.length) return true;
  const candidateName = `${String(candidate?.productTitleRaw || '')} ${String(candidate?.name || '')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!candidateName) return false;
  const matched = identityTokens.filter((token) => candidateName.includes(token));
  if (!matched.length) return false;
  return matched.includes(identityTokens[0]) || matched.length >= 2;
}

function isLikelyLowResThumbnail(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return true;
  const lower = text.toLowerCase();
  if (/(thumbnail|thumb|tiny|mini|icon|swatch|badge|avatar|favicon)/i.test(lower)) return true;

  const dimValues = [];
  for (const match of lower.matchAll(/(?:^|[?&/_-])(w|h|width|height|size)=?([0-9]{2,4})/g)) {
    dimValues.push(Number(match[2]));
  }
  for (const match of lower.matchAll(/([0-9]{2,4})[x_](\d{2,4})/g)) {
    dimValues.push(Number(match[1]), Number(match[2]));
  }
  for (const match of lower.matchAll(/_s(?:x|y|l)(\d{2,5})_/g)) {
    dimValues.push(Number(match[1]));
  }
  for (const match of lower.matchAll(/_ac_[a-z]{1,8}(\d{2,5})_/g)) {
    dimValues.push(Number(match[1]));
  }
  if (!dimValues.length) return false;
  const maxDim = Math.max(...dimValues);
  return Number.isFinite(maxDim) && maxDim > 0 && maxDim < 420;
}

function normalizeAmountString(rawAmount) {
  const compact = String(rawAmount || '')
    .replace(/[,\s]/g, '')
    .trim();
  if (!compact) return '';
  if (!/^\d+(?:\.\d{1,2})?$/.test(compact)) return '';
  const [wholeRaw, fractionRaw = ''] = compact.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || '0';
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!fractionRaw) return formattedWhole;
  const fraction = fractionRaw.padEnd(2, '0').slice(0, 2);
  return `${formattedWhole}.${fraction}`;
}

function normalizePriceToken(rawToken) {
  const token = String(rawToken || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!token) return '';

  const leading = token.match(/^(US\$|CA\$|C\$|AU\$|A\$|USD|CAD|AUD|EUR|GBP|CHF|JPY|INR|MXN|\$|£|€)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)$/i);
  if (leading) {
    const currency = leading[1].toUpperCase();
    const amount = normalizeAmountString(leading[2]);
    if (!amount) return '';
    if (currency === '$' || currency === 'US$' || currency === 'USD') return `$${amount}`;
    if (currency === '£' || currency === 'GBP') return `£${amount}`;
    if (currency === '€' || currency === 'EUR') return `€${amount}`;
    if (currency === 'CA$' || currency === 'C$' || currency === 'CAD') return `C$${amount}`;
    if (currency === 'AU$' || currency === 'A$' || currency === 'AUD') return `A$${amount}`;
    return `${currency} ${amount}`;
  }

  const trailing = token.match(/^([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(USD|CAD|AUD|EUR|GBP|CHF|JPY|INR|MXN)$/i);
  if (trailing) {
    const amount = normalizeAmountString(trailing[1]);
    const code = trailing[2].toUpperCase();
    if (!amount) return '';
    if (code === 'USD') return `$${amount}`;
    if (code === 'GBP') return `£${amount}`;
    if (code === 'EUR') return `€${amount}`;
    if (code === 'CAD') return `C$${amount}`;
    if (code === 'AUD') return `A$${amount}`;
    return `${code} ${amount}`;
  }

  const numericOnly = token.match(/^([0-9][0-9,]*(?:\.[0-9]{1,2})?)$/);
  if (numericOnly) {
    const amount = normalizeAmountString(numericOnly[1]);
    return amount ? `$${amount}` : '';
  }

  return '';
}

function normalizePrice(raw) {
  if (!raw) return '';
  const text = String(raw)
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#36;/g, '$')
    .trim();
  if (!text) return '';

  const patterns = [
    /(?:US\$|CA\$|C\$|AU\$|A\$|USD|CAD|AUD|EUR|GBP|CHF|JPY|INR|MXN|\$|£|€)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi,
    /[0-9][0-9,]*(?:\.[0-9]{1,2})?\s*(?:USD|CAD|AUD|EUR|GBP|CHF|JPY|INR|MXN)\b/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const normalized = normalizePriceToken(match[0]);
      if (normalized) return normalized;
    }
    pattern.lastIndex = 0;
  }

  return normalizePriceToken(text);
}

function extractPriceFromText(text) {
  const lines = String(text || '').split('\n').map((line) => line.trim());
  for (const line of lines) {
    if (!line) continue;
    if (/(^|\b)(price|now|sale|deal|current price|our price|list price)(\b|:)/i.test(line)) {
      const normalized = normalizePrice(line);
      if (normalized) return normalized;
    }
  }
  return normalizePrice(text);
}

function parseAmountFromNormalizedPrice(price) {
  const match = String(price || '').match(/([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);
  if (!match) return NaN;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : NaN;
}

function scorePriceContext(context) {
  const text = String(context || '').toLowerCase();
  let score = 0;
  if (/(current price|sale price|our price|now\s*[:=]|deal price|today(?:'s)? price|final price|price to pay|add to cart)/.test(text)) score += 34;
  if (/(price|sale|deal|offer)/.test(text)) score += 14;
  if (/(list price|original price|regular price|was\s*\$|msrp|compare at|strike(?:through)?|crossed[- ]out)/.test(text)) score -= 34;
  if (/(afterpay|klarna|affirm|installments?|payments?|per month|apr|financing)/.test(text)) score -= 58;
  if (/(rewards?|service|installation|shipping|delivery|protection plan|warranty|membership)/.test(text)) score -= 24;
  if (/(review|reviews|rating|stars?)/.test(text)) score -= 8;
  return score;
}

function addPriceCandidate(out, {
  raw = '',
  baseScore = 0,
  index = 0,
  source = '',
  context = '',
  applyContextScore = true
} = {}) {
  const normalized = normalizePrice(raw);
  if (!normalized) return;
  let score = Number(baseScore) || 0;
  if (applyContextScore) score += scorePriceContext(context);
  const amount = parseAmountFromNormalizedPrice(normalized);
  if (Number.isFinite(amount)) {
    if (amount < 20) score -= 12;
    if (amount > 20_000) score -= 40;
  }
  out.push({
    price: normalized,
    amount,
    score,
    index: Number.isFinite(index) ? index : 0,
    source
  });
}

function extractPriceCandidatesFromHtml(html) {
  const text = String(html || '');
  if (!text) return [];
  const out = [];
  const moneyRegex = /(?:US\$|CA\$|C\$|AU\$|A\$|\$|£|€)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi;
  let moneyMatch;
  while ((moneyMatch = moneyRegex.exec(text)) !== null) {
    const index = moneyMatch.index || 0;
    const context = text.slice(Math.max(0, index - 70), Math.min(text.length, index + 110));
    const left = text.slice(Math.max(0, index - 28), index).toLowerCase();
    const right = text.slice(index + moneyMatch[0].length, Math.min(text.length, index + moneyMatch[0].length + 40)).toLowerCase();
    let localBoost = 0;
    if (/(price now|now[:\s]|current|our price|sale)/.test(left)) localBoost += 34;
    if (/(was|list|regular|original|msrp)/.test(left)) localBoost -= 34;
    if (/(save|savings|you save|rebate|discount)\s*$/.test(left)) localBoost -= 72;
    if (/(in\s+\d+\s+payments?|\/mo|per month|apr)/.test(right)) localBoost -= 56;
    if (/\b(?:rebate|savings?)\b/.test(right)) localBoost -= 42;
    if (/\(?\s*[0-9]{1,3}%\s*off\b/.test(right)) localBoost -= 48;
    addPriceCandidate(out, {
      raw: moneyMatch[0],
      baseScore: 44 + localBoost,
      index,
      source: 'html_money',
      context
    });
  }
  moneyRegex.lastIndex = 0;

  const keyedPatterns = [
    {
      regex: /"(?:salePrice|currentPrice|finalPrice|ourPrice|displayPrice|priceToPay|priceAmount)"\s*:\s*"?([0-9]{1,7}(?:\.[0-9]{1,2})?)"?/gi,
      score: 78,
      source: 'html_keyed_primary'
    },
    {
      regex: /"(?:price|amount)"\s*:\s*"?([0-9]{1,7}(?:\.[0-9]{1,2})?)"?/gi,
      score: 54,
      source: 'html_keyed_generic'
    },
    {
      regex: /"(?:listPrice|regularPrice|originalPrice|wasPrice|msrp|strike(?:through)?Price)"\s*:\s*"?([0-9]{1,7}(?:\.[0-9]{1,2})?)"?/gi,
      score: 28,
      source: 'html_keyed_list'
    }
  ];
  for (const pattern of keyedPatterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const index = match.index || 0;
      addPriceCandidate(out, {
        raw: normalizePriceToken(match[1]),
        baseScore: pattern.score,
        index,
        source: pattern.source,
        applyContextScore: false
      });
    }
    pattern.regex.lastIndex = 0;
  }
  return out;
}

function extractIkeaPrimaryHtmlSlice(html = '') {
  const text = String(html || '');
  if (!text) return '';
  const lower = text.toLowerCase();
  const markers = [
    'article number',
    'product details',
    'measurements',
    'good to know',
    'materials and care'
  ];
  const indices = markers
    .map((marker) => lower.indexOf(marker))
    .filter((index) => Number.isInteger(index) && index > 1200);
  const cutoff = indices.length ? Math.min(...indices) : Math.min(text.length, 45_000);
  return text.slice(0, Math.max(0, cutoff));
}

function parseIkeaUtagData(html = '') {
  const text = String(html || '');
  if (!text) return null;
  const scriptMatch = text.match(
    /<script[^>]*data-type=["']utag-data["'][^>]*>\s*var\s+utag_data\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/i
  );
  if (scriptMatch?.[1]) return safeJsonParse(scriptMatch[1], null);
  const fallbackMatch = text.match(/var\s+utag_data\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/i);
  if (fallbackMatch?.[1]) return safeJsonParse(fallbackMatch[1], null);
  return null;
}

function normalizeIkeaArticleNumber(value = '') {
  const digits = String(value || '').replace(/[^0-9]/g, '');
  return digits.length === 8 ? digits : '';
}

function extractIkeaUtagPrice(html = '', sourceUrl = '') {
  const text = String(html || '');
  if (!text || !isIkeaProductPathUrl(sourceUrl)) return '';
  const utagData = parseIkeaUtagData(text);
  const sourceArticleNumbers = extractIkeaProductImageTokens(sourceUrl)
    .articleNumbers
    .map((entry) => normalizeIkeaArticleNumber(entry))
    .filter(Boolean);
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' || typeof value === 'number') return [value];
    return [];
  };
  if (utagData && typeof utagData === 'object') {
    const productIds = toArray(utagData.product_ids).map((entry) => normalizeIkeaArticleNumber(entry)).filter(Boolean);
    const productPrices = toArray(utagData.product_prices).map((entry) => String(entry || '').trim());
    for (const sourceArticleNumber of sourceArticleNumbers) {
      const index = productIds.findIndex((entry) => entry === sourceArticleNumber);
      if (index >= 0) {
        const matchedPrice = normalizePrice(productPrices[index]);
        if (matchedPrice) return matchedPrice;
      }
    }
    if (productIds.length === 1 && productPrices.length === 1) {
      const singlePrice = normalizePrice(productPrices[0]);
      if (singlePrice) return singlePrice;
    }
  }
  const match = text.match(/"product_prices"\s*:\s*\[\s*"([0-9]+(?:\.[0-9]{1,2})?)"\s*]/i);
  if (!match?.[1]) return '';
  return normalizePrice(match[1]);
}

function extractIkeaDataProductPrice(html = '', sourceUrl = '') {
  const text = String(html || '');
  if (!text || !isIkeaProductPathUrl(sourceUrl)) return '';

  const sourceArticleNumbers = extractIkeaProductImageTokens(sourceUrl)
    .articleNumbers
    .map((entry) => normalizeIkeaArticleNumber(entry))
    .filter(Boolean);
  const preferredArticleSet = new Set(sourceArticleNumbers);

  const candidates = [];
  const collectCandidate = (articleRaw = '', priceRaw = '') => {
    const articleNumber = normalizeIkeaArticleNumber(articleRaw);
    const normalizedPrice = normalizePrice(priceRaw);
    if (!normalizedPrice) return '';
    if (articleNumber && preferredArticleSet.size && preferredArticleSet.has(articleNumber)) {
      return normalizedPrice;
    }
    candidates.push({ articleNumber, price: normalizedPrice });
    return '';
  };

  let match;
  const noThenPricePattern = /data-product-no="([^"]+)"[^>]*data-product-price="([^"]+)"/gi;
  while ((match = noThenPricePattern.exec(text)) !== null) {
    const preferred = collectCandidate(match[1], match[2]);
    if (preferred) return preferred;
  }
  const priceThenNoPattern = /data-product-price="([^"]+)"[^>]*data-product-no="([^"]+)"/gi;
  while ((match = priceThenNoPattern.exec(text)) !== null) {
    const preferred = collectCandidate(match[2], match[1]);
    if (preferred) return preferred;
  }

  if (candidates.length) return candidates[0].price;

  const srTextMatch = text.match(/pipcom-price__sr-text[^>]*>\s*Price\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (!srTextMatch?.[1]) return '';
  return normalizePrice(srTextMatch[1]);
}

function isIkeaLikelyProductPageHtml(html = '', sourceUrl = '') {
  if (!isIkeaProductPathUrl(sourceUrl)) return false;
  const text = String(html || '');
  if (!text) return false;
  const sourceArticleNumbers = extractIkeaProductImageTokens(sourceUrl)
    .articleNumbers
    .map((entry) => normalizeIkeaArticleNumber(entry))
    .filter(Boolean);
  const utagData = parseIkeaUtagData(text);
  if (utagData && typeof utagData === 'object' && sourceArticleNumbers.length) {
    const utagIds = (Array.isArray(utagData.product_ids) ? utagData.product_ids : [utagData.product_ids])
      .map((entry) => normalizeIkeaArticleNumber(entry))
      .filter(Boolean);
    if (sourceArticleNumbers.some((entry) => utagIds.includes(entry))) return true;
  }
  for (const articleNumber of sourceArticleNumbers) {
    if (!articleNumber) continue;
    const dotted = articleNumber.replace(/^(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3');
    const spaced = articleNumber.replace(/^(\d{3})(\d{3})(\d{2})$/, '$1 $2 $3');
    if (new RegExp(articleNumber, 'i').test(text)) return true;
    if (new RegExp(dotted.replace(/\./g, '\\.'), 'i').test(text)) return true;
    if (new RegExp(spaced.replace(/\s+/g, '\\s+'), 'i').test(text)) return true;
  }
  if (/data-product-no=/i.test(text) && /data-product-price=/i.test(text)) return true;
  if (/pipf-page[^>]*js-product-pip/i.test(text)) return true;
  if (/id="pip-range-json-ld"/i.test(text)) return true;
  if (/"page_type"\s*:\s*"product information page"/i.test(text)) return true;
  if (/<meta[^>]*property=["']og:type["'][^>]*content=["']product["']/i.test(text)) return true;
  if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"?Product"?[\s\S]*?<\/script>/i.test(text)) {
    return true;
  }
  if (/article number/i.test(text) && /<h1[\s>]/i.test(text)) return true;
  const ikeaProductImageMatches = text.match(/https?:\/\/[^"'\s<>()]*\/images\/products\/[^"'\s<>()]+/gi) || [];
  if (ikeaProductImageMatches.some((entry) => scoreIkeaProductImageMatch(sourceUrl, entry) >= 60)) return true;
  return false;
}

function chooseBestPriceCandidate(candidates) {
  const deduped = new Map();
  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    const key = String(candidate?.price || '').trim();
    if (!key) continue;
    const current = deduped.get(key);
    if (!current || candidate.score > current.score || (candidate.score === current.score && candidate.index < current.index)) {
      deduped.set(key, candidate);
    }
  }
  return [...deduped.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.index !== b.index) return a.index - b.index;
    if (Number.isFinite(a.amount) && Number.isFinite(b.amount) && a.amount !== b.amount) return a.amount - b.amount;
    return 0;
  })[0] || null;
}

function pickBestProductPrice({ finalUrl = '', html = '', meta = {}, jsonLd = {} } = {}) {
  const candidates = [];
  const currency = meta['product:price:currency'] || meta['og:price:currency'] || meta.pricecurrency || '';
  const ikeaSource = isIkeaUrl(finalUrl);
  const ikeaProductPath = isIkeaProductPathUrl(finalUrl);
  const ikeaProductHtml = isIkeaLikelyProductPageHtml(html, finalUrl);

  // IKEA pricing priority (most stable to least for this scraper):
  // 1) data-product-price on the PIP root node (matches what users see on page)
  // 2) Product JSON-LD offer price
  // 3) utag product_prices mapped by article number
  if (ikeaSource) {
    if (!ikeaProductPath || !ikeaProductHtml) return '';
    const ikeaDataProductPrice = extractIkeaDataProductPrice(html, finalUrl);
    if (ikeaDataProductPrice) return ikeaDataProductPrice;
    const ikeaJsonLdRelevant = isIkeaCandidateRelevant(finalUrl, {
      productTitleRaw: jsonLd.name,
      name: jsonLd.name
    });
    const ikeaJsonLdPrice = ikeaJsonLdRelevant ? normalizePrice(jsonLd.price) : '';
    if (ikeaJsonLdPrice) return ikeaJsonLdPrice;
    const ikeaUtagPrice = extractIkeaUtagPrice(html, finalUrl);
    if (ikeaUtagPrice) return ikeaUtagPrice;
  }

  addPriceCandidate(candidates, {
    raw: jsonLd.price,
    baseScore: 62,
    source: 'jsonld'
  });
  if (meta['product:sale_price:amount']) {
    addPriceCandidate(candidates, {
      raw: `${currency} ${meta['product:sale_price:amount']}`.trim(),
      baseScore: 78,
      source: 'meta_sale'
    });
  }
  if (meta['product:price:amount']) {
    addPriceCandidate(candidates, {
      raw: `${currency} ${meta['product:price:amount']}`.trim(),
      baseScore: 66,
      source: 'meta_product_amount'
    });
  }
  if (meta['og:price:amount']) {
    addPriceCandidate(candidates, {
      raw: `${meta['og:price:currency'] || currency} ${meta['og:price:amount']}`.trim(),
      baseScore: 58,
      source: 'meta_og_amount'
    });
  }
  addPriceCandidate(candidates, {
    raw: meta['product:price'],
    baseScore: 58,
    source: 'meta_product_price'
  });
  if (meta.price) {
    addPriceCandidate(candidates, {
      raw: `${meta.pricecurrency || currency} ${meta.price}`.trim(),
      baseScore: 70,
      source: 'meta_itemprop_price'
    });
  }
  if (meta['twitter:data1'] && /[$€£]|(?:USD|CAD|AUD|EUR|GBP|CHF|JPY|INR|MXN)/i.test(meta['twitter:data1'])) {
    addPriceCandidate(candidates, {
      raw: meta['twitter:data1'],
      baseScore: 48,
      source: 'meta_twitter'
    });
  }
  if (isAmazonUrl(finalUrl)) {
    addPriceCandidate(candidates, {
      raw: extractAmazonPriceFromHtml(html),
      baseScore: 86,
      source: 'amazon_html'
    });
  }

  candidates.push(...extractPriceCandidatesFromHtml(html));
  if (ikeaSource) {
    for (const candidate of extractPriceCandidatesFromHtml(extractIkeaPrimaryHtmlSlice(html))) {
      candidates.push({
        ...candidate,
        score: candidate.score + 26,
        source: `${candidate.source}_ikea_primary`
      });
    }
  }
  const best = chooseBestPriceCandidate(candidates);
  return best?.price || '';
}

function absoluteUrl(baseUrl, maybeRelative) {
  if (!maybeRelative) return '';
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return maybeRelative;
  }
}

function isHomeDepotUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    return host === 'homedepot.com' || host.endsWith('.homedepot.com');
  } catch {
    return /(?:^|\.)homedepot\.com(?:$|\/)/i.test(raw);
  }
}

function isBhPhotoUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    return host === 'bhphotovideo.com' || host.endsWith('.bhphotovideo.com') || host === 'bhphoto.com' || host.endsWith('.bhphoto.com');
  } catch {
    return /(?:^|\.)bhphotovideo\.com(?:$|\/)|(?:^|\.)bhphoto\.com(?:$|\/)/i.test(raw);
  }
}

function isLowesUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    return host === 'lowes.com' || host.endsWith('.lowes.com');
  } catch {
    return /(?:^|\.)lowes\.com(?:$|\/)/i.test(raw);
  }
}

function canonicalImageKey(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return '';
  try {
    const url = new URL(text);
    const pathname = url.pathname || '';
    const parts = pathname.split('/').filter(Boolean);
    const file = (parts[parts.length - 1] || '').toLowerCase()
      .replace(/\._[^.]+_(?=\.[a-z0-9]+$)/i, '')
      .replace(/[-_](?:\d{2,5}x\d{2,5}|\d{2,5})(?=\.[a-z0-9]+$)/i, '')
      .replace(/@[\dx]+(?=\.[a-z0-9]+$)/i, '');
    const dir = parts.slice(0, -1).join('/').toLowerCase();
    return `${url.hostname.toLowerCase()}/${dir}/${file}`;
  } catch {
    return text
      .toLowerCase()
      .replace(/[?#].*$/, '')
      .trim();
  }
}

function estimateImageQualityScore(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return 0;
  let score = 0;
  try {
    const url = new URL(text);
    const combined = `${url.pathname} ${url.search}`.toLowerCase();
    const dims = [];
    for (const match of combined.matchAll(/(\d{2,5})[x_](\d{2,5})/g)) {
      dims.push(Number(match[1]) * Number(match[2]));
    }
    for (const match of combined.matchAll(/(?:w|width)=([0-9]{2,5})/g)) {
      dims.push(Number(match[1]) * Number(match[1]));
    }
    for (const match of combined.matchAll(/(?:h|height)=([0-9]{2,5})/g)) {
      dims.push(Number(match[1]) * Number(match[1]));
    }
    for (const match of combined.matchAll(/_s(?:x|y|l)(\d{2,5})_/g)) {
      const size = Number(match[1]);
      dims.push(size * size);
    }
    for (const match of combined.matchAll(/_ac_[a-z]{1,8}(\d{2,5})_/g)) {
      const size = Number(match[1]);
      dims.push(size * size);
    }
    const bestDim = dims.length ? Math.max(...dims) : 0;
    score += bestDim;

    if (/(thumbnail|thumb|icon|swatch|small|tiny|mini|badge|verified|_sm\b|\/sm\/)/i.test(combined)) score -= 220_000;
    if (/(large|xl|zoom|hires|hero|full|original|2048|3000)/i.test(combined)) score += 80_000;
    if (/\.png(?:$|\?)/i.test(url.pathname)) score -= 35_000;
    if (/\.svg(?:$|\?)/i.test(url.pathname)) score -= 150_000;
    if (/\.(jpe?g|webp)(?:$|\?)/i.test(url.pathname)) score += 20_000;
  } catch {
    const lower = text.toLowerCase();
    if (/(thumbnail|thumb|icon|swatch|small|tiny|mini|badge|verified)/i.test(lower)) score -= 220_000;
    if (/(large|xl|zoom|hires|hero|full|original)/i.test(lower)) score += 80_000;
  }
  if (isLikelyLowResThumbnail(text)) score -= 180_000;
  return score;
}

function dedupeImageUrls(urls, max = 30) {
  const highResBuckets = new Map();
  const lowResBuckets = new Map();
  const out = [];
  const upsertBucket = (bucket, key, url, score) => {
    if (!bucket.has(key)) {
      bucket.set(key, { url, score, firstSeen: bucket.size });
      return;
    }
    const current = bucket.get(key);
    if (score > current.score) {
      bucket.set(key, { url, score, firstSeen: current.firstSeen });
    }
  };
  const appendRanked = (bucket) => {
    const ranked = Array.from(bucket.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.firstSeen - b.firstSeen;
    });
    for (const best of ranked) {
      out.push(best.url);
      if (out.length >= max) break;
    }
  };

  for (const entry of Array.isArray(urls) ? urls : []) {
    const candidate = normalizeImageCandidateUrl(entry);
    if (!candidate) continue;
    if (!/^https?:\/\//i.test(candidate)) continue;
    if (!looksLikeProductImage(candidate)) continue;
    const key = canonicalImageKey(candidate);
    if (!key) continue;
    const score = estimateImageQualityScore(candidate);
    if (isLikelyLowResThumbnail(candidate)) {
      upsertBucket(lowResBuckets, key, candidate, score);
      continue;
    }
    upsertBucket(highResBuckets, key, candidate, score);
  }

  appendRanked(highResBuckets);
  if (out.length < max) {
    const highKeys = new Set(out.map((entry) => canonicalImageKey(entry)).filter(Boolean));
    const lowRanked = Array.from(lowResBuckets.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.firstSeen - b.firstSeen;
    });
    for (const candidate of lowRanked) {
      const key = canonicalImageKey(candidate.url);
      if (!key || highKeys.has(key)) continue;
      out.push(candidate.url);
      if (out.length >= max) break;
    }
  }
  return out;
}

function pinPrimaryImage(images, primaryImage) {
  const normalized = dedupeImageUrls(images, 30);
  const primary = normalizeImageCandidateUrl(primaryImage);
  if (!primary) return normalized;
  const primaryKey = canonicalImageKey(primary);
  if (!primaryKey) return normalized;
  const match = normalized.find((src) => canonicalImageKey(src) === primaryKey);
  if (!match) return normalized;
  return [match, ...normalized.filter((src) => src !== match)];
}

function parseSrcsetUrls(srcsetValue) {
  return String(srcsetValue || '')
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractAmazonProductGalleryImages(baseUrl, html) {
  const out = [];
  const push = (candidate) => {
    if (!candidate) return;
    const absolute = absoluteUrl(baseUrl, candidate);
    if (!absolute) return;
    out.push(absolute);
  };
  const trustedContext = /(imageblock|imageblockatf|mainimagecontainer|main-image-container|imgtagwrapper|altimages|landingimage|ivlargeimage|ivthumbimage|maintainableimage|imagegallerydata|colorimages|dynamicimage)/i;
  const blockedContext = /(customerimages|customerimage|customer-media|customer_media|ugc|usergenerated|reviewimage|review-image|reviewmedia|review-media|reviewphotos|customerphotos|cr_arp|cr_dp_d_show_all_btm|ask_(?:details|answers)|customerreviews|customer-reviews)/i;

  const imgTagRegex = /<img\b[^>]*(?:id=["']landingImage["']|data-old-hires=|data-a-dynamic-image=)[^>]*>/gi;
  const srcAttr = /\bsrc\s*=\s*(["'])(.*?)\1/i;
  const dataSrcAttr = /\bdata-src\s*=\s*(["'])(.*?)\1/i;
  const oldHiresAttr = /\bdata-old-hires\s*=\s*(["'])(.*?)\1/i;
  const dynamicAttr = /\bdata-a-dynamic-image\s*=\s*(["'])(.*?)\1/i;
  let tagMatch;
  while ((tagMatch = imgTagRegex.exec(html)) !== null) {
    const tag = tagMatch[0];
    const index = tagMatch.index || 0;
    const isLandingImage = /\bid=["']landingImage["']/i.test(tag);
    const context = html.slice(Math.max(0, index - 220), Math.min(html.length, index + 220)).toLowerCase();
    if (!isLandingImage && !trustedContext.test(context)) continue;
    if (!isLandingImage && blockedContext.test(context)) continue;
    const src = tag.match(oldHiresAttr)?.[2] || tag.match(srcAttr)?.[2] || tag.match(dataSrcAttr)?.[2] || '';
    if (src) push(src);
    const dynamicPayload = tag.match(dynamicAttr)?.[2] || '';
    for (const dynamicUrl of extractUrlsFromDynamicImagePayload(dynamicPayload)) {
      push(dynamicUrl);
    }
  }

  const colorBlockRegex = /"colorImages"\s*:\s*\{[\s\S]{0,260000}?"initial"\s*:\s*\[[\s\S]{0,260000}?\]\s*\}/gi;
  const imageFieldRegex = /"(?:hiRes|large|mainUrl|image|thumb)"\s*:\s*"([^"]+)"/gi;
  let colorBlock;
  while ((colorBlock = colorBlockRegex.exec(html)) !== null) {
    const block = colorBlock[0];
    let fieldMatch;
    while ((fieldMatch = imageFieldRegex.exec(block)) !== null) {
      const raw = String(fieldMatch[1] || '').replace(/\\\//g, '/').replace(/\\u0026/gi, '&');
      push(raw);
    }
    imageFieldRegex.lastIndex = 0;
  }

  return dedupeImageUrls(out, 30);
}

function extractAmazonImageCandidatesFromHtml(html) {
  const out = [];
  const push = (raw) => {
    const normalized = normalizeImageCandidateUrl(raw);
    if (!normalized) return;
    out.push(normalized);
  };

  const dynamicAttrRegex = /\bdata-a-dynamic-image\s*=\s*(["'])(.*?)\1/gi;
  let dynamicAttrMatch;
  while ((dynamicAttrMatch = dynamicAttrRegex.exec(html)) !== null) {
    for (const candidate of extractUrlsFromDynamicImagePayload(dynamicAttrMatch[2])) {
      push(candidate);
    }
  }

  const colorBlockRegex = /"colorImages"\s*:\s*\{[\s\S]{0,260000}?"initial"\s*:\s*\[[\s\S]{0,260000}?\]\s*\}/gi;
  const imageFieldRegex = /"(?:hiRes|large|mainUrl|image|thumb)"\s*:\s*"([^"]+)"/gi;
  let colorBlock;
  while ((colorBlock = colorBlockRegex.exec(html)) !== null) {
    const block = colorBlock[0];
    let fieldMatch;
    while ((fieldMatch = imageFieldRegex.exec(block)) !== null) {
      push(String(fieldMatch[1] || '').replace(/\\\//g, '/').replace(/\\u0026/gi, '&'));
    }
    imageFieldRegex.lastIndex = 0;
  }

  // Fallback: pull Amazon image URLs only when they appear in product-image script contexts.
  const trustedContext = /(colorimages|imageblockatf|mainimage|landingimage|dynamicimage|ivlargeimage|ivthumbimage|altimages|mainurl|hires|imagegallerydata|mainimagecontainer|maintainableimage)/i;
  const blockedContext = /(primevideo|amazonprime|exploreprimevideo|sponsored|sims-|sp_detail|adfeedback|promo|customerimages|customerimage|customer-media|customer_media|ugc|usergenerated|reviewimage|review-image|reviewmedia|review-media|reviewphotos|customerphotos|cr_arp|cr_dp_d_show_all_btm|ask_(?:details|answers)|customerreviews|customer-reviews)/i;
  const scriptImageRegex = /https?:\\?\/\\?\/(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\\?\/images\\?\/I\\?\/[A-Za-z0-9%._,+-]+/gi;
  let scriptImageMatch;
  while ((scriptImageMatch = scriptImageRegex.exec(html)) !== null) {
    const index = scriptImageMatch.index || 0;
    const context = html.slice(Math.max(0, index - 180), Math.min(html.length, index + 180)).toLowerCase();
    if (!trustedContext.test(context)) continue;
    if (blockedContext.test(context)) continue;
    push(scriptImageMatch[0].replace(/\\\//g, '/').replace(/\\u0026/gi, '&'));
  }

  return dedupeImageUrls(out, 30);
}

function extractScriptImageCandidatesFromHtml(baseUrl, html) {
  const out = [];
  const push = (candidate) => {
    if (!candidate) return;
    const absolute = absoluteUrl(baseUrl, candidate);
    if (!absolute) return;
    if (!/^https?:\/\//i.test(absolute)) return;
    if (!looksLikeProductImage(absolute)) return;
    out.push(absolute);
  };
  const trustedContext = /(product|gallery|carousel|hero|zoom|main|primary|media|images?|sku|variant|pdp)/i;
  const blockedContext = /(logo|sprite|icon|favicon|badge|avatar|swatch|captcha|perimeterx|analytics|tracking|doubleclick|adservice|pixel)/i;
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  const imageUrlRegex = /(?:https?:\\?\/\\?|\\?\/\\?\/)[^"'\\\s<>()]+/gi;
  const imageFieldRegex = /["'](?:image|imageUrl|mainImage|heroImage|primaryImage|zoomImage|largeImage|thumbnailUrl|src|url)["']\s*:\s*["']([^"']+)["']/gi;
  let scriptMatch;
  let collected = 0;
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const block = String(scriptMatch[1] || '');
    let urlMatch;
    while ((urlMatch = imageUrlRegex.exec(block)) !== null) {
      const raw = String(urlMatch[0] || '')
        .replace(/\\\//g, '/')
        .replace(/\\u0026/gi, '&')
        .replace(/^\/\//, 'https://');
      if (!isLikelyImageResourceUrl(raw)) continue;
      const index = urlMatch.index || 0;
      const context = block.slice(Math.max(0, index - 140), Math.min(block.length, index + 180)).toLowerCase();
      if (blockedContext.test(context)) continue;
      if (!trustedContext.test(context) && !/\/productimages?\//i.test(raw)) continue;
      push(raw);
      collected += 1;
      if (collected >= 160) break;
    }
    imageUrlRegex.lastIndex = 0;
    if (collected >= 160) break;

    let fieldMatch;
    while ((fieldMatch = imageFieldRegex.exec(block)) !== null) {
      const raw = String(fieldMatch[1] || '')
        .replace(/\\\//g, '/')
        .replace(/\\u0026/gi, '&')
        .replace(/^\/\//, 'https://');
      if (!isLikelyImageResourceUrl(raw)) continue;
      const index = fieldMatch.index || 0;
      const context = block.slice(Math.max(0, index - 140), Math.min(block.length, index + 180)).toLowerCase();
      if (blockedContext.test(context)) continue;
      if (!trustedContext.test(context) && !/\/productimages?\//i.test(raw)) continue;
      push(raw);
      collected += 1;
      if (collected >= 160) break;
    }
    imageFieldRegex.lastIndex = 0;
    if (collected >= 160) break;
  }
  return dedupeImageUrls(out, 30);
}

function extractHomeDepotProductImagesFromHtml(html = '') {
  const out = [];
  const push = (value) => {
    const normalized = normalizeImageCandidateUrl(
      String(value || '')
        .replace(/\\\//g, '/')
        .replace(/\\u0026/gi, '&')
        .replace(/^\/\//, 'https://')
    );
    if (!normalized) return;
    if (!/^https?:\/\//i.test(normalized)) return;
    if (!/images\.thdstatic\.com\/productimages\//i.test(normalized)) return;
    if (!looksLikeProductImage(normalized)) return;
    out.push(normalized);
  };

  const directRegex = /(?:https?:\\\/\\\/|https?:\/\/|\\\/\\\/|\/\/)images\.thdstatic\.com(?:\\\/|\/)productImages(?:\\\/|\/)[^"'\\\s<>()]+/gi;
  let match;
  while ((match = directRegex.exec(html)) !== null) {
    push(match[0]);
  }

  return dedupeImageUrls(out, 30);
}

function extractBhPhotoImageCandidatesFromUrl(sourceUrl = '') {
  if (!isBhPhotoUrl(sourceUrl)) return [];
  try {
    const parsed = new URL(sourceUrl);
    const path = String(parsed.pathname || '');
    const match = path.match(/\/c\/(?:product|replacement_for)\/(\d+)-[a-z0-9]+\/([^/?#]+?)(?:\.html?)?\/?$/i);
    if (!match) return [];
    const productId = String(match[1] || '').trim();
    const slug = decodeURIComponent(String(match[2] || ''))
      .replace(/\.(?:html?)$/i, '')
      .replace(/[^a-z0-9_-]/gi, '')
      .trim();
    if (!productId || !slug) return [];
    const fbImage = `https://www.bhphotovideo.com/images/fb/${slug}_${productId}.jpg`;
    return dedupeImageUrls([fbImage], 6);
  } catch {
    return [];
  }
}

function extractAmazonPriceFromHtml(html) {
  const candidates = [];
  const push = (raw, score = 0, index = 0) => {
    const normalized = normalizePrice(raw);
    if (!normalized) return;
    candidates.push({ value: normalized, score, index });
  };

  const scopedBlockRegex = /<(?:span|div)[^>]*(?:id|class)=["'][^"']*(?:priceblock_ourprice|priceblock_dealprice|corePrice|priceToPay|apex_desktop)[^"']*["'][^>]*>[\s\S]{0,320}?<\/(?:span|div)>/gi;
  let blockMatch;
  while ((blockMatch = scopedBlockRegex.exec(html)) !== null) {
    push(stripTags(blockMatch[0]), 140, blockMatch.index || 0);
  }

  const offscreenRegex = /<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi;
  let offscreenMatch;
  while ((offscreenMatch = offscreenRegex.exec(html)) !== null) {
    const index = offscreenMatch.index || 0;
    const context = html.slice(Math.max(0, index - 220), Math.min(html.length, index + 220)).toLowerCase();
    const hasPriceContext = /price|deal|buybox|coreprice|pricetopay|apex_desktop/.test(context);
    push(stripTags(offscreenMatch[1]), hasPriceContext ? 120 : 75, index);
  }

  const displayPriceRegex = /"displayPrice"\s*:\s*"([^"]+)"/gi;
  let displayPriceMatch;
  while ((displayPriceMatch = displayPriceRegex.exec(html)) !== null) {
    push(displayPriceMatch[1], 100, displayPriceMatch.index || 0);
  }

  const priceAmountRegex = /"priceAmount"\s*:\s*"?([0-9]+(?:\.[0-9]{1,2})?)"?/gi;
  let priceAmountMatch;
  while ((priceAmountMatch = priceAmountRegex.exec(html)) !== null) {
    push(`$${priceAmountMatch[1]}`, 95, priceAmountMatch.index || 0);
  }

  if (!candidates.length) return '';
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });
  return candidates[0].value;
}

function collectImageCandidatesFromHtml(baseUrl, html, meta = {}, jsonLd = {}) {
  const out = [];
  const isAmazon = isAmazonUrl(baseUrl);
  const isHomeDepot = isHomeDepotUrl(baseUrl);
  const isBhPhoto = isBhPhotoUrl(baseUrl);
  const isIkea = isIkeaUrl(baseUrl);
  const isIkeaProductPath = isIkea ? isIkeaProductPathUrl(baseUrl) : false;
  const isIkeaProductHtml = isIkea ? isIkeaLikelyProductPageHtml(html, baseUrl) : false;
  const push = (candidate) => {
    if (!candidate) return;
    const url = absoluteUrl(baseUrl, candidate);
    if (!/^https?:\/\//i.test(url)) return;
    if (!looksLikeProductImage(url)) return;
    if (isIkea && !isIkeaProductImageUrl(url)) return;
    out.push(url);
  };

  push(jsonLd.image);
  for (const candidate of Array.isArray(jsonLd.images) ? jsonLd.images : []) {
    push(candidate);
  }
  push(meta['og:image']);
  push(meta['og:image:secure_url']);
  push(meta['twitter:image']);
  push(meta['og:image:url']);
  push(meta['twitter:image:src']);

  if (isIkea) {
    // IKEA's product JSON-LD is highly reliable; prefer it over broad DOM/script crawling.
    const structuredImages = dedupeImageUrls(
      filterIkeaProductImages(baseUrl, [
        jsonLd.image,
        ...(Array.isArray(jsonLd.images) ? jsonLd.images : []),
        meta['og:image'],
        meta['twitter:image']
      ]),
      30
    );
    if (structuredImages.length) return structuredImages;
    if (!isIkeaProductPath || !isIkeaProductHtml) return [];
  }

  if (isAmazon) {
    const galleryImages = extractAmazonProductGalleryImages(baseUrl, html);
    const structuredImages = extractAmazonImageCandidatesFromHtml(html);
    const amazonImages = dedupeImageUrls(
      [
        ...out,
        ...galleryImages,
        ...structuredImages
      ],
      30
    );
    return amazonImages;
  }

  const imgTagRegex = /<img\b[^>]*>/gi;
  const sourceTagRegex = /<source\b[^>]*>/gi;
  const srcAttr = /\bsrc\s*=\s*(["'])(.*?)\1/i;
  const dataSrcAttr = /\bdata-src\s*=\s*(["'])(.*?)\1/i;
  const srcsetAttr = /\bsrcset\s*=\s*(["'])(.*?)\1/i;
  const dataSrcsetAttr = /\bdata-srcset\s*=\s*(["'])(.*?)\1/i;

  const imgTags = html.match(imgTagRegex) || [];
  const sourceTags = html.match(sourceTagRegex) || [];
  for (const tag of [...imgTags, ...sourceTags]) {
    const src = tag.match(srcAttr)?.[2] || tag.match(dataSrcAttr)?.[2] || '';
    if (src) push(src);
    const srcset = tag.match(srcsetAttr)?.[2] || tag.match(dataSrcsetAttr)?.[2] || '';
    for (const srcsetUrl of parseSrcsetUrls(srcset)) {
      push(srcsetUrl);
    }
  }

  for (const candidate of extractScriptImageCandidatesFromHtml(baseUrl, html)) {
    push(candidate);
  }
  if (isHomeDepot) {
    for (const candidate of extractHomeDepotProductImagesFromHtml(html)) {
      push(candidate);
    }
  }

  if (isBhPhoto && !out.length) {
    for (const candidate of extractBhPhotoImageCandidatesFromUrl(baseUrl)) {
      push(candidate);
    }
  }

  const deduped = dedupeImageUrls(out, 30);
  if (isIkea) {
    return dedupeImageUrls(filterIkeaProductImages(baseUrl, deduped), 30);
  }
  return dedupeImageUrls(out, 30);
}

const IMAGE_ACCESS_CHECK_LIMIT = 4;

async function isImageUrlAccessible(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });
    if (!(response.ok || response.status === 405)) return false;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.startsWith('image/')) return false;
    return true;
  } catch {
    return false;
  }
}

async function findAccessibleImage(candidates, limit = IMAGE_ACCESS_CHECK_LIMIT) {
  if (!Array.isArray(candidates)) return '';
  let checked = 0;
  const seen = new Set();
  for (const raw of candidates) {
    const src = String(raw || '').trim();
    if (!src) continue;
    const key = canonicalImageKey(src);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (await isImageUrlAccessible(src)) {
      return src;
    }
    checked += 1;
    if (checked >= limit) break;
  }
  return '';
}

function isLikelyBotBlockPage(html) {
  const lower = String(html || '').toLowerCase();
  if (!lower) return false;
  return (
    lower.includes('access to this page has been denied') ||
    lower.includes('px-captcha') ||
    lower.includes('perimeterx') ||
    lower.includes('press & hold to confirm you are') ||
    lower.includes('target url returned error 403') ||
    lower.includes('<title>error page</title>') ||
    lower.includes('how doers get more done')
  );
}

function isLikelyBlockedFallbackContent(text = '') {
  const lower = String(text || '').toLowerCase();
  if (!lower) return false;
  return (
    lower.includes('target url returned error 403') ||
    lower.includes('target url returned error 429') ||
    lower.includes('target url returned error 503') ||
    lower.includes('title: error page') ||
    lower.includes('source page is blocked by anti-bot protection') ||
    lower.includes('access to this page has been denied') ||
    lower.includes('perimeterx') ||
    lower.includes('px-captcha') ||
    lower.includes('how doers get more done') ||
    lower.includes('forbidden')
  );
}

function shouldRejectSparseRetailerProduct(product, sourceUrl = '') {
  if (!isHomeDepotUrl(sourceUrl) && !isLowesUrl(sourceUrl)) return false;
  const hasImages = Boolean(product?.image) || (Array.isArray(product?.images) && product.images.length > 0);
  const hasPrice = Boolean(normalizePrice(product?.price || ''));
  return !hasImages && !hasPrice;
}

function isRetailerHighFidelityPreferred(url = '') {
  return isHomeDepotUrl(url) || isLowesUrl(url);
}

function hasStrongRetailerResult(product = {}) {
  const imageCount = Array.isArray(product?.images) ? product.images.length : 0;
  const hasPrimaryImage = Boolean(String(product?.image || '').trim());
  const hasPrice = Boolean(normalizePrice(product?.price || ''));
  return hasPrice && (imageCount >= 2 || hasPrimaryImage);
}

function isLikelyAsinToken(value = '') {
  return /^[a-z0-9]{10}$/i.test(String(value || '').trim());
}

function slugToTitle(slug = '') {
  return decodeURIComponent(String(slug || ''))
    .replace(/\.\w+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function titleFromUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    const ignored = new Set(['product', 'products', 'shop', 'item', 'p', 'pd', 'collections', 'collection']);
    if (isAmazonUrl(rawUrl)) {
      const lowerParts = parts.map((part) => String(part || '').toLowerCase());
      const dpIndex = lowerParts.findIndex((part) => part === 'dp');
      if (dpIndex > 0) {
        const slug = String(parts[dpIndex - 1] || '').trim();
        if (slug && /[a-z]/i.test(slug) && !isLikelyAsinToken(slug)) {
          return slugToTitle(slug);
        }
      }
    }
    const preferredPart = [...parts].reverse().find((part) => {
      const clean = String(part || '').toLowerCase().replace(/\.\w+$/i, '');
      if (!clean || ignored.has(clean)) return false;
      if (/^\d+(\.\w+)?$/.test(clean)) return false;
      if (!/[a-z]/i.test(clean)) return false;
      if (/^ref=/.test(clean)) return false;
      if (isLikelyAsinToken(clean)) return false;
      if (/^[a-z]{0,3}\d{6,}[a-z0-9-]*$/i.test(clean)) return false;
      return true;
    });
    const slug = preferredPart || parts[parts.length - 1] || url.hostname;
    return slugToTitle(slug);
  } catch {
    return 'Untitled item';
  }
}

function minimalFallbackFromUrl(rawUrl, highlights = []) {
  const url = new URL(rawUrl);
  const seller = url.hostname.replace(/^www\./, '');
  const productTitleRaw = normalizeTitle(titleFromUrl(rawUrl));
  const bhImageFallbacks = extractBhPhotoImageCandidatesFromUrl(rawUrl);
  return {
    url: rawUrl,
    brand: '',
    brandRaw: '',
    brandSource: 'unknown',
    brandConfidence: 0,
    productTitleRaw,
    name: buildItemName(productTitleRaw, rawUrl),
    image: bhImageFallbacks[0] || '',
    images: bhImageFallbacks,
    seller,
    price: '',
    highlights,
    description: '',
    dimensions: [],
    materials: [],
    specs: [],
    detailSections: [],
    overview: '',
    overviewBullets: [],
    aiOverview: ''
  };
}

function countTitleNoiseSignals(value = '') {
  const text = String(value || '').toLowerCase();
  const patterns = [
    /\bref\s*=/,
    /\brelease date\b/,
    /\bcustomer reviews?\b/,
    /\banswered questions?\b/,
    /\bsort by\b/,
    /\bsearch results?\b/,
    /\badd to cart\b/,
    /\bshop now\b/
  ];
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function isLikelyNonsenseTitle(name, sourceUrl = '') {
  const value = String(name || '').replace(/\s+/g, ' ').trim();
  if (!value) return true;
  if (/\bref\s*=/.test(value.toLowerCase())) return true;
  if (/\bby\s+no\b/i.test(value)) return true;

  const words = value.split(/\s+/).filter(Boolean);
  const alphaChars = (value.match(/[a-z]/gi) || []).length;
  const symbolChars = (value.match(/[^a-z0-9\s]/gi) || []).length;
  const noiseSignals = countTitleNoiseSignals(value);

  if (noiseSignals >= 2) return true;
  if (isAmazonUrl(sourceUrl) && noiseSignals >= 1) return true;
  if (words.length >= 4 && alphaChars < 8) return true;
  if (value.length >= 12 && symbolChars >= Math.ceil(value.length * 0.18)) return true;
  return false;
}

function isWeakName(name, sourceUrl = '') {
  const value = String(name || '').trim();
  if (!value) return true;
  if (/^untitled item$/i.test(value)) return true;
  if (/^\d+(\.\w+)?$/i.test(value)) return true;
  if (/^(access denied|forbidden|request blocked|bot detection|are you human\??)$/i.test(value)) return true;
  if (/(access denied|temporarily unavailable|verify you are human|captcha)/i.test(value)) return true;
  if (isLikelyNonsenseTitle(value, sourceUrl)) return true;
  if (isRetailerOnlyName(value)) return true;
  return false;
}

function isRetailerOnlyName(name) {
  const clean = String(name || '')
    .replace(/[|].*$/, '')
    .replace(/[^a-z0-9&\s'-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!clean) return true;
  const normalized = clean.replace(/\s+/g, '');
  const retailerNames = new Set([
    'wayfair',
    'allmodern',
    'jossandmain',
    'jossmain',
    'birchlane',
    'perigold',
    'article',
    'lowes',
    'bedbathandbeyond',
    'homedepot',
    'walmart',
    'target',
    'amazon'
  ]);
  return retailerNames.has(normalized);
}

function isRetailerToken(word) {
  const token = String(word || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const retailerTokens = new Set([
    'wayfair',
    'allmodern',
    'jossandmain',
    'jossmain',
    'birchlane',
    'perigold',
    'homedepot',
    'lowes',
    'target',
    'walmart',
    'amazon',
    'ikea'
  ]);
  return retailerTokens.has(token);
}

function chooseBestNameCandidate(candidates, sourceUrl = '') {
  const host = (() => {
    try {
      return new URL(sourceUrl).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return '';
    }
  })();
  const productTerms = /(rug|table|chair|sofa|vanity|oven|cabinet|dresser|mirror|faucet|lamp|bed|sectional|toilet|sink|stool|desk)/i;
  let best = '';
  let bestScore = -Infinity;
  for (const raw of Array.isArray(candidates) ? candidates : []) {
    const candidate = cleanExtractedItemName(String(raw || '').replace(/\s+/g, ' ').trim());
    if (!candidate) continue;
    let score = 0;
    const words = candidate.split(/\s+/).filter(Boolean);
    if (isRetailerOnlyName(candidate)) score -= 200;
    if (/^by\s+/i.test(candidate)) score -= 260;
    if (words.length >= 2 && words.length <= 12) score += 20;
    if (words.length >= 4 && words.length <= 18) score += 12;
    if (productTerms.test(candidate)) score += 24;
    if (/\bset of \d+\b/i.test(candidate)) score += 10;
    if (host && candidate.toLowerCase().includes(host.replace(/\.[a-z]+$/, ''))) score -= 24;
    if (/^\d+$/.test(candidate)) score -= 40;
    if (/(access denied|captcha|verify)/i.test(candidate)) score -= 80;
    if (/\b(?:studio|design|inc|llc)\b/i.test(candidate) && !productTerms.test(candidate)) score -= 35;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

function decodeExtendedHtmlEntities(text) {
  const decoded = decodeHtmlEntities(String(text || ''))
    .replace(/&nbsp;/gi, ' ');
  return decoded
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function shouldNormalizeAllCaps(value) {
  const letters = String(value || '').replace(/[^a-z]/gi, '');
  if (letters.length < 5) return false;
  return letters === letters.toUpperCase();
}

function dedupeAdjacentTokens(text) {
  const tokens = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!tokens.length) return '';
  const out = [];
  let previous = '';
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (key && key === previous) continue;
    out.push(token);
    previous = key;
  }
  return out.join(' ');
}

function normalizeNameFragment(rawValue) {
  let value = decodeExtendedHtmlEntities(rawValue)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  value = value
    .replace(/([|•:;])(?:\s*\1)+/g, '$1')
    .replace(/\s*[-–—]{2,}\s*/g, ' - ')
    .replace(/\s*([|•:;])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
  value = value.replace(/^[|•:;,\-–—\s]+|[|•:;,\-–—\s]+$/g, '').trim();
  if (shouldNormalizeAllCaps(value)) {
    value = toTitleCase(value);
  }
  return dedupeAdjacentTokens(value);
}

function isLikelyMeaningfulBrandText(rawValue) {
  const value = String(rawValue || '').replace(/\s+/g, ' ').trim();
  if (!value) return false;
  if (!/[a-z]/i.test(value)) return false;
  if (/^(?:brand|manufacturer|unknown|none|n\/a|na)$/i.test(value)) return false;
  if (/\b(?:add to cart|customer reviews?|free shipping|shop now|buy now|learn more|item details)\b/i.test(value)) return false;
  if (/^[a-z0-9-]{9,}$/i.test(value) && /[a-z]/i.test(value) && /\d/.test(value)) return false;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 5) return false;
  return true;
}

function normalizeTitle(rawTitle) {
  let value = normalizeNameFragment(rawTitle);
  value = cleanExtractedItemName(value);
  value = value
    .replace(/\s*(?:\||•|:)\s*(?:buy|shop)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  value = value.replace(/^[|•:;,\-–—\s]+|[|•:;,\-–—\s]+$/g, '').trim();
  return dedupeAdjacentTokens(value);
}

function normalizeBrand(rawBrand) {
  let value = normalizeNameFragment(rawBrand);
  value = value
    .replace(/^\s*(?:brand|manufacturer|made by|collection by|sold by)\s*[:\-]?\s*/i, '')
    .replace(/^\s*by\s+/i, '')
    .replace(/\s*\b(?:official|store|shop|site)\b\s*$/i, '')
    .replace(/\s*\b(?:inc|llc|ltd|co)\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  value = value.replace(/^[|•:;,\-–—\s]+|[|•:;,\-–—\s]+$/g, '').trim();
  if (!isLikelyMeaningfulBrandText(value)) return '';
  return dedupeAdjacentTokens(value);
}

function normalizeIdentityKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\.[a-z]{2,}(?:\/.*)?$/, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function normalizeSellerKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  let host = raw;
  if (/^https?:\/\//i.test(raw) || raw.includes('.')) {
    try {
      const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      host = parsed.hostname.toLowerCase();
    } catch {
      host = raw;
    }
  }
  host = host.replace(/^www\./, '');
  const compactHost = (host.split('.')[0] || host).replace(/[^a-z0-9]+/g, '');
  const compactRaw = raw.replace(/[^a-z0-9]+/g, '');
  const aliases = {
    thehomedepot: 'homedepot',
    homedepotcom: 'homedepot',
    lowe: 'lowes',
    lowescom: 'lowes',
    jossmain: 'jossandmain',
    jossandmain: 'jossandmain'
  };
  return aliases[compactHost] || aliases[compactRaw] || compactHost || compactRaw;
}

function clampConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function scoreBrandSource(source) {
  const key = String(source || '').trim().toLowerCase();
  return Number(BRAND_SOURCE_CONFIDENCE[key] || 0);
}

function titleContainsBrand(productTitle, brand) {
  const cleanTitle = normalizeTitle(productTitle);
  const cleanBrand = normalizeBrand(brand);
  if (!cleanTitle || !cleanBrand) return false;
  const escaped = escapeRegExp(cleanBrand).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(cleanTitle);
}

function removeBrandFromTitle(productTitle, brand) {
  const cleanTitle = normalizeTitle(productTitle);
  const cleanBrand = normalizeBrand(brand);
  if (!cleanTitle || !cleanBrand) return cleanTitle;

  const escapedBrand = escapeRegExp(cleanBrand).replace(/\s+/g, '\\s+');
  let working = cleanTitle
    .replace(new RegExp(`^${escapedBrand}(?:\\b|\\s|[|•:;,\\-–—])+`, 'i'), '')
    .replace(new RegExp(`(?:\\b|\\s|[|•:;,\\-–—])+${escapedBrand}$`, 'i'), '')
    .replace(new RegExp(`\\bby\\s+${escapedBrand}\\b`, 'i'), '')
    .replace(/^[|•:;,\-–—\s]+|[|•:;,\-–—\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const brandTokens = cleanBrand.toLowerCase().split(/\s+/).filter(Boolean);
  const compareTokens = working.toLowerCase().split(/\s+/).filter(Boolean);
  if (brandTokens.length && compareTokens.length > brandTokens.length) {
    const startsWithBrand = brandTokens.every((token, idx) => compareTokens[idx] === token);
    const endsWithBrand = brandTokens.every((token, idx) => compareTokens[compareTokens.length - brandTokens.length + idx] === token);
    if (startsWithBrand) {
      working = working.split(/\s+/).slice(brandTokens.length).join(' ').trim();
    }
    if (endsWithBrand && working) {
      working = working.split(/\s+/).slice(0, Math.max(0, working.split(/\s+/).length - brandTokens.length)).join(' ').trim();
    }
  }

  working = working.replace(/^[|•:;,\-–—\s]+|[|•:;,\-–—\s]+$/g, '').trim();
  working = dedupeAdjacentTokens(working);
  return working || cleanTitle;
}

function findSpecCutIndex(tokens = []) {
  const list = Array.isArray(tokens) ? tokens : [];
  const unitWords = new Set(['in', 'inch', 'inches', 'ft', 'foot', 'feet', 'cm', 'mm', 'light', 'lights', 'piece', 'pc', 'pack', 'count']);
  for (let i = 0; i < list.length; i += 1) {
    const current = String(list[i] || '').toLowerCase().replace(/[^a-z0-9.]+/g, '');
    const next = String(list[i + 1] || '').toLowerCase().replace(/[^a-z0-9.]+/g, '');
    if (!current) continue;
    const hasDigit = /\d/.test(current);
    if (!hasDigit) continue;
    if (unitWords.has(next)) return i;
    if (/^\d+(?:\.\d+)?(?:in|inch|inches|ft|cm|mm)$/.test(current)) return i;
    if (/^\d+(?:\.\d+)?(?:light|lights|piece|pc|pack|count)$/.test(current)) return i;
  }
  return -1;
}

function detectNormalizedProductType(text = '') {
  const value = String(text || '').toLowerCase();
  const rules = [
    [/\bflush mount\b/, 'Flush Mount'],
    [/\bwall sconce\b/, 'Wall Sconce'],
    [/\bpendant(?:\s+light)?\b/, 'Pendant Light'],
    [/\bceiling light\b/, 'Ceiling Light'],
    [/\bvanity light\b/, 'Vanity Light'],
    [/\blight fixture\b/, 'Light Fixture'],
    [/\bchandelier\b/, 'Chandelier'],
    [/\bfaucet\b/, 'Faucet'],
    [/\bnightstand\b/, 'Nightstand'],
    [/\bbed frame\b/, 'Bed Frame'],
    [/\btoilet\b/, 'Toilet'],
    [/\bmirror\b/, 'Mirror'],
    [/\brug\b/, 'Rug'],
    [/\btable\b/, 'Table'],
    [/\blamp\b/, 'Lamp']
  ];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) return label;
  }
  const inferred = detectItemType(value);
  return inferred ? toTitleCase(inferred) : '';
}

function extractFinishPhrase(text = '') {
  const value = String(text || '');
  const combo = value.match(/\b(brushed|matte|satin|polished|oil[- ]rubbed)\s+(brass|nickel|chrome|bronze|gold|black|white|steel)\b/i);
  if (combo) {
    return toTitleCase(`${combo[1].replace(/-/g, ' ')} ${combo[2]}`);
  }
  const colorOrder = ['white', 'black', 'gray', 'grey', 'brass', 'nickel', 'chrome', 'bronze', 'gold', 'silver', 'blue', 'green', 'brown', 'beige'];
  const materialOrder = ['linen', 'metal', 'wood', 'acrylic', 'glass', 'steel'];
  const picks = [];
  const hasWord = (word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(value);
  const color = colorOrder.find((entry) => hasWord(entry));
  const material = materialOrder.find((entry) => hasWord(entry));
  if (color) picks.push(color);
  if (material && material !== color) picks.push(material);
  return picks.length ? toTitleCase(picks.join(' ')) : '';
}

function extractStyleDescriptor(text = '') {
  const value = String(text || '').toLowerCase();
  const styles = ['modern', 'industrial', 'farmhouse', 'vintage', 'rustic', 'traditional', 'minimalist'];
  const found = styles.find((entry) => new RegExp(`\\b${escapeRegExp(entry)}\\b`, 'i').test(value));
  return found ? toTitleCase(found) : '';
}

function stripTitleNoiseForFallback(text = '') {
  return String(text || '')
    .replace(/\b\d+(?:\.\d+)?\s*(?:in(?:ch(?:es)?)?|ft|feet|cm|mm|["'])\.?\b/gi, ' ')
    .replace(/\b\d+\s*[- ]?\s*lights?\b/gi, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(?:w|watt|watts)\b/gi, ' ')
    .replace(/\b(?:model|sku|item|style|part|no\.?)\s*[:#-]?\s*[a-z0-9-]+\b/gi, ' ')
    .replace(/\b[a-z]{0,4}\d{3,}[a-z0-9-]*\b/gi, ' ')
    .replace(/\b(?:with|featuring|includes?|including|kit|set|led)\b/gi, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[-–—/|,:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildFallbackTitleName(productTitle = '') {
  const clean = normalizeTitle(productTitle);
  if (!clean) return '';
  const stripped = stripTitleNoiseForFallback(clean);
  const source = stripped || clean;
  const finish = extractFinishPhrase(source);
  const type = detectNormalizedProductType(source) || detectNormalizedProductType(clean);
  const descriptor = extractStyleDescriptor(source);
  const sourceTokens = source.split(/\s+/).filter(Boolean);
  const typeTokens = new Set(String(type || '').toLowerCase().split(/\s+/).filter(Boolean));
  const leadingCandidate = sourceTokens.find((token) => {
    const key = String(token || '').toLowerCase().replace(/[^a-z0-9'-]/g, '');
    if (!key || key.length < 3) return false;
    if (isRetailerToken(key)) return false;
    if (typeTokens.has(key)) return false;
    return true;
  });

  const tokens = [];
  const pushPhrase = (value) => {
    const words = String(value || '').split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push(word);
      if (tokens.length >= 4) return;
    }
  };

  pushPhrase(finish);
  if (!finish && type && leadingCandidate) pushPhrase(toTitleCase(leadingCandidate));
  pushPhrase(type);
  if (tokens.length < 3) pushPhrase(descriptor);

  if (!tokens.length) {
    const fallbackTokens = source
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9'-]/gi, ''))
      .filter(Boolean)
      .filter((token) => !isRetailerToken(token))
      .slice(0, 4)
      .map((token) => toTitleCase(token));
    return dedupeAdjacentTokens(fallbackTokens.join(' ')).trim();
  }

  const output = dedupeAdjacentTokens(tokens.join(' ')).trim();
  return output ? toTitleCase(output) : '';
}

function isLikelyModelTokenForDisplay(token = '') {
  const value = String(token || '').toLowerCase().replace(/[^a-z0-9'-]/g, '');
  if (!value || value.length < 3) return false;
  if (/\d/.test(value)) return false;
  const blocked = new Set([
    'white', 'black', 'gray', 'grey', 'brass', 'nickel', 'chrome', 'bronze', 'gold', 'silver',
    'linen', 'metal', 'wood', 'acrylic', 'glass',
    'modern', 'industrial', 'farmhouse', 'rustic', 'traditional',
    'flush', 'mount', 'wall', 'sconce', 'pendant', 'light', 'fixture',
    'faucet', 'toilet', 'mirror', 'rug', 'table', 'lamp', 'bed', 'frame',
    'floor', 'ceiling', 'indoor', 'outdoor'
  ]);
  return !blocked.has(value);
}

function compactTitleForBrandDisplay(productTitle = '') {
  const clean = normalizeTitle(productTitle);
  if (!clean) return '';
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length <= 2) return clean;
  const cutIndex = findSpecCutIndex(tokens);
  const trimmed = cutIndex > 0 && cutIndex <= 3 ? tokens.slice(0, cutIndex).join(' ').trim() : clean;
  if (!trimmed || isWeakName(trimmed) || isRetailerOnlyName(trimmed)) return clean;
  const trimmedTokens = trimmed.split(/\s+/).filter(Boolean);
  if (trimmedTokens.length <= 2) return trimmed;
  const first = trimmedTokens[0];
  if (isLikelyModelTokenForDisplay(first)) {
    const normalizedType = detectNormalizedProductType(trimmed);
    if (normalizedType && normalizedType.split(/\s+/).length === 1) {
      return `${toTitleCase(first)} ${normalizedType}`;
    }
    return toTitleCase(first);
  }
  const fallback = buildFallbackTitleName(trimmed);
  return fallback || trimmed;
}

function inferBrandFromProductTitle(productTitle = '', sellerName = '') {
  const cleanTitle = normalizeTitle(productTitle);
  const tokens = cleanTitle.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return { brand: '', confidence: 0 };
  if (findSpecCutIndex(tokens) < 0) return { brand: '', confidence: 0 };

  const first = tokens[0] || '';
  const second = tokens[1] || '';
  const third = tokens[2] || '';
  if (!/^[A-Z][A-Za-z&'-]{1,}$/.test(first)) return { brand: '', confidence: 0 };
  if (!/^[A-Z][A-Za-z&'-]{1,}$/.test(second)) return { brand: '', confidence: 0 };
  if (!/^[A-Z][A-Za-z0-9&'-]{2,}$/.test(third)) return { brand: '', confidence: 0 };

  const inferredBrand = normalizeBrand(`${first} ${second}`);
  if (!inferredBrand) return { brand: '', confidence: 0 };
  if (isRetailerOnlyName(inferredBrand) || isBrandEquivalentToSeller(inferredBrand, sellerName)) {
    return { brand: '', confidence: 0 };
  }
  const sellerKey = normalizeSellerKey(sellerName);
  const confidence = MULTI_BRAND_SELLER_KEYS.has(sellerKey) ? 0.74 : 0.71;
  return { brand: inferredBrand, confidence };
}

function isBrandEquivalentToSeller(brand, sellerName) {
  const brandKey = normalizeIdentityKey(brand);
  const sellerKey = normalizeSellerKey(sellerName) || normalizeIdentityKey(sellerName);
  if (!brandKey || !sellerKey) return false;
  if (brandKey === sellerKey) return true;
  const minLength = Math.min(brandKey.length, sellerKey.length);
  return minLength >= 4 && (brandKey.includes(sellerKey) || sellerKey.includes(brandKey));
}

function shouldAppendBrand({ sellerName = '', brand = '', productTitle = '', confidence = 0 } = {}) {
  const cleanBrand = normalizeBrand(brand);
  const cleanTitle = normalizeTitle(productTitle);
  if (!cleanBrand || !cleanTitle) return false;
  if (isWeakName(cleanTitle)) return false;

  const brandConfidence = clampConfidence(confidence);
  if (brandConfidence < BRAND_APPEND_CONFIDENCE_MIN) return false;
  if (isBrandEquivalentToSeller(cleanBrand, sellerName)) return false;

  const sellerKey = normalizeSellerKey(sellerName);
  if (SINGLE_BRAND_SELLER_KEYS.has(sellerKey)) return false;
  if (brandConfidence < BRAND_APPEND_CONFIDENCE_MIN) return false;

  const titleWithoutBrand = removeBrandFromTitle(cleanTitle, cleanBrand);
  if (!titleWithoutBrand || isWeakName(titleWithoutBrand)) return false;
  const escapedBrand = escapeRegExp(cleanBrand).replace(/\s+/g, '\\s+');
  if (new RegExp(`\\b${escapedBrand}\\b`, 'i').test(titleWithoutBrand)) return false;
  return true;
}

function isBhPhotoSeller(value = '') {
  const sellerKey = normalizeSellerKey(value);
  return sellerKey === 'bhphotovideo' || sellerKey === 'bhphoto';
}

function resolveUnifiedItemNameContext(product, sourceUrl = '') {
  const productTitle = resolvePreferredProductTitle(product, sourceUrl);
  let brand = normalizeBrand(product?.brandRaw || product?.brand || '');
  let brandConfidence = resolveBrandConfidence({
    explicitConfidence: product?.brandConfidence,
    brandSource: product?.brandSource,
    brand,
    sellerName: product?.seller || '',
    productTitle
  });
  if (!brand) {
    const inferredBrand = inferBrandFromProductTitle(productTitle, product?.seller || '');
    if (inferredBrand.brand) {
      brand = inferredBrand.brand;
      brandConfidence = Math.max(brandConfidence, clampConfidence(inferredBrand.confidence));
    }
  }
  return {
    productTitle,
    brand,
    brandConfidence
  };
}

function generateUniversalItemName(product, sourceUrl = '') {
  const context = resolveUnifiedItemNameContext(product, sourceUrl);
  const formatted = formatItemName({
    productTitle: context.productTitle,
    brand: context.brand,
    sellerName: product?.seller || '',
    brandConfidence: context.brandConfidence
  });
  if (formatted && !isWeakName(formatted, sourceUrl)) {
    return truncateItemName(formatted);
  }
  const fallback = buildFallbackTitleName(context.productTitle || product?.name || titleFromUrl(sourceUrl));
  if (fallback && !isWeakName(fallback, sourceUrl)) return truncateItemName(fallback);
  const fullName = buildItemName(context.productTitle || product?.name || titleFromUrl(sourceUrl), sourceUrl);
  if (shouldPreferFullItemName(fullName, sourceUrl)) return fullName;
  return truncateItemName(fullName || titleFromUrl(sourceUrl) || 'Untitled item');
}

function formatItemName({ productTitle = '', brand = '', sellerName = '', brandConfidence = 0 } = {}) {
  // Default format item names as `Product Name by Manufacturer` when the manufacturer is confidently known and not redundant with the seller.
  const cleanTitle = normalizeTitle(productTitle);
  if (!cleanTitle) return '';
  if (isBhPhotoSeller(sellerName) && shouldPreferFullItemName(cleanTitle)) {
    return truncateItemName(cleanTitle);
  }
  const cleanBrand = normalizeBrand(brand);
  const titleWithoutBrand = removeBrandFromTitle(cleanTitle, cleanBrand);
  const compactTitle = compactTitleForBrandDisplay(titleWithoutBrand || cleanTitle);
  if (!cleanBrand) {
    const words = cleanTitle.split(/\s+/).filter(Boolean);
    const hasSpecNoise = /\b\d+(?:\.\d+)?\s*(?:in(?:ch(?:es)?)?|ft|cm|mm|w|watt|watts|v|volt|volts|gpf|gpm|lb|lbs|kg)\b/i.test(cleanTitle)
      || /\b(?:model|sku|item|style|part|no\.?)\b/i.test(cleanTitle);
    if (words.length <= 8 && !hasSpecNoise) {
      return truncateItemName(cleanTitle);
    }
    return truncateItemName(buildFallbackTitleName(titleWithoutBrand || cleanTitle) || titleWithoutBrand || cleanTitle);
  }
  if (!shouldAppendBrand({
    sellerName,
    brand: cleanBrand,
    productTitle: compactTitle || titleWithoutBrand || cleanTitle,
    confidence: brandConfidence
  })) {
    return truncateItemName(buildFallbackTitleName(titleWithoutBrand || cleanTitle) || titleWithoutBrand || cleanTitle);
  }
  return truncateItemName(`${compactTitle || titleWithoutBrand || cleanTitle} by ${cleanBrand}`);
}

function extractVisibleBrandCandidates(html = '') {
  const text = decodeExtendedHtmlEntities(stripTags(html))
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return [];
  const out = [];
  const push = (value, source, confidence) => {
    const cleaned = normalizeBrand(
      String(value || '')
        .replace(/\s*(?:\||•|,|;).*/g, '')
        .replace(/\s+\b(?:reviews?|rating|customer|item|sku|model|price|sale|ships?|shop|buy)\b.*$/i, '')
        .trim()
    );
    if (!cleaned) return;
    out.push({
      raw: String(value || '').trim(),
      brand: cleaned,
      source,
      confidence: clampConfidence(confidence)
    });
  };

  const labeledPatterns = [
    { pattern: /\bbrand\s*[:\-]\s*([a-z0-9][a-z0-9&'./() -]{1,80})/gi, source: 'visible_labeled', confidence: 0.88 },
    { pattern: /\bmanufacturer\s*[:\-]\s*([a-z0-9][a-z0-9&'./() -]{1,80})/gi, source: 'visible_labeled', confidence: 0.88 },
    { pattern: /\bcollection\s+by\s+([a-z0-9][a-z0-9&'./() -]{1,80})/gi, source: 'visible_labeled', confidence: 0.86 }
  ];
  for (const { pattern, source, confidence } of labeledPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      push(match[1], source, confidence);
      if (out.length >= 12) return out;
    }
    pattern.lastIndex = 0;
  }

  const byPattern = /\bby\s+([a-z][a-z0-9&'./() -]{1,60})(?=\s*(?:\||•|,|(?:\d+\s+reviews?)|$))/gi;
  let byMatch;
  while ((byMatch = byPattern.exec(text)) !== null) {
    push(byMatch[1], 'visible_byline', 0.82);
    if (out.length >= 12) break;
  }
  return out;
}

function normalizeProductTitleCandidate(rawTitle = '', sourceUrl = '') {
  const clean = normalizeTitle(rawTitle);
  if (!clean) return '';
  if (!isAmazonUrl(sourceUrl)) return clean;
  const segments = clean.split(/\s[-–—|]\s/).map((entry) => entry.trim()).filter(Boolean);
  if (!segments.length) return clean;
  const primary = segments[0];
  if (!primary) return clean;
  const words = primary.split(/\s+/).filter(Boolean);
  if (words.length >= 3 && words.length <= 14 && !isWeakName(primary, sourceUrl)) {
    return primary;
  }
  return clean;
}

function scoreProductTitleCandidate(candidate, { sourceUrl = '' } = {}) {
  const normalized = normalizeProductTitleCandidate(candidate?.raw || '', sourceUrl);
  if (!normalized) return Number.NEGATIVE_INFINITY;
  if (isWeakName(normalized, sourceUrl) || isRetailerOnlyName(normalized)) return Number.NEGATIVE_INFINITY;

  let score = Number(candidate?.confidence || 0) * 100;
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 18) score += 18;
  if (words.length === 1) score -= 18;
  if (words.length > 24) score -= 20;
  if (isGenericTypeOnlyName(normalized)) score -= 26;
  if (/\b(product|toy|climber|chair|table|faucet|lamp|light|mount|toilet|bed|rug)\b/i.test(normalized)) score += 10;
  if (isLikelyNonsenseTitle(normalized, sourceUrl)) score -= 180;

  if (isAmazonUrl(sourceUrl)) {
    if (candidate?.source === 'amazon_dom') score += 34;
    if (candidate?.source === 'h1') score += 10;
    if (candidate?.source === 'url') score -= 12;
  }

  return score;
}

function extractProductTitle(doc, structuredData, metadata, { sourceUrl = '' } = {}) {
  const primaryHeading = parsePrimaryHeading(doc, { sourceUrl });
  const amazonDomTitle = isAmazonUrl(sourceUrl) ? extractAmazonProductTitleFromHtml(doc) : '';
  const candidates = [
    { raw: amazonDomTitle, source: 'amazon_dom', confidence: 0.995 },
    { raw: primaryHeading, source: 'h1', confidence: 0.98 },
    { raw: structuredData?.name || '', source: 'json_ld', confidence: 0.92 },
    { raw: metadata?.title || '', source: 'metadata', confidence: 0.7 },
    { raw: metadata?.['og:title'] || '', source: 'metadata', confidence: 0.68 },
    { raw: metadata?.['twitter:title'] || '', source: 'metadata', confidence: 0.66 },
    { raw: parseTitle(doc), source: 'metadata', confidence: 0.6 },
    { raw: titleFromUrl(sourceUrl), source: 'url', confidence: 0.45 }
  ];

  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const candidate of candidates) {
    const normalized = normalizeProductTitleCandidate(candidate.raw, sourceUrl);
    if (!normalized) continue;
    const score = scoreProductTitleCandidate(candidate, { sourceUrl });
    if (!best || score > bestScore) {
      best = {
        productTitleRaw: normalized,
        productTitle: normalized,
        source: candidate.source,
        confidence: candidate.confidence
      };
      bestScore = score;
    }
  }

  if (best && Number.isFinite(bestScore) && bestScore > Number.NEGATIVE_INFINITY) {
    return best;
  }

  const fallbackRaw = chooseBestNameCandidate(candidates.map((entry) => entry.raw), sourceUrl) || titleFromUrl(sourceUrl) || 'Untitled item';
  const fallbackNormalized = normalizeProductTitleCandidate(fallbackRaw, sourceUrl) || buildItemName(fallbackRaw, sourceUrl);
  return {
    productTitleRaw: fallbackNormalized,
    productTitle: fallbackNormalized,
    source: 'fallback',
    confidence: 0.4
  };
}

function extractBrand(doc, structuredData, metadata, { sellerName = '', productTitle = '' } = {}) {
  const candidates = [];
  const addCandidate = (rawValue, source, confidence) => {
    const brand = normalizeBrand(rawValue);
    if (!brand) return;
    candidates.push({
      raw: String(rawValue || '').trim(),
      brand,
      source,
      confidence: clampConfidence(confidence)
    });
  };

  addCandidate(structuredData?.brand, 'json_ld', BRAND_SOURCE_CONFIDENCE.json_ld);
  for (const visible of extractVisibleBrandCandidates(doc)) {
    addCandidate(visible.raw, visible.source, visible.confidence);
  }
  const metadataBrandKeys = [
    'product:brand',
    'product:manufacturer',
    'og:brand',
    'brand',
    'manufacturer'
  ];
  for (const key of metadataBrandKeys) {
    addCandidate(metadata?.[key], 'metadata', BRAND_SOURCE_CONFIDENCE.metadata);
  }

  if (!candidates.length) {
    return {
      brandRaw: '',
      brand: '',
      source: 'unknown',
      confidence: 0
    };
  }

  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const candidate of candidates) {
    let score = candidate.confidence;
    if (titleContainsBrand(productTitle, candidate.brand)) score += 0.05;
    if (isBrandEquivalentToSeller(candidate.brand, sellerName)) score -= 0.04;
    if (!best || score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return {
    brandRaw: best?.brand || '',
    brand: best?.brand || '',
    source: best?.source || 'unknown',
    confidence: clampConfidence(best?.confidence || 0)
  };
}

function resolveBrandConfidence({
  explicitConfidence = 0,
  brandSource = '',
  brand = '',
  sellerName = '',
  productTitle = ''
} = {}) {
  const explicit = clampConfidence(explicitConfidence);
  if (explicit > 0) return explicit;
  const cleanBrand = normalizeBrand(brand);
  if (!cleanBrand) return 0;
  let confidence = scoreBrandSource(brandSource);
  if (!confidence) confidence = BRAND_SOURCE_CONFIDENCE.unknown;
  if (titleContainsBrand(productTitle, cleanBrand)) {
    confidence = Math.max(confidence, 0.8);
  }
  if (isBrandEquivalentToSeller(cleanBrand, sellerName)) {
    confidence = Math.max(confidence, 0.9);
  }
  return clampConfidence(confidence);
}

function resolvePreferredProductTitle(product, sourceUrl = '') {
  const candidates = [
    product?.productTitleRaw || '',
    product?.name || '',
    titleFromUrl(sourceUrl)
  ];
  const winner = chooseBestNameCandidate(candidates, sourceUrl) || candidates.find((entry) => String(entry || '').trim()) || '';
  let normalized = normalizeTitle(winner);
  if (!normalized || isWeakName(normalized, sourceUrl) || isRetailerOnlyName(normalized) || isGenericTypeOnlyName(normalized)) {
    const fromUrl = normalizeTitle(titleFromUrl(sourceUrl));
    if (fromUrl && !isWeakName(fromUrl, sourceUrl) && !isRetailerOnlyName(fromUrl)) {
      normalized = fromUrl;
    }
  }
  if (!normalized) {
    normalized = buildItemName(winner || titleFromUrl(sourceUrl), sourceUrl);
  }
  return normalized;
}

function inferBrandFromName(name) {
  const text = String(name || '').replace(/[|].*$/, '').trim();
  if (!text) return '';
  const tokens = text.split(/\s+/).filter(Boolean);
  const productWord = /^(table|vanity|sofa|chair|oven|range|microwave|refrigerator|fridge|dishwasher|faucet|mirror|rug|lamp|bed|dresser|cabinet|desk|stool|sink|toilet|grill|sectional|air|fry|single|double|outdoor|indoor)$/i;
  const out = [];
  for (const token of tokens) {
    const clean = token.replace(/[^a-z0-9&'-]/gi, '');
    if (!clean) continue;
    if (productWord.test(clean)) break;
    if (/^[A-Z][A-Za-z0-9&'-]*$/.test(clean) || /^[A-Z]+$/.test(clean)) {
      out.push(clean);
      if (out.length >= 3) break;
      continue;
    }
    break;
  }
  const deduped = out.filter((token, idx) => {
    if (idx === 0) return true;
    return token.toLowerCase() !== out[idx - 1].toLowerCase();
  });
  return deduped.join(' ').trim();
}

function inferBriefType(text) {
  const value = String(text || '').toLowerCase();
  const rules = [
    [/wall oven/, 'Wall Oven'],
    [/patio table/, 'Patio Table'],
    [/\bvanity\b/, 'Vanity'],
    [/dining chair|patio chair|outdoor chair/, 'Dining Chair'],
    [/\bsofa\b|\bcouch\b/, 'Sofa'],
    [/\b(?:patio|dining|coffee|console|side|end|accent|cocktail|entry|kitchen|bedside|writing)\s+table\b|\btable\s+(?:set|desk|top|base|legs)\b/, 'Table'],
    [/\bmirror\b/, 'Mirror'],
    [/\bfaucet\b/, 'Faucet'],
    [/\brug\b/, 'Rug'],
    [/\blamp\b/, 'Lamp']
  ];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) return label;
  }
  return '';
}

function detectItemType(text) {
  const value = String(text || '').toLowerCase();
  const rules = [
    [/\bwall oven\b|\boven\b/, 'Oven'],
    [/\btable lamp\b|\bfloor lamp\b|\bceiling light\b|\bflush mount\b|\blight fixture\b|\blamp\b/, 'Light Fixture'],
    [/\b(?:patio|dining|coffee|console|side|end|accent|cocktail|entry|kitchen|bedside|writing)\s+table\b|\btable\s+(?:set|desk|top|base|legs)\b/, 'Table'],
    [/\brug\b/, 'Rug'],
    [/\bvanity\b/, 'Vanity'],
    [/\bchair\b/, 'Chair'],
    [/\bsofa\b|\bcouch\b/, 'Sofa'],
    [/\bmirror\b/, 'Mirror'],
    [/\bfaucet\b/, 'Faucet'],
    [/\btoilet\b/, 'Toilet'],
    [/\bsink\b/, 'Sink'],
    [/\bcabinet\b/, 'Cabinet'],
    [/\bdresser\b/, 'Dresser'],
    [/\bbed\b/, 'Bed'],
    [/\bdesk\b/, 'Desk'],
    [/\brefrigerator\b|\bfridge\b/, 'Refrigerator'],
    [/\bdishwasher\b/, 'Dishwasher']
  ];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) return label;
  }
  return '';
}

function detectPatioType(text) {
  const value = String(text || '').toLowerCase();
  if (/\bpatio\b.*\btable\b|\btable\b.*\bpatio\b|\boutdoor\b.*\btable\b|\bdining table\b/.test(value)) {
    return 'Patio Table';
  }
  return '';
}

function detectMaterial(text) {
  const value = String(text || '').toLowerCase();
  const materials = [
    ['teak', 'Teak'],
    ['eucalyptus', 'Eucalyptus'],
    ['acacia', 'Acacia'],
    ['oak', 'Oak'],
    ['walnut', 'Walnut'],
    ['aluminum', 'Aluminum'],
    ['steel', 'Steel'],
    ['metal', 'Metal'],
    ['wood', 'Wood']
  ];
  for (const [token, label] of materials) {
    if (value.includes(token)) return label;
  }
  return '';
}

function detectQuantity(text) {
  const value = String(text || '');
  const pieceMatch = value.match(/\b(\d+)\s*[- ]?\s*piece\b/i);
  if (pieceMatch) return `${pieceMatch[1]} Piece`;
  const setMatch = value.match(/\b(\d+)\s*[- ]?\s*pc\b/i);
  if (setMatch) return `${setMatch[1]} Piece`;
  return '';
}

function extractModelToken(text) {
  const stop = new Set([
    'outdoor', 'indoor', 'dining', 'table', 'chair', 'sofa', 'rug', 'oven', 'vanity', 'set',
    'piece', 'rectangular', 'round', 'with', 'umbrella', 'hole', 'light', 'led', 'flush', 'mount',
    'fixture', 'ceiling', 'chandelier', 'pendant', 'dark', 'wood',
    'teak', 'eucalyptus', 'aluminum', 'metal', 'modern', 'collection', 'and', 'for', 'the',
    'wayfair', 'allmodern', 'all', 'joss', 'main', 'jossandmain', 'birchlane', 'birch',
    'lane', 'perigold', 'hand', 'tufted', 'wool', 'area', 'rectangle', 'square', 'runner'
  ]);
  const tokens = String(text || '')
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9'-]/gi, ''))
    .filter(Boolean);
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (stop.has(lower)) continue;
    if (/^\d+$/.test(lower)) continue;
    if (token.length < 3) continue;
    return toTitleCase(token);
  }
  return '';
}

function abbreviateItemName(rawName) {
  const text = String(rawName || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Untitled item';

  const quantity = detectQuantity(text);
  const material = detectMaterial(text);
  const patioType = detectPatioType(text);
  const type = patioType || detectItemType(text);
  const model = extractModelToken(text);

  if (model && type) {
    if (quantity && material) return `${quantity} ${material} ${type}`;
    if (quantity) return `${quantity} ${model} ${type}`;
    if (material) return `${model} ${material} ${type}`;
    return `${model} ${type}`;
  }

  const parts = [quantity, material, type].filter(Boolean);
  if (parts.length) return parts.join(' ');

  const stop = new Set([
    'with', 'and', 'the', 'for', 'from', 'by', 'outdoor', 'indoor', 'rectangular', 'round',
    'modern', 'set', 'collection', 'mode', 'new', 'in', 'on'
  ]);
  const tokens = text
    .split(' ')
    .map((t) => t.replace(/[^a-z0-9'-]/gi, ''))
    .filter(Boolean)
    .filter((t) => !stop.has(t.toLowerCase()));

  return tokens.slice(0, 4).map(toTitleCase).join(' ') || 'Untitled item';
}

function composeDescription(name, brandHint = '') {
  const fullName = String(name || '').replace(/\s+/g, ' ').trim();
  if (!fullName) return 'Untitled item';

  const brand = String(brandHint || inferBrandFromName(fullName)).trim();
  let withoutBrand = fullName;
  if (brand) {
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const repeatedBrandPrefix = new RegExp(`^(?:${escapedBrand}\\s+)+`, 'i');
    withoutBrand = withoutBrand.replace(repeatedBrandPrefix, '').trim();
  }
  const brief = inferBriefType(withoutBrand || fullName);

  if (brand && brief) return `${brand}, ${brief}`;
  if (brand && withoutBrand) {
    return `${brand}, ${withoutBrand.split(/\s+/).slice(0, 3).join(' ')}`;
  }
  return fullName.split(/\s+/).slice(0, 5).join(' ');
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitHintTokens(value) {
  const stop = new Set([
    'www', 'com', 'net', 'org', 'co', 'io', 'store', 'shop', 'inc', 'llc', 'ltd', 'official'
  ]);
  return String(value || '')
    .toLowerCase()
    .replace(/https?:\/\//g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stop.has(token));
}

function hostFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

function stripLeadingHintTokens(name, hints = []) {
  let value = String(name || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  const tokens = [...new Set(hints.flatMap((hint) => splitHintTokens(hint)))];
  if (!tokens.length) return value;
  const pattern = new RegExp(`^(?:${tokens.map((token) => escapeRegExp(token)).join('|')})(?:\\b|\\s|[-–—,:])+`, 'i');
  let prev = '';
  while (value && value !== prev && pattern.test(value)) {
    prev = value;
    value = value.replace(pattern, '').trim();
  }
  return value;
}

function removeModelAndMeasurementNoise(text) {
  return String(text || '')
    .replace(/\b(?:model|sku|item|style|part|number|no\.?)\b\s*[:#-]?\s*[a-z0-9-]+\b/gi, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(?:gpf|gpm|amp|amps|w|kw|watt|watts|volt|volts|v|hz|in|inch|inches|ft|cm|mm|oz|lb|lbs|kg)\b/gi, ' ')
    .replace(/\b(?:rough[-\s]?in)\b/gi, ' ')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompactItemNameCandidate(rawName, { brand = '', seller = '', sourceUrl = '', typeHint = '' } = {}) {
  const keepTokens = new Set(['one-piece', 'wall-mounted', 'floor-mounted']);
  const hostHint = hostFromUrl(sourceUrl);
  const blockedTokens = new Set([
    ...splitHintTokens(brand),
    ...splitHintTokens(seller),
    ...splitHintTokens(hostHint)
  ]);
  const blockedWords = new Set([
    'model', 'sku', 'item', 'style', 'number', 'no', 'in', 'inch', 'inches', 'ft', 'cm', 'mm',
    'gpf', 'gpm', 'amp', 'amps', 'watt', 'watts', 'volt', 'volts', 'hz', 'lb', 'lbs', 'kg'
  ]);
  let value = cleanExtractedItemName(String(rawName || '').replace(/\s+/g, ' ').trim());
  value = stripLeadingHintTokens(value, [brand, seller, hostHint]);
  value = removeModelAndMeasurementNoise(value);
  const tokens = value
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ''))
    .filter(Boolean)
    .filter((token) => {
      const lower = token.toLowerCase();
      if (keepTokens.has(lower)) return true;
      if (blockedTokens.has(lower)) return false;
      if (blockedWords.has(lower)) return false;
      if (/^\d+(?:\.\d+)?$/.test(lower)) return false;
      if (/[a-z]/i.test(token) && /\d/.test(token)) return false;
      return true;
    });
  let compact = tokens.join(' ').replace(/\s+/g, ' ').trim();
  if (!compact) {
    compact = detectItemType(typeHint) || '';
  }
  compact = compact
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, ITEM_NAME_WORD_LIMIT)
    .join(' ');
  return toTitleCase(compact);
}

function collectCompactNameDescriptors(text) {
  const value = String(text || '').toLowerCase();
  const out = [];
  if (/\bdual flush\b/.test(value)) out.push('Dual Flush');
  if (/\bone[-\s]?piece\b/.test(value)) out.push('One-Piece');
  if (/\bcompact\b/.test(value)) out.push('Compact');
  if (/\belongated\b/.test(value)) out.push('Elongated');
  if (/\bwall[-\s]?mounted\b/.test(value)) out.push('Wall-Mounted');
  if (/\bfloor[-\s]?mounted\b/.test(value)) out.push('Floor-Mounted');
  if (/\bpedestal\b/.test(value)) out.push('Pedestal');
  if (/\bsmart\b/.test(value)) out.push('Smart');
  return out;
}

function isGenericTypeOnlyName(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return true;
  const generic = new Set([
    'table', 'chair', 'sofa', 'rug', 'vanity', 'mirror', 'faucet', 'toilet', 'sink', 'cabinet',
    'dresser', 'bed', 'desk', 'refrigerator', 'dishwasher', 'lamp', 'light', 'light fixture',
    'flush mount', 'patio table'
  ]);
  return generic.has(normalized);
}

function extractDistinctiveModelFromUrl(sourceUrl = '', { brand = '', seller = '' } = {}) {
  const token = extractModelToken(titleFromUrl(sourceUrl));
  if (!token) return '';
  if (isGenericTypeOnlyName(token)) return '';
  const blocked = new Set([
    ...splitHintTokens(brand),
    ...splitHintTokens(seller),
    ...splitHintTokens(hostFromUrl(sourceUrl))
  ]);
  return blocked.has(token.toLowerCase()) ? '' : token;
}

function buildHeuristicCompactItemName(product, sourceUrl = '') {
  const brandHint = String(product?.brand || inferBrandFromName(product?.name || '')).trim();
  const hints = [
    product?.name,
    product?.description,
    ...(Array.isArray(product?.specs) ? product.specs.slice(0, 8) : []),
    ...(Array.isArray(product?.highlights) ? product.highlights.slice(0, 4) : [])
  ].filter(Boolean);
  const hintText = hints.join(' ');
  const base = normalizeCompactItemNameCandidate(product?.name || '', {
    brand: brandHint,
    seller: product?.seller || '',
    sourceUrl,
    typeHint: hintText
  });
  const type = detectItemType(hintText) || detectItemType(product?.name || '') || detectItemType(titleFromUrl(sourceUrl));
  const descriptors = collectCompactNameDescriptors(hintText);
  const modelFromUrl = extractDistinctiveModelFromUrl(sourceUrl, {
    brand: brandHint,
    seller: product?.seller || ''
  });
  const blockedModelTokens = new Set([
    ...splitHintTokens(brandHint),
    ...splitHintTokens(product?.seller || ''),
    ...splitHintTokens(hostFromUrl(sourceUrl))
  ]);
  const modelFromNameRaw = extractModelToken(product?.name || '');
  const modelFromName = blockedModelTokens.has(modelFromNameRaw.toLowerCase()) ? '' : modelFromNameRaw;
  let compact = base;
  if (!compact || isGenericTypeOnlyName(compact)) {
    if (modelFromUrl) {
      compact = modelFromUrl;
    } else {
      compact = [modelFromName, ...descriptors.slice(0, 1), type].filter(Boolean).join(' ');
    }
  } else if (compact.split(/\s+/).length > 7) {
    compact = [modelFromName, ...descriptors.slice(0, 1), type].filter(Boolean).join(' ') || compact;
  }
  if (!compact) {
    compact = modelFromUrl || base || cleanExtractedItemName(titleFromUrl(sourceUrl)) || 'Untitled item';
  }
  const normalized = normalizeCompactItemNameCandidate(compact, {
    brand: brandHint,
    seller: product?.seller || '',
    sourceUrl,
    typeHint: hintText
  });
  if (normalized && !isGenericTypeOnlyName(normalized)) return normalized;
  if (modelFromUrl) return modelFromUrl;
  return normalized || (type ? toTitleCase(type) : 'Untitled item');
}

function compactNamePromptPayload(product, sourceUrl, fallbackName) {
  const brandHint = String(product?.brand || inferBrandFromName(product?.name || '')).trim();
  const description = String(product?.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  const specs = Array.isArray(product?.specs)
    ? product.specs.map((entry) => String(entry || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 6)
    : [];
  const highlights = Array.isArray(product?.highlights)
    ? product.highlights.map((entry) => String(entry || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 4)
    : [];
  return {
    url: sourceUrl,
    current_name: String(product?.name || '').replace(/\s+/g, ' ').trim(),
    brand_hint: brandHint,
    seller_hint: String(product?.seller || '').replace(/\s+/g, ' ').trim(),
    description,
    specs,
    highlights,
    fallback_name: fallbackName
  };
}

async function requestAiCompactItemName(product, sourceUrl, fallbackName) {
  if (!OPENAI_API_KEY) return '';
  const systemPrompt = [
    'You create concise shopping item names.',
    'Return only valid JSON like {"name":"Compact Item Name"}.',
    'Rules:',
    '1) 1 to 10 words (prefer 1-5 words).',
    '2) Keep only the product name/type and useful descriptor words.',
    '3) Never include seller, retailer, manufacturer, or brand names.',
    '4) Never include model/SKU/style numbers.',
    '5) Avoid measurements and spec units unless essential.',
    '6) Use title case.'
  ].join('\n');
  const userPrompt = JSON.stringify(compactNamePromptPayload(product, sourceUrl, fallbackName), null, 2);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_ITEM_NAME_TIMEOUT_MS);
  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENAI_ITEM_NAME_MODEL,
        temperature: 0.1,
        max_tokens: 80,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    if (!response.ok) return '';
    const payload = safeJsonParse(await response.text(), {});
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return '';
    const parsed = safeJsonParse(content, {});
    return typeof parsed?.name === 'string' ? parsed.name : '';
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function pickCompactItemName(product, sourceUrl = '') {
  const brandHint = String(product?.brand || inferBrandFromName(product?.name || '')).trim();
  const modelFromUrl = extractDistinctiveModelFromUrl(sourceUrl, {
    brand: brandHint,
    seller: product?.seller || ''
  });
  const fallback = buildHeuristicCompactItemName(product, sourceUrl);
  const aiName = await requestAiCompactItemName(product, sourceUrl, fallback);
  const normalizedAi = normalizeCompactItemNameCandidate(aiName, {
    brand: brandHint,
    seller: product?.seller || '',
    sourceUrl,
    typeHint: [product?.name || '', product?.description || '', ...(product?.specs || [])].join(' ')
  });
  if (normalizedAi && !isWeakName(normalizedAi)) {
    if (!isGenericTypeOnlyName(normalizedAi) || !modelFromUrl) return normalizedAi;
    return modelFromUrl;
  }
  if (fallback && !isGenericTypeOnlyName(fallback)) return fallback;
  return modelFromUrl || fallback;
}

function shouldPreferFullItemName(name, sourceUrl = '') {
  const clean = String(name || '').replace(/\s+/g, ' ').trim();
  if (!clean || isWeakName(clean)) return false;
  if (isGenericTypeOnlyName(clean)) return false;
  if (/(add to cart|free shipping|customer reviews?|shop now|buy now|see details|learn more)/i.test(clean)) return false;
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 24) return false;
  if (words.length === 1) {
    const token = words[0];
    return token.length >= 4 && /[a-z]/i.test(token) && !isRetailerToken(token);
  }
  return true;
}

async function pickFinalItemName(product, sourceUrl = '') {
  return generateUniversalItemName(product, sourceUrl);
}

function buildItemName(rawName, sourceUrl = '') {
  const base = String(rawName || '').replace(/\s+/g, ' ').trim();
  const cleaned = cleanExtractedItemName(base);
  const bestCandidate = chooseBestNameCandidate([cleaned, base], sourceUrl) || cleaned;
  const safe = isWeakName(bestCandidate, sourceUrl) ? titleFromUrl(sourceUrl) : bestCandidate;
  const normalized = cleanExtractedItemName(safe);
  if (normalized && !isWeakName(normalized, sourceUrl)) return truncateItemName(normalized);
  const fromUrl = cleanExtractedItemName(titleFromUrl(sourceUrl));
  return truncateItemName(fromUrl || 'Untitled item');
}

function cleanExtractedItemName(value) {
  return String(value || '')
    .replace(/\s+[|]\s+(?:buy|shop|wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|amazon(?:\.com)?).*$/i, '')
    .replace(/\s+-\s+(?:wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|amazon(?:\.com)?).*$/i, '')
    .replace(/\s+-\s+(buy|shop).*/i, '')
    .replace(/^\s*see\s+more\s+by\s+[^|]+$/i, '')
    .replace(/^\s*by\s+[^|]+$/i, '')
    .replace(/^\s*amazon(?:\.com)?\s*:\s*/i, '')
    .replace(/\s*:\s*(?:toys?\s*&\s*games?|home\s*&\s*kitchen|sports?\s*&\s*outdoors?)\s*$/i, '')
    .replace(/^(all\s*modern|allmodern|wayfair|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|amazon(?:\.com)?)\b[\s,:-]*/i, '')
    .replace(/^\s*by\s+[a-z0-9&' -]+\s*[:|-]\s*/i, '')
    .replace(/\b[a-z]{0,3}\d{5,}\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitToSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function truncateItemName(text, maxChars = ITEM_NAME_MAX_LENGTH) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(' ');
  const clipped = lastSpace > Math.floor(maxChars * 0.65) ? sliced.slice(0, lastSpace) : sliced;
  return `${clipped.trim()}...`;
}

function truncateAtWordBoundary(text, maxChars = 500) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxChars) return normalized;
  const sliceLimit = Math.max(maxChars - 3, 1);
  const sliced = normalized.slice(0, sliceLimit);
  const lastSpace = sliced.lastIndexOf(' ');
  const clipped = lastSpace > Math.floor(sliceLimit * 0.65) ? sliced.slice(0, lastSpace) : sliced;
  return `${clipped.trim()}...`;
}

function tokenizeForSimilarity(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  );
}

function isMostlyItemTitleText(text, name) {
  const left = tokenizeForSimilarity(text);
  const right = tokenizeForSimilarity(name);
  if (left.size < 4 || right.size < 4) return false;
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }
  const ratio = overlap / Math.max(1, Math.min(left.size, right.size));
  return ratio >= 0.75 && left.size <= right.size + 5;
}

function cleanDescriptionForOverview(text, name = '') {
  let clean = decodeHtmlEntities(String(text || '')).replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  clean = clean
    .replace(/^\s*(?:amazon(?:\.com)?|wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|target|walmart)\s*:\s*/i, '')
    .replace(/\s*:\s*(?:toys?\s*&\s*games?|home\s*&\s*kitchen|sports?\s*&\s*outdoors?|patio,\s*lawn\s*&\s*garden|beauty\s*&\s*personal\s*care|electronics?)\s*$/i, '')
    .trim();
  if (isMostlyItemTitleText(clean, name)) return '';
  if (
    /^(?:amazon(?:\.com)?|wayfair|allmodern|perigold|target|walmart)\b/i.test(clean) &&
    clean.length < 220 &&
    !/[.!?]/.test(clean)
  ) {
    return '';
  }
  return clean;
}

function isLikelyNoisyDetailTitle(title) {
  const value = String(title || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!value) return true;
  if (value.length < 3) return true;
  const exactNoise = new Set([
    'skip to',
    'keyboard shortcuts',
    'image unavailable',
    'purchase options and add-ons',
    'sorry, there was a problem.',
    'sorry there was a problem',
    'related products',
    'sponsored products related to this item',
    'products related to this item',
    'compare with similar items',
    'videos for this product',
    'looking for specific info?',
    'looking for specific info',
    'customer ratings by feature'
  ]);
  if (exactNoise.has(value)) return true;
  return /\b(skip to|keyboard shortcuts|sponsored|sign in|customer reviews?|add to list|add to cart|purchase options|related products|frequently bought together|report an issue|top reviews?|sorry, there was a problem|image unavailable)\b/i.test(value);
}

function isLikelyNoisyDetailLine(line) {
  const value = String(line || '').replace(/\s+/g, ' ').trim();
  if (!value) return true;
  if (value.length <= 2) return true;
  if (/^(show|hide|learn more|see more|see less|next|previous)$/i.test(value)) return true;
  return /(sign in|captcha|sponsored|customer review|add to cart|eligible for return|ships from|sold by|report an issue)/i.test(value);
}

function extractQuantityHint(text) {
  const value = String(text || '');
  const rules = [
    { pattern: /\bset of\s*(\d+)\b/i, map: (m) => `Set of ${m[1]}` },
    { pattern: /\bpack of\s*(\d+)\b/i, map: (m) => `Pack of ${m[1]}` },
    { pattern: /\b(\d+)\s*[- ]?(?:piece|pc)\b/i, map: (m) => `${m[1]}-piece` },
    { pattern: /\b(\d+)\s*count\b/i, map: (m) => `${m[1]} count` }
  ];
  for (const rule of rules) {
    const match = value.match(rule.pattern);
    if (match) return rule.map(match);
  }
  return '';
}

function extractAgeRangeHint(text) {
  const value = String(text || '');
  const range = value.match(/\bages?\s*(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\b/i) || value.match(/\b(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*(?:years?|yrs?)\b/i);
  if (range) return `Ages ${range[1]}-${range[2]}`;
  const plus = value.match(/\bages?\s*(\d{1,2})\s*\+\b/i) || value.match(/\b(\d{1,2})\s*\+\s*(?:years?|yrs?)\b/i);
  if (plus) return `Ages ${plus[1]}+`;
  const spaced = value.match(/\bfor\s+((?:\d{1,2}\s+){2,6})year old\b/i);
  if (spaced?.[1]) {
    const numbers = spaced[1].trim().split(/\s+/).map((n) => Number(n)).filter((n) => Number.isFinite(n));
    if (numbers.length) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      if (min === max) return `Ages ${min}`;
      return `Ages ${min}-${max}`;
    }
  }
  return '';
}

function extractIncludedItemsHint(text, specs = []) {
  const search = `${String(text || '')} ${Array.isArray(specs) ? specs.join(' ') : ''}`.replace(/\s+/g, ' ').trim();
  if (!search) return '';
  const match = search.match(/\b(?:includes?|comes with|in the box|package includes?)\s*[:\-]?\s*([^.!?;]{8,130})/i);
  if (!match?.[1]) return '';
  return match[1].replace(/\s+/g, ' ').trim();
}

function extractColorHint(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  const explicit = value.match(/\bcolou?r\s*[:\-]?\s*([a-z][a-z0-9\s/-]{1,28})(?:[,.;]|$)/i);
  if (explicit?.[1]) {
    return toTitleCase(explicit[1].trim().replace(/\s+/g, ' '));
  }
  const palette = [
    'black', 'white', 'gray', 'grey', 'silver', 'gold', 'bronze', 'beige', 'brown',
    'tan', 'cream', 'blue', 'navy', 'green', 'olive', 'red', 'burgundy', 'orange',
    'yellow', 'purple', 'pink', 'teal', 'charcoal'
  ];
  for (const color of palette) {
    const pattern = new RegExp(`\\b${color}\\b`, 'i');
    if (pattern.test(value)) return toTitleCase(color);
  }
  return '';
}

function extractUseCaseHints(text) {
  const value = String(text || '').toLowerCase();
  const rules = [
    [/\boutdoor\b|\bpatio\b/, 'outdoor spaces'],
    [/\bindoor\b/, 'indoor spaces'],
    [/\bkitchen\b/, 'kitchen'],
    [/\bbath(?:room)?\b/, 'bathroom'],
    [/\bdining\b/, 'dining area'],
    [/\bliving room\b/, 'living room'],
    [/\bbedroom\b/, 'bedroom'],
    [/\boffice\b/, 'office']
  ];
  const out = [];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) out.push(label);
    if (out.length >= 3) break;
  }
  return out;
}

function extractFeatureHints(text) {
  const value = String(text || '');
  const rules = [
    [/\bwaterproof\b|\bwater-resistant\b/i, 'water-resistant'],
    [/\bweather[- ]?resistant\b/i, 'weather-resistant'],
    [/\brust[- ]?resistant\b/i, 'rust-resistant'],
    [/\badjustable\b/i, 'adjustable'],
    [/\bfold(?:ing|able)?\b/i, 'foldable'],
    [/\bnon[- ]?slip\b/i, 'non-slip'],
    [/\bmachine washable\b/i, 'machine washable'],
    [/\bdishwasher safe\b/i, 'dishwasher safe'],
    [/\bcordless\b/i, 'cordless'],
    [/\bheavy[- ]?duty\b/i, 'heavy-duty']
  ];
  const out = [];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) out.push(label);
    if (out.length >= 3) break;
  }
  return out;
}

function pickSizeOrDimensionHint(product) {
  const dimensions = Array.isArray(product?.dimensions) ? product.dimensions : [];
  const specs = Array.isArray(product?.specs) ? product.specs : [];
  for (const line of dimensions) {
    const clean = String(line || '').trim();
    if (clean) return clean;
  }
  for (const line of specs) {
    const clean = String(line || '').replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    if (/(?:\d+\s*(?:\"|in|inch|inches|cm|mm|ft|oz|lb|lbs|kg|qt|gal)\b|dimension|length|width|height|depth|capacity|weight)/i.test(clean)) {
      return clean;
    }
  }
  return '';
}

function stripLeadingName(text, name) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const itemName = String(name || '').replace(/\s+/g, ' ').trim();
  if (!source || !itemName) return source;
  const escaped = itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const noLead = source
    .replace(new RegExp(`^${escaped}\\s*[:\\-–—]\\s*`, 'i'), '')
    .replace(new RegExp(`^${escaped}\\s+`, 'i'), '')
    .trim();
  return noLead || source;
}

function normalizeOverviewBullets(list, limit = 6) {
  const out = [];
  const seen = new Set();
  for (const entry of Array.isArray(list) ? list : []) {
    const text = String(entry || '').replace(/^[•\-\s]+/, '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function hasStructuredDetailSections(sections) {
  if (!Array.isArray(sections) || !sections.length) return false;
  let score = 0;
  const informativeTitle = /(overview|about this item|product (?:details|information)|technical details|specifications?|dimensions?|materials?|features?|description)/i;
  for (const section of sections) {
    const title = String(section?.title || '').trim();
    if (!title || isLikelyNoisyDetailTitle(title)) continue;
    const lines = normalizeDetailList(section?.lines || []);
    if (!lines.length) continue;
    score += informativeTitle.test(title) ? 2 : 1;
    if (lines.length >= 2) score += 1;
    if (lines.some((line) => /[:x×]|(?:inch|inches|cm|mm|material|color|model|weight|capacity)/i.test(line))) {
      score += 1;
    }
    if (score >= 3) return true;
  }
  return false;
}

function buildProductOverview(product, maxChars = 500) {
  const name = String(product?.name || '').replace(/\s+/g, ' ').trim();
  const description = cleanDescriptionForOverview(product?.description || '', name);
  const specs = Array.isArray(product?.specs) ? product.specs : [];
  const materials = Array.isArray(product?.materials) ? product.materials : [];
  const highlights = Array.isArray(product?.highlights) ? product.highlights : [];
  const combined = [description, ...specs, ...materials, ...highlights, name].join(' ');

  let text = composeOverviewParagraph({
    name,
    description,
    specs,
    highlights,
    maxChars: Math.min(maxChars, 300)
  });
  text = truncateAtWordBoundary(text, Math.min(maxChars, 300));

  const bullets = [];
  const addBullet = (label, value) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const line = `${label}: ${clean}`;
    if (bullets.some((entry) => entry.toLowerCase() === line.toLowerCase())) return;
    bullets.push(line);
  };

  const quantity = extractQuantityHint(combined);
  addBullet('Quantity', quantity);

  const sizeHint = pickSizeOrDimensionHint(product);
  addBullet(/x|×|dimension|length|width|height|depth/i.test(sizeHint) ? 'Dimensions' : 'Size', sizeHint);

  const color = extractColorHint([description, ...specs].join(' '));
  addBullet('Color', color);

  const ageRange = extractAgeRangeHint(combined);
  addBullet('Age range', ageRange);

  addBullet('Material', materials.slice(0, 2).join(', '));
  addBullet('Includes', extractIncludedItemsHint(`${description} ${highlights.join(' ')}`, specs));

  const uses = extractUseCaseHints(combined);
  addBullet('Best for', uses.join(', '));

  const features = extractFeatureHints([description, ...specs, ...highlights].join(' '));
  addBullet('Features', features.join(', '));

  if (!bullets.length) {
    for (const spec of specs) {
      const line = String(spec || '').replace(/\s+/g, ' ').trim();
      if (!/^[a-z][a-z0-9\s/&()+.-]{2,24}:\s+.+/i.test(line)) continue;
      if (bullets.some((entry) => entry.toLowerCase() === line.toLowerCase())) continue;
      bullets.push(line);
      if (bullets.length >= 3) break;
    }
  }

  const normalizedBullets = normalizeOverviewBullets(bullets, 6);
  const clippedBullets = [];
  let used = text.length;
  for (const line of normalizedBullets) {
    const extra = line.length + (used > 0 ? 1 : 0);
    if (used + extra > maxChars) break;
    clippedBullets.push(line);
    used += extra;
  }

  return { text, bullets: clippedBullets };
}

function toTitleCase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectShortFeatureTags(text) {
  const value = String(text || '');
  const matches = [];
  const rules = [
    [/\bair fry\b/i, 'Air Fry'],
    [/\bconvection\b/i, 'Convection Oven'],
    [/\bself[- ]?clean\b/i, 'Self Clean'],
    [/\bsteam\b/i, 'Steam'],
    [/\bsmart\b|\bwifi\b/i, 'Smart'],
    [/\benergy star\b/i, 'Energy Star'],
    [/\bstainless\b/i, 'Stainless Steel'],
    [/\bfrench door\b/i, 'French Door'],
    [/\bdouble oven\b/i, 'Double Oven'],
    [/\bsingle wall oven\b|\bwall oven\b/i, 'Wall Oven'],
    [/\binduction\b/i, 'Induction'],
    [/\bcounter[- ]?depth\b/i, 'Counter Depth'],
    [/\bside[- ]by[- ]side\b/i, 'Side By Side'],
    [/\btop freezer\b/i, 'Top Freezer'],
    [/\bbottom freezer\b/i, 'Bottom Freezer'],
    [/\bquiet\b/i, 'Quiet Operation'],
    [/\bumbrella hole\b|\bhas umbrella\b|\bparasol hole\b/i, 'Umbrella Hole'],
    [/\beucalyptus\b/i, 'Eucalyptus Wood']
  ];

  for (const [pattern, label] of rules) {
    if (pattern.test(value)) matches.push(label);
  }

  const directionalDimensions = value.match(/(\d{2,3}(?:\.\d+)?)\s*(?:\"|in|inch|inches)\s*(l|w|h|d|length|width|height|depth)\b/gi) || [];
  for (const raw of directionalDimensions) {
    const m = raw.match(/(\d{2,3}(?:\.\d+)?)\s*(?:\"|in|inch|inches)\s*(l|w|h|d|length|width|height|depth)\b/i);
    if (!m) continue;
    const number = m[1];
    const axisMap = {
      l: 'L',
      length: 'L',
      w: 'W',
      width: 'W',
      h: 'H',
      height: 'H',
      d: 'D',
      depth: 'D'
    };
    const axis = axisMap[m[2].toLowerCase()] || '';
    if (axis) matches.push(`${number}in ${axis}`);
  }

  const cuFtMatches = value.match(/\b(\d+(?:\.\d+)?)\s*(cu\.?\s*ft|cubic feet)\b/gi) || [];
  for (const raw of cuFtMatches) {
    const m = raw.match(/(\d+(?:\.\d+)?)/);
    if (m) matches.push(`${m[1]} Cu Ft`);
  }

  if (/\boutdoor\b/i.test(value)) matches.push('Outdoor');
  if (/\bindoor\b/i.test(value)) matches.push('Indoor');
  if (/\bround\b/i.test(value)) matches.push('Round');
  if (/\brectangular?\b/i.test(value)) matches.push('Rectangular');
  if (/\bextendable|expandable\b/i.test(value)) matches.push('Extendable');
  if (/\bsolid wood|oak|walnut|teak|acacia|mango wood\b/i.test(value)) matches.push('Wood');
  if (/\bmetal|steel|aluminum\b/i.test(value)) matches.push('Metal');

  const seatsMatch = value.match(/\bseats?\s*(\d+)/i);
  if (seatsMatch) matches.push(`Seats ${seatsMatch[1]}`);

  return matches;
}

function specToText(spec) {
  if (typeof spec === 'string') return spec;
  if (!spec || typeof spec !== 'object') return '';
  const name = spec.name || spec.key || spec.label || '';
  const value =
    spec.value ||
    spec.text ||
    spec.description ||
    spec.content ||
    (Array.isArray(spec.values) ? spec.values.join(' ') : '') ||
    '';
  return `${name} ${value}`.trim();
}

function normalizeDetailList(list, limit = 8) {
  const out = [];
  const seen = new Set();
  for (const entry of Array.isArray(list) ? list : []) {
    const text = String(entry || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function collectDimensionsFromText(text) {
  const value = String(text || '');
  const out = [];
  const triples = value.match(/\b\d{1,3}(?:\.\d+)?\s*(?:\"|in|inch|inches|cm|mm)\s*[x×]\s*\d{1,3}(?:\.\d+)?\s*(?:\"|in|inch|inches|cm|mm)(?:\s*[x×]\s*\d{1,3}(?:\.\d+)?\s*(?:\"|in|inch|inches|cm|mm))?/gi) || [];
  out.push(...triples);
  const axis = value.match(/\b(?:length|width|height|depth|diameter)\s*[:\-]?\s*\d{1,3}(?:\.\d+)?\s*(?:\"|in|inch|inches|cm|mm)\b/gi) || [];
  out.push(...axis);
  return normalizeDetailList(out, 8);
}

function collectMaterialsFromText(text) {
  const value = String(text || '').toLowerCase();
  const map = [
    ['stainless steel', 'Stainless Steel'],
    ['aluminum', 'Aluminum'],
    ['steel', 'Steel'],
    ['teak', 'Teak'],
    ['eucalyptus', 'Eucalyptus'],
    ['acacia', 'Acacia'],
    ['oak', 'Oak'],
    ['walnut', 'Walnut'],
    ['wood', 'Wood'],
    ['glass', 'Glass'],
    ['marble', 'Marble'],
    ['ceramic', 'Ceramic'],
    ['porcelain', 'Porcelain'],
    ['leather', 'Leather'],
    ['linen', 'Linen'],
    ['cotton', 'Cotton'],
    ['polyester', 'Polyester'],
    ['plastic', 'Plastic'],
    ['resin', 'Resin']
  ];
  const out = [];
  for (const [token, label] of map) {
    if (value.includes(token)) out.push(label);
  }
  return normalizeDetailList(out, 8);
}

function collectSpecsFromHtml(html) {
  const out = [];
  const rowRegex = /<tr[^>]*>\s*<t[hd][^>]*>([\s\S]*?)<\/t[hd]>\s*<t[hd][^>]*>([\s\S]*?)<\/t[hd]>\s*<\/tr>/gi;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const key = decodeHtmlEntities(stripTags(match[1]));
    const value = decodeHtmlEntities(stripTags(match[2]));
    if (key && value) out.push(`${key}: ${value}`);
    if (out.length >= 16) break;
  }
  const bulletRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((match = bulletRegex.exec(html)) !== null) {
    const text = decodeHtmlEntities(stripTags(match[1]));
    if (!text) continue;
    if (text.length < 12) continue;
    if (/(shipping|returns|warranty|customer reviews|faq|financing|afterpay|klarna|affirm|add to cart|get it by|free fast delivery|professional installation|see details|sold in|reviews?\b|rating\b)/i.test(text)) continue;
    if (/(?:US\$|CA\$|C\$|AU\$|A\$|\$|£|€)\s*[0-9]/.test(text)) continue;
    const isStructured = /(inch|inches|cm|mm|material|finish|weight|capacity|depth|width|height|dimension)/i.test(text);
    const isNarrative = text.length >= 35 &&
      /(includes?|comes with|designed|portable|safe|non-toxic|ideal|perfect|gift|kids|children|easy|durable|feature|great for|screen[- ]?free|assembly|storage)/i.test(text);
    if (isStructured || isNarrative) {
      out.push(text);
    }
    if (out.length >= 20) break;
  }
  return normalizeDetailList(out, 12);
}

function pickNarrativeSpecLines(specs = [], limit = 3) {
  const out = [];
  for (const raw of Array.isArray(specs) ? specs : []) {
    const line = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!line) continue;
    if (line.length < 35 || line.length > 420) continue;
    if (/^(dimensions?|size|color|material|weight|capacity)\s*:/i.test(line)) continue;
    if (/(shipping|returns|warranty|customer reviews|sponsored|compare with|report an issue|sign in)/i.test(line)) continue;
    out.push(line);
    if (out.length >= limit) break;
  }
  return out;
}

function composeOverviewParagraph({ name = '', description = '', specs = [], highlights = [], maxChars = 300 }) {
  const seen = new Set();
  const candidates = [];
  const pushCandidate = (value) => {
    const clean = cleanDescriptionForOverview(String(value || '').replace(/^[•\-\s]+/, '').trim(), name);
    if (!clean) return;
    if (clean.length < 28) return;
    if (/(shipping|returns|warranty|customer reviews|sponsored|compare with|report an issue|sign in)/i.test(clean)) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(clean);
  };

  for (const sentence of splitToSentences(description)) {
    pushCandidate(sentence);
  }
  for (const line of pickNarrativeSpecLines(specs, 4)) {
    for (const sentence of splitToSentences(line)) {
      pushCandidate(sentence);
    }
  }

  let text = '';
  for (const candidate of candidates) {
    const next = text ? `${text} ${candidate}` : candidate;
    if (next.length > 250 && text) break;
    text = next;
    if (text.length >= 140) break;
  }

  if (!text && description) {
    text = cleanDescriptionForOverview(description, name);
  }
  if (!text && specs.length) {
    text = pickNarrativeSpecLines(specs, 1)[0] || String(specs[0] || '');
  }

  if (text.length < 90) {
    const featureTerms = normalizeDetailList(highlights, 3);
    if (featureTerms.length) {
      const prefix = text ? `${text}${/[.!?]$/.test(text) ? '' : '.'} ` : '';
      text = `${prefix}Notable features include ${featureTerms.join(', ')}.`;
    }
  }

  text = cleanDescriptionForOverview(text, name);
  if (text && !/[.!?]$/.test(text)) text = `${text}.`;
  return truncateAtWordBoundary(text, maxChars);
}

function collectSectionLines(htmlSegment) {
  const lines = [];
  if (!htmlSegment) return lines;
  let match;
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((match = liRegex.exec(htmlSegment)) !== null) {
    const text = decodeHtmlEntities(stripTags(match[1]));
    if (text) lines.push(text);
  }
  if (lines.length) return normalizeDetailList(lines, 12);

  const paraRegex = /<(p|div)[^>]*>([\s\S]*?)<\/\1>/gi;
  while ((match = paraRegex.exec(htmlSegment)) !== null) {
    const text = decodeHtmlEntities(stripTags(match[2]));
    if (text) lines.push(text);
  }
  if (lines.length) return normalizeDetailList(lines, 6);

  const raw = decodeHtmlEntities(stripTags(htmlSegment));
  if (!raw) return lines;
  const sentences = splitToSentences(raw);
  return normalizeDetailList(sentences, 6);
}

function collectDetailSectionsFromHtml(html) {
  if (!html) return [];
  const sanitized = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const headingRegex = /<(h[2-4])[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(sanitized)) !== null) {
    const title = decodeHtmlEntities(stripTags(match[2]));
    if (!title) continue;
    headings.push({
      title: title.trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }
  if (!headings.length) return [];

  const sections = [];
  const skipKeywords = /(return|shipping|warranty|faq|policy)/i;
  for (let i = 0; i < headings.length; i += 1) {
    const current = headings[i];
    const nextStart = i + 1 < headings.length ? headings[i + 1].start : sanitized.length;
    const content = sanitized.slice(current.end, nextStart);
    const title = current.title.trim();
    if (!title || skipKeywords.test(title) || isLikelyNoisyDetailTitle(title)) continue;
    const lines = collectSectionLines(content).filter((line) => !isLikelyNoisyDetailLine(line));
    if (!lines.length) continue;
    sections.push({ title, lines });
    if (sections.length >= 6) break;
  }
  return sections;
}

function normalizeDetailSections(sections) {
  const normalized = [];
  const seen = new Set();
  for (const section of Array.isArray(sections) ? sections : []) {
    const title = String(section?.title || '').trim();
    if (!title || isLikelyNoisyDetailTitle(title)) continue;
    const lines = normalizeDetailList(section.lines || section.entries || []).filter((line) => !isLikelyNoisyDetailLine(line));
    if (!lines.length) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ title, lines });
    if (normalized.length >= 8) break;
  }
  return normalized;
}

function generateHighlights({ name, descriptionText, specs = [], categoryHint = '' }) {
  const searchSpace = [
    name || '',
    descriptionText || '',
    ...specs.map(specToText),
    categoryHint || ''
  ].join(' ');

  const rawTags = collectShortFeatureTags(searchSpace);
  const seen = new Set();
  const tags = [];
  for (const tag of rawTags) {
    const clean = toTitleCase(tag).trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(clean);
  }

  const isSimple = /\b(mug|cup|plate|bowl|spoon|fork|towel|pillow)\b/i.test(`${name} ${categoryHint}`);
  const isComplex = /\b(oven|fridge|refrigerator|dishwasher|range|microwave|car|washer|dryer)\b/i.test(`${name} ${categoryHint}`);

  if (!tags.length) {
    const itemType = detectItemType(searchSpace);
    if (itemType) tags.push(itemType);
  }

  if (isSimple) return tags.slice(0, 1);
  if (isComplex) return tags.slice(0, 4);
  const output = tags.slice(0, 3);
  if (!output.length) {
    const itemType = detectItemType(searchSpace);
    if (itemType && !isSimple) return [itemType];
  }
  return output;
}

function mergeProducts(base, candidate, sourceUrl = '') {
  const merged = { ...base };
  if (!candidate) return merged;
  if (isIkeaUrl(sourceUrl) && !isWeakName(merged.name) && !isIkeaCandidateRelevant(sourceUrl, candidate)) {
    return merged;
  }

  const mergedImages = dedupeImageUrls(
    [
      ...(Array.isArray(merged.images) ? merged.images : []),
      ...(Array.isArray(candidate.images) ? candidate.images : []),
      merged.image,
      candidate.image
    ],
    30
  );
  merged.images = mergedImages;

  const currentImageScore = looksLikeProductImage(merged.image) ? estimateImageQualityScore(merged.image) : Number.NEGATIVE_INFINITY;
  const candidateImageScore = looksLikeProductImage(candidate.image) ? estimateImageQualityScore(candidate.image) : Number.NEGATIVE_INFINITY;
  if (candidateImageScore > currentImageScore + 20_000) {
    merged.image = candidate.image;
  }
  const mergedImageKey = canonicalImageKey(merged.image);
  const hasMergedImageInList = mergedImageKey
    ? mergedImages.some((src) => canonicalImageKey(src) === mergedImageKey)
    : false;
  if ((!merged.image || !looksLikeProductImage(merged.image) || !hasMergedImageInList) && mergedImages.length) {
    merged.image = mergedImages[0];
  }
  const mergedPrice = normalizePrice(merged.price);
  const candidatePrice = normalizePrice(candidate.price);
  if (!mergedPrice && candidatePrice) {
    merged.price = candidatePrice;
  } else if (mergedPrice) {
    merged.price = mergedPrice;
  }
  if (isWeakName(merged.name) && candidate.name) {
    merged.name = candidate.name;
  }
  if ((!merged.productTitleRaw || isWeakName(merged.productTitleRaw)) && candidate.productTitleRaw) {
    merged.productTitleRaw = candidate.productTitleRaw;
  }
  if ((!merged.brand || !normalizeBrand(merged.brand)) && candidate.brand) {
    merged.brand = candidate.brand;
  }
  if (!merged.brandRaw && candidate.brandRaw) {
    merged.brandRaw = candidate.brandRaw;
  }
  const mergedBrandConfidence = clampConfidence(merged.brandConfidence);
  const candidateBrandConfidence = clampConfidence(candidate.brandConfidence);
  if (candidateBrandConfidence > mergedBrandConfidence) {
    merged.brandConfidence = candidateBrandConfidence;
    if (candidate.brand) merged.brand = candidate.brand;
    if (candidate.brandRaw) merged.brandRaw = candidate.brandRaw;
    if (candidate.brandSource) merged.brandSource = candidate.brandSource;
  } else if (!merged.brandSource && candidate.brandSource) {
    merged.brandSource = candidate.brandSource;
  }
  if ((!merged.seller || merged.seller === 'unknown') && candidate.seller) {
    merged.seller = candidate.seller;
  }
  if ((!Array.isArray(merged.highlights) || !merged.highlights.length) && Array.isArray(candidate.highlights)) {
    merged.highlights = candidate.highlights;
  }
  if (!merged.description && candidate.description) {
    merged.description = candidate.description;
  }
  merged.dimensions = normalizeDetailList([...(merged.dimensions || []), ...(candidate.dimensions || [])], 8);
  merged.materials = normalizeDetailList([...(merged.materials || []), ...(candidate.materials || [])], 8);
  merged.specs = normalizeDetailList([...(merged.specs || []), ...(candidate.specs || [])], 12);
  if ((!merged.detailSections || !merged.detailSections.length) && Array.isArray(candidate.detailSections) && candidate.detailSections.length) {
    merged.detailSections = candidate.detailSections;
  }

  return merged;
}

function needsEnrichment(product) {
  return !product?.image || !product?.price || isWeakName(product?.name);
}

function sanitizeProduct(product, sourceUrl) {
  const sanitized = { ...product };
  const dedupedImageList = dedupeImageUrls(
    [
      ...(Array.isArray(sanitized.images) ? sanitized.images : []),
      sanitized.image
    ],
    30
  );
  const imageList = isIkeaUrl(sourceUrl)
    ? dedupeImageUrls(filterIkeaProductImages(sourceUrl, dedupedImageList), 30)
    : dedupedImageList;
  sanitized.images = imageList;
  const sanitizedImageKey = canonicalImageKey(sanitized.image);
  const matchedFeatured = sanitizedImageKey
    ? imageList.find((src) => canonicalImageKey(src) === sanitizedImageKey)
    : '';
  sanitized.image = matchedFeatured || imageList[0] || '';
  sanitized.price = normalizePrice(sanitized.price);

  if (isWeakName(sanitized.name)) {
    sanitized.name = buildItemName(titleFromUrl(sourceUrl), sourceUrl);
  }
  if (!sanitized.seller) {
    sanitized.seller = new URL(sourceUrl).hostname.replace(/^www\./, '');
  }
  sanitized.productTitleRaw = normalizeTitle(sanitized.productTitleRaw || sanitized.name || titleFromUrl(sourceUrl));
  sanitized.brandRaw = normalizeBrand(sanitized.brandRaw || sanitized.brand || '');
  sanitized.brand = normalizeBrand(sanitized.brand || sanitized.brandRaw || '');
  sanitized.brandSource = String(sanitized.brandSource || (sanitized.brand ? 'unknown' : '')).trim() || 'unknown';
  sanitized.brandConfidence = resolveBrandConfidence({
    explicitConfidence: sanitized.brandConfidence,
    brandSource: sanitized.brandSource,
    brand: sanitized.brand,
    sellerName: sanitized.seller,
    productTitle: sanitized.productTitleRaw || sanitized.name
  });
  sanitized.name = buildItemName(sanitized.productTitleRaw || sanitized.name, sourceUrl);
  if (!Array.isArray(sanitized.highlights)) sanitized.highlights = [];
  if (!sanitized.highlights.length) {
    sanitized.highlights = generateHighlights({
      name: sanitized.name,
      descriptionText: sourceUrl
    });
  }
  sanitized.description = cleanDescriptionForOverview(sanitized.description || '', sanitized.name);
  if (sanitized.description.length > 420) {
    sanitized.description = `${sanitized.description.slice(0, 417)}...`;
  }
  sanitized.dimensions = normalizeDetailList(sanitized.dimensions || [], 8);
  sanitized.materials = normalizeDetailList(sanitized.materials || [], 8);
  sanitized.specs = normalizeDetailList(sanitized.specs || [], 12);

  const detailsSpace = [
    sanitized.description,
    ...(sanitized.specs || [])
  ].join(' ');
  if (!sanitized.dimensions.length) {
    sanitized.dimensions = collectDimensionsFromText(detailsSpace);
  }
  if (!sanitized.materials.length) {
    sanitized.materials = collectMaterialsFromText(detailsSpace);
  }
  sanitized.detailSections = normalizeDetailSections(sanitized.detailSections || []);
  const overview = buildProductOverview(sanitized, 500);
  sanitized.overview = overview.text;
  sanitized.overviewBullets = overview.bullets;
  sanitized.aiOverview = overview.text;
  if (isAmazonUrl(sourceUrl) && !hasStructuredDetailSections(sanitized.detailSections)) {
    const lines = [
      sanitized.overview,
      ...(sanitized.overviewBullets || []).map((line) => `• ${line}`)
    ].filter(Boolean);
    if (lines.length) {
      sanitized.detailSections = [{ title: 'Overview', lines }];
      if (!sanitized.description && sanitized.overview) {
        sanitized.description = sanitized.overview;
      }
    }
  }

  return sanitized;
}

async function fetchPage(targetUrl) {
  const response = await fetch(targetUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml'
    }
  });
  return response;
}

async function extractFromHtml(finalUrl, html) {
  const meta = parseMetaTags(html);
  const primaryHeading = parsePrimaryHeading(html, { sourceUrl: finalUrl });
  const pageTitle = parseTitle(html);
  const jsonLd = parseJsonLd(html, {
    sourceUrl: finalUrl,
    primaryHeading,
    pageTitle
  });
  const host = new URL(finalUrl).hostname.replace(/^www\./, '');
  const seller = host;
  const titleSelection = extractProductTitle(html, jsonLd, meta, { sourceUrl: finalUrl });
  const productTitleRaw = titleSelection.productTitleRaw;
  const productTitle = titleSelection.productTitle;
  const brandSelection = extractBrand(html, jsonLd, meta, {
    sellerName: seller,
    productTitle
  });
  const brandRaw = brandSelection.brandRaw;
  const brand = brandSelection.brand;
  const brandSource = brandSelection.source;
  const brandConfidence = resolveBrandConfidence({
    explicitConfidence: brandSelection.confidence,
    brandSource,
    brand,
    sellerName: seller,
    productTitle
  });
  const extractedName = generateUniversalItemName({
    productTitleRaw,
    name: productTitle,
    brand,
    brandRaw,
    brandSource,
    brandConfidence,
    seller
  }, finalUrl);

  const candidateImage = jsonLd.image || meta['og:image'] || meta['twitter:image'] || '';
  const imageCandidateUrl = normalizeImageCandidateUrl(absoluteUrl(finalUrl, candidateImage));
  const image = looksLikeProductImage(imageCandidateUrl) ? imageCandidateUrl : '';
  const images = collectImageCandidatesFromHtml(finalUrl, html, meta, jsonLd);

  const description = jsonLd.description || meta.description || meta['og:description'] || meta['twitter:description'] || '';
  const specs = collectSpecsFromHtml(html);
  const dimensions = normalizeDetailList([
    ...(jsonLd.dimensions || []),
    ...collectDimensionsFromText(`${description} ${specs.join(' ')}`)
  ], 8);
  const materials = normalizeDetailList([
    ...(jsonLd.materials || []),
    ...collectMaterialsFromText(`${description} ${specs.join(' ')}`)
  ], 8);
  const detailSections = collectDetailSectionsFromHtml(html);
  const price = pickBestProductPrice({
    finalUrl,
    html,
    meta,
    jsonLd
  });

  const accessibleImage = await findAccessibleImage([image, ...images]);
  const featuredImages = pinPrimaryImage([accessibleImage, ...images], accessibleImage || images[0] || '');

  return {
    url: finalUrl,
    brand,
    brandRaw,
    brandSource,
    brandConfidence,
    productTitleRaw,
    name: extractedName,
    image: featuredImages[0] || '',
    images: featuredImages,
    seller,
    price,
    description,
    dimensions,
    materials,
    specs,
    detailSections,
    highlights: generateHighlights({
      name: productTitle || extractedName,
      descriptionText: [description, specs.join('. ')].filter(Boolean).join('. '),
      specs
    })
  };
}

async function extractViaMicrolink(targetUrl) {
  const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`;
  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new ExtractError(`Microlink fallback failed (status ${response.status})`, response.status);
  }

  const payload = safeJsonParse(await response.text(), {});
  const data = payload?.data || {};
  const blockedSignals = [data?.title, data?.description, data?.publisher].filter(Boolean).join(' ');
  if (isLikelyBlockedFallbackContent(blockedSignals)) {
    throw new ExtractError('Microlink returned blocked/invalid page content.', 422);
  }
  const finalUrl = data.url || targetUrl;
  const base = minimalFallbackFromUrl(finalUrl);
  const productTitleRaw = normalizeTitle(String(data.title || base.productTitleRaw || '').trim());
  const bhImageFallbacks = dedupeImageUrls(
    [
      ...extractBhPhotoImageCandidatesFromUrl(finalUrl),
      ...extractBhPhotoImageCandidatesFromUrl(targetUrl)
    ],
    6
  );
  const microlinkImage = looksLikeProductImage(data.image?.url)
    ? data.image?.url || ''
    : looksLikeProductImage(data.screenshot?.url)
      ? data.screenshot?.url || ''
      : bhImageFallbacks[0] || '';

  return {
    ...base,
    productTitleRaw,
    name: buildItemName(productTitleRaw || base.name, finalUrl),
    image: microlinkImage,
    images: dedupeImageUrls(
      [
        data.image?.url || '',
        data.screenshot?.url || '',
        ...bhImageFallbacks
      ],
      30
    ),
    seller: base.seller,
    price: normalizePrice(data.description || ''),
    description: String(data.description || '').trim(),
    dimensions: collectDimensionsFromText(data.description || ''),
    materials: collectMaterialsFromText(data.description || ''),
    specs: normalizeDetailList(splitToSentences(data.description || '').slice(0, 4), 4),
    highlights: generateHighlights({
      name: data.title || base.name,
      descriptionText: data.description || ''
    }),
    detailSections: []
  };
}

async function extractViaZyte(targetUrl) {
  if (!ZYTE_API_KEY) {
    throw new ExtractError('Zyte API key is not configured.', 401);
  }

  const auth = Buffer.from(`${ZYTE_API_KEY}:`).toString('base64');
  const response = await fetch('https://api.zyte.com/v1/extract', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      url: targetUrl,
      browserHtml: true,
      product: true,
      productOptions: {
        extractFrom: 'browserHtml'
      }
    })
  });

  if (!response.ok) {
    throw new ExtractError(`Zyte fallback failed (status ${response.status})`, response.status);
  }

  const payload = safeJsonParse(await response.text(), {});
  const product = payload?.product || {};
  const finalUrl = product.url || payload?.url || targetUrl;
  const base = minimalFallbackFromUrl(finalUrl);
  const browserHtml = typeof payload?.browserHtml === 'string' ? payload.browserHtml : '';
  const browserMeta = browserHtml ? parseMetaTags(browserHtml) : {};
  const browserPrimaryHeading = browserHtml ? parsePrimaryHeading(browserHtml, { sourceUrl: finalUrl }) : '';
  const browserPageTitle = browserHtml ? parseTitle(browserHtml) : '';
  const browserJsonLd = browserHtml
    ? parseJsonLd(browserHtml, {
      sourceUrl: finalUrl,
      primaryHeading: browserPrimaryHeading,
      pageTitle: browserPageTitle
    })
    : {};
  const browserTitleSelection = browserHtml
    ? extractProductTitle(browserHtml, browserJsonLd, browserMeta, { sourceUrl: finalUrl })
    : { productTitleRaw: '' };
  const browserBrandSelection = browserHtml
    ? extractBrand(browserHtml, browserJsonLd, browserMeta, {
      sellerName: base.seller,
      productTitle: browserTitleSelection.productTitleRaw || ''
    })
    : { brand: '', brandRaw: '', source: 'unknown', confidence: 0 };
  const browserImages = browserHtml
    ? collectImageCandidatesFromHtml(finalUrl, browserHtml, browserMeta, browserJsonLd)
    : [];
  const browserPrice = browserHtml
    ? pickBestProductPrice({
      finalUrl,
      html: browserHtml,
      meta: browserMeta,
      jsonLd: browserJsonLd
    })
    : '';

  const mainImage = product?.mainImage?.url;
  const imageFromArray = Array.isArray(product?.images) ? product.images[0]?.url : '';
  const imageCandidate = mainImage || imageFromArray || '';
  const images = Array.isArray(product?.images)
    ? product.images
      .map((entry) => entry?.url || '')
      .filter(Boolean)
    : [];
  const bhImageFallbacks = dedupeImageUrls(
    [
      ...extractBhPhotoImageCandidatesFromUrl(finalUrl),
      ...extractBhPhotoImageCandidatesFromUrl(targetUrl)
    ],
    6
  );
  const mergedImages = dedupeImageUrls([imageCandidate, ...images, ...browserImages, ...bhImageFallbacks], 30);

  const brand =
    product?.brand ||
    product?.brandName ||
    product?.manufacturer ||
    browserBrandSelection.brand ||
    '';
  const productTitleRaw = normalizeTitle(
    String(product?.name || browserTitleSelection.productTitleRaw || base.productTitleRaw || '').trim()
  );
  const normalizedBrand = normalizeBrand(typeof brand === 'string' ? brand : '');
  const brandSource = normalizedBrand ? 'json_ld' : 'unknown';
  const brandConfidence = resolveBrandConfidence({
    explicitConfidence: clampConfidence(
      normalizedBrand
        ? Math.max(
          BRAND_SOURCE_CONFIDENCE.json_ld,
          Number(browserBrandSelection?.confidence || 0)
        )
        : 0
    ),
    brandSource: normalizedBrand && browserBrandSelection?.source
      ? browserBrandSelection.source
      : brandSource,
    brand: normalizedBrand,
    sellerName: base.seller,
    productTitle: productTitleRaw
  });

  const priceRaw = product?.price || product?.regularPrice || '';
  const currency = product?.currencyRaw || product?.currency || '';
  const price = priceRaw
    ? `${currency ? `${currency} ` : ''}${priceRaw}`.trim()
    : browserPrice;

  const specTexts = [
    ...(Array.isArray(product?.specifications) ? product.specifications.map(specToText) : []),
    ...(Array.isArray(product?.features) ? product.features.map(specToText) : [])
  ];

  return {
    ...base,
    brand: normalizedBrand,
    brandRaw: normalizedBrand,
    brandSource,
    brandConfidence,
    productTitleRaw,
    name: buildItemName(productTitleRaw || base.name, finalUrl),
    image: looksLikeProductImage(imageCandidate)
      ? imageCandidate
      : (browserImages[0] || mergedImages[0] || ''),
    images: mergedImages,
    seller: base.seller,
    price,
    description: String(product?.description || '').replace(/\s+/g, ' ').trim(),
    dimensions: normalizeDetailList([
      ...collectDimensionsFromText(product?.description || ''),
      ...collectDimensionsFromText(specTexts.join(' '))
    ], 8),
    materials: normalizeDetailList([
      ...collectMaterialsFromText(product?.description || ''),
      ...collectMaterialsFromText(specTexts.join(' '))
    ], 8),
    specs: normalizeDetailList(specTexts, 12),
    highlights: generateHighlights({
      name: product?.name || base.name,
      descriptionText: product?.description || '',
      specs: product?.specifications || product?.features || [],
      categoryHint: product?.category || ''
    })
    ,
    detailSections: []
  };
}

async function extractViaJinaAi(targetUrl) {
  const mirrorUrl = `https://r.jina.ai/http://${targetUrl.replace(/^https?:\/\//, '')}`;
  const response = await fetch(mirrorUrl, {
    headers: { Accept: 'text/plain' }
  });

  if (!response.ok) {
    throw new ExtractError(`Jina mirror fallback failed (status ${response.status})`, response.status);
  }

  const text = await response.text();
  if (isLikelyBlockedFallbackContent(text)) {
    throw new ExtractError('Jina mirror returned blocked/invalid page content.', 422);
  }
  const base = minimalFallbackFromUrl(targetUrl);
  const bhImageFallbacks = extractBhPhotoImageCandidatesFromUrl(targetUrl);

  const titleMatch = text.match(/^Title:\s*(.+)$/im);
  const productTitleRaw = normalizeTitle(titleMatch ? titleMatch[1].trim() : base.productTitleRaw || '');
  const imageMatch = text.match(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/i);
  const allImageMatches = Array.from(text.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi)).map((m) => m[1]);

  return {
    ...base,
    productTitleRaw,
    name: buildItemName(productTitleRaw || base.name, targetUrl),
    image: imageMatch && looksLikeProductImage(imageMatch[1]) ? imageMatch[1] : (bhImageFallbacks[0] || ''),
    images: dedupeImageUrls([...allImageMatches, ...bhImageFallbacks], 30),
    price: extractPriceFromText(text),
    description: splitToSentences(text).slice(0, 3).join('. '),
    dimensions: collectDimensionsFromText(text),
    materials: collectMaterialsFromText(text),
    specs: normalizeDetailList(splitToSentences(text).filter((line) => /(?:inch|inches|cm|mm|material|capacity|weight|dimension|width|height|depth)/i.test(line)).slice(0, 10), 10),
    highlights: generateHighlights({
      name: productTitleRaw || base.name,
      descriptionText: text
    })
    ,
    detailSections: []
  };
}

async function enrichProductData(targetUrl, baseProduct) {
  let product = baseProduct;
  if (!needsEnrichment(product)) return product;

  if (isRetailerHighFidelityPreferred(targetUrl)) {
    let zyteError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const candidate = await extractViaZyte(targetUrl);
        product = mergeProducts(product, candidate, targetUrl);
        if (hasStrongRetailerResult(product) || !needsEnrichment(product)) {
          return product;
        }
      } catch (error) {
        zyteError = error;
      }
    }

    // If Zyte is temporarily degraded, fall back to secondary providers to keep partial results flowing.
    const secondaryFallbacks = [extractViaMicrolink, extractViaJinaAi];
    for (const fallback of secondaryFallbacks) {
      if (!needsEnrichment(product)) break;
      try {
        const candidate = await fallback(targetUrl);
        product = mergeProducts(product, candidate, targetUrl);
      } catch {
        // Ignore this fallback and continue.
      }
    }

    if (hasStrongRetailerResult(product)) return product;
    if (zyteError && shouldRejectSparseRetailerProduct(product, targetUrl)) {
      throw new ExtractError(
        `Enhanced extraction unavailable for this retailer right now (${zyteError.message}).`,
        422
      );
    }
    return product;
  }

  const fallbacks = [extractViaZyte, extractViaMicrolink, extractViaJinaAi];
  for (const fallback of fallbacks) {
    if (!needsEnrichment(product)) break;
    try {
      const candidate = await fallback(targetUrl);
      product = mergeProducts(product, candidate, targetUrl);
    } catch {
      // Ignore this fallback and continue to the next provider.
    }
  }

  return product;
}

async function extractProductData(targetUrl) {
  const response = await fetchPage(targetUrl);
  if (!response.ok) {
    throw new ExtractError(`Could not fetch URL (status ${response.status})`, response.status);
  }

  const finalUrl = response.url || targetUrl;
  const html = await response.text();
  if (isLikelyBotBlockPage(html)) {
    throw new ExtractError('Source page is blocked by anti-bot protection.', 403);
  }
  return extractFromHtml(finalUrl, html);
}

async function serveStatic(req, res) {
  const parsed = new URL(req.url || '/', 'http://localhost');
  const isShareRoute = /^\/share\/[^/]+\/?$/.test(parsed.pathname);
  const isBetaRoute = /^\/beta\/?$/.test(parsed.pathname);
  const rawPath = parsed.pathname === '/' || isShareRoute || isBetaRoute ? '/index.html' : parsed.pathname;
  const requestPath = decodeURIComponent(rawPath).replace(/^\/+/, '');
  const filePath = path.join(publicDir, requestPath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    const baseHeaders = {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'bytes'
    };
    const fileSize = stats.size;
    const rangeHeader = String(req.headers.range || '').trim();
    const rangeMatch = rangeHeader.match(/^bytes=(\d*)-(\d*)$/i);
    if (rangeMatch) {
      const startRaw = rangeMatch[1];
      const endRaw = rangeMatch[2];
      let start = startRaw ? Number.parseInt(startRaw, 10) : NaN;
      let end = endRaw ? Number.parseInt(endRaw, 10) : NaN;

      if (!startRaw) {
        const suffixLength = Number.parseInt(endRaw, 10);
        if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
          res.writeHead(416, {
            ...baseHeaders,
            'Content-Range': `bytes */${fileSize}`
          });
          res.end();
          return;
        }
        start = Math.max(fileSize - suffixLength, 0);
        end = Math.max(fileSize - 1, 0);
      } else {
        if (!Number.isInteger(start) || start < 0 || start >= fileSize) {
          res.writeHead(416, {
            ...baseHeaders,
            'Content-Range': `bytes */${fileSize}`
          });
          res.end();
          return;
        }
        if (!endRaw || !Number.isInteger(end) || end >= fileSize) {
          end = Math.max(fileSize - 1, 0);
        }
      }

      if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${fileSize}`
        });
        res.end();
        return;
      }

      res.writeHead(206, {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(end - start + 1)
      });
      if ((req.method || 'GET').toUpperCase() === 'HEAD') {
        res.end();
        return;
      }
      fsSync.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      ...baseHeaders,
      'Content-Length': String(fileSize)
    });
    if ((req.method || 'GET').toUpperCase() === 'HEAD') {
      res.end();
      return;
    }
    fsSync.createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function getScopeBoardIds(match) {
  const boardId = decodeURIComponent(match[1] || '').trim();
  return boardId ? { scopeType: 'board', scopeId: boardId } : null;
}

function createUniqueSlug(db, scopeType, scopeId, seedLabel, fallback = 'category') {
  const baseSeed = slugifyCategoryKey(seedLabel) || fallback;
  const exists = db.prepare(`
    SELECT 1
    FROM categories
    WHERE scope_type = ? AND scope_id = ? AND slug = ?
  `);
  let candidate = baseSeed;
  let suffix = 2;
  while (exists.get(scopeType, scopeId, candidate)) {
    candidate = `${baseSeed}_${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function listItemCustomValues(db, boardId, itemId = '') {
  const whereItem = itemId ? 'AND v.item_id = ?' : '';
  const stmt = db.prepare(`
    SELECT
      v.board_id,
      v.item_id,
      v.category_id,
      v.value_type,
      v.value_text,
      v.value_number,
      v.value_boolean,
      v.value_select,
      v.source,
      v.confidence,
      v.last_updated_at
    FROM item_custom_values v
    INNER JOIN categories c
      ON c.id = v.category_id
      AND c.scope_type = 'board'
      AND c.scope_id = v.board_id
    WHERE v.board_id = ?
    ${whereItem}
    ORDER BY v.last_updated_at DESC
  `);
  const rows = itemId ? stmt.all(boardId, itemId) : stmt.all(boardId);
  return rows.map((row) => ({
    boardId: row.board_id,
    itemId: row.item_id,
    categoryId: row.category_id,
    value: decodeStoredValue(row),
    source: row.source,
    confidence: Number.isFinite(Number(row.confidence)) ? Number(row.confidence) : null,
    lastUpdatedAt: row.last_updated_at
  }));
}

class DataError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'DataError';
    this.status = status;
  }
}

function normalizeIncomingValueEntries(values) {
  if (Array.isArray(values)) {
    return values.map((entry) => ({
      categoryId: String(entry?.categoryId || entry?.category_id || '').trim(),
      value: entry?.value,
      source: entry?.source,
      confidence: entry?.confidence
    }));
  }
  if (values && typeof values === 'object') {
    return Object.entries(values).map(([categoryId, entry]) => ({
      categoryId: String(categoryId || '').trim(),
      value: entry && typeof entry === 'object' ? entry.value : entry,
      source: entry && typeof entry === 'object' ? entry.source : 'user',
      confidence: entry && typeof entry === 'object' ? entry.confidence : null
    }));
  }
  return [];
}

function createBoardDataService(db) {
  return {
    getBoardCategories(boardId) {
      if (!boardId) throw new DataError('Invalid board id.', 400);
      return ensureDefaultCategories(db, 'board', boardId);
    },

    createBoardCategory(boardId, payload = {}) {
      if (!boardId) throw new DataError('Invalid board id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      const label = String(payload?.label || '').trim();
      if (!label) throw new DataError('Category label is required.', 400);
      const type = normalizeCategoryType(payload?.type);
      const allowedOptions = normalizeAllowedOptions(payload?.allowedOptions || payload?.allowed_options || []);
      if (type === 'select' && allowedOptions.length === 0) {
        throw new DataError('Select categories require allowedOptions.', 400);
      }
      const slug = createUniqueSlug(db, 'board', boardId, payload?.key || payload?.slug || label, 'category');
      const maxPositionRow = db.prepare(`
        SELECT COALESCE(MAX(position), -1) AS max_position
        FROM categories
        WHERE scope_type = 'board' AND scope_id = ?
      `).get(boardId);
      const nextPosition = Number(maxPositionRow?.max_position || -1) + 1;
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO categories (
          id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position, created_at, updated_at
        ) VALUES (?, 'board', ?, ?, ?, ?, ?, 0, 1, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      `).run(id, boardId, label, slug, type, JSON.stringify(allowedOptions), nextPosition);
      const created = db.prepare(`
        SELECT id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position, created_at, updated_at
        FROM categories
        WHERE id = ?
      `).get(id);
      return rowToCategory(created);
    },

    updateBoardCategory(boardId, categoryId, payload = {}) {
      if (!boardId || !categoryId) throw new DataError('Invalid category id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      const existing = db.prepare(`
        SELECT id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position
        FROM categories
        WHERE id = ? AND scope_type = 'board' AND scope_id = ?
      `).get(categoryId, boardId);
      if (!existing) throw new DataError('Category not found.', 404);
      const nextLabel = String(payload?.label ?? existing.label).trim();
      if (!nextLabel) throw new DataError('Category label is required.', 400);
      const requestedType = normalizeCategoryType(payload?.type ?? existing.type);
      const nextType = existing.is_default ? existing.type : requestedType;
      const nextOptions = normalizeAllowedOptions(
        payload?.allowedOptions ??
        payload?.allowed_options ??
        safeJsonParse(existing.allowed_options_json || '[]', [])
      );
      if (nextType === 'select' && nextOptions.length === 0) {
        throw new DataError('Select categories require allowedOptions.', 400);
      }
      db.prepare(`
        UPDATE categories
        SET
          label = ?,
          type = ?,
          allowed_options_json = ?,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ? AND scope_type = 'board' AND scope_id = ?
      `).run(nextLabel, nextType, JSON.stringify(nextType === 'select' ? nextOptions : []), categoryId, boardId);
      const updated = db.prepare(`
        SELECT id, scope_type, scope_id, label, slug, type, allowed_options_json, is_default, is_deletable, position, created_at, updated_at
        FROM categories
        WHERE id = ?
      `).get(categoryId);
      return rowToCategory(updated);
    },

    deleteBoardCategory(boardId, categoryId) {
      if (!boardId || !categoryId) throw new DataError('Invalid category id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      const existing = db.prepare(`
        SELECT id, is_deletable
        FROM categories
        WHERE id = ? AND scope_type = 'board' AND scope_id = ?
      `).get(categoryId, boardId);
      if (!existing) throw new DataError('Category not found.', 404);
      if (!existing.is_deletable) throw new DataError('This category is required and cannot be deleted.', 400);
      db.prepare(`
        DELETE FROM categories
        WHERE id = ? AND scope_type = 'board' AND scope_id = ?
      `).run(categoryId, boardId);
      return { deleted: true, id: categoryId };
    },

    reorderBoardCategories(boardId, payload = {}) {
      if (!boardId) throw new DataError('Invalid board id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      const categories = listCategoriesForScope(db, 'board', boardId);
      const requested = Array.isArray(payload?.categoryIds)
        ? payload.categoryIds.map((entry) => String(entry || '').trim()).filter(Boolean)
        : [];
      if (!requested.length) {
        throw new DataError('categoryIds is required.', 400);
      }
      const requestedSet = new Set(requested);
      const existingIds = categories.map((entry) => entry.id);
      if (requestedSet.size !== requested.length) {
        throw new DataError('categoryIds must be unique.', 400);
      }
      if (requested.length !== existingIds.length) {
        throw new DataError('categoryIds must include every category exactly once.', 400);
      }
      if (existingIds.some((id) => !requestedSet.has(id))) {
        throw new DataError('categoryIds must include every category exactly once.', 400);
      }

      const updatePosition = db.prepare(`
        UPDATE categories
        SET
          position = ?,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ? AND scope_type = 'board' AND scope_id = ?
      `);
      db.exec('BEGIN');
      try {
        for (let index = 0; index < requested.length; index += 1) {
          updatePosition.run(index, requested[index], boardId);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return listCategoriesForScope(db, 'board', boardId);
    },

    listBoardCustomValues(boardId) {
      if (!boardId) throw new DataError('Invalid board id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      return listItemCustomValues(db, boardId);
    },

    upsertItemCustomValues(boardId, itemId, values) {
      if (!boardId || !itemId) throw new DataError('Invalid item id.', 400);
      ensureDefaultCategories(db, 'board', boardId);
      const entries = normalizeIncomingValueEntries(values);
      if (!entries.length) return listItemCustomValues(db, boardId, itemId);

      const categories = new Map(
        listCategoriesForScope(db, 'board', boardId).map((entry) => [entry.id, entry])
      );
      const upsert = db.prepare(`
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
          confidence,
          last_updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(board_id, item_id, category_id) DO UPDATE SET
          value_type = excluded.value_type,
          value_text = excluded.value_text,
          value_number = excluded.value_number,
          value_boolean = excluded.value_boolean,
          value_select = excluded.value_select,
          source = excluded.source,
          confidence = excluded.confidence,
          last_updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      `);
      const remove = db.prepare(`
        DELETE FROM item_custom_values
        WHERE board_id = ? AND item_id = ? AND category_id = ?
      `);

      db.exec('BEGIN');
      try {
        for (const entry of entries) {
          if (!entry.categoryId) continue;
          const category = categories.get(entry.categoryId);
          if (!category) continue;
          const parsed = parseTypedValue(category.type, entry.value, category.allowedOptions || []);
          if (!parsed.hasValue) {
            remove.run(boardId, itemId, category.id);
            continue;
          }
          const source = entry.source === 'scraped' ? 'scraped' : 'user';
          const confidence = source === 'scraped' && Number.isFinite(Number(entry.confidence))
            ? Math.max(0, Math.min(1, Number(entry.confidence)))
            : null;
          upsert.run(
            boardId,
            itemId,
            category.id,
            category.type,
            parsed.stored.value_text ?? null,
            parsed.stored.value_number ?? null,
            parsed.stored.value_boolean ?? null,
            parsed.stored.value_select ?? null,
            source,
            confidence
          );
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        if (error instanceof DataError) throw error;
        throw new DataError(error instanceof Error ? error.message : 'Invalid value payload.', 400);
      }
      return listItemCustomValues(db, boardId, itemId);
    }
  };
}

export function createDataService({ databasePath = dbPath } = {}) {
  const db = openDatabase(databasePath);
  const service = createBoardDataService(db);
  return {
    ...service,
    db,
    close() {
      db.close();
    }
  };
}

export function __testOnlyNormalizeCompactItemNameCandidate(rawName, options = {}) {
  return normalizeCompactItemNameCandidate(rawName, options);
}

export async function __testOnlyPickCompactItemName(product, sourceUrl = '') {
  return pickCompactItemName(product, sourceUrl);
}

export async function __testOnlyPickFinalItemName(product, sourceUrl = '') {
  return pickFinalItemName(product, sourceUrl);
}

export function __testOnlyFormatItemName(payload = {}) {
  return formatItemName(payload);
}

export function __testOnlyParseJsonLd(html, options = {}) {
  return parseJsonLd(html, options);
}

export function __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, meta = {}, jsonLd = {}) {
  return collectImageCandidatesFromHtml(baseUrl, html, meta, jsonLd);
}

export async function __testOnlyExtractFromHtml(finalUrl, html) {
  return extractFromHtml(finalUrl, html);
}

export function __testOnlyIsLikelyBlockedFallbackContent(text = '') {
  return isLikelyBlockedFallbackContent(text);
}

export function __testOnlyShouldRejectSparseRetailerProduct(product = {}, sourceUrl = '') {
  return shouldRejectSparseRetailerProduct(product, sourceUrl);
}

export function __testOnlyMergeProducts(base, candidate, sourceUrl = '') {
  return mergeProducts(base, candidate, sourceUrl);
}

export async function __testOnlyRunFullExtraction(url) {
  const normalizedUrl = normalizeIncomingUrl(url);
  if (!normalizedUrl) {
    throw new ExtractError('Invalid URL.', 400);
  }
  let product;
  try {
    product = await extractProductData(normalizedUrl);
  } catch {
    product = minimalFallbackFromUrl(normalizedUrl, []);
  }
  product = await enrichProductData(normalizedUrl, product);
  product = sanitizeProduct(product, normalizedUrl);
  product.name = await pickFinalItemName(product, normalizedUrl);
  return product;
}

export async function __testOnlyDebugExtractionStages(url) {
  const normalizedUrl = normalizeIncomingUrl(url);
  if (!normalizedUrl) {
    throw new ExtractError('Invalid URL.', 400);
  }
  let base;
  try {
    base = await extractProductData(normalizedUrl);
  } catch (error) {
    base = minimalFallbackFromUrl(normalizedUrl, []);
    base.__initialError = error instanceof Error ? error.message : String(error || '');
  }
  const zyte = await (async () => {
    try {
      return await extractViaZyte(normalizedUrl);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error || ''),
        images: [],
        image: '',
        price: '',
        name: ''
      };
    }
  })();
  const mergedWithZyte = mergeProducts(base, zyte, normalizedUrl);
  const sanitized = sanitizeProduct(mergedWithZyte, normalizedUrl);
  return {
    base: {
      name: base?.name || '',
      image: base?.image || '',
      images: Array.isArray(base?.images) ? base.images.length : 0,
      price: base?.price || '',
      initialError: base?.__initialError || ''
    },
    zyte: {
      name: zyte?.name || '',
      image: zyte?.image || '',
      images: Array.isArray(zyte?.images) ? zyte.images.length : 0,
      price: zyte?.price || '',
      error: zyte?.error || ''
    },
    merged: {
      image: mergedWithZyte?.image || '',
      images: Array.isArray(mergedWithZyte?.images) ? mergedWithZyte.images.length : 0,
      price: mergedWithZyte?.price || ''
    },
    sanitized: {
      image: sanitized?.image || '',
      images: Array.isArray(sanitized?.images) ? sanitized.images.length : 0,
      price: sanitized?.price || ''
    }
  };
}

export function __testOnlyPickBestProductPrice(finalUrl, html) {
  const primaryHeading = parsePrimaryHeading(html, { sourceUrl: finalUrl });
  const pageTitle = parseTitle(html);
  const meta = parseMetaTags(html);
  const jsonLd = parseJsonLd(html, {
    sourceUrl: finalUrl,
    primaryHeading,
    pageTitle
  });
  return pickBestProductPrice({ finalUrl, html, meta, jsonLd });
}

export function __testOnlyUpsertDemoTemplateFromSourceBoard(databasePath, options = {}) {
  const db = openDatabase(databasePath);
  try {
    return upsertBoardTemplateFromSourceBoard(db, options);
  } finally {
    db.close();
  }
}

export function __testOnlyProvisionDemoBoardForUser(databasePath, userId, options = {}) {
  const db = openDatabase(databasePath);
  try {
    return provisionDemoBoardForUser(db, userId, options);
  } finally {
    db.close();
  }
}

export function __testOnlyReadUserSnapshot(databasePath, userId) {
  const db = openDatabase(databasePath);
  try {
    return readUserSnapshot(db, userId);
  } finally {
    db.close();
  }
}

export function __testOnlyAssertTemplateSnapshotWriteAccess(databasePath, user = {}, snapshot = {}) {
  const db = openDatabase(databasePath);
  try {
    assertTemplateSnapshotWriteAccess(db, user, snapshot);
    return true;
  } finally {
    db.close();
  }
}

async function handleExtract(req, res) {
  const body = await readJsonBody(req);
  const normalizedUrl = normalizeIncomingUrl(body?.url);
  if (!normalizedUrl) {
    respondJson(res, 400, { error: 'Invalid URL.' });
    return;
  }

  try {
    let product;
    let initialError = null;

    try {
      product = await extractProductData(normalizedUrl);
    } catch (error) {
      initialError = error;
      product = minimalFallbackFromUrl(normalizedUrl, []);
    }

    product = await enrichProductData(normalizedUrl, product);
    product = sanitizeProduct(product, normalizedUrl);
    const hasImages = Boolean(product?.image) || (Array.isArray(product?.images) && product.images.length > 0);
    const productTextForBlockDetection = [
      product?.name || '',
      product?.description || '',
      ...(Array.isArray(product?.specs) ? product.specs : [])
    ].join(' ');
    if (
      isHomeDepotUrl(normalizedUrl) &&
      !hasImages &&
      isLikelyBlockedFallbackContent(productTextForBlockDetection)
    ) {
      throw new ExtractError(
        'Home Depot blocked automated extraction from this environment (403), so images could not be retrieved.',
        422
      );
    }
    if (shouldRejectSparseRetailerProduct(product, normalizedUrl)) {
      throw new ExtractError(
        'Retailer blocked automated extraction from this environment, so image and price could not be retrieved.',
        422
      );
    }
    product.name = await pickFinalItemName(product, normalizedUrl);
    if (needsEnrichment(product) && (!Array.isArray(product.highlights) || !product.highlights.length)) {
      product.highlights = [];
    }
    if (!product?.name && initialError) {
      throw initialError;
    }
    respondJson(res, 200, product);
  } catch (error) {
    respondJson(res, 422, {
      error: error instanceof Error ? error.message : 'Could not parse this product page.'
    });
  }
}

export function createServer({
  databasePath = dbPath,
  feedbackSender = sendSiteFeedbackEmail,
  boardNotificationSender = sendBoardActivityEmail
} = {}) {
  const db = openDatabase(databasePath);
  const dataService = createBoardDataService(db);
  const shouldSkipDemoBoardProvisioning = (options = {}) => {
    const explicitFlag = options?.explicitFlag === true;
    const hasSharedBoardRequest = Boolean(String(options?.sharedBoardId || '').trim());
    return explicitFlag || hasSharedBoardRequest;
  };

  const server = http.createServer(async (req, res) => {
    const method = req.method || 'GET';
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = parsedUrl.pathname;

    try {
      if (pathname === '/api/interview-projects' && method === 'POST') {
        const project = createInterviewProjectRecord(db);
        respondJson(res, 201, {
          project,
          sharePath: `/?project=${encodeURIComponent(project.id)}`
        });
        return;
      }

      const interviewProjectAudioMatch = pathname.match(/^\/api\/interview-projects\/([^/]+)\/audio$/);
      if (interviewProjectAudioMatch) {
        const projectId = decodeURIComponent(interviewProjectAudioMatch[1] || '').trim();
        if (!projectId) {
          respondJson(res, 400, { error: 'Invalid project id.' });
          return;
        }

        if (method === 'PUT') {
          const body = await readBinaryBody(req, 150_000_000);
          if (!body.length) {
            respondJson(res, 400, { error: 'Audio payload is required.' });
            return;
          }
          writeInterviewProjectAudio(
            db,
            projectId,
            body,
            parsedUrl.searchParams.get('filename') || 'audio',
            req.headers['content-type']
          );
          respondJson(res, 200, { ok: true });
          return;
        }

        if (method === 'GET' || method === 'HEAD') {
          const audioAsset = readInterviewProjectAudio(db, projectId);
          if (!audioAsset) {
            respondJson(res, 404, { error: 'Project audio was not found.' });
            return;
          }
          respondBuffer(req, res, audioAsset.buffer, audioAsset.mimeType);
          return;
        }
      }

      const interviewProjectMatch = pathname.match(/^\/api\/interview-projects\/([^/]+)$/);
      if (interviewProjectMatch) {
        const projectId = decodeURIComponent(interviewProjectMatch[1] || '').trim();
        if (!projectId) {
          respondJson(res, 400, { error: 'Invalid project id.' });
          return;
        }

        if (method === 'GET') {
          const project = readInterviewProjectRecord(db, projectId);
          if (!project) {
            respondJson(res, 404, { error: 'Shared project not found.' });
            return;
          }
          respondJson(res, 200, {
            project,
            sharePath: `/?project=${encodeURIComponent(project.id)}`
          });
          return;
        }

        if (method === 'PUT') {
          const body = await readJsonBody(req, 10_000_000);
          const project = writeInterviewProjectPayload(db, projectId, body);
          respondJson(res, 200, {
            project,
            sharePath: `/?project=${encodeURIComponent(project.id)}`
          });
          return;
        }
      }

      if (pathname === '/api/feedback' && method === 'POST') {
        const authContext = lookupAuthContext(db, req);
        if (!authContext.authenticated && authContext.sessionToken) {
          appendSetCookieHeader(res, createClearSessionCookie(req));
        }
        const body = await readJsonBody(req);
        const submission = normalizeSiteFeedbackSubmission(body, {
          user: authContext.authenticated ? authContext.user : null,
          userAgent: req.headers['user-agent'],
          ipAddress: collectRequestIp(req)
        });
        await feedbackSender(submission);
        respondJson(res, 202, { ok: true });
        return;
      }

      if (pathname === '/api/auth/session' && method === 'GET') {
        const authContext = lookupAuthContext(db, req);
        if (!authContext.authenticated && authContext.sessionToken) {
          authLog('warn', 'session_cookie_rejected', { status: 401 });
          appendSetCookieHeader(res, createClearSessionCookie(req));
        }
        respondJson(res, 200, {
          authenticated: authContext.authenticated,
          user: authContext.user,
          betaWelcomeGateEnabled: BETA_WELCOME_GATE_ENABLED
        });
        return;
      }

      if (pathname === '/api/auth/sign-up' && method === 'POST') {
        const body = await readJsonBody(req);
        const createdUser = await createAccount(db, body);
        if (!shouldSkipDemoBoardProvisioning({ explicitFlag: body?.skipDemoBoardProvisioning === true })) {
          try {
            provisionDemoBoardForUser(db, createdUser.id);
          } catch (error) {
            console.warn('Could not auto-provision demo board after sign-up:', error);
          }
        }
        try {
          const ownerAttachResult = await ensureOwnerMasterBoardAttached(db, createdUser.id);
          if (ownerAttachResult.attached) {
            authLog('info', 'owner_board_attached_after_sign_up', {
              userId: createdUser.id,
              boardId: ownerAttachResult.boardId || ''
            });
          }
        } catch (error) {
          console.warn('Could not auto-attach owner master board after sign-up:', error);
        }
        const user = readPublicUserById(db, createdUser.id) || createdUser;
        const session = createSessionForUser(db, user.id);
        appendSetCookieHeader(res, createSessionCookie(session.token, req));
        authLog('info', 'sign_up_succeeded', {
          email: maskEmail(user?.email),
          userId: user?.id || '',
          status: 201
        });
        respondJson(res, 201, {
          authenticated: true,
          user,
          betaWelcomeGateEnabled: BETA_WELCOME_GATE_ENABLED
        });
        return;
      }

      if (pathname === '/api/auth/sign-in' && method === 'POST') {
        const body = await readJsonBody(req);
        const authenticatedUser = await authenticateAccount(db, body);
        if (!shouldSkipDemoBoardProvisioning({ explicitFlag: body?.skipDemoBoardProvisioning === true })) {
          try {
            provisionDemoBoardForUser(db, authenticatedUser.id);
          } catch (error) {
            console.warn('Could not auto-provision demo board after sign-in:', error);
          }
        }
        try {
          const ownerAttachResult = await ensureOwnerMasterBoardAttached(db, authenticatedUser.id);
          if (ownerAttachResult.attached) {
            authLog('info', 'owner_board_attached_after_sign_in', {
              userId: authenticatedUser.id,
              boardId: ownerAttachResult.boardId || ''
            });
          }
        } catch (error) {
          console.warn('Could not auto-attach owner master board after sign-in:', error);
        }
        const user = readPublicUserById(db, authenticatedUser.id) || authenticatedUser;
        const session = createSessionForUser(db, user.id);
        appendSetCookieHeader(res, createSessionCookie(session.token, req));
        authLog('info', 'sign_in_succeeded', {
          email: maskEmail(user?.email),
          userId: user?.id || '',
          status: 200
        });
        respondJson(res, 200, {
          authenticated: true,
          user,
          betaWelcomeGateEnabled: BETA_WELCOME_GATE_ENABLED
        });
        return;
      }

      if (pathname === '/api/auth/sign-out' && method === 'POST') {
        clearSessionFromRequest(db, req);
        appendSetCookieHeader(res, createClearSessionCookie(req));
        authLog('info', 'sign_out_succeeded', { status: 200 });
        respondJson(res, 200, { ok: true, betaWelcomeGateEnabled: BETA_WELCOME_GATE_ENABLED });
        return;
      }

      const requireAuthenticatedUser = () => {
        const authContext = lookupAuthContext(db, req);
        if (!authContext.authenticated || !authContext.user) {
          if (authContext.sessionToken) {
            appendSetCookieHeader(res, createClearSessionCookie(req));
          }
          respondJson(res, 401, { error: 'Authentication required.' });
          return null;
        }
        return authContext.user;
      };

      const requireTemplateAdmin = () => {
        const user = requireAuthenticatedUser();
        if (!user) return null;
        if (isUserTemplateAdmin(user)) return user;
        respondJson(res, 403, { error: 'Admin access required.' });
        return null;
      };

      if (pathname === '/api/beta/acknowledge' && method === 'POST') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const updatedUser = markUserBetaWelcomeAcknowledged(db, user.id);
        respondJson(res, 200, {
          ok: true,
          user: updatedUser,
          betaWelcomeGateEnabled: BETA_WELCOME_GATE_ENABLED
        });
        return;
      }

      if (pathname === '/api/first-link-notice/trigger' && method === 'POST') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const result = triggerFirstLinkNotice(db, user.id);
        respondJson(res, 200, {
          ok: true,
          shouldShowNotice: result.shouldShowNotice,
          user: result.user
        });
        return;
      }

      if (pathname === '/api/first-link-notice/acknowledge' && method === 'POST') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const updatedUser = acknowledgeFirstLinkNotice(db, user.id);
        respondJson(res, 200, {
          ok: true,
          user: updatedUser
        });
        return;
      }

      if (pathname === '/api/demo/templates' && method === 'GET') {
        respondJson(res, 200, {
          templates: listActiveBoardTemplateSummaries(db)
        });
        return;
      }

      const templatePreviewMatch = pathname.match(/^\/api\/demo\/templates\/([^/]+)\/preview$/);
      if (templatePreviewMatch && method === 'GET') {
        const templateSlug = decodeURIComponent(templatePreviewMatch[1] || '').trim();
        const template = readBoardTemplateBySlug(db, templateSlug, { activeOnly: true });
        if (!template) {
          respondJson(res, 404, { error: 'Template not found.' });
          return;
        }
        const board = cloneJson(safeJsonParse(template.board_json || '{}', {}), {});
        if (board && typeof board === 'object' && !Array.isArray(board)) {
          const boardName = String(board.name || '').trim();
          if (isOwnerTemplateBoardName(boardName)) {
            board.name = getPreferredOwnerTemplateBoardName();
          }
        }
        respondJson(res, 200, {
          template: rowToBoardTemplateSummary(template),
          board
        });
        return;
      }

      const templateCloneMatch = pathname.match(/^\/api\/demo\/templates\/([^/]+)\/clone$/);
      if (templateCloneMatch && method === 'POST') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const templateSlug = decodeURIComponent(templateCloneMatch[1] || '').trim();
        const body = await readJsonBody(req);
        const provisioned = provisionDemoBoardForUser(db, user.id, {
          force: true,
          templateSlug,
          boardName: body?.boardName
        });
        if (!provisioned.seeded || !provisioned.board) {
          const message = provisioned.reason === 'template-not-configured'
            ? 'Template not found.'
            : 'Could not clone template.';
          respondJson(res, 404, { error: message });
          return;
        }
        respondJson(res, 201, {
          ok: true,
          board: provisioned.board,
          template: provisioned.template,
          snapshot: provisioned.snapshot
        });
        return;
      }

      if (pathname === '/api/admin/demo/templates/sync' && method === 'POST') {
        const adminUser = requireTemplateAdmin();
        if (!adminUser) return;
        const body = await readJsonBody(req);
        const template = upsertBoardTemplateFromSourceBoard(db, {
          templateSlug: body?.templateSlug || body?.slug,
          title: body?.title,
          description: body?.description,
          sourceBoardId: body?.sourceBoardId,
          sourceUserId: body?.sourceUserId || adminUser.id,
          sourceUserEmail: body?.sourceUserEmail,
          isDefault: typeof body?.isDefault === 'boolean' ? body.isDefault : undefined,
          isActive: typeof body?.isActive === 'boolean' ? body.isActive : undefined
        });
        respondJson(res, 200, { ok: true, template });
        return;
      }

      if (method === 'POST' && pathname === '/api/extract') {
        if (!requireAuthenticatedUser()) return;
        await handleExtract(req, res);
        return;
      }

      if (pathname === '/api/shared-board' && method === 'GET') {
        const boardId = String(parsedUrl.searchParams.get('board') || '').trim();
        const ownerUserId = String(parsedUrl.searchParams.get('owner') || '').trim();
        if (!boardId) {
          respondJson(res, 400, { error: 'Board id is required.' });
          return;
        }
        const sharedBoardRecord = await resolveSharedBoardRecordById(db, boardId, ownerUserId);
        if (!sharedBoardRecord?.board) {
          respondJson(res, 404, { error: 'Shared board not found.' });
          return;
        }
        const authContext = lookupAuthContext(db, req);
        if (authContext.authenticated && authContext.user && sharedBoardRecord.ownerId && authContext.user.id !== sharedBoardRecord.ownerId) {
          upsertSharedBoardParticipant(db, sharedBoardRecord.board.id, sharedBoardRecord.ownerId, authContext.user.id);
        }
        respondJson(res, 200, {
          board: sharedBoardRecord.board,
          ownerId: sharedBoardRecord.ownerId
        });
        return;
      }

      if (pathname === '/api/data') {
        if (method === 'GET') {
          const betaAccessRequest = String(parsedUrl.searchParams.get('beta') || '').trim() === '1';
          const requestedSharedBoardId = String(parsedUrl.searchParams.get('board') || '').trim();
          const requestedSharedOwnerId = String(parsedUrl.searchParams.get('owner') || '').trim();
          let requestedSharedBoardRecord = null;
          if (requestedSharedBoardId) {
            try {
              requestedSharedBoardRecord = await resolveSharedBoardRecordById(db, requestedSharedBoardId, requestedSharedOwnerId);
            } catch (error) {
              console.warn('Could not resolve requested shared board during /api/data load:', error);
            }
          }
          const requestedSharedBoard = requestedSharedBoardRecord?.board || null;
          const requestedSharedBoardOwnerId = String(requestedSharedBoardRecord?.ownerId || '').trim();
          const authContext = lookupAuthContext(db, req);
          if (authContext.authenticated && authContext.user) {
            if (requestedSharedBoard && requestedSharedBoardOwnerId && authContext.user.id !== requestedSharedBoardOwnerId) {
              upsertSharedBoardParticipant(db, requestedSharedBoard.id, requestedSharedBoardOwnerId, authContext.user.id);
            }
            if (!shouldSkipDemoBoardProvisioning({ sharedBoardId: requestedSharedBoardId })) {
              try {
                provisionDemoBoardForUser(db, authContext.user.id);
              } catch (error) {
                console.warn('Could not auto-provision demo board during /api/data load:', error);
              }
            }
            try {
              const ownerAttachResult = await ensureOwnerMasterBoardAttached(db, authContext.user.id);
              if (ownerAttachResult.attached) {
                authLog('info', 'owner_board_attached_during_data_load', {
                  userId: authContext.user.id,
                  boardId: ownerAttachResult.boardId || ''
                });
              }
            } catch (error) {
              console.warn('Could not auto-attach owner master board during /api/data load:', error);
            }
            const { snapshot: userSnapshot } = normalizeLegacyOwnerTemplateBoardNamesForUser(db, authContext.user.id);
            const payload = requestedSharedBoard
              ? mergeSharedBoardIntoSnapshot(userSnapshot, requestedSharedBoard)
              : userSnapshot;
            respondJson(res, 200, {
              ...payload,
              sharedBoardOwnerId: requestedSharedBoardOwnerId
            });
            return;
          } else if (authContext.sessionToken) {
            appendSetCookieHeader(res, createClearSessionCookie(req));
          }
          const anonymousSnapshot = betaAccessRequest
            ? resolveAnonymousBetaSnapshot(db)
            : await resolveAnonymousSnapshot(db);
          const payload = requestedSharedBoard
            ? normalizeAppDataSnapshot({ boards: [requestedSharedBoard] })
            : anonymousSnapshot;
          respondJson(res, 200, {
            ...payload,
            sharedBoardOwnerId: requestedSharedBoardOwnerId
          });
          return;
        }
        if (method === 'PUT') {
          const user = requireAuthenticatedUser();
          if (!user) return;
          const requestedSharedBoardId = String(parsedUrl.searchParams.get('board') || '').trim();
          const requestedSharedOwnerId = String(parsedUrl.searchParams.get('owner') || '').trim();
          const body = await readJsonBody(req, 60_000_000);
          if (requestedSharedBoardId && requestedSharedOwnerId && requestedSharedOwnerId !== user.id) {
            assertTemplateBoardWriteAccess(db, user, requestedSharedBoardId);
            const incomingSnapshot = normalizeAppDataSnapshot(body);
            const incomingBoard = findBoardInSnapshot(incomingSnapshot, requestedSharedBoardId);
            if (!incomingBoard) {
              respondJson(res, 400, { error: 'Shared board payload must include the requested board.' });
              return;
            }
            const ownerUser = readPublicUserById(db, requestedSharedOwnerId);
            if (!ownerUser) {
              respondJson(res, 404, { error: 'Shared board owner was not found.' });
              return;
            }
            const ownerSnapshot = readUserSnapshot(db, requestedSharedOwnerId);
            const previousBoard = findBoardInSnapshot(ownerSnapshot, requestedSharedBoardId);
            const replaced = replaceBoardInSnapshot(ownerSnapshot, incomingBoard);
            if (!replaced.replaced) {
              respondJson(res, 404, { error: 'Shared board was not found on owner account.' });
              return;
            }
            upsertSharedBoardParticipant(db, requestedSharedBoardId, requestedSharedOwnerId, user.id);
            writeUserSnapshot(db, requestedSharedOwnerId, replaced.snapshot);
            await notifyBoardActivityRecipients({
              db,
              req,
              notificationSender: boardNotificationSender,
              actorUser: user,
              ownerUserId: requestedSharedOwnerId,
              previousBoard,
              nextBoard: incomingBoard
            });
            respondJson(res, 200, {
              ok: true,
              mode: 'shared-board',
              boardId: requestedSharedBoardId,
              ownerId: requestedSharedOwnerId
            });
            return;
          }
          assertTemplateSnapshotWriteAccess(db, user, body);
          const previousSnapshot = readUserSnapshot(db, user.id);
          const nextSnapshot = normalizeAppDataSnapshot(body);
          writeUserSnapshot(db, user.id, body);
          const previousBoardsById = new Map(
            (Array.isArray(previousSnapshot?.boards) ? previousSnapshot.boards : [])
              .map((board) => [String(board?.id || '').trim(), board])
              .filter(([boardId]) => Boolean(boardId))
          );
          const nextBoards = Array.isArray(nextSnapshot?.boards) ? nextSnapshot.boards : [];
          for (const nextBoard of nextBoards) {
            const boardId = String(nextBoard?.id || '').trim();
            if (!boardId) continue;
            await notifyBoardActivityRecipients({
              db,
              req,
              notificationSender: boardNotificationSender,
              actorUser: user,
              ownerUserId: user.id,
              previousBoard: previousBoardsById.get(boardId) || null,
              nextBoard
            });
          }
          respondJson(res, 200, { ok: true });
          return;
        }
      }

      const categoriesMatch = pathname.match(/^\/api\/boards\/([^/]+)\/categories$/);
      if (categoriesMatch) {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const scope = getScopeBoardIds(categoriesMatch);
        if (!scope) {
          respondJson(res, 400, { error: 'Invalid board id.' });
          return;
        }
        if (method === 'GET') {
          respondJson(res, 200, { categories: dataService.getBoardCategories(scope.scopeId) });
          return;
        }
        if (method === 'POST') {
          assertTemplateBoardWriteAccess(db, user, scope.scopeId);
          const body = await readJsonBody(req);
          const category = dataService.createBoardCategory(scope.scopeId, body);
          respondJson(res, 201, { category });
          return;
        }
      }

      const reorderCategoriesMatch = pathname.match(/^\/api\/boards\/([^/]+)\/categories\/reorder$/);
      if (reorderCategoriesMatch && method === 'PUT') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const scope = getScopeBoardIds(reorderCategoriesMatch);
        if (!scope) {
          respondJson(res, 400, { error: 'Invalid board id.' });
          return;
        }
        assertTemplateBoardWriteAccess(db, user, scope.scopeId);
        const body = await readJsonBody(req);
        const categories = dataService.reorderBoardCategories(scope.scopeId, body);
        respondJson(res, 200, { categories });
        return;
      }

      const categoryMatch = pathname.match(/^\/api\/boards\/([^/]+)\/categories\/([^/]+)$/);
      if (categoryMatch) {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const scope = getScopeBoardIds(categoryMatch);
        const categoryId = decodeURIComponent(categoryMatch[2] || '').trim();
        if (!scope || !categoryId) {
          respondJson(res, 400, { error: 'Invalid category id.' });
          return;
        }
        if (method === 'PATCH') {
          assertTemplateBoardWriteAccess(db, user, scope.scopeId);
          const body = await readJsonBody(req);
          const category = dataService.updateBoardCategory(scope.scopeId, categoryId, body);
          respondJson(res, 200, { category });
          return;
        }
        if (method === 'DELETE') {
          assertTemplateBoardWriteAccess(db, user, scope.scopeId);
          const result = dataService.deleteBoardCategory(scope.scopeId, categoryId);
          respondJson(res, 200, result);
          return;
        }
      }

      const listValuesMatch = pathname.match(/^\/api\/boards\/([^/]+)\/items\/custom-values$/);
      if (listValuesMatch && method === 'GET') {
        if (!requireAuthenticatedUser()) return;
        const boardId = decodeURIComponent(listValuesMatch[1] || '').trim();
        if (!boardId) {
          respondJson(res, 400, { error: 'Invalid board id.' });
          return;
        }
        respondJson(res, 200, { values: dataService.listBoardCustomValues(boardId) });
        return;
      }

      const itemValuesMatch = pathname.match(/^\/api\/boards\/([^/]+)\/items\/([^/]+)\/custom-values$/);
      if (itemValuesMatch && method === 'PUT') {
        const user = requireAuthenticatedUser();
        if (!user) return;
        const boardId = decodeURIComponent(itemValuesMatch[1] || '').trim();
        const itemId = decodeURIComponent(itemValuesMatch[2] || '').trim();
        if (!boardId || !itemId) {
          respondJson(res, 400, { error: 'Invalid item id.' });
          return;
        }
        assertTemplateBoardWriteAccess(db, user, boardId);
        const body = await readJsonBody(req);
        const values = dataService.upsertItemCustomValues(boardId, itemId, body?.values);
        respondJson(res, 200, { itemId, values });
        return;
      }

      if (method === 'GET' || method === 'HEAD') {
        await serveStatic(req, res);
        return;
      }

      res.writeHead(405);
      res.end('Method not allowed');
    } catch (error) {
      const status = Number(error?.status || 500);
      respondJson(res, status, {
        error: error instanceof Error ? error.message : 'Server error'
      });
    }
  });

  server.on('close', () => {
    try {
      db.close();
    } catch {
      // ignore close errors
    }
  });

  return { server, db };
}

export function startServer({ port = PORT, databasePath = dbPath } = {}) {
  const { server, db } = createServer({ databasePath });
  const resolvedDatabasePath = path.resolve(databasePath);
  const usesRenderPersistentDisk = resolvedDatabasePath.startsWith(`${renderPersistentDataDir}${path.sep}`) || resolvedDatabasePath === renderPersistentDataDir;
  const authProviderLabel = isSupabaseAuthEnabled() ? 'supabase' : 'local';
  console.log('[startup]', {
    authProvider: authProviderLabel,
    databasePath: resolvedDatabasePath,
    appDataPath: path.resolve(appDataPath),
    runningOnRender,
    usesRenderPersistentDisk
  });
  if (runningOnRender && !usesRenderPersistentDisk && !process.env.DATA_DB_PATH) {
    console.warn('[startup] Render detected without DATA_DB_PATH and database is not under /var/data. Local DB may reset on redeploy/restart.');
  }
  return new Promise((resolve) => {
    server.listen(port, () => {
      const address = server.address();
      const resolvedPort = typeof address === 'object' && address ? address.port : Number(port);
      resolve({ server, db, port: resolvedPort });
    });
  });
}

const isMainModule = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
  : false;

if (isMainModule) {
  startServer({ port: PORT }).then(({ port }) => {
    console.log(`Shopping organizer running at http://localhost:${port}`);
  });
}
