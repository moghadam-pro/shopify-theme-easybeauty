# Selling EasyBeauty on the Shopify Theme Store

How to get from this repository to a paid theme listed on themes.shopify.com. Facts below
were read from shopify.dev on 2026-11-25; re-check the linked pages before submitting,
because Shopify changes these rules.

- Overview and revenue share: <https://shopify.dev/docs/storefronts/themes/store>
- Requirements: <https://shopify.dev/docs/storefronts/themes/store/requirements>
- Review process: <https://shopify.dev/docs/storefronts/themes/store/review-process>
- How to submit: <https://shopify.dev/docs/storefronts/themes/store/review-process/submit-theme>
- Fees: <https://shopify.dev/docs/storefronts/themes/store/revenue-share>

What still blocks EasyBeauty from passing review is tracked in
[THEME-STORE-READINESS.md](THEME-STORE-READINESS.md).

## 1. Money

| Item | Rule |
|---|---|
| Submitting | Free ("no fees for submitting themes for listing") |
| Shopify's share | **15% revenue share**, calculated on gross sales |
| Processing | 2.9% processing fee plus applicable sales tax (some countries add a regulatory operating fee) |
| Payouts | Partner Dashboard → Payouts → Themes tab |
| Price | Set in the submission form. The pages read didn't state a price range; check the form. |

## 2. Before you submit

### Accounts and stores

1. **Shopify Partner account** at partners.shopify.com. You accept the Shopify Partner
   Agreement when you submit.
2. **Demo store per preset.** Each preset needs at least one demo store, created as a
   **client transfer store** in the Dev Dashboard. Development stores can't be used,
   because they can't be transferred. Fill the store with real skincare content (not the
   snowboard sample products on the current dev store).
3. **Documentation site and a support contact form.** Both must be live before launch and
   are linked from the listing. Point `theme_documentation_url` and `theme_support_url` (or
   `theme_support_email`) in `config/settings_schema.json` at them. Today they point at
   GitHub, which won't do.

### Code rules that decide eligibility

- **Original code.** Shopify's Skeleton Theme is the only approved starting codebase;
  anything else must be fully original. Themes built on or derived from **Dawn or Horizon
  are not eligible**. EasyBeauty was written from scratch (see `DECISIONS.md`), so keep it
  that way: don't paste Dawn sections or snippets in.
- **Fonts** must come from `font_picker`. Custom fonts aren't accepted. *(Done in 1.11.0.)*
- **Colors:** a color system with at least 4 colors. *(Color schemes, done in 1.11.0.)*
- **Lighthouse:** average **performance ≥ 60** and **accessibility ≥ 90**, measured on the
  home, product and collection pages, on both desktop and mobile.
- **Required features**, among others: cart-page discounts, accelerated checkout buttons,
  faceted search filtering, gift cards, predictive search, selling plans and Follow on Shop.
  The full list is on the requirements page.
- **Fully tested.** "Poorly tested themes will be rejected without further review."

### Presets

- Any number is allowed. One preset must use the theme's own name ("EasyBeauty").
- Preset names: 1–2 words, under 30 characters.
- With more than one preset, the ZIP needs a `/listings` folder holding a separate template
  set for each additional preset.

### Release info

Every submission needs a version number and release notes. These come from
`theme_info.theme_version` and `CHANGELOG.md` (see "Releasing a version" in
[DEVELOPMENT.md](DEVELOPMENT.md)).

## 3. Submitting

1. Build the ZIP from a tagged release: `tools/package.sh` → `dist/EasyBeauty.zip`.
2. Partner Dashboard → **Themes** → **Submit a theme**.
3. Add the ZIP, tick the Partner Agreement, then click **Upload file**.
4. Fill in the **Theme submission form**: listing text for the theme and for each preset,
   screenshots, demo store per preset, price, documentation and support links.
5. Click **Submit**.

You can upload changes while the theme is waiting, but only until the review team starts
reviewing it. From then on, changes are locked until you get their assessment.

## 4. Review

Five stages, in order. Each must pass before the next starts:

1. Features and Online Store 2.0 compatibility
2. Lighthouse performance and accessibility
3. Technical requirements: pages, consistency, browsers, assets, SEO, accessibility, social
4. Design and UX: settings, font picker, color system, responsive images
5. Pre-launch: exclusivity, naming, demo stores, documentation, support

- Results arrive by email: either **rejected**, or a list of required changes you can reply
  to and discuss.
- Only one theme can be under review at a time, unless you already have a published theme.
- After a rejection you must **wait 30 days** to resubmit. Resubmitting without fixing the
  reasons can get the account temporarily suspended. So submit only when
  THEME-STORE-READINESS.md has no open blockers and Lighthouse passes.
- Shopify doesn't publish a review duration.

## 5. After approval

- Reply to merchant support requests **within two business days**. They arrive through the
  contact form.
- Fix critical bugs immediately, or the theme may be temporarily removed from the store.
- Keep the documentation current with each release.
- Updates go through the Partner Dashboard as new versions. See
  <https://shopify.dev/docs/storefronts/themes/store/success/updates> for the rules.

## 6. Checklist

- [ ] Every blocker in THEME-STORE-READINESS.md fixed
- [ ] Lighthouse ≥ 60 performance and ≥ 90 accessibility (home, product, collection;
      desktop and mobile)
- [ ] Theme tested on all templates, browsers and screen sizes, in the theme editor too
- [ ] Presets decided and named; `/listings` folder if there is more than one
- [ ] One client transfer demo store per preset, filled with real content
- [ ] Public documentation site and support contact form; URLs in `theme_info`
- [ ] Listing text and screenshots for each preset
- [ ] Price chosen
- [ ] Version tagged, CHANGELOG entry written, ZIP built with `tools/package.sh`
- [ ] Partner account ready, then submit
