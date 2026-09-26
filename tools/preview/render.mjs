// Store-less preview renderer for /theme.
//
// Renders every JSON template through layout/theme.liquid with liquidjs, a set of
// Shopify tag/filter shims, and mock data (mock-data.mjs). Output goes to ./out as
// plain HTML so it can be opened in a browser or screenshotted by shoot.mjs.
//
// This is an approximation for design review only — the real check is
// `shopify theme dev` against a store.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Hash, Tokenizer } from 'liquidjs';
import * as mock from './mock-data.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(process.env.THEME_DIR || path.join(HERE, '../../theme'));
const OUT = path.resolve(process.env.OUT_DIR || path.join(HERE, 'out'));

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const locale = readJson(path.join(THEME, 'locales/en.default.json'));

// ---------- theme settings (schema defaults overlaid with settings_data "current") ----------
const settingsSchema = readJson(path.join(THEME, 'config/settings_schema.json'));
const settingsData = readJson(path.join(THEME, 'config/settings_data.json'));
const themeSettings = {};
for (const group of settingsSchema) for (const s of group.settings || []) if (s.id && 'default' in s) themeSettings[s.id] = s.default;
Object.assign(themeSettings, typeof settingsData.current === 'object' ? settingsData.current : {});

// ---------- helpers ----------
function lookup(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function translate(key, vars = {}) {
  let str = lookup(locale, key);
  if (str == null) return `translation missing: en.${key}`;
  if (typeof str === 'object') str = vars.count === 1 ? str.one : str.other;
  return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] ?? ''));
}

function money(cents) {
  const n = Number(cents || 0) / 100;
  return mock.shop.money_format.replace(/\{\{\s*amount\s*\}\}/, n.toFixed(2));
}

const PLACEHOLDER = (cls = '') =>
  `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525 525" preserveAspectRatio="xMidYMid slice" style="background:#E3DCD2;width:100%;height:100%;display:block"><text x="50%" y="50%" text-anchor="middle" fill="#9B8F82" font-family="sans-serif" font-size="18">image placeholder</text></svg>`;

function resolveSetting(type, value) {
  if (value == null || value === '') return type === 'image_picker' || type === 'collection' || type === 'product' ? null : value;
  switch (type) {
    case 'link_list': return mock.linklists[value] || null;
    case 'collection': return mock.collections[value] || mock.collection;
    case 'product': return mock.products.find((p) => p.handle === value) || mock.products[0];
    case 'image_picker': return null; // images uploaded in the admin don't exist locally
    default: return value;
  }
}

function sectionSchema(type) {
  const src = fs.readFileSync(path.join(THEME, 'sections', `${type}.liquid`), 'utf8');
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return m ? JSON.parse(m[1]) : {};
}

function buildSection(id, cfg = {}) {
  const schema = sectionSchema(cfg.type);
  const settings = {};
  for (const s of schema.settings || []) if (s.id) settings[s.id] = resolveSetting(s.type, cfg.settings?.[s.id] ?? s.default);

  const blockEntries = cfg.block_order
    ? cfg.block_order.map((bid) => [bid, cfg.blocks[bid]])
    : Object.entries(cfg.blocks || {});
  const blocks = blockEntries.filter(([, b]) => b && !b.disabled).map(([bid, b]) => {
    const bs = (schema.blocks || []).find((x) => x.type === b.type) || {};
    const bset = {};
    for (const s of bs.settings || []) if (s.id) bset[s.id] = resolveSetting(s.type, b.settings?.[s.id] ?? s.default);
    return { id: bid, type: b.type, settings: bset, shopify_attributes: '' };
  });
  return { id, type: cfg.type, settings, blocks, shopify_attributes: '' };
}

// ---------- liquid engine ----------
const engine = new Liquid({
  root: [path.join(THEME, 'snippets')],
  partials: [path.join(THEME, 'snippets')],
  extname: '.liquid',
  strictFilters: false,
  strictVariables: false,
  dynamicPartials: true,
  jsTruthy: false,
  ownPropertyOnly: false,
  // liquidjs resolves a bare undefined `size` to the scope's key count (0); Shopify treats it as nil.
  globals: { size: null },
});

