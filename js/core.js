// Shared by every public page: nav, footer, commission badge, page views, product card.
document.getElementById('nav').innerHTML = `
<header class="nav"><a class="brand" href="#/"><img src="${IMG['profile-sm.png']}" alt=""><b>JoshMC</b></a>
<nav>${[['index.html', 'Home', 'home'], ['shop.html', 'MCModels', 'mcmodels'], ['projects.html', 'Projects', 'projects'], ['gallery.html', 'Gallery', 'gallery']]
    .map(([h, t, k]) => `<a id="nav-${k}" href="${h}">${t}</a>`).join('')}</nav>
<span id="status" class="status" role="status" aria-live="polite"><i class="bi bi-hourglass-split" aria-hidden="true"></i><span>Checking commissions…</span></span>
<button id="theme" class="ic th" type="button" aria-label="Switch light / dark mode"><i class="bi"></i></button>
<button id="menu" class="ic burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mainnav"><i class="bi bi-list"></i></button><div class="prog" id="prog"></div></header>`;
document.querySelector('.nav nav').id = 'mainnav';
// Last content we saw is applied straight away, so edited text doesn't flash back to the default on each visit.
let saved = {}; try { saved = JSON.parse(localStorage.getItem('siteContent') || '{}'); } catch { }
const content = db.collection('siteSettings').doc('content').get().then(d => d.exists ? d.data() : {}).catch(() => saved);
const foot = c => document.getElementById('foot').innerHTML = `
<footer class="foot">${c.hide_foot_links ? '' : `<div><a href="https://x.com/${esc(c.x || 'RealJoshMC')}"><i class="bi bi-twitter-x"></i> @${esc(c.x || 'RealJoshMC')}</a>
<a href="#"><i class="bi bi-discord"></i> ${esc(c.discord || 'joshmc0001')}</a>${c.email ? `<a href="mailto:${esc(c.email)}"><i class="bi bi-envelope"></i> ${esc(c.email)}</a>` : ''}</div>`}
<small>&copy; ${new Date().getFullYear()} ${esc(c.brand || 'JoshMC')}. ${esc(c.foot_text || 'Not affiliated with Mojang.')}</small></footer>`;
let C = saved; foot(saved);
content.then(c => { C = c; foot(c); applyContent(c); try { localStorage.setItem('siteContent', JSON.stringify(c)); } catch { } });

db.collection('siteSettings').doc('commissions').get().then(d => {
  const open = d.exists && d.data().open, s = document.getElementById('status');
  document.body.dataset.msg = (d.exists && d.data().message) || ''; document.body.dataset.open = open; document.dispatchEvent(new Event('commission'));
  s.innerHTML = `<i class="bi ${open ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'}" aria-hidden="true"></i><span>${open ? 'Commissions open' : 'Commissions closed'}</span>`;
  s.className = 'status ' + (open ? 'open' : 'closed');
}).catch(() => document.getElementById('status').remove());

const track = page => { const inc = firebase.firestore.FieldValue.increment(1), day = new Date().toISOString().slice(0, 10); db.collection('pageViews').doc(page).set({ count: inc, days: { [day]: inc } }, { merge: true }).catch(() => { }); };

const isNew = c => c.createdAt && Date.now() - c.createdAt < 14 * 864e5;   // added in the last 14 days
const productCard = (c, w = 500, i = 0) => `<a class="product rv" data-id="${esc(c.id || '')}" style="--i:${i % 12}" href="${esc(c.link || '#')}" target="_blank" rel="noopener">
<div class="pimg"><img src="${esc(cdn(c.image, w))}" decoding="async" alt="${esc(c.title)}" loading="lazy">${isNew(c) ? '<em class="new">NEW</em>' : ''}${c.price ? `<b class="price">${esc(c.price)}</b>` : ''}</div><span>${esc(c.title)}</span></a>`;

// Soft 3D tilt on product cards (mouse only)
if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointermove', e => {
    const el = e.target.closest?.('.product'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ty', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
    el.style.setProperty('--tx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
  });
  document.addEventListener('pointerout', e => { const el = e.target.closest?.('.product'); if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty('--tx'); el.style.removeProperty('--ty'); } });
}
// Reveal cards as they scroll in (also used by the shop page)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: .08 });
  new MutationObserver(() => document.querySelectorAll('.product.rv:not(.seen),.proj.rv:not(.seen)').forEach(el => { el.classList.add('seen'); io.observe(el); }))
    .observe(document.body, { childList: true, subtree: true });
}

// ---------- Dark / light mode (remembers your choice, otherwise follows the device) ----------
{
  const root = document.documentElement, btn = document.getElementById('theme');
  const cur = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const paint = () => { btn.querySelector('i').className = 'bi ' + (cur() === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'); btn.title = cur() === 'dark' ? 'Light mode' : 'Dark mode'; };
  paint();
  btn.onclick = e => {
    const next = cur() === 'dark' ? 'light' : 'dark';
    const apply = () => { root.dataset.theme = next; try { localStorage.setItem('theme', next); } catch { } paint(); document.dispatchEvent(new Event('themechange')); };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {   // circle wipe from the button
      root.style.setProperty('--tx0', e.clientX + 'px'); root.style.setProperty('--ty0', e.clientY + 'px');
      document.startViewTransition(apply);
    } else apply();
  };
}
// Scroll progress bar under the header
{ const p = document.getElementById('prog'); addEventListener('scroll', () => p.style.transform = `scaleX(${scrollY / Math.max(document.documentElement.scrollHeight - innerHeight, 1)})`, { passive: true }); }
// Main buttons lean toward the cursor
if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.('.btn.main'); if (!b) return; const r = b.getBoundingClientRect();
    b.style.translate = `${(e.clientX - r.left - r.width / 2) * .15}px ${(e.clientY - r.top - r.height / 2) * .25}px`;
  });
  document.addEventListener('pointerout', e => { const b = e.target.closest?.('.btn.main'); if (b) b.style.translate = ''; });
}

// ---------- Mobile menu (hamburger) ----------
{
  const bar = document.querySelector('.nav'), btn = document.getElementById('menu');
  const set = on => { bar.classList.toggle('open', on); btn.setAttribute('aria-expanded', on); btn.setAttribute('aria-label', on ? 'Close menu' : 'Open menu'); btn.firstElementChild.className = 'bi ' + (on ? 'bi-x-lg' : 'bi-list'); };
  btn.onclick = () => set(!bar.classList.contains('open'));
  document.addEventListener('click', e => { if (bar.classList.contains('open') && (e.target.closest('#mainnav a') || !e.target.closest('.nav'))) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width:641px)').addEventListener('change', e => { if (e.matches) set(false); });
}
