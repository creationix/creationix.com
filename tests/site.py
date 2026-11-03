#!/usr/bin/env python3
"""Exercise the application through the real Jam server and an isolated database."""
import concurrent.futures
import http.client
import json
import os
from pathlib import Path
import selectors
import signal
import sqlite3
import subprocess
import tempfile
import unittest
import urllib.parse
import uuid
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
JAM = os.environ.get('JAM_BIN', 'jam')


class SiteTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory(prefix='creationix-test-')
        cls.database = Path(cls.directory.name) / 'site.db'
        cls.config = Path(cls.directory.name) / 'jam.json'
        cls.config.write_text(json.dumps({
            'limits': {'memory': '128mb', 'cpu': '2s', 'time': '15s'},
            'sqlite': {'db': {'path': str(cls.database), 'busyTimeout': '2s'}},
        }))
        cls.start()

    @classmethod
    def start(cls):
        cls.process = subprocess.Popen(
            [JAM, 'serve', '--config', str(cls.config), '--listen', '127.0.0.1:0', '--workers', '4', str(ROOT / 'app.js')],
            cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True,
        )
        selector = selectors.DefaultSelector()
        selector.register(cls.process.stderr, selectors.EVENT_READ)
        try:
            if not selector.select(30):
                raise AssertionError('Jam did not report startup under the hang guard')
            line = cls.process.stderr.readline()
            if not line.startswith('jam: listening on '):
                raise AssertionError(f'Jam startup failed: {line}')
            cls.origin = line.strip().removeprefix('jam: listening on ')
            cls.address = urllib.parse.urlsplit(cls.origin).netloc
        except BaseException:
            cls.process.kill()
            cls.process.wait()
            raise
        finally:
            selector.close()

    @classmethod
    def stop(cls):
        cls.process.send_signal(signal.SIGTERM)
        _, stderr = cls.process.communicate(timeout=30)
        if cls.process.returncode != 0 or stderr:
            raise AssertionError(f'Jam exit {cls.process.returncode}: {stderr}')

    @classmethod
    def tearDownClass(cls):
        try:
            cls.stop()
        finally:
            cls.directory.cleanup()

    @classmethod
    def request(cls, method, path, data=None, headers=None, chunked=False):
        connection = http.client.HTTPConnection(cls.address, timeout=25)
        try:
            connection.request(method, path, body=data, headers=headers or {}, encode_chunked=chunked)
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), response.read()
        finally:
            connection.close()

    def payload(self, **changes):
        return {
            'id': str(uuid.uuid4()), 'name': 'Test Person',
            'email': f'test-{uuid.uuid4()}@example.test', 'company': 'Test project',
            'service': 'Architecture & simplification', 'budget': 'Let’s discuss',
            'timeline': 'Exploring possibilities',
            'message': 'A test inquiry about making a real application simpler.',
            'consent': 'yes', **changes,
        }

    def submit(self, payload, headers=None):
        return self.request('POST', '/inquiries', json.dumps(payload).encode(), {
            'content-type': 'application/json', 'accept': 'application/json', **(headers or {}),
        })

    def test_pages_and_errors(self):
        for path in ['/', '/writing', '/projects', '/about', '/consulting', '/consulting/thanks', '/privacy']:
            with self.subTest(path=path):
                status, headers, body = self.request('GET', path)
                self.assertEqual(status, 200)
                self.assertIn('text/html', headers['content-type'])
                self.assertIn(b'<main id="main">', body)
                self.assertIn('frame-ancestors', headers['content-security-policy'])
                self.assertEqual(headers['cache-control'], 'no-store')
                self.assertEqual(headers['x-content-type-options'], 'nosniff')
        self.assertEqual(self.request('GET', '/missing')[0], 404)
        self.assertEqual(self.request('GET', '/writing/missing')[0], 404)
        status, headers, _ = self.request('POST', '/about')
        self.assertEqual(status, 405)
        self.assertEqual(headers['allow'], 'GET, HEAD')
        status, headers, _ = self.request('GET', '/inquiries')
        self.assertEqual(status, 405)
        self.assertEqual(headers['allow'], 'POST')
        self.assertEqual(self.request('GET', '/healthz')[2], b'{"status":"ok"}')

    def test_writing_search_and_escaping(self):
        _, _, body = self.request('GET', '/writing?q=runtime')
        self.assertIn(b'A small runtime.', body)
        _, _, body = self.request('GET', '/writing?topic=Performance')
        self.assertIn(b'Measure the work', body)
        self.assertNotIn(b'The best code is', body)
        _, _, body = self.request('GET', '/writing?q=' + urllib.parse.quote('<script>alert(1)</script>'))
        self.assertIn(b'No notes found.', body)
        self.assertNotIn(b'<script>alert(1)</script>', body)
        self.assertIn(b'&lt;script&gt;', body)
        _, _, body = self.request('GET', '/writing/radical-simplification')
        self.assertIn(b'Preview draft', body)

    def test_projects_and_rss(self):
        status, _, body = self.request('GET', '/api/projects?category=Foundations')
        self.assertEqual(status, 200)
        self.assertEqual([p['name'] for p in json.loads(body)['projects']], ['Architect', 'Smith', 'VFS'])
        _, _, body = self.request('GET', '/projects?category=Tools')
        self.assertIn(b'js-git', body)
        self.assertNotIn(b'<h3><a href="https://github.com/luvit/luvit">', body)
        status, headers, body = self.request('GET', '/feed.xml')
        self.assertEqual(status, 200)
        self.assertIn('application/rss+xml', headers['content-type'])
        channel = ET.fromstring(body).find('channel')
        self.assertEqual(len(channel.findall('item')), 3)
        self.assertTrue(all('[Preview draft]' in item.findtext('title') for item in channel.findall('item')))
        self.assertIn(b'Disallow: /', self.request('GET', '/robots.txt')[2])

    def test_assets_etags_and_head(self):
        for path in ['/assets/site.css', '/assets/site.js', '/favicon.svg']:
            with self.subTest(path=path):
                status, headers, body = self.request('GET', path)
                self.assertEqual(status, 200)
                self.assertTrue(body)
                etag = headers['etag']
                for match in [etag, 'W/' + etag, '"another", ' + etag, '*']:
                    status, cached_headers, cached = self.request('GET', path, headers={'if-none-match': match})
                    self.assertEqual(status, 304)
                    self.assertEqual(cached, b'')
                    self.assertEqual(cached_headers['etag'], etag)
                status, head_headers, head = self.request('HEAD', path)
                self.assertEqual(status, 200)
                self.assertEqual(head, b'')
                self.assertEqual(int(head_headers['content-length']), len(body))
        self.assertEqual(self.request('HEAD', '/')[2], b'')

    def test_validation_and_origin(self):
        for changes, field in [({'email': 'bad'}, 'email'), ({'message': 'short'}, 'message'), ({'consent': ''}, 'consent'), ({'name': ''}, 'name'), ({'service': 'Invented'}, 'service'), ({'id': 'invalid'}, 'id')]:
            status, _, body = self.submit(self.payload(**changes))
            self.assertEqual(status, 422)
            self.assertIn(field, json.loads(body)['errors'])
        self.assertEqual(self.submit(self.payload(), {'origin': 'https://elsewhere.test'})[0], 403)
        self.assertEqual(self.submit(self.payload(), {'origin': 'null'})[0], 403)
        self.assertEqual(self.submit(self.payload(), {'origin': self.origin})[0], 201)
        self.assertEqual(self.request('POST', '/inquiries', b'broken', {'content-type': 'application/json'})[0], 400)
        self.assertEqual(self.request('POST', '/inquiries', b'\xff', {'content-type': 'application/json'})[0], 400)
        self.assertEqual(self.request('POST', '/inquiries', b'hello', {'content-type': 'text/plain'})[0], 415)

    def test_form_redirect_and_error_preserves_values(self):
        payload = self.payload(name="O'Reilly <script>bad()</script>")
        status, headers, _ = self.request('POST', '/inquiries', urllib.parse.urlencode(payload).encode(), {'content-type': 'application/x-www-form-urlencoded'})
        self.assertEqual(status, 303)
        self.assertEqual(headers['location'], '/consulting/thanks')
        payload.update(id=str(uuid.uuid4()), email='invalid')
        status, _, body = self.request('POST', '/inquiries', urllib.parse.urlencode(payload).encode(), {'content-type': 'application/x-www-form-urlencoded'})
        self.assertEqual(status, 422)
        self.assertIn(b'&lt;script&gt;bad()&lt;/script&gt;', body)
        self.assertNotIn(b'<script>bad()</script>', body)
        self.assertIn(b'aria-invalid="true"', body)

    def test_body_bounds_including_chunked(self):
        data = json.dumps(self.payload(message='x' * 20000)).encode()
        self.assertEqual(self.request('POST', '/inquiries', data, {'content-type': 'application/json'})[0], 413)
        chunks = [data[index:index + 4096] for index in range(0, len(data), 4096)]
        self.assertEqual(self.request('POST', '/inquiries', iter(chunks), {'content-type': 'application/json'}, chunked=True)[0], 413)
        self.assertEqual(self.request('GET', '/healthz')[0], 200)

    def test_duplicate_and_concurrent_submissions(self):
        payload = self.payload(message='Unicode survives storage: Ω, 日本語, 😀. ' * 3)
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.submit(payload)[0], range(12)))
        self.assertEqual(results, [201] * 12)
        with sqlite3.connect(self.database) as connection:
            rows = connection.execute('SELECT message FROM inquiries WHERE id = ?', [payload['id']]).fetchall()
        self.assertEqual(rows, [(payload['message'].strip(),)])
        self.assertEqual(self.submit({**payload, 'message': 'Different content submitted with the same form ID.'})[0], 409)
        payloads = [self.payload() for _ in range(24)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            self.assertEqual(list(pool.map(lambda value: self.submit(value)[0], payloads)), [201] * len(payloads))
        with sqlite3.connect(self.database) as connection:
            ids = {row[0] for row in connection.execute('SELECT id FROM inquiries')}
        self.assertTrue(all(value['id'] in ids for value in payloads))

    def test_email_limit_and_honeypot(self):
        email = f'limit-{uuid.uuid4()}@example.test'
        for _ in range(3):
            self.assertEqual(self.submit(self.payload(email=email))[0], 201)
        status, headers, _ = self.submit(self.payload(email=email))
        self.assertEqual(status, 429)
        self.assertEqual(headers['retry-after'], '3600')
        payload = self.payload(website='spam.example')
        self.assertEqual(self.submit(payload)[0], 201)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT count(*) FROM inquiries WHERE id = ?', [payload['id']]).fetchone()[0], 0)

    def test_retention_and_capacity(self):
        sample = self.payload()
        self.assertEqual(self.submit(sample)[0], 201)
        with sqlite3.connect(self.database) as connection:
            connection.execute('UPDATE inquiries SET created_at = 0 WHERE id = ?', [sample['id']])
        self.assertEqual(self.submit(self.payload())[0], 201)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT count(*) FROM inquiries WHERE id = ?', [sample['id']]).fetchone()[0], 0)
            # Fill only this isolated test DB; remove these rows before leaving.
            connection.execute("""WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<5000)
              INSERT INTO inquiries SELECT 'capacity-'||x, 'Test', 'capacity@example.test', '', 's', 'b', 't', 'm', 1, CAST(strftime('%s','now') AS INTEGER)*1000 FROM n""")
        try:
            self.assertEqual(self.submit(self.payload())[0], 503)
        finally:
            with sqlite3.connect(self.database) as connection:
                connection.execute("DELETE FROM inquiries WHERE id LIKE 'capacity-%'")

    def test_z_persistence_after_restart(self):
        payload = self.payload()
        self.assertEqual(self.submit(payload)[0], 201)
        self.stop()
        self.start()
        self.assertEqual(self.submit(payload)[0], 201)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT count(*) FROM inquiries WHERE id = ?', [payload['id']]).fetchone()[0], 1)
        # There is deliberately no HTTP endpoint for reading private inquiries.
        self.assertEqual(self.request('GET', '/api/inquiries')[0], 404)


if __name__ == '__main__':
    unittest.main(verbosity=2)
