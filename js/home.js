function initHome() {
let alive = true; leave.push(() => alive = false);
const box = document.getElementById('products');
const cardsQ = col('mcmodels_cards');
Promise.all([cardsQ, content]).then(([s, c]) => {
  const max = +c.home_count || (innerWidth < 768 ? 5 : 9);
  const all = s.filter(c => !c.hidden); setProducts(all);
  box.innerHTML = all.length ? all.slice(0, max).map((c, i) => productCard(c, i ? 500 : 900, i)).join('') : '<p class="empty">No products yet.</p>';
  document.getElementById('more').hidden = all.length <= max;
}).catch(() => box.innerHTML = '<p class="empty">Could not load products. Refresh to try again.</p>');

const uid = l => (String(l).match(/[a-f0-9]{32}/i) || [''])[0];
const show = m => document.getElementById('viewer').innerHTML =
  `<iframe title="${esc(m.title)}" src="https://sketchfab.com/models/${uid(m.link)}/embed" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`;
const thumb = async m => m.thumbnailUrl || m.thumbnail || await fetch('https://sketchfab.com/oembed?url=' + encodeURIComponent(m.link))
  .then(r => r.json()).then(j => j.thumbnail_url).catch(() => '');

col('sketchfabModels').then(async s => {
  const docs = s.filter(d => !d.hidden);
  if (!docs.length) return document.getElementById('viewer').closest('section').remove();
  const ms = await Promise.all(docs.map(async d => ({ ...d, t: await thumb(d) })));
  show(ms[0]);
  const strip = document.getElementById('strip');
  ms.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = i ? '' : 'on'; b.title = m.title;
    b.innerHTML = `<img src="${esc(m.t)}" alt="${esc(m.title)}" loading="lazy">`;
    b.onclick = () => { show(m); strip.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); };
    strip.appendChild(b);
  });
}).catch(() => { });

// Commission section follows the open/closed switch from the admin
const cm = () => {
  const open = document.body.dataset.open === 'true', msg = document.body.dataset.msg;
  document.getElementById('cmText').textContent = msg || (open
    ? "Commissions are open. Send me a message with what you have in mind and I'll reply with a price."
    : "Commissions are closed right now. Follow me on X to hear when slots open.");
  document.getElementById('cmX').textContent = open ? 'Message me on X' : 'Follow me on X';
};
document.addEventListener('commission', () => alive && cm()); if (document.body.dataset.open !== undefined) cm();
let discord = 'joshmc0001';
document.getElementById('cmD').onclick = e => { navigator.clipboard?.writeText(discord); e.target.textContent = 'Copied ' + discord; };

// Contact links edited in the admin (Pages tab). Headline, About and the rest are applied by applyContent() in pages.js
content.then(c => {
  if (c.x) document.getElementById('cmX').href = 'https://x.com/' + c.x;
  if (c.discord) { discord = c.discord; document.getElementById('cmD').textContent = 'Copy Discord: ' + c.discord; }
  if (c.email) { const e = document.getElementById('cmE'); e.href = 'mailto:' + c.email; e.hidden = false; }
});

// ---------- Hero head: follows the cursor / finger, floats, and reacts to clicks ----------
const hero = document.querySelector('.hero'), head = document.getElementById('head3d');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (hero && head && !calm) {
  const tilt = e => {
    const r = hero.getBoundingClientRect();
    head.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 40 + 'deg');
    head.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 26 + 'deg');
  };
  hero.addEventListener('pointermove', tilt);
  hero.addEventListener('pointerleave', () => { head.style.setProperty('--rx', '0deg'); head.style.setProperty('--ry', '0deg'); });

  // Click / tap the head: it spins, a speech bubble pops up and little blocks burst out.
  const lines = ['Hi! 👋', 'Need a model?', 'Check the shop!', 'Oof!', 'Commissions? 👀', 'Built block by block', 'Nice click!'];
  const bubble = document.createElement('div'); bubble.className = 'bubble'; head.appendChild(bubble);
  let n = 0, bt;
  head.addEventListener('click', e => {
    const img = head.querySelector('img'); img.classList.remove('spin'); void img.offsetWidth; img.classList.add('spin');
    bubble.textContent = n && n % 10 === 0 ? 'You really like clicking me 😄' : lines[n % lines.length]; n++;
    bubble.classList.add('on'); clearTimeout(bt); bt = setTimeout(() => bubble.classList.remove('on'), 1600);
  });

  // Little pixels trail behind the cursor over the hero (mouse only)
  let last = 0;
  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || performance.now() - last < 45) return; last = performance.now();
    const r = hero.getBoundingClientRect(), p = document.createElement('i'); p.className = 'trail';
    p.style.left = e.clientX - r.left + 'px'; p.style.top = e.clientY - r.top + 'px'; hero.appendChild(p); setTimeout(() => p.remove(), 700);
  });
}

