// Mock Shopify objects for the store-less preview. Shapes follow the Liquid
// object reference closely enough for this theme's sections to render; they are
// not a full emulation (no real variants API, filters, or checkout).

const IMG = (file, alt = '') => ({ src: `assets/${file}`, alt, aspect_ratio: 0.8, width: 800, height: 1000 });

const CATALOG = [
  ['radiance-serum-no-3', 'Radiance Serum No.3', 64, null, 'sample-product-1.jpg', 'Serum'],
  ['barrier-repair-cream', 'Barrier Repair Cream', 58, null, 'sample-product-2.jpg', 'Moisturizer'],
  ['gentle-cleansing-milk', 'Gentle Cleansing Milk', 42, null, 'sample-product-3.jpg', 'Cleanser'],
  ['ceramide-lip-balm', 'Ceramide Lip Balm', 18, null, 'sample-product-4.jpg', 'Lip'],
  ['clay-balance-mask', 'Clay Balance Mask', 31, 38, 'sample-product-1.jpg', 'Mask'],
  ['daily-mineral-spf-30', 'Daily Mineral SPF 30', 36, null, 'sample-product-2.jpg', 'Sunscreen'],
  ['overnight-retinal-oil', 'Overnight Retinal Oil', 75, null, 'sample-product-3.jpg', 'Oil'],
  ['hydrating-essence-toner', 'Hydrating Essence Toner', 34, null, 'sample-product-4.jpg', 'Toner'],
  ['peptide-eye-cream', 'Peptide Eye Cream', 48, 57, 'sample-product-1.jpg', 'Eye'],
  ['enzyme-polish', 'Enzyme Polish', 29, null, 'sample-product-2.jpg', 'Exfoliant'],
  ['calming-cica-gel', 'Calming Cica Gel', 32, null, 'sample-product-3.jpg', 'Moisturizer'],
  ['body-barrier-lotion', 'Body Barrier Lotion', 38, null, 'sample-product-4.jpg', 'Body'],
];

const DESCRIPTION =
  '<p>A weightless, fragrance-free formula built around the barrier you already have. Dermatologist tested, batch-tested in our lab outside Lisbon.</p>';

export const products = CATALOG.map(([handle, title, price, compare, img, type], i) => {
  const images = [IMG(img, title), IMG('lifestyle-skin.jpg', title), IMG('lifestyle-apply.jpg', title)];
  const variants = ['30 ml', '50 ml'].map((size, v) => ({
    id: 1000 + i * 10 + v,
    title: size,
    price: (price + v * 18) * 100,
    compare_at_price: compare ? (compare + v * 18) * 100 : null,
    available: true,
    featured_image: images[0],
    option1: size,
  }));
  return {
    id: 100 + i,
    handle,
    title,
    url: `product.html`,
    vendor: 'EasyBeauty',
    type,
    description: DESCRIPTION,
    tags: [type],
    price: variants[0].price,
    price_min: variants[0].price,
    price_max: variants[1].price,
    price_varies: true,
    compare_at_price: variants[0].compare_at_price,
    compare_at_price_max: variants[1].compare_at_price,
    available: true,
    featured_image: images[0],
    images,
    variants,
    has_only_default_variant: false,
    selected_or_first_available_variant: variants[0],
    options_with_values: [{ name: 'Size', position: 1, selected_value: '30 ml', values: ['30 ml', '50 ml'] }],
  };
});

export const collection = {
  id: 1,
  handle: 'all',
  title: 'All skincare',
  url: 'collection.html',
  description: '<p>Twelve formulas, continuously improved.</p>',
  featured_image: IMG('hero-banner.jpg'),
  products,
  all_products_count: products.length,
  products_count: products.length,
  sort_by: 'best-selling',
  sort_options: [
    { value: 'best-selling', name: 'Best selling' },
    { value: 'price-ascending', name: 'Price, low to high' },
    { value: 'price-descending', name: 'Price, high to low' },
  ],
  filters: [
    {
      type: 'list',
      label: 'Product type',
      values: ['Serum', 'Moisturizer', 'Cleanser'].map((v) => ({
        label: v, value: v, param_name: 'filter.p.product_type', count: 2, active: false,
      })),
    },
    {
      type: 'boolean',
      label: 'In stock',
      values: [{ label: 'In stock', value: '1', param_name: 'filter.v.availability', count: 12, active: false }],
    },
  ],
};

