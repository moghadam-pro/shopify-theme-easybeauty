# Design ↔ theme gap (design export of 26 Sep 2026 vs theme 1.2.0)

`design-reference/` was refreshed from the design project export `easybeauty-pure-theme.zip`
(the `*.dc.html` sources, the Modernist design system, the written brief in
`design-reference/uploads/beauty-store-design-brief.md`). This file compares that source —
pages, shared chrome and brief — against the live theme **EasyBeauty 1.2.0** and lists what is
left to build. Tick items off here as they ship and mention them in `CHANGELOG.md`.

## What changed in the design since the first export

Compared with the pages the theme was first built from (git history of
`design-reference/pages/`), copy and page structure are unchanged. The changes are:

| Change | Where |
|---|---|
| **Dark mode** — sun/moon toggle in the header, remembered per browser, full dark palette (`html[data-theme="dark"]`) | SiteHeader, every page's tokens |
| Hard-coded colours replaced by tokens (`--t1`…`--t7`, `--dark-bg`, `--accent-fill`, `--imgbg`, `--plate*`); accent colour configurable | every page |
| "Cart" renamed **"Bag"** everywhere (drawer title, buttons, aria labels) | Landing, Product, Collection, Bag drawers |
| Product page: **availability row** under the buy buttons — "In stock — ships within 24h · Free delivery over $75 · 60-day returns, opened or not" | Product |
| Accessibility pass: 44px minimum touch targets (header icons, quantity steppers, footer links 38px), `aria-live` on bag count / promo / form notes, `aria-expanded` on accordions, `aria-pressed` on filters, descriptive aria-labels ("Add one more …"), links underlined with `text-decoration` instead of borders | all |
| Account menu: Your details · Saved (count) · Orders · Help & contact, each with a note | SiteHeader |
| **Landing Centered** — alternate homepage: centred hero copy with a thin vertical rule, bottom of the photo fading into sand, hotspots moved low with the **price** in each card, card opens above the dot, 180 ms close delay | new page |
| **Header Options** — five header studies: 1A centred wordmark (what the theme ships), 1B flush-left single tier, 1C two tiers with a category rail, 1D inverted ink masthead, 1E editorial stacked masthead | new page |

## Gap list

Status: ✅ in the theme · 🟡 partly · ❌ missing · ⛔ not possible in a theme (Shopify-hosted)

### Global
| Item | Status | Notes |
|---|---|---|
| Announcement bar, 3 rotating messages | ✅ | |
| Mega menu (columns, notes, feature, footnote) | ✅ | Main menu set up in Admin with the design's Shop / Collections structure (items link to all products until category collections exist) |
| Header layout options 1B–1E | ❌ | Theme ships 1A only; could become a `layout` setting |
| Dark mode toggle + dark palette | ❌ | |
| "Bag" wording everywhere | 🟡 | Page title says "Your bag"; drawer still says "Your cart (n)", button "Checkout" |
| 44px touch targets, aria-live / aria-expanded / aria-pressed, underline links | 🟡 | Some present (focus rings, aria-current); needs the pass above |
| Predictive search with product images (brief §4) | ❌ | Search drawer submits to /search; Shopify's `/search/suggest` endpoint would power this |
| Welcome popup, 10% offer, delay/exit intent (brief §5) | ❌ | |
| Fade-up on scroll, 300 ms crossfades (brief §2) | ❌ | Respect `prefers-reduced-motion` |
| Account menu items as designed (Your details, Saved, Orders, Help & contact + notes) | 🟡 | Theme: Orders, Addresses, Saved, Log out |
| Checkout, customer account pages, phone/OTP sign-in (AuthModal) | ⛔ | Styled in Settings → Checkout → Customize |

### Product card (brief §4 — used on home, collection, PDP)
| Item | Status |
|---|---|
| Secondary image crossfade on hover | ❌ |
| Lift on hover + "Quick add" sliding up over the image (always visible on mobile) | ❌ |
| Badges as pills (Selling fast violet, New green, Sale, Sold out) | 🟡 (Sale only) |
| Star rating + review count under the name | ❌ |

### Homepage
| Item | Status | Notes |
|---|---|---|
| Hero hotspots | ✅ | Card has no pointer/tail, no price, no viewport auto-flip, no close delay |
| Centred hero variant (Landing Centered) | ❌ | Hero offers copy left/right only |
| Category showcase | ✅ | Mobile should become horizontal chips (brief §5.3) |
| Tabs + badge grid, texture tiles, statement, bundle, video carousel, reviews, story, quiz CTA, newsletter | ✅ | |

### Collection
| Item | Status | Notes |
|---|---|---|
| Banner, category chips, quiz prompt | ✅ | |
| Filters as a left sidebar (desktop) / drawer (mobile), price range, rating, in-stock | 🟡 | Theme uses inline dropdowns over the grid |

### Product
| Item | Status |
|---|---|
| Rating line, lead, sizes, big price, packs, add-to-bag with price, save, badges, highlights, accordions | ✅ |
| Availability row (in stock / free delivery / returns) | ❌ |
| Sticky mobile add-to-bag bar after the main button scrolls away | ❌ |
| Breadcrumb; video in the gallery ("How to use · 0:12") | ❌ |
| Reviews filterable by skin type | ⛔ needs a reviews app |

### Bag / cart
| Item | Status |
|---|---|
| Lines, save for later, summary, promo, trust badges, payment icons, drawer upsell | ✅ |
| Wording "Your bag", "Apply code", "Add one more …" labels | 🟡 |

### Other pages
About, Contact, FAQ, Legal, Lookbook, Quiz, Journal, Article, 404: ✅ content and layout match;
the design's changes there are the global accessibility/underline items above.

## Suggested order for 1.3.0

1. Wording + accessibility pass (Bag wording, touch targets, aria-live/expanded/pressed, underline links).
2. Product card hover (crossfade, quick add, badge pills, rating).
3. Product availability row + sticky mobile add-to-bag bar + breadcrumb.
4. Dark mode (toggle, palette from the design tokens).
5. Hero: centred layout option, hotspot price/tail/auto-flip/close delay; category chips on mobile.
6. Predictive search; welcome popup; fade-up motion.
7. Collection sidebar filters; header layout options.