// ---------- Moving hero background ----------
// Every row is a fixed set of tiles that glide and wrap around. Nothing is ever added to or removed from the page while it
// moves: when a tile leaves the far edge (already off screen) it just gets a new, pre-loaded random picture and goes to the
// other end. That removes the layout work that used to make the rows jump.
(async () => {
  try {
    const wall = document.getElementById('wall'); if (!wall) return;
    const [c, g, pj] = await Promise.all([cardsQ, col('gallery'), col('projects')]);
    const pool = [...new Set([...c.filter(x => !x.hidden).map(x => x.image),
      ...g.slice(0, 80).filter(x => !x.hidden).map(x => x.imageUrl), ...pj.filter(x => !x.hidden).map(x => x.image)].filter(Boolean))];
    if (pool.length < 4) return;
    const GAP = 14, SPEEDS = [30, 20, 38, 25, 33, 22, 36], inUse = new Map(), ready = [];
    const src = u => cdn(u, 320);
    let filling = false;
    const refill = async () => {                       // keep a few images downloaded + decoded ahead of time
      if (filling) return; filling = true;
      while (ready.length < 12) {
        const u = pool[Math.floor(Math.random() * pool.length)];
        if (ready.some(r => r.u === u) && pool.length > ready.length) continue;
        const im = new Image(); im.src = src(u); try { await im.decode(); ready.push({ u, im }); } catch { if (!pool.length) break; }
      }
      filling = false;
    };
    const pick = (avoid = []) => {
      const ok = r => !inUse.get(r.u) && !avoid.includes(r.u);
      let k = ready.findIndex(ok); if (k < 0) k = ready.findIndex(r => !avoid.includes(r.u));
      let u; if (k >= 0) u = ready.splice(k, 1)[0].u;
      else { const free = pool.filter(x => !inUse.get(x) && !avoid.includes(x)); u = (free.length ? free : pool)[Math.floor(Math.random() * (free.length || pool.length))]; }
      inUse.set(u, (inUse.get(u) || 0) + 1); refill(); return u;
    };
    const release = u => inUse.set(u, Math.max((inUse.get(u) || 1) - 1, 0));
    let rows = [], raf = 0, built = { w: 0, h: 0 }, step = 0;
    const build = async () => {
      cancelAnimationFrame(raf); wall.innerHTML = ''; rows = []; inUse.clear();
      const W = wall.clientWidth, H = wall.clientHeight; if (!W || !H) return;
      const probe = document.createElement('div'); probe.className = 'track'; const pi = new Image(); probe.appendChild(pi); wall.appendChild(probe);
      const size = parseFloat(getComputedStyle(pi).width) || 140; probe.remove();
      const w = size + GAP, nRows = Math.ceil(H / w) + 1, n = Math.ceil(W / w) + 3, total = n * w;
      built = { w: W, h: H }; const firsts = [];
      for (let r = 0; r < nRows; r++) {
        const track = document.createElement('div'); track.className = 'track'; track.style.top = r * w + 'px';
        const dir = r % 2 ? 1 : -1, speed = SPEEDS[r % SPEEDS.length] * (.9 + Math.random() * .2), phase = Math.random() * total, tiles = [];
        for (let i = 0; i < n; i++) {
          const u = pick([tiles[i - 1]?.el.dataset.u]), el = new Image(); el.alt = ''; el.src = src(u); el.dataset.u = u;
          const x = -w + ((i * w + phase) % total); el.style.transform = `translate3d(${x}px,0,0)`;
          tiles.push({ el, x }); track.appendChild(el); if (x > -w && x < W) firsts.push(el);
        }
        wall.appendChild(track); rows.push({ dir, speed, tiles });
      }
      // show the wall only once what's on screen has loaded, so nothing pops in
      await Promise.race([Promise.all(firsts.map(e => e.decode().catch(() => { }))), new Promise(r => setTimeout(r, 2500))]);
      wall.classList.add('live');
      if (calm) return;
      let t0 = performance.now();
      const loop = t => { if (!alive) return;
        const dt = Math.min((t - t0) / 1000, .05); t0 = t;
        for (const R of rows) {
          const d = R.dir * R.speed * dt;
          for (const T of R.tiles) {
            T.x += d;
            if (R.dir < 0 && T.x < -w) { T.x += total; swap(T); }
            else if (R.dir > 0 && T.x >= total - w) { T.x -= total; swap(T); }
            T.el.style.transform = `translate3d(${T.x.toFixed(2)}px,0,0)`;
          }
        }
        raf = requestAnimationFrame(loop);
      };
      const swap = T => { release(T.el.dataset.u); const u = pick(); T.el.dataset.u = u; T.el.src = src(u); };
      raf = requestAnimationFrame(loop);
    };
    await refill(); await build();
    let rt; addEventListener('resize', () => {           // only rebuild on a real size change (not the phone's address bar)
      clearTimeout(rt); rt = setTimeout(() => { if (alive && (Math.abs(wall.clientWidth - built.w) > 60 || wall.clientHeight > built.h + 120)) build(); }, 300);
    });
  } catch (e) { }
})();