// Shopify filters
engine.registerFilter('t', (key, ...args) => translate(key, Object.fromEntries(args.filter(Array.isArray))));
engine.registerFilter('money', money);
engine.registerFilter('money_with_currency', (c) => `${money(c)} USD`);
engine.registerFilter('money_without_trailing_zeros', (c) => money(c).replace(/\.00$/, ''));
engine.registerFilter('asset_url', (name) => `assets/${String(name).replace(/\.liquid$/, '')}`);
engine.registerFilter('image_url', (img) => (img && typeof img === 'object' ? img.src : img || ''));
engine.registerFilter('img_url', (img) => (img && typeof img === 'object' ? img.src : img || ''));
engine.registerFilter('image_tag', (src, ...args) => `<img src="${src}" alt="" loading="lazy">`);
engine.registerFilter('stylesheet_tag', (url) => `<link rel="stylesheet" href="${url}">`);
engine.registerFilter('script_tag', (url) => `<script src="${url}" defer></script>`);
engine.registerFilter('preload_tag', (url) => `<link rel="preload" href="${url}" as="font" type="font/woff2" crossorigin>`);
engine.registerFilter('placeholder_svg_tag', (_name, ...args) => {
  const cls = args.find((a) => Array.isArray(a) && a[0] === 'class');
  return PLACEHOLDER(cls ? cls[1] : 'placeholder-svg');
});
engine.registerFilter('handleize', (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
engine.registerFilter('handle', (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
engine.registerFilter('json', (v) => JSON.stringify(v ?? null));
engine.registerFilter('default_errors', () => '');
engine.registerFilter('format_address', () => '');
engine.registerFilter('format_code', (s) => s);
engine.registerFilter('link_to', (title, url) => `<a href="${url}">${title}</a>`);
engine.registerFilter('within', (url) => url);
engine.registerFilter('payment_type_svg_tag', () => '');

// {% schema %} / {% comment %}-like raw-skip blocks
function rawBlock(name, wrap) {
  engine.registerTag(name, class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.body = [];
      while (remain.length) {
        const t = remain.shift();
        if (t.name === `end${name}`) return;
        this.body.push(t.getText());
      }
    }
    *render() { return wrap ? wrap(this.body.join('')) : ''; }
  });
}
rawBlock('schema');
rawBlock('javascript', (b) => `<script>${b}</script>`);

// {% style %}...{% endstyle %} — liquid inside is rendered
engine.registerTag('style', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.tpls = [];
    const stream = liquid.parser.parseStream(remain)
      .on('tag:endstyle', () => stream.stop())
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('end', () => { throw new Error('style not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    emitter.write('<style>');
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    emitter.write('</style>');
  }
});

// {% form 'type', obj, attr: val %}...{% endform %}
engine.registerTag('form', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    const tk = new Tokenizer(token.args, liquid.options.operators);
    this.formType = tk.readValue();
    tk.skipBlank();
    if (tk.peek() === ',') tk.advance();
    tk.skipBlank();
    // optional positional object arg (e.g. `product`) — skip it when not followed by ':'
    const save = tk.p;
    const maybe = tk.readIdentifier();
    tk.skipBlank();
    if (maybe.content && tk.peek() !== ':') { if (tk.peek() === ',') tk.advance(); }
    else tk.p = save;
    this.hash = new Hash(tk.remaining());
    this.tpls = [];
    const stream = liquid.parser.parseStream(remain)
      .on('tag:endform', () => stream.stop())
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('end', () => { throw new Error('form not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    const attrs = yield this.hash.render(ctx);
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => (v === true ? `${k}` : `${k}="${String(v).replace(/"/g, '&quot;')}"`)).join(' ');
    ctx.push({ form: { errors: null, posted_successfully: false, email: '', first_name: '', last_name: '', body: '' } });
    emitter.write(`<form method="post" action="#" ${attrStr}>`);
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    emitter.write('</form>');
    ctx.pop();
  }
});

// {% paginate x by n %} — exposes a single-page `paginate` object
engine.registerTag('paginate', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.tpls = [];
    const stream = liquid.parser.parseStream(remain)
      .on('tag:endpaginate', () => stream.stop())
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('end', () => { throw new Error('paginate not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1, parts: [], previous: null, next: null, items: 0 } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
  }
});

// {% section 'name' %} and {% sections 'group' %}
async function renderSection(id, cfg, globals) {
  const section = buildSection(id, cfg);
  const src = fs.readFileSync(path.join(THEME, 'sections', `${cfg.type}.liquid`), 'utf8');
  const html = await engine.parseAndRender(src, { ...globals, section });
  return `<div id="shopify-section-${id}" class="shopify-section">${html}</div>`;
}

let GLOBALS = {};
engine.registerTag('section', class extends Tag {
  constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.trim().replace(/^['"]|['"]$/g, ''); }
  *render(ctx) { return yield renderSection(this.name, { type: this.name }, ctx.getAll()); }
});
engine.registerTag('sections', class extends Tag {
  constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.trim().replace(/^['"]|['"]$/g, ''); }
  *render(ctx) {
    const group = readJson(path.join(THEME, 'sections', `${this.name}.json`));
    let out = '';
    for (const id of group.order) if (!group.sections[id].disabled) out += yield renderSection(id, group.sections[id], ctx.getAll());
    return out;
  }
});

// ---------- pages ----------
const PAGES = {
  index: { page_type: 'index', title: 'EasyBeauty' },
  product: { page_type: 'product', title: mock.products[0].title },
  collection: { page_type: 'collection', title: mock.collection.title },
  'list-collections': { page_type: 'list-collections', title: 'Collections' },
  cart: { page_type: 'cart', title: 'Your bag' },
  search: { page_type: 'search', title: 'Search' },
  blog: { page_type: 'blog', title: 'Journal' },
  article: { page_type: 'article', title: mock.articles[0].title },
  page: { page_type: 'page', title: 'Shipping & returns' },
  'page.about': { page_type: 'page', title: 'About' },
  'page.contact': { page_type: 'page', title: 'Contact' },
  'page.faq': { page_type: 'page', title: 'FAQ' },
  'page.legal': { page_type: 'page', title: 'Legal' },
  'page.lookbook': { page_type: 'page', title: 'Lookbook' },
  'page.quiz': { page_type: 'page', title: 'Skin quiz' },
  404: { page_type: '404', title: 'Page not found' },
  'customers/login': { page_type: 'customers/login', title: 'Log in', guest: true },
  'customers/register': { page_type: 'customers/register', title: 'Create account', guest: true },
  'customers/account': { page_type: 'customers/account', title: 'Account' },
};

function globalsFor(name, meta) {
  return {
    settings: themeSettings,
    shop: mock.shop,
    routes: mock.routes,
    cart: mock.cart,
    customer: meta.guest ? null : mock.customer,
    linklists: mock.linklists,
    collections: mock.collections,
    all_products: Object.fromEntries(mock.products.map((p) => [p.handle, p])),
    blogs: { journal: mock.blog },
    product: mock.products[0],
    collection: mock.collection,
    recommendations: { performed: true, products: mock.products.slice(1, 5), products_count: 4 },
    blog: mock.blog,
    article: mock.articles[0],
    page: { title: meta.title, handle: name.replace(/^page\.?/, '') || 'shipping', content: '<p>Orders ship within two business days from Lisbon. Free standard shipping over $60. Unopened products can be returned within 30 days.</p>' },
    search: { performed: true, terms: 'serum', results: mock.products.slice(0, 4), results_count: 4 },
    request: { page_type: meta.page_type, locale: { iso_code: 'en' }, design_mode: false },
    page_title: meta.title,
    page_description: '',
    canonical_url: `${name}.html`,
    current_page: 1,
    content_for_header: '',
    template: { name: name.split('.')[0], suffix: name.split('.')[1] || null },
  };
}

// Storefront paths written into templates/settings → the matching local preview file.
function localizeLinks(html) {
  const map = [
    [/^\/collections\/?$/, 'list-collections.html'],
    [/^\/collections\/[^/]+$/, 'collection.html'],
    [/^\/(collections\/[^/]+\/)?products\/[^/]+$/, 'product.html'],
    [/^\/pages\/([a-z-]+)$/, (m) => (PAGES[`page.${m[1]}`] ? `page.${m[1]}.html` : 'page.html')],
    [/^\/blogs\/[^/]+$/, 'blog.html'],
    [/^\/blogs\/[^/]+\/[^/]+$/, 'article.html'],
    [/^\/cart$/, 'cart.html'],
    [/^\/search$/, 'search.html'],
    [/^\/account(\/login)?$/, 'customers.login.html'],
    [/^\/$/, 'index.html'],
  ];
  return html.replace(/href="(\/[^"#?]*)([^"]*)"/g, (all, p) => {
    for (const [re, to] of map) {
      const m = p.match(re);
      if (m) return `href="${typeof to === 'function' ? to(m) : to}"`;
    }
    return all;
  });
}

async function renderPage(name, meta) {
  const tpl = readJson(path.join(THEME, 'templates', `${name}.json`));
  const globals = globalsFor(name, meta);
  let content = '';
  for (const id of tpl.order) {
    const cfg = tpl.sections[id];
    if (cfg.disabled) continue;
    content += await renderSection(id, cfg, globals);
  }
  const layout = fs.readFileSync(path.join(THEME, 'layout', `${tpl.layout || 'theme'}.liquid`), 'utf8');
  return localizeLinks(await engine.parseAndRender(layout, { ...globals, content_for_layout: content }));
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  for (const f of fs.readdirSync(path.join(THEME, 'assets'))) {
    const src = path.join(THEME, 'assets', f);
    if (f.endsWith('.liquid')) {
      const css = await engine.parseAndRender(fs.readFileSync(src, 'utf8'), { settings: themeSettings });
      fs.writeFileSync(path.join(OUT, 'assets', f.replace(/\.liquid$/, '')), css);
    } else fs.copyFileSync(src, path.join(OUT, 'assets', f));
  }

  const only = process.argv.slice(2);
  const failures = [];
  for (const [name, meta] of Object.entries(PAGES)) {
    if (only.length && !only.includes(name)) continue;
    const file = `${name.replace('/', '.')}.html`;
    try {
      fs.writeFileSync(path.join(OUT, file), await renderPage(name, meta));
      console.log(`ok   ${file}`);
    } catch (e) {
      failures.push(name);
      console.error(`FAIL ${file}: ${e.message}`);
    }
  }
  if (failures.length) process.exitCode = 1;
}

main();
