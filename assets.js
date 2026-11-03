export const css = String.raw`
:root {
  --paper:#f6f5ef;
  --ink:#20392f;
  --muted:#657168;
  --line:#dcded3;
  --accent:#d6f98b;
  --white:#fffef9;
  --radius:12px;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:var(--ink);
  background:var(--paper);
  font-synthesis:none;
  font-size:16px;
  line-height:1.6;
  scroll-behavior:smooth
}
* {
  box-sizing:border-box
}
body {
  margin:0
}
a {
  color:inherit;
  text-decoration:none
}
a:hover {
  text-decoration:underline;
  text-underline-offset:5px
}
button,input,select,textarea {
  font:inherit
}
button,a,input,select,textarea {
  outline-offset:5px
}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible {
  outline:2px solid var(--ink)
}
::selection {
  background:var(--accent);
  color:var(--ink)
}
.wrap {
  width:min(1160px,calc(100% - 80px));
  margin:auto
}
.skip {
  position:absolute;
  top:-100px;
  left:20px;
  padding:12px;
  background:var(--accent);
  z-index:10
}
.skip:focus {
  top:12px
}
.site-header {
  height:112px;
  border-bottom:1px solid var(--line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:30px
}
.brand {
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:750;
  font-size:24px;
  letter-spacing:-1px
}
.brand svg {
  width:28px;
  height:28px
}
.nav {
  display:flex;
  align-items:center;
  gap:32px;
  font-size:14px
}
.nav [aria-current=page] {
  text-decoration:underline;
  text-underline-offset:7px
}
.nav .nav-contact {
  padding:10px 17px;
  border:1px solid var(--ink);
  border-radius:6px
}
.mobile-navigation {
  display:none
}
.hero {
  display:grid;
  grid-template-columns:1.35fr 1fr;
  gap:70px;
  align-items:center;
  padding:91px 0 84px
}
.eyebrow,.label {
  font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:1.5px;
  font-weight:500
}
.eyebrow {
  display:flex;
  align-items:center;
  gap:10px
}
.dot {
  width:7px;
  height:7px;
  border-radius:50%;
  background:#728748;
  display:inline-block
}
.hero h1 {
  font-family:Georgia,"Times New Roman",serif;
  font-size:clamp(54px,6.5vw,85px);
  font-weight:400;
  line-height:1.03;
  letter-spacing:-3.5px;
  margin:26px 0
}
.hero h1 em {
  font-weight:400;
  color:#6a8055
}
.lede {
  font-size:18px;
  line-height:1.75;
  max-width:510px;
  color:var(--muted)
}
.hero .lede {
  margin-bottom:29px
}
.button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:24px;
  border:1px solid var(--ink);
  padding:13px 20px;
  border-radius:6px;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  background:var(--ink);
  color:var(--white);
  text-align:center
}
.button:hover {
  text-decoration:none;
  background:#355344
}
.button.secondary {
  background:transparent;
  color:var(--ink)
}
.button.secondary:hover {
  background:#e9ecdf
}
.button-row {
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap
}
.quiet-link {
  font-size:14px;
  display:inline-flex;
  gap:14px;
  align-items:center
}
.hero-note {
  font-size:12px;
  color:var(--muted);
  margin-top:24px
}
.hero-art {
  background:var(--ink);
  color:var(--paper);
  border-radius:var(--radius);
  padding:27px 28px 25px;
  position:relative;
  overflow:hidden;
  min-height:370px
}
.art-top {
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-bottom:1px solid #ffffff25;
  padding-bottom:18px;
  color:#d3dece;
  font:10px ui-monospace,monospace;
  letter-spacing:1px
}
.window-dots {
  display:flex;
  gap:5px
}
.window-dots i {
  width:5px;
  height:5px;
  background:#92a68a;
  border-radius:50%
}
.art-diagram {
  width:100%;
  height:195px;
  margin:14px 0 0
}
.art-bottom {
  display:flex;
  justify-content:space-between;
  align-items:end
}
.art-quote {
  font:italic 28px/1.15 Georgia,serif;
  letter-spacing:-.5px;
  margin:0;
  max-width:245px
}
.art-counter {
  font:10px/1.5 ui-monospace,monospace;
  color:#c3d4b3;
  text-align:right
}
.intro-strip {
  border-top:1px solid var(--line);
  border-bottom:1px solid var(--line);
  display:grid;
  grid-template-columns:1fr 2fr;
  gap:50px;
  padding:25px 0 28px;
  align-items:center
}
.intro-strip p {
  margin:0;
  font-size:14px;
  line-height:1.8;
  color:var(--muted)
}
.intro-strip strong {
  color:var(--ink);
  font-weight:600
}
.section {
  padding:65px 0;
  border-bottom:1px solid var(--line)
}
.section-header {
  display:flex;
  align-items:end;
  justify-content:space-between;
  gap:24px;
  margin-bottom:29px
}
.section-header h2,.page-intro h1 {
  font:400 42px/1.15 Georgia,serif;
  letter-spacing:-1px;
  margin:8px 0 0
}
.section-header p {
  color:var(--muted);
  margin:8px 0 0;
  font-size:14px
}
.projects-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:18px
}
.project {
  border:1px solid var(--line);
  border-radius:var(--radius);
  padding:24px;
  background:var(--white);
  display:flex;
  flex-direction:column;
  min-height:258px;
  transition:transform .15s,border-color .15s
}
.project:hover {
  transform:translateY(-3px);
  border-color:#9aac8f
}
.project-top {
  display:flex;
  align-items:center;
  justify-content:space-between
}
.project-mark {
  height:44px;
  width:44px;
  display:grid;
  place-items:center;
  background:#edf0df;
  border-radius:9px;
  font:26px Georgia,serif
}
.project:nth-child(3n+2) .project-mark {
  background:#e1ebe5
}
.project:nth-child(3n) .project-mark {
  background:#efe3d4
}
.arrow {
  color:var(--muted);
  font-size:20px
}
.project h3 {
  font-size:20px;
  letter-spacing:-.5px;
  margin:21px 0 5px
}
.project p {
  font-size:14px;
  line-height:1.7;
  color:var(--muted);
  margin:0 0 22px
}
.project-bottom {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-top:auto;
  font:10px ui-monospace,monospace;
  color:var(--muted)
}
.tag {
  font:10px ui-monospace,monospace;
  border-radius:20px;
  padding:3px 8px;
  border:1px solid var(--line);
  white-space:nowrap
}
.writing-list {
  border-top:1px solid var(--line)
}
.writing-row {
  display:grid;
  grid-template-columns:100px 1fr 90px;
  gap:24px;
  align-items:center;
  padding:23px 0;
  border-bottom:1px solid var(--line)
}
.writing-row:last-child {
  border-bottom:0
}
.writing-row .topic {
  font:11px ui-monospace,monospace;
  color:var(--muted)
}
.writing-row h3 {
  font:400 24px/1.3 Georgia,serif;
  letter-spacing:-.4px;
  margin:0 0 6px
}
.writing-row p {
  font-size:13px;
  color:var(--muted);
  margin:0
}
.writing-meta {
  text-align:right;
  color:var(--muted);
  font-size:11px;
  line-height:1.8
}
.draft {
  font:10px ui-monospace,monospace;
  color:#6c754c
}
.consult-banner {
  display:grid;
  grid-template-columns:1fr auto;
  gap:35px;
  align-items:center;
  background:#e5ebd9;
  border-radius:var(--radius);
  padding:42px 45px;
  margin:60px 0
}
.consult-banner h2 {
  font:400 39px/1.15 Georgia,serif;
  letter-spacing:-1px;
  margin:9px 0 10px
}
.consult-banner p {
  font-size:14px;
  color:var(--muted);
  max-width:520px;
  margin:0
}
.site-footer {
  padding:30px 0 35px;
  display:flex;
  justify-content:space-between;
  gap:24px;
  font-size:12px;
  color:var(--muted);
  border-top:1px solid var(--line)
}
.footer-links {
  display:flex;
  gap:24px
}
.page-intro {
  padding:65px 0 42px;
  max-width:750px
}
.page-intro h1 {
  font-size:60px;
  letter-spacing:-2px;
  margin:16px 0
}
.page-intro p {
  font-size:17px;
  line-height:1.8;
  color:var(--muted)
}
.tools-row {
  display:flex;
  gap:20px;
  align-items:center;
  justify-content:space-between;
  margin:0 0 30px;
  flex-wrap:wrap
}
.filters {
  display:flex;
  gap:7px;
  flex-wrap:wrap
}
.filter {
  font-size:12px;
  padding:7px 13px;
  border:1px solid var(--line);
  border-radius:20px
}
.filter[aria-current=true],.filter:hover {
  background:var(--ink);
  border-color:var(--ink);
  color:var(--paper);
  text-decoration:none
}
.search {
  display:flex;
  border:1px solid #b7c0ae;
  border-radius:6px;
  overflow:hidden;
  background:var(--white)
}
.search input {
  min-width:0;
  width:210px;
  border:0;
  background:none;
  padding:9px 12px;
  font-size:13px
}
.search button {
  background:transparent;
  border:0;
  padding:8px 12px;
  color:var(--ink);
  cursor:pointer
}
.results-section {
  padding-bottom:65px;
  min-height:340px
}
.empty {
  padding:55px 20px;
  text-align:center;
  color:var(--muted);
  border:1px dashed var(--line);
  border-radius:var(--radius)
}
.article {
  max-width:720px;
  margin:0 auto;
  padding:60px 0 80px
}
.article h1 {
  font:400 clamp(38px,5vw,59px)/1.1 Georgia,serif;
  letter-spacing:-1.8px;
  margin:26px 0
}
.article .article-meta {
  font:12px ui-monospace,monospace;
  color:var(--muted);
  margin:20px 0 32px
}
.article-body {
  font:19px/1.9 Georgia,serif
}
.article-body p {
  margin:0 0 25px
}
.notice {
  padding:13px 17px;
  border:1px solid #d0d9bb;
  background:#eef1e3;
  border-radius:6px;
  font-size:12px;
  margin-bottom:30px;
  color:#586648
}
.article-end {
  padding-top:25px;
  border-top:1px solid var(--line);
  margin-top:35px
}
.consult-layout {
  display:grid;
  grid-template-columns:.85fr 1.15fr;
  gap:80px;
  padding-bottom:75px;
  align-items:start
}
.consult-copy h2 {
  font:400 32px Georgia,serif;
  letter-spacing:-.7px;
  margin-top:0
}
.service {
  padding:20px 0;
  border-top:1px solid var(--line)
}
.service h3 {
  font-size:15px;
  margin:0 0 7px
}
.service p {
  font-size:14px;
  color:var(--muted);
  margin:0
}
.contact-form {
  padding:32px;
  background:var(--white);
  border:1px solid var(--line);
  border-radius:var(--radius)
}
.contact-form h2 {
  font:400 29px Georgia,serif;
  margin:0 0 7px
}
.form-intro {
  font-size:13px;
  color:var(--muted);
  margin:0 0 23px
}
.field-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px
}
.field {
  margin-bottom:17px
}
.field label {
  display:block;
  font-size:12px;
  font-weight:600;
  margin-bottom:6px
}
.field input,.field select,.field textarea {
  display:block;
  width:100%;
  min-width:0;
  padding:10px 11px;
  border:1px solid #c9cfc1;
  background:#fffefb;
  border-radius:5px;
  font-size:14px;
  color:var(--ink)
}
.field textarea {
  resize:vertical;
  min-height:135px
}
.field .optional {
  font-weight:400;
  color:var(--muted)
}
.field [aria-invalid=true] {
  border-color:#a7543d
}
.field-error {
  font-size:12px;
  color:#9c442d;
  margin:4px 0 0
}
.consent {
  display:flex;
  gap:9px;
  align-items:start;
  font-size:11px;
  line-height:1.6;
  color:var(--muted);
  margin:4px 0 20px
}
.consent input {
  margin-top:3px
}
.form-note {
  font-size:10px;
  line-height:1.7;
  color:var(--muted);
  margin:14px 0 0
}
.honeypot {
  position:absolute;
  left:-10000px;
  width:1px;
  height:1px;
  overflow:hidden
}
.form-status {
  font-size:13px;
  margin-bottom:18px
}
.error-summary {
  padding:12px;
  border:1px solid #d9b5a7;
  border-radius:5px;
  background:#fff2ed;
  color:#843e2b;
  font-size:13px;
  margin-bottom:20px
}
.success-card {
  max-width:650px;
  padding:55px 0 100px
}
.success-icon {
  width:54px;
  height:54px;
  border-radius:50%;
  background:var(--accent);
  display:grid;
  place-items:center;
  font-size:25px
}
.success-card h1 {
  font:400 55px/1.1 Georgia,serif;
  letter-spacing:-1.5px
}
.success-card p {
  color:var(--muted);
  font-size:17px;
  line-height:1.8
}
.privacy {
  max-width:720px;
  padding-bottom:70px
}
.privacy h2 {
  font:400 28px Georgia,serif;
  margin-top:35px
}
.privacy p {
  color:var(--muted)
}
.preview-label {
  font:9px ui-monospace,monospace;
  letter-spacing:1px;
  border:1px solid #8b9d73;
  padding:3px 7px;
  border-radius:3px;
  color:#64734f
}
.preview-label-wrap {
  display:flex;
  align-items:center;
  gap:12px
}
.full-width {
  width:100%
}
@media(min-width:1600px) {
  .hero {
    padding-top:110px;
    padding-bottom:100px
  }
}
@media(max-width:900px) {
  .wrap {
    width:calc(100% - 48px)
  }
  .hero {
    gap:30px;
    padding:60px 0
  }
  .hero h1 {
    font-size:64px
  }
  .hero-art {
    padding:22px;
    min-height:340px
  }
  .art-quote {
    font-size:24px
  }
  .hero .lede {
    font-size:16px
  }
  .nav {
    gap:23px
  }
  .consult-layout {
    gap:35px
  }
  .projects-grid {
    gap:12px
  }
  .project {
    padding:20px
  }
  .consult-banner {
    padding:32px
  }
  .consult-banner h2 {
    font-size:33px
  }
}
@media(max-width:650px) {
  .wrap {
    width:calc(100% - 36px)
  }
  .site-header {
    height:84px;
    position:relative
  }
  .brand {
    font-size:22px
  }
  .brand svg {
    width:24px
  }
  .preview-label {
    display:none
  }
  .mobile-navigation {
    display:block;
  }
  .menu-toggle {
    display:block;
    list-style:none;
    cursor:pointer;
    border:1px solid var(--line);
    border-radius:5px;
    padding:7px 10px;
    background:none;
    color:var(--ink);
    font-size:12px
  }
  .nav {
    display:none;
    position:absolute;
    top:73px;
    right:0;
    left:0;
    background:var(--paper);
    z-index:5;
    border:1px solid var(--line);
    padding:20px;
    border-radius:8px;
    box-shadow:0 10px 20px #20392f10
  }
  .mobile-navigation[open] .nav {
    display:flex;
    flex-direction:column;
    align-items:stretch;
    gap:16px
  }
  .nav .nav-contact {
    text-align:center
  }
  .hero {
    grid-template-columns:1fr;
    padding:43px 0;
    gap:36px
  }
  .hero h1 {
    font-size:clamp(52px,13vw,76px);
    letter-spacing:-2.5px;
    margin:22px 0
  }
  .eyebrow {
    font-size:10px
  }
  .hero .lede {
    font-size:16px
  }
  .hero-art {
    min-height:320px;
    max-width:450px;
    width:100%;
    margin:0 auto
  }
  .art-diagram {
    height:160px
  }
  .intro-strip {
    grid-template-columns:1fr;
    gap:12px;
    padding:23px 0
  }
  .section {
    padding:40px 0
  }
  .section-header h2 {
    font-size:34px
  }
  .section-header .quiet-link {
    font-size:12px;
    white-space:nowrap
  }
  .projects-grid {
    grid-template-columns:1fr
  }
  .project {
    min-height:220px;
    padding:23px
  }
  .project h3 {
    margin-top:14px
  }
  .writing-row {
    grid-template-columns:1fr auto;
    gap:9px;
    padding:21px 0
  }
  .writing-row .topic {
    grid-column:1/-1
  }
  .writing-row h3 {
    font-size:23px
  }
  .writing-row p {
    font-size:12px
  }
  .writing-meta {
    font-size:10px;
    min-width:50px
  }
  .consult-banner {
    grid-template-columns:1fr;
    gap:24px;
    margin:35px 0;
    padding:28px 24px
  }
  .consult-banner h2 {
    font-size:35px
  }
  .consult-banner .button {
    justify-self:start
  }
  .site-footer {
    flex-direction:column;
    gap:16px;
    padding-top:23px
  }
  .footer-links {
    gap:22px
  }
  .page-intro {
    padding:43px 0 30px
  }
  .page-intro h1 {
    font-size:47px;
    letter-spacing:-1.6px
  }
  .page-intro p {
    font-size:16px
  }
  .tools-row {
    align-items:stretch;
    gap:20px
  }
  .search {
    width:100%
  }
  .search input {
    flex:1;
    width:auto
  }
  .filters {
    gap:6px
  }
  .filter {
    padding:6px 11px
  }
  .consult-layout {
    grid-template-columns:1fr;
    gap:25px
  }
  .contact-form {
    padding:23px 20px
  }
  .field-grid {
    grid-template-columns:1fr;
    gap:0
  }
  .article {
    padding-top:35px
  }
  .article h1 {
    font-size:43px;
    letter-spacing:-1.2px
  }
  .article-body {
    font-size:18px
  }
  .success-card h1 {
    font-size:43px
  }
  .preview-label-wrap {
    gap:0
  }
  .results-section {
    padding-bottom:40px
  }
}
@media(prefers-reduced-motion:reduce) {
  :root {
    scroll-behavior:auto
  }
  * {
    transition:none!important
  }
}
`;