// ---------- Latest from X ----------
// Shows your newest posts automatically (X's own embedded timeline), or one specific post if you paste its link in the admin.
(() => {
  const sec = document.getElementById('sec-x'), box = document.getElementById('xbox'); if (!sec) return;
  let user = 'RealJoshMC', post = '', token = 0;
  const theme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const load = () => new Promise((res, rej) => {
    if (window.twttr?.widgets) return res(window.twttr);
    const s = document.createElement('script'); s.src = 'https://platform.twitter.com/widgets.js'; s.async = true;
    s.onload = () => res(window.twttr); s.onerror = rej; document.head.appendChild(s); setTimeout(rej, 8000);
  });
  const render = async () => {
    const my = ++token; box.innerHTML = '';
    try {
      const tw = await load(), id = (post.match(/status(?:es)?\/(\d+)/) || [])[1];
      const el = id ? await tw.widgets.createTweet(id, box, { theme: theme(), dnt: true, align: 'center' })
        : await tw.widgets.createTimeline({ sourceType: 'profile', screenName: user }, box, { height: 560, theme: theme(), chrome: 'noheader nofooter transparent', dnt: true });
      if (my === token) sec.style.display = el ? '' : 'none';
    } catch { if (my === token) sec.style.display = 'none'; }   // if X can't load, the section just stays hidden
  };
  content.then(c => {
    user = c.x || user; post = c.x_post || '';
    const l = document.getElementById('xLink'); l.href = 'https://x.com/' + user; l.textContent = 'Follow @' + user; render();
  });
  document.addEventListener('themechange', () => { if (alive && sec.style.display !== 'none') render(); });
})();

// ---------- Scroll reveal ----------
if ('IntersectionObserver' in window && !calm) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: .12 });
  const watch = () => document.querySelectorAll('.rv:not(.seen)').forEach(el => { el.classList.add('seen'); io.observe(el); });
  document.querySelectorAll('section .head, .viewer, .strip, .cm > *, .about .wrap > *').forEach(el => el.classList.add('rv'));
  new MutationObserver(watch).observe(document.getElementById('products'), { childList: true }); watch();
}

homeProjects();
}
