# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A German-language portfolio website for **Elke Scheichenost — Innenarchitektur** (interior design, Salzburg). Static Jekyll 4.4 site built on a purchased Bootstrap 3 HTML template, not on a Jekyll theme. Deployed to GitHub Pages at `/innenarchitektur`.

## Commands

```bash
bundle install
bundle exec jekyll serve --host 127.0.0.1 --livereload   # http://127.0.0.1:4000/innenarchitektur/
bundle exec jekyll build                                  # output to _site/ (gitignored)
```

Requires **Ruby 3.2.x with the MSYS2/DevKit toolchain** — several gems build native extensions. There are no tests, no linter, and no npm/node toolchain.

**`--host 127.0.0.1` is required.** `_config.yml` hardcodes `host: 192.168.0.32` (a LAN address from the author's machine); `jekyll serve` reads it as the bind address and fails on any other network. On Windows the `wdm` gem provides file watching.

## Deployment

GitHub Pages builds the **`gh-pages`** branch server-side — `_site/` is gitignored and never committed. `main` still exists but holds only the two initial scaffolding commits and is years behind; **all real work lives on `gh-pages`**. Commit there, and do not branch from or open PRs against `main`.

Two constraints follow from this:

- Only the three whitelisted plugins in `_config.yml` (`jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`) will run. Adding any other plugin silently breaks the deployed build.
- GitHub Pages **ignores the `Gemfile`** and builds with its own pinned `github-pages` environment (Jekyll 3.9.x), while local builds use Jekyll 4.4.1. Local and deployed output can differ; verify anything version-sensitive against the live site. Moving to a GitHub Actions workflow would close this gap.

## baseurl: the main hazard

The site is served from the subpath `/innenarchitektur`, set as `baseurl` in `_config.yml`. **Every internal URL — links, images, CSS, JS, favicon — must be written as `{{ site.baseurl }}/path`.** A bare `/path` works locally with `--baseurl ""` and 404s in production. Several commits in the history exist solely to fix paths that missed this.

`site.static_files` paths already begin with `/`, so the gallery hrefs in `_layouts/project.html` render a harmless double slash (`/innenarchitektur//assets/...`). Tidy it by dropping the literal `/`, never by dropping `{{ site.baseurl }}`.

## Content model

Editing the site means editing collections and data files, not HTML.

**Projects** (`_projects/*.md`, output to `/projects/<filename>.html` via `_layouts/project.html`):

```yaml
---
title: Privatwohnung          # heading and homepage tile caption
imageFolderSlug: attersee     # folder under assets/images/project-images/
thumbnail: 0.jpeg             # file inside that folder, used as the tile image
hovertext: Attersee           # subtitle revealed on tile hover
---
Body text (Markdown) renders beside the title on the project page.
```

**Project galleries are convention-driven, not listed.** `_layouts/project.html` iterates `site.static_files` and picks up anything whose path contains `/assets/images/project-images/<imageFolderSlug>/`. Adding photos = dropping files into that folder; nothing else to update. nanogallery2 renders them, and `assets/js/my_custom.js` wires the "Gallerie ansehen" link to open the lightbox.

The match is a plain **substring** test, so the trailing `| append: '/'` in that `assign` is load-bearing: without it `<slug>` also matches the `<slug>_big` archive folder and every gallery renders twice. Keep the trailing slash.

**Image originals:** each gallery folder has a `<slug>_big` sibling holding the uncompressed originals. These are the archive and must stay out of the build. Always add compressed copies to the plain folder and keep the original in `_big`.

`_config.yml` excludes them with `assets/images/project-images/*_big`. **Write that pattern without a trailing slash** — `*_big/` silently fails to match and Jekyll copies all ~70 MB of originals into `_site` and onto the live site, where LICENSE section 2 says they do not belong. Verify after touching it: `ls _site/assets/images/project-images` must show no `_big` entries. (The trailing slash on the *gallery* `assign` in `_layouts/project.html` is a separate thing and is still required.)

**Homepage** (`index.html`) renders `site.projects` into two columns by splitting on `forloop.index0 | modulo: 2` — projects alternate left/right in collection (alphabetical) order.

**Data files** (`_data/`):
- `navigation.yml` — drives both the header and footer nav (`name` + `link`).
- `references.yml` — the client list on `about.html`, auto-split into two columns at the halfway point. An entry with an optional `projectLink: <project filename>` renders a link to that project page.
- `social_media.yml` — footer icons (`link` + Font Awesome `icon` class). Currently still points at generic twitter/facebook/linkedin homepages.

## Assets and styling

`_layouts/default.html` hand-loads every stylesheet and script — Bootstrap 3, Font Awesome, nanogallery2, jQuery, and the "effects" bundle (masonry, imagesloaded, classie, AnimOnScroll, modernizr). Order matters; jQuery must precede the plugins.

CSS is plain files under `assets/css/`, edited directly:
- `style.css`, `responsive.css` — the original template, largely untouched.
- `custom-style.css` — **all site-specific overrides go here**, including the self-hosted **Lato** `@font-face` rules (woff2 files in `assets/css/font/`, split latin / latin-ext by `unicode-range`) and the olive accent `#5f6503de`. Body text is Lato 300; `b`/`strong` map to 700.

Fonts are self-hosted deliberately — **do not switch to the Google Fonts CDN**, which would send visitor IPs to Google and create a GDPR problem for an Austrian business site. `style.css` carried exactly that: an `@import url(https://fonts.googleapis.com/...Open+Sans...)` inherited from the avana template, which the Lato migration missed and which fired on every page load. It was removed on 2026-09-20. Nothing sets `font-family: 'Open Sans'` on a live selector, so removing it changed no rendering. If you ever touch the vendored template CSS again, grep it for `googleapis` and `gstatic` first.

**There is no Sass in this project any more.** `_sass/main.scss`, `assets/css/styles.scss` and `theme: minima` were all removed on 2026-09-20; nothing had ever inherited from them. The build is now warning-free — the Dart Sass `/`-division deprecation noise that used to appear on every build is gone, so a new warning means something real. The `minima` gem is still in the `Gemfile` and is now unused; dropping it needs a `bundle install` to update `Gemfile.lock`.

## Gem pins

`wdm` is pinned to `~> 0.2.0`. Do not drop it back to 0.1.1 — that version does not compile on Ruby 3.x (`rb_thread_call_without_gvl` implicit declaration). It is Windows-only file watching and does not affect deployment.

## Scaffolding removal (2026-09-20)

The Jekyll-tutorial and avana-template leftovers were deleted: `index_old.html`, `blog_old.html`, `staff.html`, `_layouts/post_old.html`, `_layouts/author.html`, `_includes/navigation_old.html`, `_projects_old/`, `_authors/`, `_posts/`, `_sass/`, `assets/css/styles.scss`, `assets/css/nanogallery2.woff.min.css`, `assets/js/maps.js`, `assets/js/jquery.contact.js`, `assets/js/custom.js`, the `project1..4`/`projectTest` image folders, and the unused `about-images/`, `blog-images/`, `home-images/` and `work/` template photo sets. All recoverable from git history on `gh-pages`.

Alongside it, the `authors` collection and the `posts`/`authors` entries under `defaults` came out of `_config.yml`. That retired the landmine where `layout: "post"` was the default for `_posts/` while no `_layouts/post.html` existed — adding a blog back means re-adding both the default and the layout.

`assets/js/custom.js` was a `#subscribeform` newsletter handler for a form that exists nowhere; its `<script>` tag came out of `_layouts/default.html` with it. Do not confuse it with `assets/js/my_custom.js` (live — wires the gallery link) or `assets/js/effects/modernizr.custom.js` (live).

Still unreferenced but deliberately kept: `assets/images/logo.png`, `logo_old.png` and `logo_uncropped.svg`. These are Elke's brand masters, not template stock — only `logo.svg` is actually served.

`_config.yml` also excludes `CLAUDE.md` from the build, which is why it does not appear in `_site/`.

## The `<head>`: duplicate title tags

`_layouts/default.html` writes its own `<title>{{ page.title }}</title>` **and** calls `{% seo %}`, which writes a second one. Every built page ships two `<title>` elements — e.g. `<title>Projekte</title>` and `<title>Projekte | Your awesome title</title>`. Fixing `title:` in `_config.yml` only changes the second one; the hand-written tag has to be removed as well.

## Known placeholder content

`_config.yml` still carries the Jekyll defaults (`title: Your awesome title`, `your-email@example.com`, the sample description, `twitter_username: jekyllrb`) and those feed `jekyll-seo-tag` output. Project body copy is lorem ipsum and `impressum.html` lists "123 Fake Street". Both `about.html` and `impressum.html` declare `title: About` in their front matter, so the Impressum tab reads "About". In `about.html` the two reference columns label their project links differently — "Link" on the left, "Ansehen" on the right. These are real gaps, not decoys — fix them when asked, but they are not accidental breakage.

The footer copyright was the template's `© 2015 avana LLC` placeholder — a copyright claim in the template author's name over Elke's site. It now renders her own notice via `{{ 'now' | date: "%Y" }}`.

## Licensing

`LICENSE` is deliberately scoped into three parts — MIT for the site's own source, all rights reserved for Elke's photographs and copy, and third-party components under their own terms. Do not replace it with a plain MIT file: the repo vendors **nanogallery2 (GPLv3-or-commercial)**, which an unqualified MIT grant would contradict, and a blanket MIT would also give away the portfolio photographs.

One item remains unresolved and should not be treated as settled: the **avana template** (`assets/css/style.css`, `responsive.css` and the markup derived from them) ships with every license field in its theme header blank. Provenance unknown. If the original license turns out to require attribution, add a separate credit line.

Historical note: commercial **Gill Sans** webfonts were removed on 2026-09-20 and replaced with Lato (SIL OFL 1.1). They remain in git history on `gh-pages`, and the deployed site keeps serving them until that change is pushed. The same is true of the Google Fonts `@import` and the published `_big` originals — all three fixes only take effect on push.