export const browser = String.raw`
// Native links and form submission continue to work without JavaScript.
const form = document.querySelector('[data-contact-form]');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('[role=status]');
  button.disabled = true;
  button.textContent = 'Sending…';
  status.textContent = '';
  form.querySelectorAll('[data-error]').forEach(node => node.remove());
  form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
  try {
    const response = await fetch(form.action, {method: 'POST', headers: {'Accept': 'application/json'}, body: new URLSearchParams(new FormData(form))});
    const result = await response.json();
    if (response.ok) {
      window.location.assign('/consulting/thanks');
      return;
    }
    status.textContent = result.message || 'Please check the form and try again.';
    for (const [name, message] of Object.entries(result.errors || {})) {
      const input = form.elements.namedItem(name);
      if (!input) continue;
      input.setAttribute('aria-invalid', 'true');
      const error = document.createElement('p');
      error.className = 'field-error'; error.dataset.error = ''; error.textContent = message;
      error.id = name + '-error'; input.setAttribute('aria-describedby', error.id);
      input.closest('.field')?.append(error);
    }
    form.querySelector('[aria-invalid]')?.focus();
  } catch {
    status.textContent = 'The connection was interrupted. You can try again; your inquiry will only be saved once.';
  } finally {
    button.disabled = false;
    button.textContent = 'Send an inquiry ↗';
  }
});
`;

export const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#20392f"/><g stroke="#d6f98b" stroke-width="5" stroke-linecap="round"><path d="M32 12v40M12 32h40M18 18l28 28M18 46l28-28"/></g></svg>';
