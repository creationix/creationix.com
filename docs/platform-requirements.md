# What creationix.com needs from revision.studio

The goal is to build creationix.com on revision.studio. This document lists
everything the site needs from the platform, so the platform can be designed
with a real public website in mind.

Where it comes from:

- **Site goals:** what Tim said creationix.com should be (September 2026).
- **Platform state:** revision.studio's current design, as of commit
  `9cf5de2` on the branch `claude/youthful-allen-desrax`: `docs/vision.md`,
  `docs/architecture.md` and `docs/recipes.md`. Older revision.studio repos
  were ignored on purpose because they're out of date.

How to read the tables:

- **Priority:**
  - **Must**: needed at launch
  - **Should**: needed soon after
  - **Could**: nice to have
- **Hub today:** what the platform already has.
  - **exists**: done
  - **partial**: a similar mechanism exists but doesn't cover this yet
  - **planned**: listed in the architecture's next steps
  - **missing**: not there at all

## What the site is

1. **Writing.** One stream of posts: technical posts, stories from building
   a homestead in the Arkansas mountains, and thoughts on life and principles.
2. **Portfolio.** A showcase of past projects.
3. **Hire me.** A page where people can get in touch about contract or
   consulting work.
4. **Product pages.** Sections for early products that don't have their own
   domain yet. They'll get one later.
5. **Live features.** A count of people on the current page, and maybe live
   cursors, like the demo from 2010.
6. **Lean and customizable.** Tim owns all of the code. Only a few tools, each
   picked on purpose rather than taken as a default.

The site also has to keep what exists today: two posts from 2016, their URLs,
`/rss/`, and `/.well-known/nostr.json` (for NIP-05, the Nostr identity check).

The biggest difference from the hub's current audience: the hub is designed
around **trusted, enrolled household devices**. A website is mostly
**anonymous public visitors**, it needs to be **found by search engines**,
and it **must stay up when the house is offline**.

---

