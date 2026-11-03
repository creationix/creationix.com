# creationix.com, on Jam

A fresh website for Tim Caswell: landing page, writing with search and RSS, a curated project directory, and a consulting form backed by SQLite. The first deployment is a preview. Article copy is explicitly marked as proposed draft writing; the inquiry flow stores test submissions but does not send email.

The application uses Jam's web APIs and native SQLite binding. There is no Node compatibility layer, runtime package dependency, bundler or client framework. HTML is rendered on the server; navigation, search, filters and form submission work without browser JavaScript. The mobile menu uses native HTML. A small optional browser script adds inline form validation feedback.

## Run

Use the single-process Jam build from `mjackson/jam` PR148, at least `57b88bc`. Create `data/`, then:

```sh
jam serve --config jam.json app.js
# http://127.0.0.1:3000

jam dev --config jam.json --workers 4 app.js
```

The default pool is two JS workers per available CPU. Database connections belong to those workers and run concurrently. The schema is created idempotently. No transaction crosses an asynchronous task boundary.

## Test

```sh
JAM_BIN=/absolute/path/to/jam python3 tests/site.py
```

The test launches its own four-worker server with an isolated temporary database. It checks page routes, search/filtering, drafts, RSS, security headers, ETag/HEAD behavior, validation, body limits, duplicate submissions, concurrent writes and persistence across a server restart. The public API cannot list inquiries.

For browser checks, start the app and run `SITE_ORIGIN=http://127.0.0.1:3000 bun tests/browser.js`. The script uses an installed Chrome binary (override with `CHROME_BIN`) to check desktop/mobile layout, navigation and both enhanced and plain HTML form submissions. Screenshots stay in ignored `.cache/screenshots/`.

## Content and inquiries

Edit `content.js` for writing and project metadata, and `views.js` for page copy. Writing is draft copy pending Tim's review. No old blog content or subscribers are imported.

The consulting form accepts URL-encoded forms or JSON at `POST /inquiries`. It validates and bounds inputs, uses parameterized SQL, deduplicates retries by form ID, and caps inquiries per email and in aggregate. A honeypot catches simple form bots. These measures do not replace infrastructure abuse controls for a public production funnel. Inquiries expire after 90 days; cleanup happens during a new submission.

To review the latest 100 inquiries on the server:

```sh
jam run --config jam.json scripts/inquiries.js
```

This prints contact details. Run it only in a private operator terminal. Back up the SQLite database before deploying production content. Email notifications and real production copy are intentionally pending setup/review.

## Deployment

Run Jam under systemd with a writable data directory outside release code and a TLS reverse proxy. Jam owns application HTTP parsing and SQLite; the proxy provides the public certificate. The preview must keep its own database and hostname. `robots.txt` disallows indexing while draft content is present.

Application routes: `/`, `/writing`, `/writing/:slug`, `/projects`, `/about`, `/consulting`, `/consulting/thanks`, `/privacy`, `/feed.xml`. Operational routes: `/healthz`, `/api/projects`, `/inquiries`. Assets have content-derived ETags and conditional GET support. Pages and form responses use `no-store`.
