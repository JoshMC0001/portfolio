// Everything the admin "Pages" tab can change. Values are saved in Firestore at siteSettings/content.
//
// Field types:
//   text  replaces the text of `sel`            area   same, but a blank line starts a new paragraph
//   href  replaces the link of `sel`            show   switch that shows/hides `sel` (saved as true when HIDDEN)
//   num   a number read by the page script      color  the accent colour
//   Fields with no `sel` are read directly by core.js / home.js.
// `def` is the built-in default: it is shown as the placeholder in the admin, and used when a field is left empty.
// A page's fields only apply on that page ("site" applies everywhere).
const PAGES = [
  {
    id: 'site', name: 'All pages', href: 'index.html', groups: [
      {
        t: 'Header', f: [
          { k: 'brand', l: 'Site name', type: 'text', sel: '.nav .brand b', def: 'JoshMC' },
          { k: 'nav_home', l: 'Menu: Home', type: 'text', sel: '#nav-home', def: 'Home' },
          { k: 'nav_mcmodels', l: 'Menu: Shop', type: 'text', sel: '#nav-mcmodels', def: 'Shop' },
          { k: 'nav_gallery', l: 'Menu: Gallery', type: 'text', sel: '#nav-gallery', def: 'Gallery' },
          { k: 'hide_nav_mcmodels', l: 'Show "Shop" in the menu', type: 'show', sel: '#nav-mcmodels' },
          { k: 'hide_nav_gallery', l: 'Show "Gallery" in the menu', type: 'show', sel: '#nav-gallery' },
          { k: 'hide_status', l: 'Show the commissions open/closed badge', type: 'show', sel: '#status' }
        ]
      },
      {
        t: 'Footer', f: [
          { k: 'foot_text', l: 'Footer note', type: 'text', def: 'Not affiliated with Mojang.' },
          { k: 'hide_foot_links', l: 'Show contact links in the footer', type: 'show' }
        ]
      },
      {
        t: 'Contact links', f: [
          { k: 'x', l: 'X username', type: 'text', def: 'RealJoshMC' },
          { k: 'discord', l: 'Discord username', type: 'text', def: 'joshmc0001' },
          { k: 'email', l: 'Contact email (leave empty to hide)', type: 'email', def: '' }
        ]
      },
      {
        t: 'Look', f: [
          { k: 'accent', l: 'Accent colour (buttons, highlights, links)', type: 'color', def: '#f2b98d' }
        ]
      }
    ]
  },
  {
    id: 'home', name: 'Home', href: 'index.html', groups: [
      {
        t: 'Top banner', f: [
          { k: 'headline', l: 'Headline', type: 'text', sel: '.hero h1', def: 'Minecraft models, made to be used.' },
          { k: 'subtitle', l: 'Subtitle', type: 'text', sel: '.hero .in p', def: 'Furniture, cosmetics and environment sets for Bedrock and Java.' },
          { k: 'hero_btn1', l: 'First button text', type: 'text', sel: '.hero .cta .btn.main', def: 'Browse the shop' },
          { k: 'hero_btn1_link', l: 'First button link', type: 'href', sel: '.hero .cta .btn.main', def: 'mcmodels.html' },
          { k: 'hero_btn2', l: 'Second button text', type: 'text', sel: '.hero .cta .btn:not(.main)', def: 'Request a commission' },
          { k: 'hero_btn2_link', l: 'Second button link', type: 'href', sel: '.hero .cta .btn:not(.main)', def: '#commission' },
          { k: 'hide_hero_btn1', l: 'Show first button', type: 'show', sel: '.hero .cta .btn.main' },
          { k: 'hide_hero_btn2', l: 'Show second button', type: 'show', sel: '.hero .cta .btn:not(.main)' },
          { k: 'hide_hero_head', l: 'Show your Minecraft head image', type: 'show', sel: '#head3d' },
          { k: 'hide_hero_wall', l: 'Show the moving background of your products and gallery', type: 'show', sel: '#wall' }
        ]
      },
      {
        t: 'Latest products', f: [
          { k: 'sec_products_title', l: 'Section title', type: 'text', sel: '#sec-products h2', def: 'Latest products' },
          { k: 'home_more', l: '"View all" link text', type: 'text', sel: '#more', def: 'View all' },
          { k: 'home_count', l: 'How many products to show (empty = automatic)', type: 'num', def: '9' },
          { k: 'hide_sec_products', l: 'Show this section', type: 'show', sel: '#sec-products' }
        ]
      },
      {
        t: '3D models', f: [
          { k: 'sec_models_title', l: 'Section title', type: 'text', sel: '#sec-models h2', def: '3D models' },
          { k: 'hide_sec_models', l: 'Show this section', type: 'show', sel: '#sec-models' }
        ]
      },
      {
        t: 'Commissions', hint: 'The open/closed text above the buttons is set in Overview, under Commissions.', f: [
          { k: 'cm_title', l: 'Section title', type: 'text', sel: '#commission h2', def: 'Need something custom?' },
          { k: 'step1_t', l: 'Step 1 title', type: 'text', sel: '.steps li:nth-child(1) b', def: 'Tell me what you need' },
          { k: 'step1_d', l: 'Step 1 text', type: 'text', sel: '.steps li:nth-child(1) span', def: "Describe the model, whether it's for Bedrock or Java, and your deadline." },
          { k: 'step2_t', l: 'Step 2 title', type: 'text', sel: '.steps li:nth-child(2) b', def: 'Agree on scope and price' },
          { k: 'step2_d', l: 'Step 2 text', type: 'text', sel: '.steps li:nth-child(2) span', def: "I'll confirm what's included before any work starts." },
          { k: 'step3_t', l: 'Step 3 title', type: 'text', sel: '.steps li:nth-child(3) b', def: 'Get your model' },
          { k: 'step3_d', l: 'Step 3 text', type: 'text', sel: '.steps li:nth-child(3) span', def: "You'll receive the finished files, ready to use in game." },
          { k: 'hide_cm_steps', l: 'Show the 3 steps', type: 'show', sel: '.steps' },
          { k: 'hide_cm_discord', l: 'Show the Discord button', type: 'show', sel: '#cmD' },
          { k: 'hide_sec_commission', l: 'Show this section', type: 'show', sel: '#commission' }
        ]
      },
      {
        t: 'About', f: [
          { k: 'about_title', l: 'Section title', type: 'text', sel: '.about h2', def: "Hey, I'm JoshMC" },
          { k: 'about', l: 'About text (a blank line starts a new paragraph)', type: 'area', sel: '#aboutText', def: "I create 3D models and custom assets for Minecraft Bedrock and Java.\n\nWhether it's furniture, cosmetics or environment sets, I like designing things players actually enjoy using." },
          { k: 'hide_about_photo', l: 'Show your photo', type: 'show', sel: '.about img' },
          { k: 'hide_sec_about', l: 'Show this section', type: 'show', sel: '.about' }
        ]
      }
    ]
  },
  {
    id: 'mcmodels', name: 'Shop', href: 'mcmodels.html', groups: [
      {
        t: 'Shop page', f: [
          { k: 'shop_title', l: 'Page title', type: 'text', sel: '.page-title h1', def: 'Shop' },
          { k: 'shop_sub', l: 'Text under the title', type: 'text', sel: '.page-title p', def: 'MCModels products you can use in your own world.' },
          { k: 'hide_shop_head', l: 'Show the title and text', type: 'show', sel: '.page-title' },
          { k: 'hide_shop_search', l: 'Show the search box', type: 'show', sel: '#q' }
        ]
      }
    ]
  },
  {
    id: 'gallery', name: 'Gallery', href: 'gallery.html', groups: [
      {
        t: 'Gallery page', f: [
          { k: 'gallery_title', l: 'Page title', type: 'text', sel: '.page-title h1', def: 'Gallery' },
          { k: 'gallery_sub', l: 'Text under the title', type: 'text', sel: '.page-title p', def: 'Select an image to view it full size. Use the arrow keys to move between images.' },
          { k: 'hide_gallery_head', l: 'Show the title and text', type: 'show', sel: '.page-title' },
          { k: 'hide_gallery_search', l: 'Show the search box', type: 'show', sel: '#q' },
          { k: 'hide_gallery_chips', l: 'Show the tag filter buttons', type: 'show', sel: '#chips' }
        ]
      }
    ]
  }
];

// Applies saved content to the current public page. Safe to call more than once:
// the original text is remembered, so clearing a field in the admin puts the default back.
function applyContent(c) {
  const page = document.body.dataset.page, root = document.documentElement;
  for (const p of PAGES) {
    if (p.id !== 'site' && p.id !== page) continue;
    for (const g of p.groups) for (const f of g.f) {
      const v = c[f.k];
      if (f.type === 'color') { v ? root.style.setProperty('--accent', v) : root.style.removeProperty('--accent'); continue; }
      if (!f.sel) continue;
      document.querySelectorAll(f.sel).forEach(el => {
        if (f.type === 'show') el.hidden = !!v;
        else if (f.type === 'href') { el.dataset.h ??= el.getAttribute('href') || ''; el.setAttribute('href', v || el.dataset.h); }
        else if (f.type === 'area') { el.dataset.o ??= el.innerHTML; el.innerHTML = v ? String(v).split(/\n+/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('') : el.dataset.o; }
        else { el.dataset.o ??= el.textContent; el.textContent = v || el.dataset.o; }
      });
    }
  }
}
