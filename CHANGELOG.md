# Changelog

All notable changes to the EasyBeauty theme. Versions follow
[Semantic Versioning](https://semver.org/) and match `theme_info.theme_version`
in `theme/config/settings_schema.json` (shown in Shopify Admin under the theme
name) and the `vX.Y.Z` git tag. See "Releasing" in `docs/DEVELOPMENT.md`.

## [1.9.0] — 2026-09-30

### Added
- Bundle "Set photo": one photo of the whole set with a numbered marker per step; each step
  places its marker (left / top %) on its product. Markers and step rows highlight each other.
- Hero "Height" (fit the first screen / photo's own shape) and photo focus (left–right,
  top–bottom) settings.

### Changed
- Hero fits the space under the header by default, so the whole banner is visible on the first
  screen; the photo keeps its shape and is cropped around the focus point, so hotspots stay on
  the same spot at every screen size. Default image shift lowered from 22% to 8%.
- Preview tool: `preview:<asset>` stands in for an uploaded image in image settings.

## [1.8.0] — 2026-09-30

### Added
- Styled dropdown list for every `<select>` on mouse/trackpad devices: opens 2px under the field
  (or above it when there's no room), themed hover and selected states, keyboard support
  (arrows, Home/End, Enter, Esc, type-to-find). Touch devices keep the native picker; add
  `data-native` to a select to opt out.
- Collection tabs: "Slider with arrows" layout (default) with previous/next buttons under the
  row, and a product count per tab (up to 24).

### Changed
- Header nav: 12px items with tighter spacing so longer menus leave room for the logo.
- Dropdown chevron follows the text colour (including dark mode) instead of a fixed colour.

## [1.7.0] — 2026-09-29

### Added
- "Legal documents" section (design: Legal): tabs per document (opened by `#privacy`,
  `#terms`, `#cookies` links), numbered clauses in a two-column layout, and a sticky side
  column of notes. A document without clauses can show a Shopify policy instead.
- Page intro: optional side image (split layout, optional black & white).
- Multicolumn "Index" style: serif number, small-caps title and note (lookbook contents).

### Changed
- Lookbook (design: Lookbook): split hero with a black & white photo, index strip, looks with
  a 420px product panel, black & white photos (setting), pulsing hotspots with name labels
  that highlight the matching product row (and the other way round), an "Add" button per
  product and dark captions.

## [1.6.0] — 2026-09-29

### Added
- Journal article redesign (design: Blog Post): reading-progress bar under the header, tag /
  date / read time / reviewer meta, full-width image with caption, sticky rail with author,
  "In this article" contents built from the article's h2s (active section highlighted), and
  share buttons (copy link, Pinterest, email); editorial typography for h2, pull quotes, lists
  and tables.
- Journal listing: featured article with author, tag filter bar with a search over loaded
  articles, bordered 3-column card grid (hover lift + image zoom, dark tag label, underlined
  link) and "Load more" with a progress bar (Section Rendering API; plain links without JS).
- Newsletter section "Split with image" layout with an eyebrow (used on Journal pages).
- "Image band" section: full-width photograph with height, focal point and caption settings.
- Contact form: newsletter opt-in checkbox, side-column photo and second details block.
- Page intro: meta can sit as small caps on the right.

### Changed
- About: image band under the intro, principles as a split list with hover, team cards lift
  and zoom on hover (full width, no greyscale), dark CTA uses a terracotta primary button.
- Bag: header notes styled as small caps, summary column filled to the bottom.
- Contact: uppercase labels, topic chips, ruled side column, "+" Q&A toggles, channel cards
  highlight on hover.

## [1.5.0] — 2026-09-29

### Added
- Header "Link mega menu" block: a nav item with editor-written columns (Label | URL | note per
  line) and an optional column linking the demo product in all four layouts. Ships as
  "Features" (pages, product layouts, shopping pages, built-in features). Header demo product
  setting.
- Skin quiz rebuilt to the design: split intro (eyebrow, title, text, start, skip, notes, photo);
  centred, softly framed question card with progress, "Question n of 6", Back / Next;
  single-answer questions advance on tap (no radio dots), multi-answer questions use checkboxes
  with a maximum; result with answer tags, ranked product picks, routine total, "Add all to bag",
  retake and a recap of the answers. Questions carry a hint and per-option notes.

### Changed
- Below 1280px the header puts the logo left and centres a tighter nav, so longer menus fit.
- FAQ closer to the design: 240px sticky group nav with a 2px rule, terracotta plus icons.

## [1.4.0] — 2026-09-29

### Added
- Dark mode: Theme settings → Dark mode (on/off, default light / dark / follow device, five
  dark colours); light/dark switch in the header (and in the mobile menu); no flash on load.
- Collection page rebuilt to the design: sticky filter sidebar (quick search, applied-filter
  chips, collapsible groups with counts, two-handle price range, in-stock switch) with a slim
  hover-only scrollbar; sticky toolbar (show/hide filters, count, sort, grid density); bordered
  grid; "Load more" with progress; empty state. Filters, sort and paging update in place (Section
  Rendering API); drawer on narrow screens.
- Product cards: wishlist heart (icon only) and badges from plain "New" / "Best seller" tags.
- Header: logo position (centre / left), light/dark switch toggle, mega-menu options (links per
  column, product counts, black-and-white feature image).
- Footer: editable "Links" columns (no menus needed) and editable bottom links; defaults match the
  design.
- `CLAUDE.md` design rules and `tools/grid-check.py` (2/4px spacing and font-size check).

### Changed
- Colours are tokens mixed from the Theme settings colours (no hard-coded greys/tints).
- Hero hotspot cards always link: picked product, custom link, or a product search for the title.
- Homepage tabs: no full-width rule under the tabs, only the selected tab is underlined.
- "Shop the texture" cards wider; mega-menu feature image 220px tall.

### Removed
- Collection banner badges ("Fragrance-free · Vegan · Derm tested").

## [1.3.0] — 2026-09-28

Homepage brought in line with the latest landing design (`EasyBeauty Landing`).

### Added
- Hero: "Shift photo right" setting (zooms the photo from its left edge so copy sits beside
  the subject, hotspots stay pinned); hotspot product/link and card side settings.
- Product card: second-image crossfade, lift + shadow, sliding "Quick add" bar (single-variant
  products) or "Choose size" link, `badge:Text` tag badges, sale %, star rating from review
  metafields.
- "In use" reels: row fills the width, active reel is wider/taller and plays; plays the next
  when a video ends (photos after a set time) and loops; pauses off-screen / reduced motion.
- Press names scroll in an endless marquee (pauses on hover; static for reduced motion).
- Bundle: per-step large image override, "Bundle discount" % reflected in the button total,
  size dropdowns for fallback steps.

- Product page: the design's four layouts (Gallery left, Full-width photo, Details left /
  gallery right, Dark dossier) as a Layout setting, plus `product.hero`, `product.info-left`
  and `product.dossier` templates (assign per product or preview with `?view=`).
- "Choose your pack": Pack blocks (quantity + display discount, or subscription via the
  product's selling plan); every price, the add button and the cart quantity/selling plan
  follow the chosen pack and size. Spec blocks for the dossier. Sticky add-to-bag bar,
  breadcrumb, stock/service line.

### Changed
- Hotspots open on hover and stay open while the pointer is on the card; tap on touch.
- "Our story" (image-text) is a full-bleed 50/50 split with a height cap, copy centred.
- Statement copy: "Wake up to skin that feels soft, looks rested, and glows well past noon."
- All dropdowns: larger chevron with more right padding.
- Tabs underline in terracotta; footer "Join" button and signed-in account initials per design.
- One field style for every input, textarea and dropdown on every page (44px tall, 16px side
  padding, hairline border, ink on hover, terracotta focus ring); buttons 44px (primary
  checkout / add-to-bag 48px); quantity steppers match; checkboxes/radios in terracotta.
- Spacing on a 2/4 grid site-wide: 0–12px in steps of 2, then multiples of 4 (margins,
  paddings, gaps, offsets, sizes). Font sizes on the same scale (10–20px even, then
  multiples of 4); body text 15px → 16px.

## [1.2.0] — 2026-09-26

Header, cart, product and account chrome brought in line with `design-reference/`.

### Added
- Mega menu with the design's layout: columns from a three-level menu (collection item
  counts as notes), featured card, footnote bar, scrim; "Mega menu" header blocks.
- Account dropdown for signed-in customers (initials, orders, addresses, saved, log out).
- Save for later: `save-button` snippet, `saved-items` section, `page.saved` template,
  "Save for later" on cart lines and "Move to bag" on saved items (kept in the browser).
- Cart page promo code (via `/discount/CODE`), summary with discounts/delivery/total,
  trust badges and payment icons; cart drawer suggestions ("Complete your routine").
- Product page: rating line from `reviews.rating` metafields, lead text, large price with
  unit price, "Choose your pack" for native selling plans, price in the add button, save
  button, badges and highlight blocks.
- Footer: Shop / Company / Help / Certified columns; mobile dock labels Shop / Search / Bag / You.
- `tools/preview/shoot-states.mjs` for open mega menu and cart drawer screenshots.

### Changed
- `main-cart` and `cart-drawer` rebuilt to the design (`free-shipping-bar` snippet removed).
- Header styles moved from an inline block into `theme.css.liquid`; scroll shadow.

## [1.1.0] — 2026-09-26

Every page brought in line with the original design in `design-reference/` (#7).

### Added
- Sections: `category-showcase`, `collection-tabs`, `image-product-tiles`,
  `statement`, `bundle`, `media-carousel`, `testimonials`, `cta-banner`,
  `page-intro`, `multicolumn`, `image-gallery`, `collection-banner`,
  `collection-links`, `shoppable-look`, `blog-posts`.
- Alternate product template `product.serum` (Radiance Serum No.3 page).
- `article-card` and `faq-item` snippets; heart icon for the perk bar.

### Changed
- Homepage, About, Product, Collection, Lookbook, Contact, FAQ, Journal,
  Article, 404 and Legal templates follow the design's order and copy.
- `team-grid`, `contact-form`, `faq-accordion`, `main-blog`, `main-404` and
  `legal-links` rebuilt to the design (setting IDs and form fields unchanged).

### Fixed
- `theme check` back to 0 offenses (hardcoded `/collections/all` routes,
  unclosed elements in the FAQ).
- Found in the store preview of the 1.1.0 draft: contact section border now
  spans wide screens; no grey bar after the last category chip; carousel
  arrows hidden when every card fits; empty-journal message.

## [1.0.1] — 2026-09-26

Released with `theme_version` still reading 1.0.0.

### Fixed
- Homepage 404 after ZIP upload: `perk-bar` declared both `default` and
  `presets`, so Shopify dropped it and `templates/index.json` with it (#6).
- Unstyled storefront: stylesheet linked as `theme.css.liquid` instead of the
  compiled `theme.css` (#6).
- Broken/blank images from `shopify://shop_images` defaults; bundled assets
  are used as fallbacks instead (#4, #5).

## [1.0.0] — 2026-09-19

- First installable Online Store 2.0 theme, rebuilt from the design mockups (#1).
