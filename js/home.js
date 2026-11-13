const box = document.getElementById('products');
const cardsQ = db.collection('mcmodels_cards').orderBy('order').get();
Promise.all([cardsQ, content]).then(([s, c]) => {
  const max = +c.home_count || (innerWidth < 768 ? 5 : 9);
  const all = s.docs.map(d => d.data()).filter(c => !c.hidden);
  box.innerHTML = all.length ? all.slice(0, max).map((c, i) => productCard(c, i ? 500 : 900)).join('') : '<p class="empty">No products yet.</p>';
  document.getElementById('more').hidden = all.length <= max;
}).catch(() => box.innerHTML = '<p class="empty">Could not load products. Refresh to try again.</p>');

const uid = l => (String(l).match(/[a-f0-9]{32}/i) || [''])[0];
const show = m => document.getElementById('viewer').innerHTML =
  `<iframe title="${esc(m.title)}" src="https://sketchfab.com/models/${uid(m.link)}/embed" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`;
const thumb = async m => m.thumbnailUrl || m.thumbnail || await fetch('https://sketchfab.com/oembed?url=' + encodeURIComponent(m.link))
  .then(r => r.json()).then(j => j.thumbnail_url).catch(() => '');

db.collection('sketchfabModels').orderBy('order').get().then(async s => {
  const docs = s.docs.filter(d => !d.data().hidden);
  if (!docs.length) return document.getElementById('viewer').closest('section').remove();
  const ms = await Promise.all(docs.map(async d => ({ ...d.data(), t: await thumb(d.data()) })));
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
document.addEventListener('commission', cm);
let discord = 'joshmc0001';
document.getElementById('cmD').onclick = e => { navigator.clipboard?.writeText(discord); e.target.textContent = 'Copied ' + discord; };

// Contact links edited in the admin (Pages tab). Headline, About and the rest are applied by applyContent() in pages.js
content.then(c => {
  if (c.x) document.getElementById('cmX').href = 'https://x.com/' + c.x;
  if (c.discord) { discord = c.discord; document.getElementById('cmD').textContent = 'Copy Discord: ' + c.discord; }
  if (c.email) { const e = document.getElementById('cmE'); e.href = 'mailto:' + c.email; e.hidden = false; }
});

// Hero head follows the cursor
const hero = document.querySelector('.hero'), head = document.getElementById('head3d');
if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    head.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 30 + 'deg');
    head.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 20 + 'deg');
  });
  hero.addEventListener('pointerleave', () => { head.style.setProperty('--rx', '0deg'); head.style.setProperty('--ry', '0deg'); });
}

// Moving hero background: product key art mixed with gallery images. With fewer than 4 images the hero stays plain.
(async () => {
  try {
    const [c, g] = await Promise.all([cardsQ, db.collection('gallery').orderBy('order').limit(30).get()]);
    const imgs = [...c.docs.map(d => d.data()).filter(x => !x.hidden).map(x => x.image),
      ...g.docs.map(d => d.data()).filter(x => !x.hidden).map(x => x.imageUrl)].filter(Boolean);
    if (imgs.length < 4) return;
    for (let i = imgs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; }
    document.querySelectorAll('#wall .track').forEach((row, r) => {
      const tiles = Array.from({ length: 12 }, (_, i) => `<img src="${esc(cdn(imgs[(i + r * 3) % imgs.length], 400))}" alt="" decoding="async">`).join('');
      row.innerHTML = tiles + tiles;   // twice, so the loop is seamless
    });
    document.getElementById('wall').classList.add('live');
  } catch (e) { }
})();
