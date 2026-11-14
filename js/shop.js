function initShop() {
const box = document.getElementById('products'); let all = [];
const draw = q => {
  const l = all.filter(c => `${c.title} ${c.price || ''}`.toLowerCase().includes(q));
  box.innerHTML = l.length ? l.map(c => productCard(c)).join('') : '<p class="empty">No products match.</p>';
};
document.getElementById('q').oninput = e => draw(e.target.value.trim().toLowerCase());
col('mcmodels_cards').then(s => {
  all = s.filter(c => !c.hidden); setProducts(all); draw('');
}).catch(() => box.innerHTML = '<p class="empty">Could not load products. Refresh to try again.</p>');

}
