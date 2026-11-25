# Theme Store readiness review — EasyBeauty

Reviewed 2026-11-25 against the `test` branch (theme_version 1.10.0), plus the `easybeauty5`
draft (1.9.0) on the dev store. The live theme on the store is still 1.4.0.

Method: `shopify theme check` (recommended and `theme-check:all`), a grep audit against the
Theme Store feature requirements, and HTML audits of the draft's home, collection, product,
cart, search, blog, page, list-collections and 404 pages.

Status legend: **Blocker** = a Theme Store reviewer will reject for this. **Major** = likely
rejection or a failed review round. **Minor** = polish.

## 1. Structure vs. a standard OS 2.0 theme (Dawn / Horizon)

| Folder | Standard | EasyBeauty | Gap |
|---|---|---|---|
| layout/ | theme, password | ✓ | — |
| templates/ (+ customers/) | all required types | ✓ all present, incl. gift_card, password, list-collections | — |
| sections/ + section groups | header-group, footer-group | ✓ 55 sections, both groups | no `@app` blocks anywhere |
| blocks/ (theme blocks) | Horizon-era themes ship reusable blocks | **missing** | recommended for new submissions |
| snippets/ | ✓ | ✓ 10 | — |
| assets/ | CSS/JS, icons | CSS/JS **plus 7 demo photos** (font files removed in 1.11.0) | see 2.4, 2.5 |
| config/ | settings_schema with color schemes, font pickers | no `color_scheme_group`, no `font_picker` | see 2.3 |
| locales/ | en + many storefront and schema translations | en only | Minor/Major |

## 2. Blockers

1. **No app blocks.** No section declares `{"type": "@app"}`, and the rendered pages have no
   `shopify-app-block`. At minimum, main-product, featured-collection, main-cart, and a generic
   "apps" section need it.
2. **The product page is not block-based.** In `main-product`, title, price, variant picker,
   quantity, buy buttons and description are hard-coded. Only pack/spec/highlight/accordion are
   blocks. Merchants must be able to reorder or remove these parts.
3. **Required product features are missing:**
   - dynamic checkout button (`form | payment_button`)
   - Shop Pay Installments banner (`form | payment_terms`)
   - pickup availability (`variant.store_availabilities`)
   - quantity rules and volume pricing (`variant.quantity_rule`, `quantity_price_breaks`)
   - complementary products (`recommendations` with `intent: 'complementary'`)
   - gift card recipient form (`gift_card_recipient` fields)
   - variant swatches from option values (`value.swatch`)
4. ✅ *Fixed in 1.11.0.* **No color schemes.** Theme Store requires `color_scheme_group` in settings plus a
   `color_scheme` setting on sections. Today a custom `color_scheme` select exists in only a few
   sections.
5. ✅ *Fixed in 1.11.0.* **No `font_picker`.** Archivo and Bodoni Moda are bundled as woff2 in assets, so merchants
   can't change typography. Both fonts are in Shopify's font library: switch to
   `font_picker` + `font_face`.
6. **Bundled demo photos are used as fallbacks.** `hero-banner.jpg`, `lifestyle-*.jpg` and
   `sample-product-*.jpg` render whenever a setting is empty: 38 on the homepage, 8 on the
   product page, even on the 404 page. Blank states must use `placeholder_svg_tag` (or render
   nothing), and the images need documented licensing or removal.
7. **No localization selectors.** Header and footer have no country/currency or language
   selectors (`form 'localization'`).
8. **No theme editor events.** `theme.js` doesn't listen for `shopify:section:load/unload`,
   `shopify:block:select` etc. Sliders, drawers, the hero, and the mega menu stop working after
   a merchant edits a section in the editor.
9. **JS budget.** theme-check `AssetSizeJavaScript` **error**: `theme.js` (67 KB, loaded on
   every page from theme.liquid and password.liquid) exceeds 10 KB compressed. Split it per
   section and load each part with `defer` or on interaction.

## 3. Major

- **Gift card** has no QR code (`gift_card.qr_identifier`) and no copy-code button.
- **Cart** has no cart note setting and no quantity-rule handling.
- **Accessibility:** cart-drawer upsell thumbnail links have no accessible name, and the
  search-drawer input has no label (found on every page). Run Lighthouse/axe on home, product
  and collection: the Theme Store requires average accessibility ≥ 90 and performance ≥ 60.
  This review couldn't run Lighthouse because the store is password-protected in a fresh
  browser.
- **theme_info:** documentation and support point to a GitHub repo. Theme Store needs public
  documentation, a support email or URL, and `theme_author` equal to the partner/brand name.
- **Presets and demo store:** each preset (style) needs its own demo store with real
  skincare content. The dev store has snowboard sample products. Plan for 1–3 presets.
- **theme-check warnings:** `legal-document.liquid` lines 38/60/63/75 (`UnclosedHTMLElement`,
  conditional open/close tags) and `main-product.liquid:221` (`BlockIdUsage`).

## 4. Minor

- Additional locale files: at least fr, de, es, it, ja, nl, pt-BR plus `*.schema.json`.
- Inline `style=` in 29 places. Move to CSS custom properties where possible.
- The store uses new customer accounts, so the classic `customers/*` templates are never
  rendered. They're still required, so keep them working and styled.
- Branches: `design-reference-v2` (gap report) isn't merged into `test`, and `test` (1.5–1.10)
  isn't merged into `main`.

## 5. Suggested order

1. Settings foundation: color schemes + font pickers (touches CSS tokens everywhere).
2. main-product rebuilt as blocks + `@app` + required commerce features.
3. `@app` support in other sections, plus an "Apps" section.
4. Replace demo-image fallbacks with placeholders and remove the photos from assets.
5. Theme editor event handling + split theme.js.
6. Localization selectors, gift card QR, cart note, accessibility fixes.
7. Lighthouse pass, translations, presets + demo store, docs/support URLs, submission.
