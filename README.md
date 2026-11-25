# EasyBeauty — Shopify theme

A custom Shopify **Online Store 2.0** theme for EasyBeauty, a skincare brand: cream/terracotta
palette, Archivo + Bodoni Moda type, twelve-product catalog with a skin quiz, lookbook, and
journal (blog).

## Repository structure

```
theme/              ← the actual Shopify theme (deployable root — see below)
design-reference/    ← the original AI-generated mockups this theme's design/copy came from
                       (not a theme, not deployed — see design-reference/README.md)
docs/                ← architecture, decisions, dev/release, and Theme Store docs (see below)
```

**Start with `/docs/ARCHITECTURE.md`** for how the theme is put together, and
`/docs/DEVELOPMENT.md` for how to run, lint, and push it to a store.

## Why the restructure

The theme was originally generated in another session by exporting pages from Claude's
Artifacts tool. That export (now preserved for reference under `/design-reference`) is a set
of static HTML files using a proprietary preview-only renderer — it has no `sections`,
`blocks`, `templates`, or Liquid at all, so it could not be installed on Shopify. This version
rebuilds the same visual design and content as a real Online Store 2.0 theme: standard
`layout/config/locales/sections/snippets/templates/assets` structure, JSON templates
composed of schema-driven sections, and real Shopify objects (`product`, `collection`, `cart`,
`customer`, `blog`) instead of mock data. It passes Shopify's official linter
(`theme-check`) with 0 offenses. Full rationale in `/docs/DECISIONS.md`.

## Quick start

```bash
cd theme
shopify theme dev --store your-store.myshopify.com
```

See `/docs/DEVELOPMENT.md` for linting and publishing.

## Documentation

| Doc | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the theme is built: templates, sections, CSS tokens, color schemes, fonts, JS |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local dev, linting, releasing a version, building and uploading the ZIP |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why things are the way they are |
| [docs/PAGE-MAPPING.md](docs/PAGE-MAPPING.md) | Design mockup page → theme template/section |
| [docs/DESIGN-HANDOFF.md](docs/DESIGN-HANDOFF.md) | Design handoff notes |
| [docs/THEME-STORE-READINESS.md](docs/THEME-STORE-READINESS.md) | Theme Store review of the theme: open blockers and fix order |
| [docs/THEME-STORE-SUBMISSION.md](docs/THEME-STORE-SUBMISSION.md) | How to sell on the Shopify Theme Store: fees, rules, submission, review, after launch |
| [CHANGELOG.md](CHANGELOG.md) | Every release |
