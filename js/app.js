// ---------- Item popup (shop products + projects) ----------
const LISTS = { product: [], project: [] }, PATH = { home: '', mcmodels: 'shop', projects: 'projects', gallery: 'gallery' };
let deepDone = false, pk = 'product', pIdx = -1;
const pm = document.createElement('div'); pm.className = 'pm'; pm.setAttribute('role', 'dialog'); pm.setAttribute('aria-modal', 'true'); pm.setAttribute('aria-label', 'Details');
pm.innerHTML = `<div class="pcard"><button class="ic pclose" type="button" aria-label="Close"><i class="bi bi-x-lg"></i></button>
<div class="pgal"><img id="pmImg" alt=""><button class="ic pprev" type="button" aria-label="Previous"><i class="bi bi-chevron-left"></i></button><button class="ic pnext" type="button" aria-label="Next"><i class="bi bi-chevron-right"></i></button><div class="pthumbs" id="pmThumbs"></div></div>
<div class="pinfo"><small id="pmCount"></small><h2 id="pmTitle"></h2><div class="pmeta" id="pmMeta"></div><div class="pprice" id="pmPrice"></div><div class="pdesc rich" id="pmDesc"></div><div class="preq" id="pmReq"></div><div class="pbtns" id="pmBtns"></div></div></div>`;
document.body.appendChild(pm);
const pq = s => pm.querySelector(s);
const lbl = u => /curseforge/i.test(u) ? 'CurseForge' : /mcpedl/i.test(u) ? 'MCPEDL' : /modrinth/i.test(u) ? 'Modrinth' : /minecraft\.net|marketplace/i.test(u) ? 'Marketplace' : /github/i.test(u) ? 'GitHub' : /youtu/i.test(u) ? 'YouTube' : '';
function fillPop() {
  const p = LISTS[pk][pIdx]; if (!p) return; const pr = pk === 'product', list = LISTS[pk];
  const img = pq('#pmImg'); img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap'); img.src = cdn(p.image, 1000); img.alt = p.title;
  const pics = pr ? [] : [p.image, ...(p.images || [])].filter(Boolean);
  pq('#pmThumbs').innerHTML = pics.length > 1 ? pics.map((u, i) => `<button type="button" class="${i ? '' : 'on'}" data-u="${esc(u)}" aria-label="Image ${i + 1}"><img src="${esc(cdn(u, 120))}" alt=""></button>`).join('') : '';
  pq('#pmCount').textContent = `${pIdx + 1} of ${list.length}`; pq('#pmTitle').textContent = p.title;
  const tg = (i, t, g) => t ? `<span class="tagp"${g ? ` data-g="${g}"` : ''}><i class="bi bi-${i}"></i> ${esc(t)}</span>` : '';
  pq('#pmMeta').innerHTML = (isNew(p) ? '<em class="new">NEW</em>' : '') + (pr ? tg('box', p.platform)
    : tg('controller', p.game, p.game && gKey(p.game)) + tg('tag', p.type) + tg('circle-fill', p.status) + tg('joystick', p.gameVersion) + tg('download', dl(p) ? kfmt(dl(p)) : ''));
  pq('#pmPrice').textContent = pr ? p.price || '' : ''; pq('#pmPrice').hidden = !(pr && p.price);
  pq('#pmDesc').innerHTML = richHTML(p.desc);
  const rq = pq('#pmReq'); rq.hidden = pr || !p.requires; rq.innerHTML = p.requires ? `<i class="bi bi-info-circle"></i> ${esc(p.requires)}` : '';
  const ls = pr ? [p.link && { u: p.link, t: /mcmodels\.net/i.test(p.link) ? 'View on MCModels' : 'Open link', m: 1 }]
    : [p.link && { u: p.link, t: lbl(p.link) ? 'View on ' + lbl(p.link) : 'Open project', m: 1 }, ...(p.links || []).map(l => ({ u: l.url, t: l.label || lbl(l.url) || 'Link' }))];
  pq('#pmBtns').innerHTML = ls.filter(l => l && safe(l.u) !== '#').map(l => `<a class="btn${l.m ? ' main' : ''}" href="${esc(safe(l.u))}" target="_blank" rel="noopener">${esc(l.t)} <i class="bi bi-box-arrow-up-right"></i></a>`).join('')
    + '<button class="btn" id="pmShare" type="button"><i class="bi bi-link-45deg"></i> Copy link</button>';
  if (pr) [1, -1].forEach(d => { const n = list[(pIdx + d + list.length) % list.length]; if (n) new Image().src = cdn(n.image, 1000); });
  if ((ROUTE === 'mcmodels' && pr) || (ROUTE === 'projects' && !pr)) history.replaceState(null, '', '#/' + PATH[ROUTE] + '/' + p.id);
}
function openItem(kind, id) { pk = kind; pIdx = LISTS[kind].findIndex(p => p.id === id); if (pIdx < 0) return; fillPop(); pm.classList.add('open'); document.body.style.overflow = 'hidden'; pq('.pclose').focus(); }
function closePop() {
  if (!pm.classList.contains('open')) return; pm.classList.remove('open'); document.body.style.overflow = '';
  if (/^#\/(shop|projects)\//.test(location.hash)) history.replaceState(null, '', '#/' + (PATH[ROUTE] || ''));
}
const stepPop = d => { pIdx = (pIdx + d + LISTS[pk].length) % LISTS[pk].length; fillPop(); };
const deep = kind => {
  if (deepDone) return; const [r, id] = location.hash.replace(/^#\/?/, '').split('/');
  if (id && ((r === 'shop' && kind === 'product') || (r === 'projects' && kind === 'project'))) { deepDone = true; openItem(kind, decodeURIComponent(id)); }
};
const setProducts = l => { LISTS.product = l; deep('product'); }, setProjects = l => { LISTS.project = l; deep('project'); };
pq('.pclose').onclick = closePop; pq('.pprev').onclick = () => stepPop(-1); pq('.pnext').onclick = () => stepPop(1);
pm.onclick = e => {
  if (e.target === pm) return closePop();
  const th = e.target.closest('#pmThumbs button');
  if (th) { pq('#pmImg').src = cdn(th.dataset.u, 1000); pq('#pmThumbs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b === th)); }
  const sh = e.target.closest('#pmShare');
  if (sh) { navigator.clipboard?.writeText(location.origin + location.pathname + '#/' + (pk === 'product' ? 'shop' : 'projects') + '/' + LISTS[pk][pIdx].id); sh.innerHTML = '<i class="bi bi-check2"></i> Copied'; setTimeout(() => sh.innerHTML = '<i class="bi bi-link-45deg"></i> Copy link', 1500); }
};
addEventListener('keydown', e => {
  if (!pm.classList.contains('open')) return;
  if (e.key === 'Escape') closePop(); if (e.key === 'ArrowLeft') stepPop(-1); if (e.key === 'ArrowRight') stepPop(1);
});
let px0; pm.ontouchstart = e => px0 = e.touches[0].clientX;
pm.ontouchend = e => { const d = e.changedTouches[0].clientX - px0; if (Math.abs(d) > 70) stepPop(d < 0 ? 1 : -1); };
document.addEventListener('click', e => {      // cards open the popup (ctrl/cmd-click still opens the link normally)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  const a = e.target.closest('.product,.proj'); if (!a) return; const id = a.dataset.id || a.dataset.pid; if (!id) return;
  e.preventDefault(); openItem(a.classList.contains('proj') ? 'project' : 'product', id);
});

// ---------- Project card (projects page + home) ----------
const projCard = (p, i = 0) => {
  const t = plainText(p.desc);
  return `<a class="proj rv" data-pid="${esc(p.id)}" style="--i:${i % 12}" href="${esc(safe(p.link))}" target="_blank" rel="noopener">
<div class="pimg"><img src="${esc(cdn(p.image, 640))}" alt="${esc(p.title)}" loading="lazy" decoding="async"><div class="pbadges">${p.game ? `<b class="ptype" data-g="${gKey(p.game)}">${esc(gShort(p.game))}</b>` : ''}${p.type ? `<b class="ptype">${esc(p.type)}</b>` : ''}</div>${isNew(p) ? '<em class="new">NEW</em>' : ''}</div>
<div class="pbody"><h3>${esc(p.title)}</h3>${t ? `<p>${esc(t)}</p>` : ''}
<div class="pmetas">${p.status ? `<span><i class="bi bi-circle-fill st" data-s="${esc(p.status)}"></i> ${esc(p.status)}</span>` : ''}${dl(p) ? `<span><i class="bi bi-download"></i> ${kfmt(dl(p))}</span>` : ''}${p.gameVersion ? `<span><i class="bi bi-controller"></i> ${esc(p.gameVersion)}</span>` : ''}</div>
<span class="pgo">View details <i class="bi bi-arrow-right"></i></span></div></a>`;
};

function initProjects() {
  let all = [], game = '', type = '', q = '';
  const projectGrid = $('projects');
  if (!projectGrid) return;
  projectGrid.innerHTML = '<p class="empty loading-projects"><i class="bi bi-arrow-repeat"></i> Loading projects…</p>';
  const draw = () => {
    const l = all.filter(p => {
      const hay = `${p.title || ''} ${plainText(p.desc || '')} ${p.type || ''} ${p.game || ''} ${p.status || ''} ${(Array.isArray(p.tags) ? p.tags.join(' ') : p.tags || '')} ${p.gameVersion || ''} ${p.loader || ''}`.toLowerCase();
      return (!game || gShort(p.game) === game) && (!type || (p.type || '') === type) && (!q || hay.includes(q));
    });
    projectGrid.innerHTML = l.length ? l.map(projCard).join('') : `<p class="empty">${all.length ? 'No projects match your search or filters.' : 'No projects have been published yet.'}</p>`;
  };
  const counts = getter => Object.entries(all.reduce((n, p) => { const k = getter(p); if (k) n[k] = (n[k] || 0) + 1; return n; }, {})).sort((a, b) => b[1] - a[1]);
  const makeChips = (el, items, current, set) => {
    if (!el) return;
    el.innerHTML = [['', all.length], ...items].map(([t, c]) => `<button type="button" data-t="${esc(t)}"${t === current() ? ' class="on"' : ''}>${t ? esc(t) : 'All'}<small>${c}</small></button>`).join('');
    el.onclick = e => { const b = e.target.closest('button[data-t]'); if (!b) return; set(b.dataset.t); makeChips(el, items, current, set); draw(); };
  };
  const showError = err => {
    console.error('[Projects page] Could not load projects:', err);
    projectGrid.innerHTML = `<div class="project-load-error"><b>Projects could not be loaded</b><p>${esc(err?.message || 'There was a problem reading the projects collection.')}</p><button class="btn" id="retryProjects" type="button"><i class="bi bi-arrow-clockwise"></i> Try again</button></div>`;
    $('retryProjects')?.addEventListener('click', () => { clearCache(); initProjects(); }, { once: true });
  };
  $('q')?.addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
  $('fbtn')?.addEventListener('click', () => {
    const tools = $('tools'); const open = !tools.classList.contains('open'); tools.classList.toggle('open', open); $('fbtn').setAttribute('aria-expanded', String(open));
  });

  // Use the same collection reader as homeProjects(). A second, forced read was causing
  // the public Projects route to take a different path from the homepage data source.
  col('projects').then(records => {
    all = (Array.isArray(records) ? records : []).map(p => ({ ...p, id: String(p.id || '') })).filter(p => p.id && !p.hidden);
    setProjects(all);
    const totalDownloads = all.reduce((sum, p) => sum + dl(p), 0);
    const stats = $('pstats');
    if (stats) {
      stats.innerHTML = `<div><b>${all.length}</b><span>project${all.length === 1 ? '' : 's'}</span></div>` + (totalDownloads ? `<div><b>${kfmt(totalDownloads)}</b><span>total downloads</span></div>` : '');
      stats.hidden = !all.length;
    }
    const games = counts(p => p.game && gShort(p.game));
    const types = counts(p => p.type);
    if (games.length > 1) { const el = $('gchips'); if (el) el.hidden = false; makeChips(el, games, () => game, v => game = v); }
    const typeChips = $('chips');
    if (types.length > 1 && typeChips) {
      makeChips(typeChips, types, () => type, v => { type = v; if ($('flabel')) $('flabel').textContent = v || 'All types'; $('tools')?.classList.remove('open'); $('fbtn')?.setAttribute('aria-expanded', 'false'); });
      if ($('fbtn')) $('fbtn').hidden = false;
    } else if (typeChips) typeChips.hidden = true;
    draw();
  }).catch(showError);
}
// ---------- Home: featured projects ----------
function homeProjects() {
  const sec = $('sec-projects'), fp = $('fprojects');
  Promise.all([col('projects'), content]).then(([s, c]) => {
    const all = s.filter(p => !p.hidden); setProjects(all);
    let l = all.filter(p => p.featured); if (!l.length) l = all;          // nothing marked as featured -> newest projects
    const max = +c.home_projects_count || 3;
    if (!l.length) return sec.remove();
    fp.innerHTML = l.slice(0, max).map((p, i) => projCard(p, i)).join(''); $('moreP').hidden = all.length <= max;
  }).catch(() => sec.remove());
}

// ---------- Router: #/ (home)  #/shop  #/projects  #/gallery  #/admin ----------
const INIT = { home: initHome, mcmodels: initShop, projects: initProjects, gallery: initGallery };
const TITLES = { home: 'JoshMC · Minecraft 3D models', mcmodels: 'JoshMC · Shop', projects: 'JoshMC · Projects', gallery: 'JoshMC · Gallery' };
const ROUTES = { '': 'home', shop: 'mcmodels', projects: 'projects', gallery: 'gallery' };
function route() {
  const r = location.hash.replace(/^#\/?/, '').split('/')[0];
  leave.splice(0).forEach(f => f()); closePop();
  if (r === 'admin') { location.hash = '#/'; return; }
  ROUTE = ROUTES[r] ?? 'home'; document.body.dataset.page = ROUTE; document.title = TITLES[ROUTE];
  $('view').innerHTML = VIEWS[ROUTE].replace(/img\/([\w.-]+)/g, (m, f) => IMG[f] || m);
  applyContent(C); deepDone = false; INIT[ROUTE](); track(ROUTE); scrollTo(0, 0);
  document.querySelectorAll('#mainnav a').forEach(a => a.classList.toggle('on', a.id === 'nav-' + ROUTE));
}
addEventListener('hashchange', route);
{ const t = $('top'); addEventListener('scroll', () => t.classList.toggle('show', scrollY > 400)); t.onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); }
route();
