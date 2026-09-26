# Changelog

All notable changes to the EasyBeauty theme. Versions follow
[Semantic Versioning](https://semver.org/) and match `theme_info.theme_version`
in `theme/config/settings_schema.json` (shown in Shopify Admin under the theme
name) and the `vX.Y.Z` git tag. See "Releasing" in `docs/DEVELOPMENT.md`.

## [1.1.0] — 2026-09-26

Every page brought in line with the original design in `design-reference/` (#7).

### Added
- Sections: `category-showcase`, `collection-tabs`, `image-product-tiles`,
  `statement`, `bundle`, `media-carousel`, `testimonials`, `cta-banner`,
  `page-intro`, `multicolumn`, `image-gallery`, `collection-banner`,
  `collection-links`, `shoppable-look`, `blog-posts`.
- Alternate product template `product.serum` (Radiance Serum No.3 page).
- `article-card` and `faq-item` snippets; heart icon for the perk bar.

### Changed
- Homepage, About, Product, Collection, Lookbook, Contact, FAQ, Journal,
  Article, 404 and Legal templates follow the design's order and copy.
- `team-grid`, `contact-form`, `faq-accordion`, `main-blog`, `main-404` and
  `legal-links` rebuilt to the design (setting IDs and form fields unchanged).

### Fixed
- `theme check` back to 0 offenses (hardcoded `/collections/all` routes,
  unclosed elements in the FAQ).
- Found in the store preview of the 1.1.0 draft: contact section border now
  spans wide screens; no grey bar after the last category chip; carousel
  arrows hidden when every card fits; empty-journal message.

## [1.0.1] — 2026-09-26

Released with `theme_version` still reading 1.0.0.

### Fixed
- Homepage 404 after ZIP upload: `perk-bar` declared both `default` and
  `presets`, so Shopify dropped it and `templates/index.json` with it (#6).
- Unstyled storefront: stylesheet linked as `theme.css.liquid` instead of the
  compiled `theme.css` (#6).
- Broken/blank images from `shopify://shop_images` defaults; bundled assets
  are used as fallbacks instead (#4, #5).

## [1.0.0] — 2026-09-19

- First installable Online Store 2.0 theme, rebuilt from the design mockups (#1).
