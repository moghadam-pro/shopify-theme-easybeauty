# Changelog

All notable changes to the EasyBeauty theme. Versions follow
[Semantic Versioning](https://semver.org/) and match `theme_info.theme_version`
in `theme/config/settings_schema.json` (shown in Shopify Admin under the theme
name) and the `vX.Y.Z` git tag. See "Releasing" in `docs/DEVELOPMENT.md`.

## [Unreleased]

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
