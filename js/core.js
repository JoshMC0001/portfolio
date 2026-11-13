// Shared by every public page: nav, footer, commission badge, page views, product card.
const PAGE = document.body.dataset.page;
document.getElementById('nav').innerHTML = `
<header class="nav"><a class="brand" href="index.html"><img src="img/profile-sm.png" alt=""><b>JoshMC</b></a>
<nav>${[['index.html', 'Home', 'home'], ['mcmodels.html', 'Shop', 'mcmodels'], ['gallery.html', 'Gallery', 'gallery']]
    .map(([h, t, k]) => `<a id="nav-${k}" href="${h}"${k === PAGE ? ' class="on"' : ''}>${t}</a>`).join('')}</nav>
<span id="status" class="status">Checking commissions…</span></header>`;
// Last content we saw is applied straight away, so edited text doesn't flash back to the default on each visit.
let saved = {}; try { saved = JSON.parse(localStorage.getItem('siteContent') || '{}'); } catch { }
const content = db.collection('siteSettings').doc('content').get().then(d => d.exists ? d.data() : {}).catch(() => saved);
const foot = c => document.getElementById('foot').innerHTML = `
<footer class="foot">${c.hide_foot_links ? '' : `<div><a href="https://x.com/${esc(c.x || 'RealJoshMC')}"><i class="bi bi-twitter-x"></i> @${esc(c.x || 'RealJoshMC')}</a>
<a href="#"><i class="bi bi-discord"></i> ${esc(c.discord || 'joshmc0001')}</a>${c.email ? `<a href="mailto:${esc(c.email)}"><i class="bi bi-envelope"></i> ${esc(c.email)}</a>` : ''}</div>`}
<small>&copy; ${new Date().getFullYear()} ${esc(c.brand || 'JoshMC')}. ${esc(c.foot_text || 'Not affiliated with Mojang.')}</small></footer>`;
foot(saved); applyContent(saved);
content.then(c => { foot(c); applyContent(c); try { localStorage.setItem('siteContent', JSON.stringify(c)); } catch { } });

db.collection('siteSettings').doc('commissions').get().then(d => {
  const open = d.exists && d.data().open, s = document.getElementById('status');
  document.body.dataset.msg = (d.exists && d.data().message) || ''; document.body.dataset.open = open; document.dispatchEvent(new Event('commission'));
  s.textContent = open ? 'Commissions open' : 'Commissions closed';
  s.className = 'status ' + (open ? 'open' : 'closed');
}).catch(() => document.getElementById('status').remove());

{
  const inc = firebase.firestore.FieldValue.increment(1), day = new Date().toISOString().slice(0, 10);
  db.collection('pageViews').doc(PAGE).set({ count: inc, days: { [day]: inc } }, { merge: true }).catch(() => { });
}

const productCard = (c, w = 500) => `<a class="product" href="${esc(c.link || '#')}" target="_blank" rel="noopener">
<img src="${esc(cdn(c.image, w))}" decoding="async" alt="${esc(c.title)}" loading="lazy"><span>${esc(c.title)}</span></a>`;
