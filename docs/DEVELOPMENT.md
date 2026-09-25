# Building, testing, and publishing the theme

## Prerequisites

Install the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli):

```bash
# macOS
brew tap shopify/shopify
brew install shopify-cli

# Windows / other — see https://shopify.dev/docs/api/shopify-cli#installation
```

You'll also need a Shopify store to develop against (a free
[development store](https://shopify.dev/docs/api/development-stores) is enough).

## Local development

From the `theme/` folder (this is the theme root Shopify CLI expects):

```bash
cd theme
shopify theme dev --store your-store.myshopify.com
```

This starts a local preview server with hot reload against your store's real data (products,
collections, etc. must already exist in that store/dev store for pages like `product.json` or
`collection.json` to show real content instead of the theme editor's placeholders).

## Store-less preview (design review)

`tools/preview/` renders every template to static HTML with [liquidjs](https://liquidjs.com),
a set of Shopify tag/filter shims, and mock data (12 products, a cart, a blog), then takes
desktop (1440px) and mobile (390px) full-page screenshots. Use it to review design changes
without a store or Shopify login:

```bash
cd tools/preview
npm install
npm run preview          # render + screenshots → out/*.html, out/shots/*.png
node render.mjs index    # render only some pages
```

It is an approximation: admin-uploaded images, real filters, predictive search, and Shopify's
own scripts don't exist there. Mock data lives in `tools/preview/mock-data.mjs`. The real check
is still `shopify theme dev`.

## Linting (theme-check)

Shopify's official linter catches broken schemas, missing translation keys, missing required
templates, accessibility issues (missing `width`/`height` on images), and more. It ships with
the Shopify CLI:

```bash
cd theme
shopify theme check
```

Or standalone, without the full CLI (what was used while building this theme, via the
`theme-check` Ruby gem):

```bash
gem install theme-check
theme-check theme/
```

This theme currently passes with **0 offenses**. Run this before every commit that touches
`/theme` — a broken `{% schema %}` block or a missing locale key will otherwise only surface
once you're staring at the theme editor.

## Pushing to a store

```bash
cd theme
shopify theme push --store your-store.myshopify.com          # push to a new/unpublished theme
shopify theme push --store your-store.myshopify.com --theme <id>   # push to a specific theme
shopify theme push --live --store your-store.myshopify.com   # ⚠ publishes to the live storefront
```

Never `--live`-push straight from a feature branch to a production store without review —
push to an unpublished theme first, preview it, then publish from Admin.

## Pulling merchant changes back

If a merchant edits colors/content in the theme editor, those settings live in
`config/settings_data.json` on the *store's* copy of the theme, not in this repo. Pull them
down before you keep editing locally, or you'll overwrite their changes on next push:

```bash
shopify theme pull --store your-store.myshopify.com --theme <id>
```

## Adding a new page type

1. Add a section under `sections/` with a `{% schema %}` block (copy the shape of an existing
   `main-*` section as a starting point).
2. Add a template under `templates/` (or `templates/customers/` for account pages) that lists
   it, following the existing `{"sections": {...}, "order": [...]}"` shape.
3. Add any new setting/block labels to **both** `locales/en.default.schema.json` (editor-facing)
   and, if the section renders customer-facing copy through `| t`, `locales/en.default.json`.
4. Run `theme-check` — it will flag a missing template, a missing translation key, or a schema
   typo immediately.

## Where things live

See `/docs/ARCHITECTURE.md` for the full folder-by-folder breakdown, `/docs/PAGE-MAPPING.md`
for how the original design mockups map onto this theme's templates, and `/docs/DECISIONS.md`
for why a few things (checkout, the mega menu, the quiz) were deliberately rebuilt differently
rather than ported 1:1.
