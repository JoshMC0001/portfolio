const PER = 24, $ = id => document.getElementById(id);
let all = [], list = [], shown = 0, cur = 0, tag = '', q = '';
const tagsOf = i => (i.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

function filter() {
  list = all.filter(i => (!tag || tagsOf(i).includes(tag)) && (!q || `${i.title} ${i.tags || ''}`.toLowerCase().includes(q)));
  shown = 0; $('grid').innerHTML = ''; more();
  if (!list.length) $('grid').innerHTML = '<p class="empty">Nothing matches. Try a different tag or search.</p>';
}
function more() {
  list.slice(shown, shown + PER).forEach((it, k) => {
    const f = document.createElement('figure'), idx = shown + k;
    f.tabIndex = 0; f.innerHTML = `<img src="${esc(cdn(it.imageUrl, 600))}" alt="${esc(it.title)}" loading="lazy" decoding="async"><figcaption>${esc(it.title)}</figcaption>`;
    f.onclick = () => open(idx); f.onkeydown = e => e.key === 'Enter' && open(idx);
    $('grid').appendChild(f);
  });
  shown = Math.min(shown + PER, list.length); $('moreBtn').hidden = shown >= list.length;
}
$('moreBtn').onclick = more;

// Tag chips: most-used first, with counts. The selected tag is kept in the URL (#tag) so a filtered view can be shared.
function setTag(t) {
  tag = t; history.replaceState(null, '', t ? '#' + encodeURIComponent(t) : location.pathname);
  $('chips').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); filter();
}
function chips() {
  const n = {}; all.forEach(i => tagsOf(i).forEach(t => n[t] = (n[t] || 0) + 1));
  const tags = Object.entries(n).sort((a, b) => b[1] - a[1]);
  if (!tags.length) return;
  $('chips').innerHTML = [['', all.length], ...tags].map(([t, c]) => `<button data-t="${esc(t)}">${t ? esc(t) : 'All'}<small>${c}</small></button>`).join('');
  $('chips').onclick = e => { const b = e.target.closest('button'); if (b) setTag(b.dataset.t); };
}
$('q').oninput = e => { q = e.target.value.trim().toLowerCase(); filter(); };

// Lightbox: arrows / Esc / swipe, likes, clickable tags
const lb = $('lb'), liked = id => localStorage.getItem('liked-' + id) === 'true';
function open(i) {
  cur = (i + list.length) % list.length; const it = list[cur];
  $('lbImg').src = cdn(it.imageUrl, 1800); $('lbImg').alt = it.title; $('lbTitle').textContent = it.title;
  $('lbMeta').textContent = `${cur + 1} of ${list.length}`;
  $('lbTags').innerHTML = tagsOf(it).map(t => `<button data-t="${esc(t)}">${esc(t)}</button>`).join('');
  $('lbLink').hidden = !it.link; if (it.link) $('lbLink').href = it.link;
  [1, -1].forEach(d => { const n = list[(cur + d + list.length) % list.length]; if (n) new Image().src = cdn(n.imageUrl, 1800); });
  heart(it); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('lbClose').focus();
}
const heart = it => {
  const on = liked(it.id);
  $('lbLike').className = 'ic' + (on ? ' liked' : '');
  $('lbLike').innerHTML = `<i class="bi bi-heart${on ? '-fill' : ''}"></i>`;
  $('lbLike').title = (it.likes || 0) + ' likes';
};
function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
$('lbClose').onclick = close; $('lbPrev').onclick = () => open(cur - 1); $('lbNext').onclick = () => open(cur + 1);
$('lbTags').onclick = e => { const b = e.target.closest('button'); if (b) { close(); setTag(b.dataset.t); scrollTo({ top: 0, behavior: 'smooth' }); } };
lb.onclick = e => { if (e.target === lb || e.target.classList.contains('stage')) close(); };
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') open(cur - 1); if (e.key === 'ArrowRight') open(cur + 1);
});
let x0; lb.ontouchstart = e => x0 = e.touches[0].clientX;
lb.ontouchend = e => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) open(cur + (d < 0 ? 1 : -1)); };
$('lbLike').onclick = async () => {
  const it = list[cur], was = liked(it.id), n = was ? -1 : 1;
  it.likes = Math.max((it.likes || 0) + n, 0);
  was ? localStorage.removeItem('liked-' + it.id) : localStorage.setItem('liked-' + it.id, 'true'); heart(it);
  db.collection('gallery').doc(it.id).update({ likes: firebase.firestore.FieldValue.increment(n) }).catch(() => { });
};

db.collection('gallery').orderBy('order').get().then(s => {
  all = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => !i.hidden); chips();
  const h = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  setTag(all.some(i => tagsOf(i).includes(h)) ? h : '');
}).catch(() => $('grid').innerHTML = '<p class="empty">Could not load images. Refresh to try again.</p>');
