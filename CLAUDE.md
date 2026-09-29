# EasyBeauty theme — working rules

Shopify Online Store 2.0 theme in `theme/`. Design source: the owner's Claude Design exports
(landing, product, collection, header, footer). Work on the branch the owner names (currently
`test`); package with `tools/package.sh` only when asked.

## Design standards (always apply)

- **Spacing grid**: every margin, padding, gap, offset and element size is on the 2/4 scale —
  `0 2 4 6 8 10 12`, then multiples of 4 (`16 20 24 28 32 36 40 44 48 …`). Border widths
  (1px / 2px) and letter-spacing are exempt. Values that are derived from other sizes (e.g. the
  sticky `--header-offset`) live in a custom property, not a raw number.
- **Font sizes**: `10 12 14 16 18 20`, then multiples of 4 (`24 28 32 36 40 44 48 …`). No
  fractional sizes. Body text is 16px.
- **Form fields**: every input, select and textarea uses the shared field style — 44px tall
  (`--control-height`), 16px side padding, 1px `--color-border`, ink border on hover,
  terracotta focus ring. Dropdowns use the larger chevron with room on the right. Buttons next to
  fields are 44px; primary checkout / add-to-bag buttons 48px.
- **Colours**: never hard-code a hex in component CSS. Use the tokens in `theme.css.liquid`
  (`--ink --off --cream --terra --color-border --t1…--t5 --color-accent-100…800
  --color-inverse-bg/text`). Muted shades are `color-mix()`ed from the base colours so Theme
  settings and dark mode recolour everything. Large dark surfaces (announcement bar, footer,
  dossier, quick-add bar) use `--color-inverse-*`.
- **Dark mode** must keep working for anything new (check `html[data-theme="dark"]`).

Check with the preview tool (`tools/preview`: `node render.mjs && node shoot.mjs`) at 1440px and
390px, and re-run the grid check before committing.

## Merchant-editable by default

Everything a buyer of the theme would want to change is a section/block setting or a Theme
setting — copy, images, links, colours, layouts (product page layouts, header logo position,
mega menu options), with sensible defaults in the JSON templates. Links that must work on a fresh
store use plain paths (`/pages/quiz`), not `shopify://` references. Navigation comes from
Shopify menus (Online Store → Navigation); footer columns use editable "Links" blocks so they
work without menus.

## Checks

- `theme-check theme/` — no new offenses (baseline: TemplateLength, SchemaJsonFormat,
  LiquidTag and one ImgLazyLoading suggestion).
- `node --check theme/assets/theme.js`
- Every new schema label is a `t:` key in `locales/en.default.schema.json`; storefront strings in
  `locales/en.default.json`.
