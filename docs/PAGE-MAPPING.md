# Mockup → theme page mapping

Each of the 16 pages exported from the original Claude Artifacts mockup (see
`/design-reference`) maps to a template and section(s) in `/theme`. "Simplified" links to the
relevant entry in `DECISIONS.md`.

| Mockup file | Theme template | Main section(s) | Notes |
|---|---|---|---|
| `EasyBeauty Landing.html` | `templates/index.json` | `hero`, `perk-bar`, `featured-collection`, `image-text` ×2, `newsletter` | Hero hotspot re-implemented as a real block type |
| `EasyBeauty Product.html` | `templates/product.json` | `main-product`, `product-recommendations` | Real variants/price/gallery; "Complete the routine" = Shopify product recommendations |
| `EasyBeauty Collection.html` | `templates/collection.json` | `main-collection` | Real `collection.filters` + `paginate`, not mock data |
| `EasyBeauty Bag.html` | `templates/cart.json` + cart drawer | `main-cart` / `cart-drawer` (section, in every layout) | Both the full cart page and the header drawer are real, AJAX-driven |
| `EasyBeauty Checkout.html` | *(none — see Decisions)* | — | Checkout isn't a theme file on non-Plus stores |
| `EasyBeauty Account.html` | `templates/customers/account.json` | `main-customer-account` | Real `customer`/`customer.orders` objects |
| `EasyBeauty Blog.html` | `templates/blog.json` | `main-blog` | Real `blog.articles` + pagination |
| `EasyBeauty Blog Post.html` | `templates/article.json` | `main-article` | Real `article.content`, optional native comments |
| `EasyBeauty About.html` | `templates/page.about.json` | `rich-text`, `about-values`, `image-text`, `team-grid` | Split into reusable sections rather than one fixed page |
| `EasyBeauty Contact.html` | `templates/page.contact.json` | `contact-form` | Real Shopify `{% form 'contact' %}` |
| `EasyBeauty FAQ.html` | `templates/page.faq.json` | `faq-accordion`, `contact-form` | Merchant-editable question groups via blocks |
| `EasyBeauty Legal.html` | `templates/page.legal.json` | `legal-links` | Links to Shopify's native policy pages instead of hardcoded legal text — see Decisions |
| `EasyBeauty Lookbook.html` | `templates/page.lookbook.json` | `lookbook-grid` | Each tile is a block linking an image to a product |
| `EasyBeauty Quiz.html` | `templates/page.quiz.json` | `quiz` | Real tag-based product matching against a merchant-chosen collection — see Decisions |
| `EasyBeauty 404.html` | `templates/404.json` | `main-404` | |
| `index.html` (bundler loader stub) | — | — | Not a real page in the mockup either; no theme equivalent needed |
| `SiteHeader.dc.html` | *(every template, via `header-group.json`)* | `sections/header.liquid` | Nav now reads a real Shopify menu (`linklist`), editable in Admin → Navigation |
| `SiteFooter.dc.html` | *(every template, via `footer-group.json`)* | `sections/footer.liquid` | Newsletter block posts to Shopify's real customer-tagging endpoint |
| `MobileDock.dc.html` | *(every template, rendered from `theme.liquid`)* | `snippets/mobile-dock.liquid` | |
| `AuthModal.dc.html` | *(not ported — see Decisions)* | — | Replaced by Shopify's native `/account/login`, `/account/register` |

Pages not in the original 16 but required by Shopify's theme spec were added from scratch
(`templates/search.json`, `list-collections.json`, `gift_card.liquid`, `password.json`, and
the remaining `customers/*.json` — login, register, addresses, order, activate_account,
reset_password) since a theme without them fails Shopify's validation.
