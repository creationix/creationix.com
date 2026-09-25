import { test } from "node:test";
import assert from "node:assert/strict";
import { inline, render } from "../lib/markdown.js";

const md = (s, o) => render(s, o).trim();

test("paragraphs, headings and rules", () => {
  assert.equal(md("# Hi *there*\n\none\ntwo\n\n---"), '<h1 id="hi-there">Hi <em>there</em></h1>\n<p>one\ntwo</p>\n<hr>');
});

test("inline formatting", () => {
  assert.equal(inline("**b** *i* `a<b` snake_case_name"), "<strong>b</strong> <em>i</em> <code>a&lt;b</code> snake_case_name");
  assert.equal(inline("*a **b** c*"), "<em>a <strong>b</strong> c</em>");
  assert.equal(inline("5 < 6 & \\*x\\*"), "5 &lt; 6 &amp; *x*");
  assert.equal(inline("line  \nbreak"), "line<br>\nbreak");
  assert.equal(inline("keep &amp; <kbd>raw</kbd>"), "keep &amp; <kbd>raw</kbd>");
});

test("links and images", () => {
  assert.equal(inline("[Ohm's](https://en.wikipedia.org/wiki/Ohm's_law)"),
    '<a href="https://en.wikipedia.org/wiki/Ohm\'s_law">Ohm\'s</a>');
  assert.equal(inline("[x](https://e.com/a_(b) \"T\")"), '<a href="https://e.com/a_(b)" title="T">x</a>');
  assert.equal(inline("<https://e.com?a=1&b=2>"), '<a href="https://e.com?a=1&amp;b=2">https://e.com?a=1&amp;b=2</a>');
  assert.equal(inline("[![a](i.png)](/x)"), '<a href="/x"><img src="i.png" alt="a" loading="lazy" decoding="async"></a>');
});

test("lone image becomes a figure; relative urls resolve", () => {
  const resolve = (u) => (u.startsWith("/") ? u : `/post/${u}`);
  assert.equal(md('![alt](p.jpg "Caption")', { resolve }),
    '<figure><img src="/post/p.jpg" alt="alt" loading="lazy" decoding="async"><figcaption>Caption</figcaption></figure>');
});

test("lists", () => {
  assert.equal(md("- a\n- b\n  - c\n\n1. x"), "<ul>\n<li>a</li>\n<li>b\n<ul>\n<li>c</li>\n</ul></li>\n</ul>\n<ol>\n<li>x</li>\n</ol>");
  assert.equal(md("3. a\n\n4. b"), '<ol start="3">\n<li><p>a</p></li>\n<li><p>b</p></li>\n</ol>');
});

test("code, quotes, html and tables", () => {
  assert.equal(md("```js\nif (a < b) {}\n```"), '<pre><code class="language-js">if (a &lt; b) {}\n</code></pre>');
  assert.equal(md("> quoted\n> text"), "<blockquote>\n<p>quoted\ntext</p>\n</blockquote>");
  assert.equal(md('<div class="x">\n*raw*\n</div>'), '<div class="x">\n*raw*\n</div>');
  assert.equal(md("| a | b |\n|---|--:|\n| 1 | 2 |"),
    '<table>\n<thead><tr><th>a</th><th style="text-align:right">b</th></tr></thead>\n<tbody>\n<tr><td>1</td><td style="text-align:right">2</td></tr>\n</tbody>\n</table>');
});
