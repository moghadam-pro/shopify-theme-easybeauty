# Design reference (not a theme)

This folder is **not** a Shopify theme and is **not** deployed anywhere. It holds the design
source the `/theme` folder is built from, so every section, string and colour has a paper trail.

## What this is

The EasyBeauty look and copy were designed as a Claude design project. Each page and shared
component is a `*.dc.html` file: an HTML template (`<x-dc>` with `{{ bindings }}`, `<sc-for>`,
`<sc-if>`, `<dc-import>`) plus a `<script type="text/x-dc">` component class holding the page's
data and behaviour. They render only inside the design tool's runtime (`support.js`,
`image-slot.js`), not in a plain browser and not in Shopify.

This copy was taken from the project export `easybeauty-pure-theme.zip` (26 Sep 2026), which
replaced an earlier set of pages decoded from the bundled site export (see git history).

## Layout

| Path | What it is |
|---|---|
| `EasyBeauty *.dc.html` | One file per page: Landing, Landing Centered (alternate homepage with a centred hero), Collection, Product, Bag, Checkout, Account, About, Contact, FAQ, Legal, Lookbook, Quiz, Blog, Blog Post, 404 |
| `SiteHeader.dc.html`, `SiteFooter.dc.html`, `MobileDock.dc.html`, `AuthModal.dc.html` | Shared chrome imported by every page |
| `Header Options.dc.html` | Header layout variants explored for the site header |
| `_ds/modernist-…/` | The "Modernist" design system the pages use: tokens and component classes (`styles.css`), manifest, lint rules, readme |
| `assets/` | The photos the pages reference (`hero`, `skin`, `apply`, `p1`–`p4`) at web size — identical to the theme's `lifestyle-*`, `hero-banner` and `sample-product-*` assets |
| `uploads/beauty-store-design-brief.md` | The written UX/visual brief the design answers (sections, interactions, image direction) |
| `uploads/pasted-*.png` | Reference screenshots supplied while designing |
| `support.js`, `image-slot.js` | The design tool's runtime; kept so the sources stay complete |

Not committed (too large, and derivable): the bundled `site/` export (~1.9 MB per page with
every asset inlined), its `site_src/` copy, the full-resolution originals of `hero`, `skin`
and `apply` (1.5–2.2 MB each), and three large reference uploads (`Wide Shoulders Beauty
Hero.png`, two 5 MB screenshots). They remain in the original project export.

## Tokens worth knowing

The pages use a light and a **dark** palette (`html[data-theme="dark"]`, toggled from the
header) built from shared tokens: surfaces `--cream`, `--off`, `--sand`; ink `--ink`; text
tones `--t1`–`--t7`; accent `--terra` / `--accent-fill`; dark bands `--dark-bg`; image
placeholder `--imgbg`. Fonts: Bodoni Moda (display) and Archivo (UI/body).

## How this feeds the theme

- Tokens → `theme/assets/theme.css.liquid` (`:root`).
- Shared chrome → `theme/sections/header.liquid`, `footer.liquid`, `snippets/mobile-dock.liquid`.
- Each page → its template in `theme/templates/`; see `/docs/PAGE-MAPPING.md` for the
  page → template/section table and `/docs/DECISIONS.md` for what was deliberately done
  differently (checkout and customer accounts are Shopify-hosted, auth is Shopify's).
