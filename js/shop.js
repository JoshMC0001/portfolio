const box = document.getElementById('products'); let all = [];
const draw = q => {
  const l = all.filter(c => c.title.toLowerCase().includes(q));
  box.innerHTML = l.length ? l.map(c => productCard(c)).join('') : '<p class="empty">No products match.</p>';
};
document.getElementById('q').oninput = e => draw(e.target.value.trim().toLowerCase());
db.collection('mcmodels_cards').orderBy('order').get().then(s => {
  all = s.docs.map(d => d.data()).filter(c => !c.hidden); draw('');
}).catch(() => box.innerHTML = '<p class="empty">Could not load products. Refresh to try again.</p>');
