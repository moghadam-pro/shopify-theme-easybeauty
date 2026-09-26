# Design handoff

Design changes made during review, and the code/logic follow-ups they leave for development.
Preview any of this without a store: `cd tools/preview && npm install && npm run preview`
(see `/docs/DEVELOPMENT.md`). The theme still passes `theme-check` with 0 offenses.

## Round 1 — layout bugs and empty sections

| Problem | Change | Files |
| --- | --- | --- |
| Sections had no side gutter: `.section { padding: … 0 }` overrode `.container`'s side padding | `.section` uses `padding-block` only | `assets/theme.css.liquid` |
| Hero headline and buttons were clipped on phones (copy was inside `.hero__media`, which has `overflow: hidden`) | Copy moved out of `.hero__media`; phones get a 4:3 image with the copy below it. New `copy_position` setting (left/right); homepage uses `right` because the bundled photo's subject is on the left. Hotspot moved off the buttons | `sections/hero.liquid`, `assets/theme.css.liquid`, `locales/en.default.schema.json`, `templates/index.json` |
| Block-based sections rendered empty on a fresh install. A schema `default` only applies to statically rendered sections, never to sections listed in JSON templates | Blocks written into the templates: perk bar, About values + team, lookbook, FAQ (11 questions), quiz (6 questions), product accordions, announcement bar, footer columns. Copy comes from `design-reference/` | `templates/*.json`, `sections/*-group.json` |
| Every image area was a grey placeholder until the merchant uploaded one. The bundled photos in `assets/` were never used | Hero, image-with-text and lookbook fall back to `hero-banner.jpg` / `lifestyle-*.jpg`. Featured collection falls back to `collections.all` instead of "Example product" cards | `sections/hero.liquid`, `sections/image-text.liquid`, `sections/lookbook-grid.liquid`, `sections/featured-collection.liquid` |
| Product grids were one column on phones | New `.grid--products` class keeps 2 columns under 600px; perk bar is 2×2 on phones | `assets/theme.css.liquid`, product-grid sections |
| Footer showed "Shop / Company / Help" headings with no links | Columns point at Shopify's default `main-menu` and `footer` menus; a column whose menu has no links is skipped | `sections/footer.liquid`, `sections/footer-group.json` |

## For development

- **Quiz tags.** The six questions use these option tags: `dry`, `oily`, `balanced`,
  `brightening`, `acne`, `anti-aging`, `sensitive`, `resilient`, `minimal`, `full`, `retinoid`,
  `vitamin-c`, `starter`, `spf-daily`, `spf`. The quiz JS in `assets/theme.js` matches them against
  product tags, so real products need matching tags. The JS handles any number of steps, but the
  result ranking should be checked with six answers and real product tags.
- **The quiz block allows only 3 options.** The design reference has 4 on some questions
  (for example "Oily centre, dry edges"). Adding `option_4`/`tag_4` needs schema, locale and JS work.
- **FAQ copy states policy facts** (free shipping over $75, $4.90 flat rate, 60-day returns,
  EU-only shipping, delivery times). These come from the mockup and must be confirmed by the store
  owner before launch. The announcement bar and perk bar say the same things.
- **Footer menus.** Stores always have `main-menu` and `footer`. If a separate "Company" menu is
  wanted, create it in the admin and add a `link_list` block.
- **Sample product images** `assets/sample-product-*.jpg` are PNG files with a `.jpg` extension.
  Browsers cope, but they should be re-exported as real JPEG/WebP (they are 100–190 KB each).
- **Lookbook** only has two fallback photos, so the third tile repeats the first. Real lookbook
  photos need uploading per block.
