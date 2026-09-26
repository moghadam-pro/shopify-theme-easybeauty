# Decisions and known simplifications

Rebuilding 16 static mockup pages as a real, installable Shopify theme required a few
deliberate departures from the mockups. Each is listed here with the reasoning, so it reads
as an intentional decision rather than a missed detail.

## Checkout page was not built

`EasyBeauty Checkout.html` has no equivalent under `/theme`. On Shopify, checkout is not a
theme template you can freely author:

- On **most plans**, checkout content/styling is controlled entirely through
  **Settings → Checkout / Checkout branding** in Shopify Admin, not theme files.
- **`checkout.liquid`** (the old fully-custom checkout) only exists on **Shopify Plus**, and
  Shopify is actively migrating Plus stores to **Checkout Extensibility** (UI extensions +
  the branding editor) instead of a Liquid file at all.

Building a `checkout.liquid` into this theme would either not run on most stores, or actively
break once Plus finishes deprecating it. The mockup's thank-you-page copy and delivery-method
labels are preserved in `/design-reference/EasyBeauty Checkout.dc.html` if a Plus merchant
wants to hand them to a checkout extension later.

## Auth modal → native customer accounts

`AuthModal.dc.html` was a client-only, `localStorage`-backed "signed in" simulation with no
real backend. It's replaced by Shopify's actual customer accounts system
(`templates/customers/login.json`, `register.json`, etc.), which is real, secure, and
supports password reset, order history, and address management out of the box. The header's
account icon links to `/account` or `/account/login` depending on `customer` being present,
matching the mockup's intent (a compact account affordance in the header) without
reimplementing auth in JavaScript.

Stores on **new customer accounts** (Shopify-hosted, the default for new stores) never use
the `customers/*` templates: login, orders, addresses and profile are rendered by Shopify and
styled in **Settings → Checkout → Customize** (logo, colours, fonts). The header still shows the
design's account dropdown (initials, orders, addresses, saved, log out) for signed-in customers.
The design's "Saved" list is a theme page (`page.saved`) backed by the browser, as in the mockup.

## Mega menu → the design's layout, driven by a real menu

The mockup's mega menu (three columns with per-item notes, a featured product card, a
footnote bar, a scrim) was hardcoded in JavaScript (`const MEGA = {...}` in
`SiteHeader.dc.html`). Since 1.2.0 `sections/header.liquid` reproduces that layout but reads
a three-level Shopify menu (**Online Store → Navigation**, default `main-menu`): level 1 =
header links, level 2 = columns, level 3 = items. Collection links show their product count
as the item note. The featured card, footnote bar and each column's "all" label come from
"Mega menu" blocks in the header section, matched to a header link by its title — so every
link stays merchant-editable and the look matches the mockup.

## Quiz → real tag-based matching

`EasyBeauty Quiz.html`'s result step matched hardcoded product IDs to hardcoded answers. The
`quiz` section instead lets a merchant pick a **result collection** in the theme editor and
tag each answer option with a **product tag** (e.g. "dry", "sensitive", "minimal"); the quiz
tallies the tags picked across all questions and shows/hides real products from that
collection whose `product.tags` match the top tag client-side. This keeps the "answer six
questions, get a routine" UX with actual store inventory instead of frozen demo data.

## Legal page → links to Shopify's native policies

Shopify stores legal policy text (privacy, terms, refunds, shipping) as first-class objects
(`shop.privacy_policy`, `shop.terms_of_service`, `shop.refund_policy`, …) managed under
**Settings → Policies**, each served automatically at its own URL. `page.legal.json` /
`legal-links` section links out to whichever of those the merchant has filled in, rather than
duplicating legal text inside the theme — copying legal copy into a template is exactly the
kind of thing that goes stale and creates liability when it's not the system of record.

## What was *not* simplified

Everything else — hero/perks/best-sellers/ingredient sections on the homepage, the full
product page (variants, gallery, accordion, recommendations), collection filtering and
pagination, the AJAX cart drawer and cart page, blog/article, About/Contact/FAQ/Lookbook, the
404 page, and every `customers/*` template — is a full, real implementation against live
Shopify data (`product`, `collection`, `cart`, `customer`, `blog`, `article`, `order`
objects), not a stub. `theme-check` (Shopify's official linter) passes with 0 offenses; see
`/docs/DEVELOPMENT.md` for how to re-run it.
