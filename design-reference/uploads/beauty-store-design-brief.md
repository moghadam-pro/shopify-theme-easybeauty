# Design Brief — Minimal Luxury Beauty & Cosmetics E-commerce Store

> Note: this is a **visual/UX design brief**, rewritten in English and stripped of Shopify/Liquid implementation details (schema, section files, app stack) so it can be handed to a design tool rather than a coding agent. A separate, dev-facing spec with Shopify OS2 technical notes exists alongside this file if needed later.

---

## 1. Brand Mood & Design Direction

**Overall feeling:** minimal, luxury, editorial, calm — closer to a high-end skincare campaign than a typical fast-beauty e-commerce site. Generous whitespace and restraint communicate premium positioning more than any single decorative element.

**Reference points:** quiet luxury minimalism (large hero photography, serif display type, muted warm neutrals), combined with a few highly interactive, "editorial magazine" moments (hover-reveal hotspots, hover image-swap navigation) that make the site feel alive without feeling busy.

**What to avoid:** saturated/neon colors, aggressive countdown-timer urgency tactics, cluttered grids, generic stock-photo look (flat white studio backgrounds), heavy drop shadows, playful gamified popups (spin-wheels) — none of this fits the brand's quiet-luxury register.

---

## 2. Design System

### Color palette
- **Base/background:** warm cream (#F5F0EA), light sand (#E8DFD3), off-white (#FBFAF8)
- **Text:** soft near-black warm brown (#2B241D) — never pure black
- **Accent (pick one direction, not both):**
  - Warm route: terracotta / dusty rose (#C97B63, #E7A99B)
  - Cool/clinical route: deep olive green (#3F4A3D)
- **Badges:** dusty violet for "Selling fast" (#8B7FD1), muted green for "New" (#4A7A5C)
- Maximum of one accent color family used consistently across the whole site. No gradients, no neon.

### Typography
- **Display/headline:** editorial high-contrast serif (Fraunces, Canela, Playfair Display, or similar) — large, light-weight, slightly generous letter-spacing (+1–2%). This carries most of the "luxury" feeling.
- **Body/UI:** clean minimal sans (Inter, Söhne, Helvetica Now) for navigation, buttons, product info, body copy.
- Hero headline size: ~56–72px desktop / ~32–40px mobile.

### Spacing, shape, motion
- Vertical section padding: 96–160px desktop, 48–64px mobile — whitespace is a primary design tool here.
- Border-radius: large/pill for chips and rounded inline images; soft (12–16px) for cards; sharp-to-soft mix for buttons depending on section.
- Container max-width: 1400–1600px, 24–32px gutters.
- Motion: gentle fade-up on scroll-into-view (400–600ms ease-out), soft 300ms crossfades for image swaps, no bouncy/springy easing.

---

## 3. Sitemap

```
Home
├── Shop
│   ├── All Products
│   ├── Collections: New / Best Sellers / Sale
│   ├── Shop by Category (Serum, Cleanser, Moisturizer, Eye Care, Body…)
│   ├── Shop by Concern (Hydration, Anti-aging, Brightening, Acne, Sensitive)
│   └── Bundles / Routines
├── Skin Quiz (Find Your Routine)
├── Product Detail Pages
├── About / Our Story
├── Ingredients / Clean Beauty
├── Journal (Blog)
├── Loyalty / Rewards
├── FAQ / Shipping & Returns
├── Contact
├── Cart
└── Account
```

---

## 4. Global Components

**Announcement bar** — thin strip above header, 3 rotating messages (welcome offer, free-shipping threshold, current promo), 4s fade cycle.

**Header** — sticky after ~80px scroll. Logo (centered or left), mega menu (Shop by Category / Shop by Concern / Best Sellers / New / Sale / Skin Quiz) with small product thumbnails next to each category link, predictive search with product images, account icon, cart icon with item-count badge.

**Footer** — Shop links / Help (FAQ, Shipping & Returns, Track Order) / About (Story, Ingredients, Sustainability) / Loyalty / Newsletter form / social icons / trust badges (Cruelty-free, Vegan, Secure checkout) / legal links.

**Cart drawer** (slides in from the right) — free-shipping progress bar at top ("You're $18 away from free shipping 🎁" with a filling bar), line items with quantity stepper, a "You may also like" row (2–3 small horizontal upsell products), optional free-sample picker, large checkout button with payment-method icons underneath.

**Sticky mobile add-to-cart bar** — appears on PDP only, after the user scrolls past the main buy button: small thumbnail, name, price, compact variant selector, Add to Cart button.

**Product card (used everywhere — home, collection, PDP related products)** — this is the "Salient-style" card:
- Default state: primary product photo, name, price, small star rating + review count under the name.
- **Desktop hover:** (1) primary photo crossfades in ~300ms to a secondary lifestyle/texture photo; (2) card lifts slightly (`translateY(-4px)`) with a softer shadow; (3) a "Quick Add" button slides up from the bottom edge of the image (`translateY(100%) → 0`, ~250ms) and sits on the image's lower edge; (4) if the product has color/shade variants, small color swatches appear alongside the quick-add button.
- **Mobile:** no hover state exists — tapping the image opens the PDP; the Quick Add button is always visible in a small fixed position under the image (no reveal animation).
- Badges (Best Seller / New / Sold Out / Selling Fast) sit as small pill shapes in the top-left corner of the image, colored per the badge palette above.

---

## 5. Homepage — Section-by-Section Design Spec

The homepage flow below blends a standard high-converting beauty-store skeleton with several distinctive interactive "hero moments." Each block should be its own modular, independently orderable section.

### 5.1 — Hero: Interactive Hotspot Hero ⭐️ (the single most important section on the site)

**Full description (build this exactly, no reference image will be supplied):**
A full-bleed lifestyle photo of a model at rest — eyes closed, warm natural side-lighting (golden hour feel), bare or partially bare shoulders, calm "self-care" mood, minimal neutral beige backdrop. No text sits directly baked into the photo itself except:
- A **centered headline** overlaying the photo (top-third or vertically centered), large editorial serif type, e.g. "Love Your Skin" or "Glow From Within" — elegant, restrained, minimal-luxury tone.
- On top of the photo, at 2–3 meaningful points (e.g., over the cheek, over the shoulder), small **floating circular hotspot buttons** sit, each showing a `+` icon by default.
- **Desktop behavior:** hovering a hotspot morphs its icon from `+` to `–` (rotate or crossfade) and opens a **minimal horizontal info card** anchored near that point. The card has: a small square thumbnail image on the left, a short bold title (e.g., "Radiant Skin Glow"), and a 1–2 line description (e.g., "Daily hydration keeps your cheeks soft, plump, and glowing."). Card style: white background, soft rounded corners, subtle shadow, small pointer/tail connecting it to the hotspot. Clicking the card navigates to the related product or category.
- A small **dot pagination indicator** may sit lower on the image if the hero rotates through multiple photo/hotspot sets as a slideshow (optional).
- **Mobile behavior:** hover doesn't exist, so tapping a hotspot opens its card (only one card open at a time); the card's position should auto-flip (up/down/left/right) so it never spills outside the viewport.

### 5.2 — Trust bar
Thin strip directly under the hero: 4 small line-icons + short label each (Free shipping over $X · Cruelty-free & vegan · Dermatologist tested · Secure checkout).

### 5.3 — Category Hover-Swap ("Shop by Category")
A large full-bleed photo (warm-toned beauty portrait) fills the section background. On the left, overlaid on the photo, a **vertical stacked list of category names** in large serif type (e.g., Serum / Recovery / Daily Care / Eye Care / Body). By default one item (say "Recovery") is bold/full-opacity while the rest sit muted/semi-transparent.
- **Desktop hover:** hovering any category name makes it bold/full-opacity while the others mute, and the **background photo crossfades** (~400ms) to an image relevant to that category. Clicking navigates to that category's collection page.
- **Mobile:** convert to a horizontally scrollable row of chip-style tabs; tapping a chip swaps the photo beneath it — no hover needed.

### 5.4 — Best Sellers: Tabs + Badge Grid
A horizontal tab row above the grid: `What's hot` / `Best sellers` / `Sale`, with a "Shop All Products" link on the far right. Below, a 4-column grid (2-column mobile) of Product Cards (section 4) with colored badge pills on the image corners (`Selling fast!` in violet, `New` in green). Switching tabs swaps the grid content via AJAX (no full page reload).

### 5.5 — "Shop the Texture" Split Feature
Two large macro/close-up photos side by side (stacked on mobile) — e.g., "cream texture swirled on the back of a hand" and "toner dripping into an open palm." These should read as extreme close-up, moody-lit product-texture photography. Each photo carries a small floating product card in its bottom-left corner (thumbnail + product name + price, always visible, no hover needed) that links to that product's PDP.

### 5.6 — Benefit Statement with Inline Image Chips
A large bold sans-serif headline, centered, on a plain light background, where a few words are replaced mid-sentence by small **pill/oval-shaped inline photo tokens** — for example: "Make you look **[oval photo: smiling model]** and feel glowy **[oval photo: dropper bottle]** and healthy **[oval photo: close-up skin with cream swipe]**." This is a pure typography+micro-image moment with no CTA — its job is purely to reinforce brand feeling. On mobile the sentence can wrap across multiple lines but the ovals must stay inline with the text, not break out into a separate stacked layout.

### 5.7 — Shoppable Bundle ("Build Your Routine")
Two columns (stacked on mobile): left is a large lifestyle still-life photo of 3 products styled together on natural props (stone, dried flowers, fabric), each product carrying a small **numbered circular badge (1, 2, 3)** pinned directly onto it in the photo. Right is a heading ("Level up your routine with the bundle") followed by a **numbered list** matching those same numbers — each row: small thumbnail, product name, a size/variant dropdown, and price. Below the list, an "Add Bundle to Cart" button showing the combined price (and bundle discount if applicable, e.g. "Save 10% as a set").

### 5.8 — Shoppable Video Carousel ("Best Skincare Products")
Centered serif heading. Below it, a **horizontally scrollable row** of vertical auto-playing muted video tiles (UGC-style application clips), each with a small play/pause icon in its top-left corner.
⚠️ **Important sizing correction:** each video tile must be narrower than a typical full-width carousel tile (roughly 220–260px wide on desktop) so that a **compact horizontal product card sits directly beneath each video and both are fully visible in the same viewport at once** — the user should never need to scroll vertically just to see which product the video is showcasing. Each carousel "item" is really a paired block: [small video on top / small horizontal product card below]. Horizontal scroll via native swipe on mobile, drag-to-scroll or arrow buttons on desktop.

### 5.9 — Social Proof Strip
Large centered brand rating (e.g., "4.8 ★ — 12,400+ reviews") followed by a horizontal carousel of short customer quotes, each paired with a small photo/UGC thumbnail. Press logos ("As seen in…") if available.

### 5.10 — Brand Story / Founder
Large half-page photo paired with a short brand-philosophy paragraph (why the brand exists, its skincare philosophy). "Read Our Story" link through to the About page.

### 5.11 — Skin Quiz CTA Banner
Full-width banner on the accent color, heading like "Not sure where to start? Take the 60-second Skin Quiz," large CTA button.

### 5.12 — Email/SMS Capture
Simple centered signup form with a concrete offer ("Get 10% off your first order") as a static section right before the footer (separate from any popup behavior).

### Popup behavior (site-wide, not a homepage section)
Exit-intent or ~5-second delay: a minimal welcome-discount popup (email field, "10% OFF") — no gamified spin-wheel; that register clashes with the quiet-luxury tone.

---

## 6. Collection (PLP) Page

- Top banner: small collection image + heading + 1–2 lines of unique SEO description copy per collection.
- Filter/sort bar: filters (Concern, Skin Type, Ingredient, Price) as a left sidebar on desktop / collapsible drawer on mobile; sort control (Featured / Best selling / Newest / Price) on the right.
- Product grid using the same Product Card component (section 4).
- Filter state persists in the URL (for SEO and back-button behavior).

---

## 7. Product Detail Page (PDP)

Section order (based on patterns observed across top-performing beauty brands, adapted to this brand's minimal-luxury tone):

1. Breadcrumb
2. Image gallery (including at least one macro/texture shot and one short usage video)
3. Product title
4. Star rating + review count (clickable, jumps to reviews)
5. Short benefit-driven hero line (sensory, outcome-first — not a formulation name)
6. Shade/variant selector (swatches, not a dropdown, if color-based)
7. Add-to-cart button with price shown inside the button
8. Trust icon row (Cruelty-free · Vegan · Dermatologist tested)
9. 4–6 benefit bullets (feature → benefit structure)
10. Expandable accordion: full Ingredients (INCI) / How to Use / FAQ
11. Consumer-study stat callout (e.g., "87% saw brighter skin in 2 weeks" — only if real data exists)
12. Bundle cross-sell ("Complete the Routine")
13. Short brand/founder narrative
14. UGC gallery
15. Full reviews section (filterable by skin type/age)
16. Related products (same hover Product Card)

Sticky mobile add-to-cart bar activates once the user scrolls past the primary buy button (section 4).

---

## 8. Cart & Checkout

- Cart drawer as described in section 4.
- Free-shipping progress bar.
- In-drawer "Complete your routine" upsell row.
- Optional free-sample picker (phase 2).
- Trust badges (payment icons, secure checkout) near the checkout button.

---

## 9. Supporting Pages (brief)

- **About:** long-form brand narrative + large photography (hero/category-swap photographic style), founder/team, values.
- **Skin Quiz:** 4–5 questions (skin type, primary concern, age, sensitivity) → outputs a recommended routine with direct links to products.
- **Ingredients/Clean Beauty:** key active ingredients explained, "free-from" list, full INCI transparency.
- **Loyalty:** points explanation, VIP tiers, a brand-specific program name rather than a generic "Rewards."

---

## 10. Interaction Pattern Summary

| Pattern | Where used | Mobile behavior |
|---|---|---|
| Hero Hotspot | Homepage hero | Tap-to-open, one card open at a time |
| Category Hover-Swap | Shop by Category | Horizontal scrollable chip tabs |
| Product Card (crossfade + quick add) | Everywhere | No hover; add-to-cart always visible |
| Tabs + Badge Grid | Homepage & PLP bestsellers | Horizontally scrollable tabs |
| Texture Split Shoppable | Homepage | Columns stack vertically |
| Benefit Inline Chips | Homepage | Wraps to multiple lines, smaller chips |
| Bundle Hotspot Numbered | Homepage + Bundle page | Photo on top, list below |
| Video Carousel Shoppable | Homepage | Same horizontal scroll, video+card paired block |

---

## 11. Image & Visual Asset Brief

**Golden rule:** every image across the site shares one consistent color grade (warm, creamy, soft contrast — never flat studio-white flash) so the whole site feels like one cohesive photoshoot rather than stock photography stitched together.

Suggested generation prompts per section:

1. **Hero (5.1):** "Editorial beauty portrait, young woman with closed eyes, natural glowing skin, warm golden-hour sunlight from the side, minimal neutral beige background, soft shadows, bare shoulders, no-makeup-makeup look, high-end skincare campaign photography, medium-format film aesthetic, shallow depth of field, 16:9." Need at least a desktop full-bleed crop and a taller mobile crop.

2. **Category hover-swap (5.3):** 4–5 images in the same visual family, each focused on a different action/product (serum on face, cream on hand, closed-eye model, eye-cream close-up) — same model or visually consistent models for brand continuity.

3. **Texture split (5.5):** "Extreme macro close-up of a hand, cream texture swirled on skin / serum drops on an open palm, dark moody background, dramatic side lighting, warm tones, high-detail product photography." Need 2 images (cream texture + liquid/serum texture).

4. **Bundle hotspot (5.7):** "Flat-lay lifestyle product photography, 3 skincare bottles/jars styled on natural stone and terracotta props, a single dried flower stem, warm terracotta-red fabric backdrop, soft studio lighting, editorial still-life composition." One composite hero image.

5. **Video carousel (5.8):** 4–6 short vertical loops (5–8 seconds) of product application (massaging serum into cheek, applying a mask, spraying toner). If video generation isn't available yet, substitute static images in the same vertical crop and upgrade to video later.

6. **Bestseller/PLP product thumbnails:** product on a neutral warm-beige or off-white (never pure-white) background, plus a secondary lifestyle/texture image per product for the hover-swap state.

7. **UGC/social proof section:** 6–8 UGC-style images (authentic-feeling, not overly polished) showing a range of skin types, ages, and ethnicities — important for building trust, consistent with best practice from top-performing beauty brands.

8. **Brand story:** 1–2 images of the founder or brand environment (lab, natural ingredients, or a model in a natural setting).

**Diversity note:** models should represent a range of ages and skin tones rather than a single narrow demographic — this also supports the trust-building role of UGC content.

---

## 12. Copywriting Direction (brief — full detail in the companion research file)

- Concern-first headlines ("Fades dark spots," not "Contains niacinamide").
- Sensory language: at least 2 sensory descriptors per product description ("silky," "weightless," "dewy").
- Benefit bullets follow a feature → benefit formula: "Hyaluronic Acid → Floods skin with hydration, plumping fine lines instantly."
- Email popup CTA: state the concrete value ("10% off your first order"), not just "Subscribe."
- No unsubstantiated claims — if the copy says "dermatologist tested," that claim needs to be real.

---

## 13. Open Assumptions to Confirm

- [ ] Site language/direction — this brief assumes English/LTR (all benchmark references were English with EUR/USD pricing); confirm if Persian/RTL is actually the target.
- [ ] Final brand name and logo
- [ ] Final accent color direction (terracotta/rose vs. olive green)
- [ ] Image sourcing plan (AI-generated vs. real photography vs. a mix) and timeline
- [ ] Initial product/category list (needed to populate the mega menu and the hero hotspots)
- [ ] Whether free samples/bundle discounts launch in phase 1 or phase 2
