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
labels are preserved in `/design-reference/pages/EasyBeauty_Checkout.html` if a Plus merchant
wants to hand them to a checkout extension later.

## Auth modal → native customer accounts

`AuthModal.dc.html` was a client-only, `localStorage`-backed "signed in" simulation with no
real backend. It's replaced by Shopify's actual customer accounts system
(`templates/customers/login.json`, `register.json`, etc.), which is real, secure, and
supports password reset, order history, and address management out of the box. The header's
account icon links to `/account` or `/account/login` depending on `customer` being present,
matching the mockup's intent (a compact account affordance in the header) without
reimplementing auth in JavaScript.

## Mega menu → linklist-driven dropdown

The mockup's header mega menu was three hand-curated columns plus a feature image, entirely
hardcoded in JavaScript (`const MEGA = {...}` in `SiteHeader.dc.html`) — a merchant could not
change a single link without editing code. `sections/header.liquid` instead reads a real
Shopify navigation menu (`link_list` setting, defaulting to `main-menu`) and renders nested
links as a dropdown panel. This means less visual flourish (no feature image column) but a
merchant can now add/remove/reorder every nav item from **Online Store → Navigation** — which
is the point of a theme built for a real store rather than a single fixed prototype.

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
