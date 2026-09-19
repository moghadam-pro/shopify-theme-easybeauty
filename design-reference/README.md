# Design reference (not a theme)

This folder is **not** a Shopify theme and is **not** deployed anywhere. It exists so the
visual and content brief behind the `/theme` folder has a paper trail.

## What this is

An earlier session produced the EasyBeauty look and copy using Claude's Artifacts tool
(a design/prototyping surface), then exported each artifact as a `.html` "bundled page" —
a self-contained blob that reconstructs the DOM at runtime from a base64-encoded manifest
plus a proprietary `dc-runtime`/`x-dc` custom-element renderer. That export format:

- is not Liquid, has no `sections`/`blocks`/`templates`, and cannot be installed on Shopify;
- inlines every asset (fonts, images, the renderer itself) as base64 inside each file, which
  is why the original 16 files were ~1.8–1.9 MB **each** (≈28 MB total) despite being static
  marketing pages;
- uses non-standard tags (`<dc-import>`, `<sc-for>`, `<sc-if>`, `{{ mustache }}` bindings) that
  only work inside claude.ai's own artifact preview — opening one of the original exports in a
  plain browser mostly just unpacks assets, it doesn't render the design.

## What's here instead

`pages/*.html` are the **decoded** templates — real HTML/CSS with the mockup's own component
classes, with the base64 manifest stripped out and every asset it referenced extracted to
`assets/` (deduplicated: 15 pages that each embedded the full Archivo/Bodoni Moda font set and
a handful of photos now share one copy of each). This is why the folder is ~2.4 MB instead of
~28 MB. Internal links between pages were rewritten to match the on-disk filenames.

These pages still reference `<dc-import>`/`<sc-for>` and won't fully render standalone in a
browser (no header/footer chrome, hotspot/quiz interactivity is inert) — they're kept as
copy/design reference, not as something to open and click through. `SiteHeader.dc.html`,
`SiteFooter.dc.html`, and `MobileDock.dc.html` are the shared chrome components; the rest are
one file per page.

## How this fed the real theme

Every section, string, and color in `/theme` was read out of these files:

- Palette (`--cream #F5F0EA`, `--ink #2B241D`, `--terra #94513C`, …), Archivo + Bodoni Moda
  typography → `theme/assets/theme.css.liquid` (`:root` tokens).
- `SiteHeader.dc.html` / `SiteFooter.dc.html` / `MobileDock.dc.html` → `theme/sections/header.liquid`,
  `theme/sections/footer.liquid`, `theme/snippets/mobile-dock.liquid`.
- Each `EasyBeauty *.html` page → the corresponding template in `theme/templates/`; see
  `/docs/PAGE-MAPPING.md` for the full page → template/section table and what was simplified
  along the way (mega-menu → linklist dropdown, client-only "auth modal" → Shopify's native
  `/account/login`, `Checkout.html` → left undone, since checkout isn't a theme file — see
  `/docs/DECISIONS.md`).

Font files in `assets/` are the same self-hosted Archivo/Bodoni Moda `.woff2` subsets copied
into `theme/assets/`, just not de-duplicated down to the trimmed weight/subset list the theme
actually ships (the theme keeps latin + latin-ext only, at the weights it uses).
