// Self-hosted backend for the portfolio SPA.
// Express + Postgres. Serves the built SPA from ./dist and a JSON API under /api.

import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

const ALLOWED_COLLECTIONS = new Set([
  'testimonials',
  'videos',
  'career_moments',
  'articles',
  'gallery',
]);

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const pool = new Pool({ connectionString: DATABASE_URL });

async function connectWithRetry(attempts = 30, delayMs = 2000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log(`[db] connected (attempt ${i})`);
      return;
    } catch (err) {
      console.warn(`[db] connection attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key text PRIMARY KEY,
      value jsonb NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      collection text NOT NULL,
      id text NOT NULL,
      data jsonb NOT NULL,
      PRIMARY KEY (collection, id)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      email text PRIMARY KEY,
      password_hash text NOT NULL
    );
  `);
}

async function seedAdmin() {
  // Seed from env ONLY when the admins table is empty. Never overwrite
  // credentials that were changed via the dashboard.
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
  if (rows[0].count > 0) {
    console.log('[admin] admins exist; env seed skipped');
    return;
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('[admin] ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed');
    return;
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
    [ADMIN_EMAIL.toLowerCase(), hash],
  );
  console.log('[admin] admin user seeded');
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));

// Auth middleware
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function requireCollection(req, res, next) {
  if (!ALLOWED_COLLECTIONS.has(req.params.name)) {
    return res.status(404).json({ error: 'not_found' });
  }
  return next();
}

// --- Auth -------------------------------------------------------------------

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const { rows } = await pool.query(
      'SELECT email, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase()],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const token = jwt.sign({ email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, email: rows[0].email });
  } catch (err) {
    return next(err);
  }
});

app.put('/api/auth/credentials', requireAuth, async (req, res, next) => {
  try {
    const jwtEmail =
      typeof req.user?.email === 'string' ? req.user.email.toLowerCase() : '';
    if (!jwtEmail) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { currentPassword, newEmail, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || currentPassword === '') {
      return res.status(400).json({ error: 'bad_request', message: 'current_password_required' });
    }
    const wantsEmail = newEmail !== undefined && newEmail !== null && newEmail !== '';
    const wantsPassword = newPassword !== undefined && newPassword !== null && newPassword !== '';
    if (!wantsEmail && !wantsPassword) {
      return res.status(400).json({ error: 'bad_request', message: 'nothing_to_update' });
    }
    if (wantsPassword && (typeof newPassword !== 'string' || newPassword.length < 8)) {
      return res.status(400).json({ error: 'bad_request', message: 'password_too_short' });
    }
    if (wantsEmail && (typeof newEmail !== 'string' || !/.+@.+\..+/.test(newEmail))) {
      return res.status(400).json({ error: 'bad_request', message: 'invalid_email' });
    }

    const { rows } = await pool.query(
      'SELECT email, password_hash FROM admins WHERE email = $1',
      [jwtEmail],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) {
      return res.status(403).json({ error: 'wrong_password' });
    }

    const finalEmail = wantsEmail ? newEmail.toLowerCase() : rows[0].email;
    const sets = [];
    const params = [];
    if (wantsPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      params.push(hash);
      sets.push(`password_hash = $${params.length}`);
    }
    if (wantsEmail) {
      params.push(finalEmail);
      sets.push(`email = $${params.length}`);
    }
    params.push(jwtEmail);
    try {
      await pool.query(
        `UPDATE admins SET ${sets.join(', ')} WHERE email = $${params.length}`,
        params,
      );
    } catch (err) {
      if (err && err.code === '23505') {
        // unique_violation: the new email already belongs to another admin
        return res.status(400).json({ error: 'bad_request', message: 'email_taken' });
      }
      throw err;
    }

    const token = jwt.sign({ email: finalEmail }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, email: finalEmail });
  } catch (err) {
    return next(err);
  }
});

// --- Health -----------------------------------------------------------------

app.get('/api/health', async (_req, res) => {
  let db = false;
  try {
    await pool.query('SELECT 1');
    db = true;
  } catch {
    db = false;
  }
  res.json({ ok: true, db });
});

// --- Settings ---------------------------------------------------------------

app.get('/api/settings/:key', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [
      req.params.key,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not_found' });
    }
    return res.json({ value: rows[0].value });
  } catch (err) {
    return next(err);
  }
});

app.put('/api/settings/:key', requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!('value' in body)) {
      return res.status(400).json({ error: 'value_required' });
    }
    await pool.query(
      `INSERT INTO settings (key, value)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [req.params.key, JSON.stringify(body.value)],
    );
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// --- Collections --------------------------------------------------------------

app.get('/api/collections/:name', requireCollection, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT data FROM items
       WHERE collection = $1
       ORDER BY (CASE WHEN id ~ '^[0-9]+$' THEN id::numeric ELSE 0 END) DESC, id DESC`,
      [req.params.name],
    );
    return res.json({ items: rows.map((r) => r.data) });
  } catch (err) {
    return next(err);
  }
});