export const collections = { all: collection, 'best-sellers': { ...collection, handle: 'best-sellers', title: 'Best sellers' } };

const link = (title, url, links = []) => ({ title, url, links, active: false, handle: title.toLowerCase() });

export const linklists = {
  'main-menu': {
    handle: 'main-menu',
    title: 'Main menu',
    links: [
      link('Shop', 'collection.html', [
        link('All skincare', 'collection.html'),
        link('Serums', 'collection.html'),
        link('Moisturizers', 'collection.html'),
        link('Cleansers', 'collection.html'),
      ]),
      link('Skin quiz', 'page.quiz.html'),
      link('Lookbook', 'page.lookbook.html'),
      link('Journal', 'blog.html'),
      link('About', 'page.about.html'),
    ],
  },
  footer: {
    handle: 'footer',
    title: 'Footer',
    links: [link('FAQ', 'page.faq.html'), link('Contact', 'page.contact.html'), link('Legal', 'page.legal.html')],
  },
};

const cartItems = products.slice(0, 2).map((p, i) => ({
  key: `${p.id}:k`,
  id: p.variants[0].id,
  product: p,
  variant: p.variants[0],
  title: p.title,
  product_title: p.title,
  variant_title: p.variants[0].title,
  url: p.url,
  image: p.featured_image,
  quantity: i + 1,
  price: p.variants[0].price,
  final_price: p.variants[0].price,
  original_line_price: p.variants[0].price * (i + 1),
  final_line_price: p.variants[0].price * (i + 1),
  line_price: p.variants[0].price * (i + 1),
  options_with_values: [{ name: 'Size', value: p.variants[0].title }],
}));

export const cart = {
  items: cartItems,
  item_count: cartItems.reduce((n, i) => n + i.quantity, 0),
  total_price: cartItems.reduce((n, i) => n + i.final_line_price, 0),
  items_subtotal_price: cartItems.reduce((n, i) => n + i.final_line_price, 0),
  note: '',
};

const articleBody =
  '<p>Your skin barrier is a thin layer of lipids and cells that keeps water in and irritants out. When it is compromised, everything stings.</p><h2>What actually helps</h2><p>Ceramides, cholesterol and fatty acids in roughly the ratio your skin makes them — and fewer actives, not more.</p>';

export const articles = [
  ['Barrier first: why your serum stings', 'lifestyle-skin.jpg'],
  ['The three-step routine we actually use', 'lifestyle-apply.jpg'],
  ['Niacinamide at 10%, explained', 'hero-banner.jpg'],
].map(([title, img], i) => ({
  id: 500 + i,
  title,
  url: 'article.html',
  author: 'Marta Sousa',
  published_at: `2026-0${7 + i}-12T09:00:00Z`,
  image: IMG(img, title),
  excerpt: '<p>A short read on what the barrier is and why fewer actives often work better.</p>',
  excerpt_or_content: '<p>A short read on what the barrier is and why fewer actives often work better.</p>',
  content: articleBody,
  tags: ['Routine'],
  comments_enabled: false,
}));

export const blog = { id: 9, handle: 'journal', title: 'Journal', url: 'blog.html', articles, articles_count: articles.length, comments_enabled: false };

export const shop = {
  name: 'EasyBeauty',
  url: 'index.html',
  email: 'hello@easybeauty.example',
  money_format: '${{amount}}',
  customer_accounts_enabled: true,
  customer_accounts_optional: true,
  password_message: 'Opening soon.',
  privacy_policy: { title: 'Privacy policy', url: '#' },
  refund_policy: { title: 'Refund policy', url: '#' },
  shipping_policy: { title: 'Shipping policy', url: '#' },
  terms_of_service: { title: 'Terms of service', url: '#' },
  subscription_policy: null,
};

export const customer = {
  first_name: 'Sara',
  last_name: 'Amini',
  name: 'Sara Amini',
  email: 'sara@example.com',
  orders: [],
  orders_count: 0,
  addresses: [],
  default_address: null,
};

export const routes = {
  root_url: 'index.html',
  account_url: 'customers.account.html',
  account_login_url: 'customers.login.html',
  account_register_url: 'customers.register.html',
  account_addresses_url: '#',
  cart_url: 'cart.html',
  cart_add_url: '#',
  cart_change_url: '#',
  search_url: 'search.html',
  product_recommendations_url: '#',
  collections_url: 'list-collections.html',
  all_products_collection_url: 'collection.html',
};
