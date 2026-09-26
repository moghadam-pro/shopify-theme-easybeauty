#!/usr/bin/env bash
# Builds the uploadable theme ZIP: dist/EasyBeauty.zip
#
# - The ZIP holds the *contents* of theme/ at its root (layout/, config/, ...),
#   never a wrapping theme/ folder — Shopify rejects/404s that layout.
# - The file is always named EasyBeauty.zip: Shopify uses the ZIP filename as
#   the theme's name in Admin, and the name should stay "EasyBeauty". The
#   version lives in theme_info.theme_version (config/settings_schema.json),
#   which Admin shows under the theme name as "Version x.y.z".
# - Packages a commit (default HEAD) with `git archive`, so uncommitted edits
#   never end up in a release. Refuses to package if the working tree is dirty,
#   if CHANGELOG.md has no entry for the version, or if a vX.Y.Z tag exists
#   on a different commit.
#
# Usage: tools/package.sh [commit]
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
ref="${1:-HEAD}"

if [ "$ref" = "HEAD" ] && [ -n "$(git status --porcelain -- theme)" ]; then
  echo "error: theme/ has uncommitted changes — commit them first" >&2
  exit 1
fi

version="$(git show "$ref:theme/config/settings_schema.json" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const info = JSON.parse(s).find((x) => x.name === "theme_info");
    process.stdout.write(info.theme_version);
  });')"

if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "error: theme_version '$version' is not x.y.z" >&2
  exit 1
fi
if ! git show "$ref:CHANGELOG.md" | grep -q "^## \[$version\]"; then
  echo "error: CHANGELOG.md has no '## [$version]' entry" >&2
  exit 1
fi
tag="v$version"
commit="$(git rev-parse "$ref^{commit}")"
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  tagged="$(git rev-parse "$tag^{commit}")"
  if [ "$tagged" != "$commit" ]; then
    echo "error: $tag already points at ${tagged:0:7}, not ${commit:0:7} — bump theme_version" >&2
    exit 1
  fi
fi

mkdir -p dist
rm -f dist/EasyBeauty.zip
git archive --format=zip -o dist/EasyBeauty.zip "$commit:theme"

echo "dist/EasyBeauty.zip — EasyBeauty $version (${commit:0:7})"