app.put('/api/collections/:name', requireAuth, requireCollection, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const items = (req.body || {}).items;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items_must_be_array' });
    }
    await client.query('BEGIN');
    let count = 0;
    for (const item of items) {
      if (item == null || typeof item !== 'object' || item.id === undefined || item.id === null) {
        continue;
      }
      await client.query(
        `INSERT INTO items (collection, id, data)
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data`,
        [req.params.name, String(item.id), JSON.stringify(item)],
      );
      count += 1;
    }
    await client.query('COMMIT');
    return res.json({ count });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback failure
    }
    return next(err);
  } finally {
    client.release();
  }
});

app.delete('/api/collections/:name/:id', requireAuth, requireCollection, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM items WHERE collection = $1 AND id = $2', [
      req.params.name,
      req.params.id,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// --- Unknown API routes -> 404 JSON ------------------------------------------

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// --- Legacy WordPress paths -> 301 /articles -----------------------------------

// Old WordPress permalinks (/category/<x>, /tag/<x>) permanently redirect to the
// blog page. Decoding is wrapped in try/catch: a malformed percent sequence
// (e.g. /category/%zz) must not crash — it falls through to the SPA 404 below.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let decoded;
  try {
    decoded = decodeURIComponent(req.path);
  } catch {
    return next();
  }
  if (
    decoded === '/category' || decoded.startsWith('/category/') ||
    decoded === '/tag' || decoded.startsWith('/tag/')
  ) {
    return res.redirect(301, '/articles');
  }
  return next();
});

// --- Legacy article id URLs -> 301 slug URLs -----------------------------------

// /articles/<id> permanently redirects to /articles/<slug> when the key matches
// a stored article id whose slug differs. Slug URLs (and anything ambiguous or
// unknown) fall through to the SPA. A DB hiccup must not break the page — it
// also falls through.
app.use(async (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let decoded;
  try {
    decoded = decodeURIComponent(req.path);
  } catch {
    return next();
  }
  const match = /^\/articles\/([^/]+)$/.exec(decoded);
  if (!match) return next();
  const key = match[1];
  try {
    const { rows } = await pool.query(
      `SELECT id, data->>'slug' AS slug FROM items
       WHERE collection = 'articles' AND (id = $1 OR data->>'slug' = $1)`,
      [key],
    );
    // The key already being some article's slug wins over an id match.
    if (rows.some((r) => r.slug === key)) return next();
    const byId = rows.find((r) => r.id === key);
    if (byId && byId.slug && byId.slug !== key) {
      return res.redirect(301, `/articles/${encodeURIComponent(byId.slug)}`);
    }
  } catch (err) {
    console.warn(`[articles] slug redirect lookup failed: ${err.message}`);
  }
  return next();
});

// --- Static SPA ---------------------------------------------------------------

// Hashed assets are immutable — cache for a year. HTML must always revalidate
// so a new deploy is picked up immediately (no stale-bundle sessions).
app.use(express.static(DIST_DIR, {
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// SPA fallback with a route whitelist: known app paths get index.html with 200;
// anything else (e.g. /wp-admin, /xmlrpc.php, /foo) still gets index.html — the
// SPA renders its 404 view — but with an HTTP 404 status so crawlers don't index
// junk URLs. /api/* was already handled above and keeps its JSON 404.
const KNOWN_APP_PATHS = new Set([
  '/',
  '/about',
  '/gallery',
  '/videos',
  '/twitter',
  '/facebook',
  '/testimonials',
  '/articles',
  '/login',
  '/dashboard',
]);

function isKnownAppPath(pathname) {
  return (
    KNOWN_APP_PATHS.has(pathname) ||
    pathname.startsWith('/articles/') ||
    pathname.startsWith('/dashboard/')
  );
}

// Plain middleware (NOT app.get('*')): Express decodes wildcard params itself
// and a malformed percent sequence like /category/%zz would throw a URIError
// before our handler runs. A bare middleware sees the raw path and stays safe.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api/')) return next();
  if (!fs.existsSync(INDEX_HTML)) {
    return res.status(404).json({ error: 'not_found' });
  }
  let pathname = req.path;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Malformed percent sequence: keep the raw path, which will not match the
    // whitelist and therefore serves the SPA 404 view.
  }
  res.setHeader('Cache-Control', 'no-cache');
  return res.status(isKnownAppPath(pathname) ? 200 : 404).sendFile(INDEX_HTML);
});

// --- Error handling -------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({ error: 'invalid_json' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload_too_large' });
  }
  console.error('[error]', err);
  return res.status(500).json({ error: 'internal_error' });
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

async function main() {
  if (!JWT_SECRET) {
    console.warn('[boot] JWT_SECRET is not set; auth tokens cannot be issued/verified securely');
  }
  await connectWithRetry();
  await initSchema();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`[boot] server listening on port ${PORT}`);
    console.log(`[boot] serving static files from ${DIST_DIR}`);
  });
}

main().catch((err) => {
  console.error('[boot] fatal startup error:', err);
  process.exit(1);
});
