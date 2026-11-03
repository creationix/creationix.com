import { db } from 'jam:sqlite';
import { posts, projects } from './content.js';
import { css, browser, icon } from './assets.js';
import { home, writing, article, projectList, about, consulting, thanks, privacy, notFound, escape, services, budgets, timelines } from './views.js';

// Each worker owns a connection. Schema setup is idempotent across workers.
db.exec(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    service TEXT NOT NULL,
    budget TEXT NOT NULL,
    timeline TEXT NOT NULL,
    message TEXT NOT NULL,
    consent INTEGER NOT NULL CHECK(consent = 1),
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS inquiries_email_created ON inquiries(email, created_at);
`);

const assets = new Map([
  ['/assets/site.css', { body: css, type: 'text/css; charset=utf-8' }],
  ['/assets/site.js', { body: browser, type: 'text/javascript; charset=utf-8' }],
  ['/favicon.svg', { body: icon, type: 'image/svg+xml' }],
]);
const fields = ['name', 'email', 'company', 'service', 'budget', 'timeline', 'message'];
const encoder = new TextEncoder();
const baseHeaders = {
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'cache-control': 'no-store',
};

function html(body, status = 200) {
  return new Response(body, { status, headers: { ...baseHeaders, 'content-type': 'text/html; charset=utf-8' } });
}

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { ...baseHeaders, ...headers } });
}

function problem(status, message, errors = {}) {
  return { status, message, errors };
}

async function readInput(request) {
  const limit = 16 * 1024;
  if (Number(request.headers.get('content-length')) > limit) throw problem(413, 'Please keep the inquiry under 16 KiB.');
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (type !== 'application/json' && type !== 'application/x-www-form-urlencoded') {
    throw problem(415, 'Use a JSON or URL-encoded form submission.');
  }
  // Bound streamed bodies too; Content-Length is only an early rejection hint.
  const reader = request.body?.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    if (reader) {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit) {
          await reader.cancel();
          throw problem(413, 'Please keep the inquiry under 16 KiB.');
        }
        text += decoder.decode(value, { stream: true });
      }
    }
    text += decoder.decode();
    const data = type === 'application/json' ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Expected an object');
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw problem(400, 'The form could not be read. Please check it and try again.');
  } finally {
    reader?.releaseLock();
  }
}

function validate(data) {
  const values = Object.fromEntries([...fields, 'consent', 'id', 'website'].map(name => [name, typeof data[name] === 'string' ? data[name].trim() : '']));
  values.email = values.email.toLowerCase();
  const errors = {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(values.id)) errors.id = 'Reload the form and try again.';
  if (values.name.length < 1 || values.name.length > 100) errors.name = 'Please enter your name, up to 100 characters.';
  if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid email address.';
  if (values.company.length > 200) errors.company = 'Please keep this under 200 characters.';
  for (const [field, options] of [['service', services], ['budget', budgets], ['timeline', timelines]]) {
    if (!options.includes(values[field])) errors[field] = 'Please choose one of the available options.';
  }
  if (values.message.length < 20 || values.message.length > 5000) errors.message = 'Please use between 20 and 5,000 characters.';
  if (values.consent !== 'yes') errors.consent = 'Please confirm that your inquiry can be stored.';
  return { values, errors };
}

function saveInquiry(values) {
  // The whole transaction is synchronous and ends before the request yields.
  return db.transaction(() => {
    const now = Date.now();
    db.prepare('DELETE FROM inquiries WHERE created_at < ?').run([now - 90 * 86400000]);
    const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get([values.id]);
    if (existing) {
      if (fields.some(field => existing[field] !== values[field])) throw problem(409, 'This form was already submitted with different details. Reload it to start a new inquiry.');
      return;
    }
    const recent = db.prepare('SELECT count(*) AS count FROM inquiries WHERE email = ? AND created_at > ?').get([values.email, now - 3600000]);
    if (recent.count >= 3) throw problem(429, 'This email has sent several inquiries recently. Please try again in an hour.');
    const total = db.prepare('SELECT count(*) AS count FROM inquiries').get();
    if (total.count >= 5000) throw problem(503, 'The inbox is temporarily full. Please try again later.');
    db.prepare(`INSERT INTO inquiries (id, name, email, company, service, budget, timeline, message, consent, created_at)
      VALUES (:id, :name, :email, :company, :service, :budget, :timeline, :message, 1, :created_at)`)
      .run({ id: values.id, ...Object.fromEntries(fields.map(field => [field, values[field]])), created_at: now });
  }, { mode: 'immediate' });
}

async function inquiry(request) {
  let values = {};
  const wantsJSON = request.headers.get('accept')?.includes('application/json') || request.headers.get('content-type')?.includes('application/json');
  try {
    const origin = request.headers.get('origin');
    if (origin) {
      let source;
      try { source = new URL(origin); } catch { throw problem(403, 'Please submit this form from the website.'); }
      // A TLS reverse proxy preserves Host while its local Jam connection is HTTP.
      if (source.host !== new URL(request.url).host || !['http:', 'https:'].includes(source.protocol)) {
        throw problem(403, 'Please submit this form from the website.');
      }
    }
    const result = validate(await readInput(request));
    values = result.values;
    if (Object.keys(result.errors).length) throw problem(422, 'Please check the highlighted fields.', result.errors);
    if (!values.website) saveInquiry(values);
    if (wantsJSON) return json({ ok: true }, 201);
    return new Response(null, { status: 303, headers: { ...baseHeaders, location: '/consulting/thanks' } });
  } catch (error) {
    let status = error.status;
    let message = error.message;
    if (!Number.isInteger(status) || status < 400 || status > 599) {
      status = String(error.code).startsWith('SQLITE_BUSY') ? 503 : 500;
      message = status === 503 ? 'The inbox is busy. Please try again shortly.' : 'Your inquiry could not be saved. Please try again.';
      console.error('Inquiry storage failed:', error.code || error.name);
    }
    if (wantsJSON) return json({ message, errors: error.errors || {} }, status, status === 429 ? { 'retry-after': '3600' } : {});
    const id = error.errors?.id ? crypto.randomUUID() : values.id || crypto.randomUUID();
    return html(consulting(id, values, error.errors, message), status);
  }
}

async function asset(request, asset) {
  if (!asset.etag) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(asset.body));
    asset.etag = `"${new Uint8Array(digest).toHex()}"`;
  }
  const headers = { ...baseHeaders, 'content-type': asset.type, 'cache-control': 'public, max-age=0, must-revalidate', etag: asset.etag };
  const tags = request.headers.get('if-none-match')?.split(',').map(value => value.trim().replace(/^W\//, '')) || [];
  if (tags.includes('*') || tags.includes(asset.etag)) return new Response(null, { status: 304, headers });
  return new Response(asset.body, { headers });
}

function feed(origin) {
  const items = posts.map(post => `<item><title>${escape(`[Preview draft] ${post.title}`)}</title><link>${origin}/writing/${post.slug}</link><guid isPermaLink="true">${origin}/writing/${post.slug}</guid><description>${escape(post.summary)}</description><category>${escape(post.category)}</category><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Creationix — preview writing</title><link>${origin}/writing</link><description>Proposed draft copy for review. Not previously published articles.</description><language>en</language>${items}</channel></rss>`;
}

export async function http(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/inquiries') {
    if (request.method !== 'POST') return json({ message: 'Use POST to submit an inquiry.' }, 405, { allow: 'POST' });
    return inquiry(request);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ message: 'Use GET or HEAD for this page.' }, 405, { allow: 'GET, HEAD' });
  if (assets.has(path)) return asset(request, assets.get(path));
  if (path === '/') return html(home());
  if (path === '/writing') return html(writing((url.searchParams.get('q') || '').slice(0, 100), url.searchParams.get('topic') || ''));
  if (path.startsWith('/writing/')) {
    const post = posts.find(post => path === `/writing/${post.slug}`);
    return post ? html(article(post)) : html(notFound(), 404);
  }
  if (path === '/projects') return html(projectList(url.searchParams.get('category') || ''));
  if (path === '/about') return html(about());
  if (path === '/consulting') return html(consulting(crypto.randomUUID()));
  if (path === '/consulting/thanks') return html(thanks());
  if (path === '/privacy') return html(privacy());
  if (path === '/api/projects') return json({ projects: projects.filter(project => !url.searchParams.has('category') || project.category === url.searchParams.get('category')) });
  if (path === '/healthz') return json({ status: db.prepare('SELECT 1 AS healthy').get().healthy === 1 ? 'ok' : 'error' });
  // Keep drafts and this staging deployment out of search indexes.
  if (path === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { ...baseHeaders, 'content-type': 'text/plain; charset=utf-8' } });
  if (path === '/feed.xml') return new Response(feed(escape(request.headers.get('x-forwarded-proto') === 'https' ? url.origin.replace(/^http:/, 'https:') : url.origin)), { headers: { ...baseHeaders, 'content-type': 'application/rss+xml; charset=utf-8' } });
  return html(notFound(), 404);
}
