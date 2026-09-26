# Mockup → theme page mapping

Each of the 16 pages exported from the original Claude Artifacts mockup (see
`/design-reference`) maps to a template and section(s) in `/theme`. "Simplified" links to the
relevant entry in `DECISIONS.md`.

| Mockup file | Theme template | Main section(s) | Notes |
|---|---|---|---|
| `EasyBeauty Landing.html` | `templates/index.json` | `hero` (3 hotspots), `perk-bar`, `category-showcase`, `collection-tabs`, `image-product-tiles`, `statement`, `bundle`, `media-carousel`, `testimonials`, `image-text` (our story), `cta-banner`, `newsletter` | Same order and copy as the mockup. The popup/announcement rotator were not ported |
| `EasyBeauty Product.html` | `templates/product.json` (all products) + `templates/product.serum.json` (Radiance Serum) | `main-product`, `multicolumn` (study results), `product-recommendations`, `image-text` (Why No.3), `image-gallery` (community), `testimonials` | Serum-specific copy lives in the alternate template so it never shows on other products. Assign it in Admin → Products → Theme template. Live reviews need a reviews app |
| `EasyBeauty Collection.html` | `templates/collection.json` | `collection-banner`, `collection-links` (category chips), `main-collection`, `image-text` (quiz prompt) | Real `collection.filters` + `paginate`, not mock data |
| `EasyBeauty Bag.html` | `templates/cart.json` + cart drawer | `main-cart` (lines, save for later, summary, promo code, trust badges), `saved-items`; `cart-drawer` (free-shipping bar, suggestions, payment icons) | Promo codes go through Shopify's `/discount/CODE` route and apply at checkout |
| `EasyBeauty Checkout.html` | *(none — see Decisions)* | — | Checkout isn't a theme file on non-Plus stores |
| `EasyBeauty Account.html` | Shopify customer accounts + `templates/page.saved.json` | header account dropdown, `saved-items` | New customer accounts are Shopify-hosted (styled in the checkout editor); `customers/*` templates serve classic accounts |
| `EasyBeauty Blog.html` | `templates/blog.json` | `main-blog` (featured newest article + card grid), `newsletter` | Real `blog.articles` + pagination |
| `EasyBeauty Blog Post.html` | `templates/article.json` | `main-article`, `blog-posts` (keep reading), `newsletter` | Real `article.content`, optional native comments |
| `EasyBeauty About.html` | `templates/page.about.json` | `page-intro`, `multicolumn` (stats), `about-values`, `multicolumn` (timeline), `image-text`, `team-grid`, `cta-banner` | |
| `EasyBeauty Contact.html` | `templates/page.contact.json` | `page-intro`, `multicolumn` (channels), `contact-form` (topics, side details, Q&A) | Real Shopify `{% form 'contact' %}` |
| `EasyBeauty FAQ.html` | `templates/page.faq.json` | `page-intro`, `faq-accordion` (group nav), `cta-banner` | Merchant-editable question groups via blocks |
| `EasyBeauty Legal.html` | `templates/page.legal.json` | `page-intro`, `legal-links`, `multicolumn` (company / data requests) | Links to Shopify's native policy pages instead of hardcoded legal text — see Decisions |
| `EasyBeauty Lookbook.html` | `templates/page.lookbook.json` | `page-intro`, `multicolumn` (index), `shoppable-look` ×4, `cta-banner` | Each look: photo hotspots + product list + add-all-to-bag |
| `EasyBeauty Quiz.html` | `templates/page.quiz.json` | `quiz` | Real tag-based product matching against a merchant-chosen collection — see Decisions |
| `EasyBeauty 404.html` | `templates/404.json` | `main-404` (with search), `multicolumn` (shortcuts) | |
| `index.html` (bundler loader stub) | — | — | Not a real page in the mockup either; no theme equivalent needed |
| `SiteHeader.dc.html` | *(every template, via `header-group.json`)* | `sections/header.liquid` | Mega menu from a 3-level menu + "Mega menu" blocks (feature card, footnote); account dropdown; scroll shadow |
| `SiteFooter.dc.html` | *(every template, via `footer-group.json`)* | `sections/footer.liquid` | Shop / Company / Help menus (`footer-shop`, `footer-company`, `footer-help`) + Certified text column |
| `MobileDock.dc.html` | *(every template, rendered from `theme.liquid`)* | `snippets/mobile-dock.liquid` | |
| `AuthModal.dc.html` | *(not ported — see Decisions)* | — | Replaced by Shopify's native `/account/login`, `/account/register` |

Pages not in the original 16 but required by Shopify's theme spec were added from scratch
(`templates/search.json`, `list-collections.json`, `gift_card.liquid`, `password.json`, and
the remaining `customers/*.json` — login, register, addresses, order, activate_account,
reset_password) since a theme without them fails Shopify's validation.
