# Theme architecture

`/theme` follows Shopify's standard **Online Store 2.0** theme architecture — the same
layout Shopify's own reference theme (Dawn) and every theme in the Shopify Theme Store use.
This document explains what each folder is for and the specific architectural choices made
for EasyBeauty.

## Folder structure

```
theme/
├── layout/
│   ├── theme.liquid        # the HTML shell every page renders inside
│   └── password.liquid     # shell used only for the storefront password page
├── config/
│   ├── settings_schema.json  # merchant-editable theme settings (colors, layout, cart)
│   └── settings_data.json    # the values currently applied to those settings
├── locales/
│   ├── en.default.json         # storefront-facing strings (buttons, labels, messages)
│   └── en.default.schema.json  # theme-editor-facing strings (setting/section names)
├── sections/    # reusable, schema-driven page building blocks
├── snippets/    # small includes with no schema (icons, product-card, price, drawers)
├── templates/   # one JSON file per page type, composed of sections
│   └── customers/  # account/login/register/addresses/order templates
└── assets/      # CSS, JS, self-hosted fonts, images
```

This is a deliberate, standard shape — it's what `theme-check` (Shopify's official linter)
validates against, and it's what makes the theme installable via `shopify theme push` and
editable in the Shopify theme editor. The `/theme` root itself must be a folder Shopify can
zip and upload directly (or use as a Shopify CLI project root); nothing above it matters to
Shopify.

## Section groups (header/footer)

`layout/theme.liquid` renders the header and footer via **section groups**:

```liquid
{% sections 'header-group' %}
...
{% sections 'footer-group' %}
```

`sections/header-group.json` and `sections/footer-group.json` each list which sections render
in that slot and in what order. This is the current (2023+) recommended pattern over hardcoding
`{% section 'header' %}` directly in the layout, because it lets merchants add, reorder, or
remove whole sections (e.g. a promo bar) above/below the header from the theme editor without
a code change. `header-group.json` currently orders `announcement-bar` → `header`.

## Sections vs. snippets vs. templates

- **A template** (`templates/*.json`) is *what page type this is* — it just lists which
  sections render, in what order, with what starting settings. Shopify requires one for every
  route type it defines (`index`, `product`, `collection`, `cart`, `404`, `search`,
  `list-collections`, `blog`, `article`, `page`, `gift_card`, `password`, and each
  `customers/*`), which is why `theme-check` fails the build if any is missing — that's the
  full list this theme now defines, versus zero JSON templates the previous export had.
- **A section** (`sections/*.liquid`) is a self-contained, merchant-configurable component
  with a `{% schema %}` block declaring its `settings` and (optionally) repeatable `blocks`.
  Anything a merchant should be able to edit, reorder, or add without touching code is a
  section. Product-specific pages use one dominant `main-*` section (`main-product`,
  `main-cart`, …) matching Dawn's naming convention, so the pattern is recognizable to any
  Shopify developer who opens this theme.
- **A snippet** (`snippets/*.liquid`) is a plain `{% render %}`-able include with no schema —
  used for things repeated across many sections that a merchant never edits directly on their
  own (an icon, a product card, the cart drawer markup, the price snippet).

## Data model: real Shopify objects, not mock content

The single biggest structural problem with the previous `html-theme` export was that it had
no data model at all — copy, prices, and product cards were hardcoded strings inside a
JS-templating layer (`{{ p.title }}`, `sc-for list="{{ products }}"`) that only ever ran inside
Claude's own artifact preview. Every one of those has been replaced with the real Shopify
Liquid object it corresponds to:

| Mockup pattern | Real Shopify equivalent used here |
|---|---|
| `sc-for list="{{ products }}"` product grid | `{% for product in collection.products %}` |
| Hardcoded `$32`, `4.9 stars`, `1,284 reviews` | `{{ product.price \| money }}`, real variant/price objects |
| `{{ count }}` cart badge | `{{ cart.item_count }}`, refreshed via the Cart AJAX API |
| Client-only `localStorage` "signed in" state | Shopify's actual `customer` object + native `/account` routes |
| `onClick="{{ someJsFunction }}"` handlers | real `data-*` attributes wired up in `assets/theme.js` |

## Styling and fonts

`assets/theme.css.liquid` (a Liquid-processed CSS asset — the `.css.liquid` extension lets it
read `settings.*` for merchant-editable colors/spacing) carries over the exact design tokens
from the mockups' own design system (`--cream`, `--ink`, `--terra`, the type scale, button/
card/form styles) as plain CSS custom properties, so the visual identity is unchanged even
though the underlying markup is now real Liquid. Archivo and Bodoni Moda are self-hosted
(the same `.woff2` files the mockups used, trimmed to the latin + latin-ext subsets and the
weights actually used) rather than pulled from Google Fonts at runtime.

## JavaScript

`assets/theme.js` is vanilla JS with no build step and no framework — it replaces the
mockups' custom `DCLogic`/`dc-runtime` component system (a claude.ai-artifact-only renderer,
see `/design-reference/README.md`) with plain `fetch`/DOM code against Shopify's real
storefront endpoints: `/cart/add.js`, `/cart/change.js`, `/cart.js`, the Section Rendering API
(`/?section_id=cart-drawer`) for live cart updates, and `/recommendations/products` for the
product recommendations section.

## Validating changes

Run [Shopify's `theme-check`](https://shopify.dev/docs/themes/tools/theme-check) after any
edit — see `/docs/DEVELOPMENT.md`. This theme currently passes with **0 offenses**.