## 1. Content model

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| C1 | Write in Markdown with front matter, with raw HTML allowed as an escape hatch | Must | missing (the hub only serves recipe files) |
| C2 | Typed collections: `post`, `project`, `product`, `page`, each with its own fields (for example a project has years, role, status, links and a hero image) | Must | partial (generic `(kind, id)` records, no schemas) |
| C3 | Tags or topics (tech, homestead, life), with a listing page and a feed for each topic | Must | missing |
| C4 | Links between items: a post about a project, a project that has a product page | Should | partial (records exist, links between them don't) |
| C5 | Images and files kept with the item that uses them | Must | exists (content-addressed blobs) |
| C6 | Image processing: resize, create modern formats, record dimensions, and **always remove EXIF and GPS data** | Must | missing |
| C7 | Full history of every change, and rolling back any of it | Must | exists (drives) |
| C8 | Drafts that stay private, plus scheduled publishing | Should | partial (drives, jobs and circles are the right building blocks) |
| C9 | Import older content with its original URLs and dates | Must | missing |

## 2. Authoring

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| A1 | Write in any editor with plain files, and have them sync into the drive as revisions | Must | partial (recipe folders are imported when the hub starts) |
| A2 | Local preview that reloads on every change and matches production exactly | Must | partial (`bun --watch`) |
| A3 | Publishing moves a "public" pointer to a new revision. Rolling back moves it back with one action. | Must | partial (drive heads exist; there's no separate public pointer) |
| A4 | Draft or edit posts from a phone, including photos taken outside on the homestead | Should | missing |
| A5 | An agent drafts or edits content, and Tim approves before anything goes public | Could | planned (agent loop) |
| A6 | Preview links for drafts that can be shared with specific people | Could | partial (circles) |

## 3. Public serving

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| P1 | Anonymous visitors get **finished HTML**: readable without JavaScript and indexable by search engines | Must | missing (recipes build their pages in the browser) |
| P2 | **The site stays up when the home hub or its internet connection is down.** Published revisions are copied to an edge server or CDN. | Must | planned in part (replication and publishing are in the vision) |
| P3 | Custom domains with automatic TLS certificates, with each domain pointing at its own drive: creationix.com, product subdomains, and product domains later on | Must | missing |
| P4 | Routing: clean URLs, redirects (at least the kind that can be set up as data), a real 404 page with a 404 status, canonical URLs | Must | missing |
| P5 | Caching: files named by their hash are cached forever; HTML is cached briefly or cleared when a new revision is published | Must | partial (hash-addressed blobs) |
| P6 | Atom feed (JSON Feed optional), sitemap, `robots.txt`, Open Graph and social tags | Must | missing |
| P7 | Arbitrary files at fixed paths, such as `/.well-known/nostr.json` with `Access-Control-Allow-Origin: *` | Must | missing |
| P8 | Size budget: an article page is under 50 KB of HTML and CSS, not counting images, and needs no JavaScript to read | Should | n/a |

## 4. Product sections

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| S1 | A product section can bring its own layout, CSS and JavaScript, fully separate from the rest of the site | Must | partial (recipes are self-contained, but only for household use) |
| S2 | A section can choose to use the shared site header and footer, or ignore them | Should | missing |
| S3 | **Moving a product out:** give a section its own domain and redirect the old paths, with no content changes | Should | missing |
| S4 | Keep untrusted or experimental product code away from the main site's cookies and admin, for example with a separate origin for each product | Should | missing |

## 5. Live and interactive features

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| R1 | A WebSocket feature for recipes and pages: rooms named after the page's path, with join, leave and broadcast | Must (if live features ship) | missing |
| R2 | A live count of people on the current page | Should | missing |
| R3 | Live cursors: many small updates per second, never stored, positions measured relative to the article column | Could | missing |
| R4 | Anonymous visitors get a temporary identity with no cookie tracking | Must | missing (the only identities are enrolled devices) |
| R5 | Abuse limits: connections per IP, messages per second, message size, and an off switch per page | Must | missing |
| R6 | Graceful fallback: pages work the same when the socket is down | Must | n/a |
| R7 | Pages can opt in, readers can turn features off, and `prefers-reduced-motion` is respected | Should | n/a |

## 6. Contact / hire me

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| F1 | **Public visitors can submit, but not read:** anyone can create an `inquiry` record; only Tim can read them | Must | missing (today being able to write a kind means being able to read it, and access depends on who you are, not on the action) |
| F2 | Spam protection: a hidden honeypot field, rate limits, and optionally a proof-of-work or Turnstile challenge | Must | missing |
| F3 | A notification feature so Tim hears about new submissions, by email or push | Must | missing |
| F4 | An inbox page for Tim, visible to the household only | Should | easy once F1 exists |
| F5 | An availability status on the hire page ("booking from March"), editable as data | Should | partial (records) |
| F6 | An optional booking link or calendar | Could | missing |

## 7. Security and privacy

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| X1 | Household data is never reachable from the public site. Public content lives in its own drive. | Must | partial (the rule that anything outside your circle returns 404) |
| X2 | No third-party tracking. Optional visit counts per page, computed on the server and never tied to people. | Should | missing |
| X3 | A Content Security Policy, plus escaping or sanitising of anything the public submits | Must | missing |
| X4 | Storage for secrets such as email and DNS API keys, kept outside records | Must | missing (the recipe guide says not to put secrets in records) |
| X5 | Admin actions require an enrolled device, and nothing is protected by being on the LAN alone | Must | exists |

## 8. Operations

| ID | Requirement | Priority | Hub today |
|---|---|---|---|
| O1 | **Static export:** the published site can be written out as plain files, so any host can serve it. This is the guard against lock-in. | Must | missing |
| O2 | Off-site backup of drives | Must | planned (replication) |
| O3 | An alert when the public site or the hub goes down | Should | missing |
| O4 | Updating the hub software is one command and can be undone | Should | missing |
| O5 | The same code runs on a laptop in development and on the hub or edge in production | Must | partial |

---

## Design tensions to settle

1. **A home hub vs. a site that must stay up.** Rural Arkansas internet
   isn't reliable. Suggestion: the hub stays the place where content is
   written and stored. Publishing sends the immutable blobs, plus a public
   pointer, to an edge server. The edge serves the files without running
   any code. The vision already has the pieces for this: content addressing
   and "publishing to the public" as a paid feature. creationix.com would be
   the first real test of it.
2. **Pages built in the browser vs. crawlable HTML.** Recipes render in the
   browser today. A public site needs HTML rendered in advance. Rendering
   when content is **published** (Markdown plus templates, turned into a
   tree of HTML files) avoids running recipe code when a visitor makes a
   request. It also answers part of "how server-side recipe code runs" for
   now: at publish time, inside a sandbox, with no network access.
3. **Circles vs. per-action permissions.** Circles answer *who you are*.
   The public site also needs *what you can do* for each record kind: the
   public can create inquiries but can't read them. Changing `reads` and
   `writes` in `recipe.json` to take a circle for each action would cover
   it.
4. **Where live rooms run.** Running them on the hub is simplest: one
   process, rooms in memory. But every visitor would connect through the
   tunnel to a home connection. Running them on the edge (for example
   Cloudflare Durable Objects, which keep state for each room) scales
   better and keeps working when the house is offline, but adds a second
   runtime. Since live features are for fun, one option is to run them on
   the hub and let them disappear when it's down.
5. **One origin or many.** Product sections with their own JavaScript on
   creationix.com share cookies and storage with the main site. A subdomain
   for each product (`<product>.creationix.com`) keeps them apart and makes
   moving a product to its own domain easy later (S3, S4).

## Suggested order

Each step gives creationix.com something it can ship:

1. **Rendering at publish time and static export** (C1–C3, C6, C9, P1,
   P4, P6, O1). creationix.com can launch with just this, hosted anywhere.
2. **Public edge serving from a drive, with custom domains** (P2, P3, P5, P7).
3. **Public submit-only records and notifications**, which bring the hire
   form (F1–F3).
4. **The live rooms feature**, starting with the page count and then cursors
   (R1–R7).
5. **Product sections and moving a product to its own domain** (S1–S4).
6. **Writing from a phone and the agent loop** (A4, A5).

## Open questions for Tim

- Should creationix.com launch on step 1 alone while the platform catches
  up, or wait until it's served from a drive?
- Is it acceptable for live features to disappear when the house is offline?
- Should the edge be Cloudflare, or something you run yourself?
- Should the website be one household's public face on the hub, or a
  separate kind of thing ("sites" alongside "recipes")?
- Which projects go in the portfolio? Should they be drafted from your
  GitHub for you to edit?
- Should inquiries go to email, or only to an inbox on the hub?
