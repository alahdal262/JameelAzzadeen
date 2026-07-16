#!/usr/bin/env node
/**
 * One-shot migration: Firestore (project "gameelazzadeen") -> self-hosted Postgres.
 *
 * Reads collections via the public Firestore REST API (open read rules) and
 * upserts them into the `items` / `settings` tables used by the new server.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node server/scripts/migrate-firestore.mjs
 *
 * Env:
 *   DATABASE_URL      (required) Postgres connection string
 *   FIREBASE_API_KEY  (optional) overrides the default public web API key
 *
 * Idempotent: safe to run multiple times (pure upserts, tables created IF NOT EXISTS).
 */

import pg from 'pg';

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    'ERROR: DATABASE_URL environment variable is required.\n' +
      'Example: DATABASE_URL=postgres://user:pass@localhost:5432/dbname node server/scripts/migrate-firestore.mjs'
  );
  process.exit(1);
}

const FIREBASE_PROJECT = 'gameelazzadeen';
const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY || 'AIzaSyA_L0XyjlLOeavYYuKIHddwD23PepZPtuQ';

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

const COLLECTIONS = ['testimonials', 'videos', 'career_moments', 'articles', 'gallery'];
const SETTINGS_KEYS = ['hero_image', 'general'];

const ARABIC_LABELS = {
  testimonials: 'الشهادات',
  videos: 'الفيديوهات',
  career_moments: 'المحطات المهنية',
  articles: 'المقالات',
  gallery: 'معرض الصور',
  settings: 'الإعدادات',
};

// ---------------------------------------------------------------------------
// Firestore REST value decoding
// ---------------------------------------------------------------------------

/** Decode a single Firestore REST "Value" object into plain JSON. */
function decodeValue(value) {
  if (value == null || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  // Rare types not expected in this dataset — degrade gracefully.
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('bytesValue' in value) return value.bytesValue;
  return null;
}

/** Decode a Firestore "fields" map into a plain object. */
function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields || {})) {
    out[key] = decodeValue(value);
  }
  return out;
}

/** Document id = last path segment of doc.name. */
function docIdFromName(name) {
  const segments = String(name || '').split('/');
  return segments[segments.length - 1];
}

// ---------------------------------------------------------------------------
// Firestore REST fetching
// ---------------------------------------------------------------------------

/** Fetch all documents of a collection, following nextPageToken pagination. */
async function fetchCollection(name) {
  const docs = [];
  let pageToken = '';
  for (;;) {
    let url = `${FIRESTORE_BASE}/${name}?pageSize=300&key=${FIREBASE_API_KEY}`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Firestore fetch failed for "${name}": HTTP ${res.status} ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    for (const doc of json.documents || []) {
      docs.push(doc);
    }
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return docs;
}

/** Fetch a single document; returns null on 404. */
async function fetchDocument(path) {
  const url = `${FIRESTORE_BASE}/${path}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Firestore fetch failed for "${path}": HTTP ${res.status} ${body.slice(0, 300)}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Postgres
// ---------------------------------------------------------------------------

async function ensureTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key   text PRIMARY KEY,
      value jsonb NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      collection text  NOT NULL,
      id         text  NOT NULL,
      data       jsonb NOT NULL,
      PRIMARY KEY (collection, id)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      email         text PRIMARY KEY,
      password_hash text NOT NULL
    );
  `);
}

async function upsertItem(pool, collection, id, data) {
  await pool.query(
    `INSERT INTO items (collection, id, data)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data`,
    [collection, id, JSON.stringify(data)]
  );
}

async function upsertSetting(pool, key, value) {
  await pool.query(
    `INSERT INTO settings (key, value)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)]
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const summary = {};

  try {
    await ensureTables(pool);
    console.log('تم التأكد من وجود الجداول (settings, items, admins).');

    // --- Collections -> items ------------------------------------------------
    for (const collection of COLLECTIONS) {
      const docs = await fetchCollection(collection);
      let count = 0;
      for (const doc of docs) {
        const docId = docIdFromName(doc.name);
        const data = decodeFields(doc.fields);
        // Keep an 'id' field inside the JSON payload.
        if (data.id === undefined || data.id === null || data.id === '') {
          data.id = docId;
        }
        await upsertItem(pool, collection, docId, data);
        count += 1;
      }
      summary[collection] = count;
      console.log(`  - ${collection}: ${count} مستند`);
    }

    // --- Settings docs -> settings -------------------------------------------
    let settingsCount = 0;
    for (const key of SETTINGS_KEYS) {
      const doc = await fetchDocument(`settings/${key}`);
      if (!doc) {
        console.log(`  - settings/${key}: غير موجود، تم التخطي`);
        continue;
      }
      const value = decodeFields(doc.fields);
      await upsertSetting(pool, key, value);
      settingsCount += 1;
      console.log(`  - settings/${key}: تم الترحيل`);
    }
    summary.settings = settingsCount;

    // --- Summary --------------------------------------------------------------
    console.log('\n===== ملخص الترحيل من Firestore إلى Postgres =====');
    for (const [name, count] of Object.entries(summary)) {
      const label = ARABIC_LABELS[name] || name;
      console.log(`${label} (${name}): ${count}`);
    }
    console.log('اكتمل الترحيل بنجاح.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('فشل الترحيل:', err.message || err);
  process.exit(1);
});
