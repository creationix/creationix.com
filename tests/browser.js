// Browser QA uses Chrome's native DevTools protocol; no package dependencies.
// SITE_ORIGIN=http://127.0.0.1:3100 bun tests/browser.js
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const origin = process.env.SITE_ORIGIN || 'http://127.0.0.1:3100';
const directory = await mkdtemp(join(tmpdir(), 'creationix-chrome-'));
const chrome = Bun.spawn([process.env.CHROME_BIN || '/opt/google/chrome/chrome', '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${directory}`, 'about:blank'], { stdout: 'ignore', stderr: 'pipe' });
let socket;
try {
  const reader = chrome.stderr.getReader();
  const decoder = new TextDecoder();
  let log = '';
  let endpoint;
  const timeout = setTimeout(() => chrome.kill(), 45000);
  try {
    while (!endpoint) {
      const { value, done } = await reader.read();
      if (done) throw new Error(`Chrome exited before readiness: ${log}`);
      log += decoder.decode(value, { stream: true });
      endpoint = log.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];
    }
  } finally { clearTimeout(timeout); }
  // Keep draining Chrome's diagnostics so its pipe cannot fill.
  void (async () => { while (!(await reader.read()).done) {} })().catch(() => {});
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const events = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const call = pending.get(message.id);
      if (!call) return;
      pending.delete(message.id);
      message.error ? call.reject(new Error(JSON.stringify(message.error))) : call.resolve(message.result);
    } else {
      const key = `${message.sessionId || ''}:${message.method}`;
      const callbacks = events.get(key) || [];
      events.delete(key);
      callbacks.forEach(resolve => resolve(message.params));
    }
  };
  const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const guard = setTimeout(() => { pending.delete(id); reject(new Error(`DevTools hang guard: ${method}`)); }, 30000);
    pending.set(id, { resolve: result => { clearTimeout(guard); resolve(result); }, reject: error => { clearTimeout(guard); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
  const cdp = (method, params) => call(method, params, sessionId);
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  const loaded = () => new Promise((resolve, reject) => {
    const guard = setTimeout(() => reject(new Error('Page load hang guard')), 30000);
    events.set(`${sessionId}:Page.loadEventFired`, [result => { clearTimeout(guard); resolve(result); }]);
  });
  const navigate = async path => { const ready = loaded(); await cdp('Page.navigate', { url: origin + path }); await ready; };
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await mkdir('.cache/screenshots', { recursive: true });
  async function screenshot(name) {
    const metrics = await cdp('Page.getLayoutMetrics');
    const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 } });
    await writeFile(`.cache/screenshots/${name}.png`, Buffer.from(data, 'base64'));
  }
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await navigate('/');
  assert.match(await evaluate('document.querySelector("h1").textContent'), /Less machinery/);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".mobile-navigation")).display'), 'none');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate('document.activeElement.classList.contains("skip")'), true);
  await evaluate('document.activeElement.blur()');
  await screenshot('desktop-home');
  await navigate('/consulting');
  await screenshot('desktop-consulting');
  // Native browser validation and enhanced fetch submission both participate.
  assert.equal(await evaluate('document.querySelector("form").checkValidity()'), false);
  const submitted = loaded();
  await evaluate(`(() => {
    const form = document.querySelector('[data-contact-form]');
    form.elements.name.value = 'Browser Test';
    form.elements.email.value = 'browser-' + crypto.randomUUID() + '@example.test';
    form.elements.message.value = 'A browser test exercising the real consulting inquiry flow.';
    form.elements.consent.checked = true;
    form.requestSubmit();
  })()`);
  await submitted;
  assert.equal(await evaluate('location.pathname'), '/consulting/thanks');
  assert.match(await evaluate('document.querySelector("h1").textContent'), /good place to start/);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate('/');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#navigation")).display'), 'none');
  await evaluate('document.querySelector(".menu-toggle").click()');
  assert.equal(await evaluate('document.querySelector(".mobile-navigation").open'), true);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#navigation")).display'), 'flex');
  await evaluate('document.querySelector(".menu-toggle").click()');
  await evaluate('document.querySelector(".menu-toggle").focus()');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  assert.equal(await evaluate('document.querySelector(".mobile-navigation").open'), true);
  await evaluate('document.querySelector(".menu-toggle").click(); document.activeElement.blur()');
  await screenshot('mobile-home');
  await navigate('/writing');
  const searchLoaded = loaded();
  await evaluate('document.querySelector("input[name=q]").value = "runtime"; document.querySelector("form.search").requestSubmit()');
  await searchLoaded;
  assert.match(await evaluate('location.search'), /q=runtime/);
  assert.equal(await evaluate('document.querySelectorAll(".writing-row").length'), 1);
  await screenshot('mobile-writing');
  // Core routes remain usable without scripts, including a normal form POST.
  await cdp('Emulation.setScriptExecutionDisabled', { value: true });
  await navigate('/consulting');
  const root = (await cdp('DOM.getDocument')).root.nodeId;
  const node = async selector => (await cdp('DOM.querySelector', { nodeId: root, selector })).nodeId;
  const click = async selector => {
    const nodeId = await node(selector);
    await cdp('DOM.scrollIntoViewIfNeeded', { nodeId });
    const { model } = await cdp('DOM.getBoxModel', { nodeId });
    const x = (model.content[0] + model.content[4]) / 2;
    const y = (model.content[1] + model.content[5]) / 2;
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  };
  await click('.menu-toggle');
  const attributes = (await cdp('DOM.getAttributes', { nodeId: await node('.mobile-navigation') })).attributes;
  assert.equal(attributes.includes('open'), true, 'native mobile menu opens without JavaScript');
  await click('.menu-toggle');
  for (const [selector, text] of [
    ['#name', 'No JavaScript Test'],
    ['#email', 'native-' + crypto.randomUUID() + '@example.test'],
    ['#message', 'A browser submission using native HTML with scripting disabled.'],
  ]) {
    await cdp('DOM.focus', { nodeId: await node(selector) });
    await cdp('Input.insertText', { text });
  }
  await click('input[name=consent]');
  const nativeSubmitted = loaded();
  await click('button[type=submit]');
  await nativeSubmitted;
  const history = await cdp('Page.getNavigationHistory');
  assert.equal(new URL(history.entries[history.currentIndex].url).pathname, '/consulting/thanks');
  await cdp('Emulation.setScriptExecutionDisabled', { value: false });
  await navigate('/projects?category=Foundations');
  assert.equal(await evaluate('document.querySelectorAll(".project").length'), 3);
  console.log('Desktop/mobile rendering, menu, writing search and the real inquiry submission passed. Screenshots: .cache/screenshots/');
} finally {
  socket?.close();
  chrome.kill();
  await chrome.exited;
  await rm(directory, { recursive: true, force: true });
}
