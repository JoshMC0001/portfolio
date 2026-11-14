// ---- shared helpers (single-file build) ----
const $ = id => document.getElementById(id);
const REQUIRE_LOGIN = false;   // true = #/admin asks you to sign in first (needs a real web address, not file://)
let ROUTE = 'home'; const leave = [];
const safe = u => /^https?:\/\//i.test(u || '') ? u : '#';
const kfmt = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n);
const dl = p => Number(String(p.downloads || '').replace(/[^\d.]/g, '')) || 0;
const gShort = g => String(g || '').replace(/^minecraft\s*/i, '');
const gKey = g => /hytale/i.test(g || '') ? 'hytale' : 'bedrock';

// Rich text: only these tags survive, everything else is unwrapped. Used when saving AND when showing.
const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'P', 'UL', 'OL', 'LI', 'H2', 'H3', 'BLOCKQUOTE', 'A', 'CODE']);
function cleanHTML(html) {
  const d = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html'), out = document.createElement('div');
  const go = (s, t) => s.childNodes.forEach(n => {
    if (n.nodeType === 3) return t.append(n.textContent);
    if (n.nodeType !== 1) return;
    let g = n.tagName;
    if (/^(SCRIPT|STYLE|IFRAME|OBJECT|NOSCRIPT|TEMPLATE)$/.test(g)) return;
    if (g === 'BR' || g === 'HR') return t.append(document.createElement(g.toLowerCase()));
    if (g === 'DIV') g = 'P'; else if (/^H[12]$/.test(g)) g = 'H2'; else if (/^H[3-6]$/.test(g)) g = 'H3';
    if (!ALLOWED.has(g)) return go(n, t);
    const e = document.createElement(g);
    if (g === 'A') { const u = n.getAttribute('href') || ''; if (!/^(https?:\/\/|mailto:)/i.test(u)) return go(n, t); e.href = u; e.target = '_blank'; e.rel = 'noopener noreferrer'; }
    go(n, e); t.append(e);
  });
  go(d.body, out); return out.innerHTML;
}
const isRich = s => /<\/?(p|br|b|strong|i|em|u|s|strike|ul|ol|li|h[1-6]|blockquote|a|div|hr|code)\b/i.test(s || '');
const richHTML = s => !s ? '' : isRich(s) ? cleanHTML(s) : String(s).split(/\n+/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
const plainText = s => { const d = document.createElement('div'); d.innerHTML = richHTML(s); return d.textContent.replace(/\s+/g, ' ').trim(); };

// Each collection is fetched once and reused while you click around (cleared when you leave the admin)
const _cache = {};
const col = name => _cache[name] ??= db.collection(name).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => { const ao = Number.isFinite(+a.order) ? +a.order : Number.MAX_SAFE_INTEGER; const bo = Number.isFinite(+b.order) ? +b.order : Number.MAX_SAFE_INTEGER; return ao - bo || (b.createdAt || 0) - (a.createdAt || 0); })).catch(e => { delete _cache[name]; throw e; });
const refreshCol = name => { delete _cache[name]; return col(name); };
const clearCache = () => Object.keys(_cache).forEach(k => delete _cache[k]);
