# Digits Studio

Complete identity and English/Arabic agency website prepared for Ahmad Alawieh, October 2026.

## Start here

- `dist/brand-kit.html`: visual brand review and individual downloads.
- `dist/index.html`: English website.
- `dist/ar/index.html`: Arabic website.
- `dist/social-editor.html`: editable social-post generator with PNG export.
- `dist/brand/digits-studio-brand-guide.pdf`: 12-page identity guide.
- `dist/brand/digits-studio-brand-kit.zip`: downloadable identity package.
- `strategy.md`: positioning, offer and name-clearance status.

For local preview, run `python -m http.server 4173 --bind 127.0.0.1 --directory dist` in this folder and open `http://127.0.0.1:4173/brand-kit.html`. Use HTTP for reliable canvas/font loading in the editor. The website is buildless static HTML/CSS/JS; production is live on Vercel at https://digitsstudio.online. See DEPLOYMENT.md for hosting, DNS and the archived earlier work.

## Contents

Logo family: original D symbol, primary solid wordmark, outline display wordmark, true black and white versions, yellow reverse, simple wordmark, live-text alternative, avatar, favicon and repeat pattern. Outlined SVGs do not require fonts. Transparent logo PNGs are 4000 px wide; symbols are 1024 px. SVG colours are editable fills; outlined text is not native Canva text. Install the supplied fonts for the live-text alternative.

Social: six 1080 x 1350 portrait feed posts, 1080 x 1080 square launch post, three 1080 x 1920 stories, LinkedIn 1584 x 396 cover, sharing image 1200 x 630, bilingual launch captions and 30-day CSV content plan. The social editor supports English/Arabic copy and four palette choices. It downloads a flat PNG and does not save or publish posts.

Print: card front and back, 85 x 55 mm trim with 3 mm bleed (91 x 61 mm PDF pages), blank A4 letterhead, A4 proposal cover and vector PDF proofs. Contact card includes a verified WhatsApp QR. Print PDFs are RGB review proofs. A printer should confirm CMYK conversion, stock and colour before production. The proposal cover and letterhead are reusable blank stationery, not completed contracts or proposals.

Contact: HTML email signature, vCard, scannable QR, real phone and existing email. The official digitsstudio.online domain is printed. No new email mailbox or social handle is implied.

Website: responsive English and Arabic pages, accessible native project dialogs, service details, FAQ, founder context, mobile menu, privacy page and local inquiry composer. Visitors review a message and choose WhatsApp or their email client. The website does not submit or store inquiry details. No backend form service, analytics, advertising pixels or social account integration is configured.

## Content accuracy

Portfolio work is previous website work by Ahmad before Digits Studio's launch. The project data comes from Ahmad's previous portfolio. No invented testimonials, outcomes, pricing or staff numbers are used. Branding and marketing are the user-authorized current offer, not a claim of historical campaign results. Confirm client portfolio permissions before a public commercial launch.

User approved Digits Studio, singular. The name is not legally cleared; similar Digits businesses exist. Ahmad has purchased digitsstudio.online and authorized public production deployment to Vercel. Social handles remain unreserved. See strategy.md for research sources and launch checks.

Fonts: Archivo and Instrument Sans, with IBM Plex Sans Arabic for the website and Noto Sans Arabic for the social editor. SIL OFL licenses are included. Wordmark lettering uses licensed Archivo outlines plus an original D; the font is not claimed as a custom-designed typeface. The submitted image supplied visual direction; no AI-generation badge is retained.

## Editing and rebuilding

Edit website copy/layout in `build_site.py`; edit base styling in `dist/assets/site.css`, the motion direction and RTL refinements in `dist/assets/motion.css`, and interactions in `dist/assets/site.js`. Run `python build_site.py` after copy changes. English and Arabic stay separate for clear routing and SEO.

Asset sources: `build_assets.py` creates vectors and three print PDFs; `export_assets.mjs` creates PNGs and brand board; `build_guide.py` creates the identity guide; `build_showcase.py` creates the review page. The source package includes fonts and project captures. All fonts, project captures and rebuild dependencies belong to this project; no previous-brand checkout is required.

For a fresh machine, install Python packages `fonttools pillow qrcode reportlab svglib pypdf brotli`, then `npm install` for Sharp/Playwright/axe. Rebuild in this order: `python build_assets.py`, `node export_assets.mjs`, `python build_guide.py`, `python build_site.py`, `python build_showcase.py`, `python package_kit.py`. Re-run QA when changing the files it exercises.

QA: `node check_site.mjs` against the server checks English and Arabic at 360, 768 and 1440 px, overflow, browser errors, axe WCAG checks, mobile navigation, project dialogs and inquiry encoding. `node check_extras.mjs` checks the brand page, social editor, generated downloads and internal static links. Automated checks do not replace manual keyboard and visual review.

Website motion: one short hero arrival, selectable real project previews, browser-window project interactions, animated native service accordions and dialog transitions. All seven sections retain their original order. Reduced-motion settings remove animation; keyboard and touch interactions remain available. IBM Plex Sans Arabic is served locally as WOFF2, with 400/500/600/700 weights, zero Arabic tracking and a separate reading scale.


## Portfolio concepts — 23 October 2026

Fornaya and Riwa Grove are two complete self-initiated fictional brands, each covering identity, a functional English/Arabic website and a proposed marketing launch. Case studies are at `/projects/fornaya/` and `/projects/riwa-grove/`, with Arabic equivalents under `/ar/projects/`. Website demos are at `/demos/{slug}/`; they are noindex, clearly labelled and process no orders or personal data. Existing real client work remains visible.

Concept source: `concepts-content.json`, `build_concepts.py`, `export_concepts.mjs`, and `dist/assets/concepts/`. Read `CONCEPT_ASSET_NOTES.md` for deliverables, generation briefs, original image paths, typography and rebuild steps. Install `uharfbuzz` alongside the existing Python dependencies. `node check_concepts.mjs` exercises the bilingual demo baskets, filters, product details and case layouts, then captures actual website previews. Run it against the local static server before regenerating the downloadable kits.


## Unified project collection

The catalogue now contains seven projects: three previous client websites and four self-initiated concepts (Fornaya, Riwa Grove, Dar Saha, Paceform). `projects-catalog.json` stores the client scope and concept order. Homepage service filters show 4 branding projects, 7 websites and 4 marketing projects; concept media and links switch to the relevant case-study section. Each service accordion also displays the appropriate deliverables and direct links.

Dar Saha demonstrates room discovery and a local stay planner with dates, nights, guest count and calculated estimates. Paceform demonstrates movement-type filtering, class details and a local sample-session selection. Both retain selections across language changes and process no actual reservations, memberships or payments. Rebuild these pages with `python build_experience_demos.py` after `python build_concepts.py`. `node check_projects.mjs` verifies the new interactions, classification and destinations across EN/AR at 360/768/1440 px and creates actual website screenshots. `concept-generation-briefs.json` records exact prompts and saved asset paths for the four additional built-in image generations.


## Professional portfolio revision — 26 October 2026

Research and design rationale: `professional-direction.md`. The homepage now presents the broader studio offer with a controllable original-work showcase, clear project scope, restrained filter motion and a direct inquiry composer. Three existing client sites have full EN/AR website case studies at their project URLs; their existing identities and original scope are retained. Four concepts have original application systems, differentiated campaign compositions and individual website layouts.

Rebuild with `python build_professional.py`. This runs the page generators, original vector applications, PNG/WebP exports and final editorial pass in the required order. It requires the existing Python packages plus BeautifulSoup (`beautifulsoup4`). Reference photos are supplied locally, with attribution and licence details in `photography-credits.json`, the public photography-credits page and each concept kit. Source photographs retain their stated licences; original brand drawings are separate. No new image generation is required for a normal rebuild.

Check locally with `node check_professional.mjs` (agency, motion controls, inquiry and six client case pages), `node check_projects.mjs` (categories and service-business demos), `node check_concepts.mjs` (retail demos, cases and guides) and `node check_extras.mjs` (auxiliary pages, downloads and internal links). The tests also regenerate actual demo website screenshots. Finish with `node build_public_kit.mjs && node validate-production.mjs`. Vercel continues to publish the committed static distribution and generate download ZIPs at build time.


## Previous GSAP opening — 26 October 2026 (superseded)

The homepage now opens on the brand yellow with an oversized bilingual headline and a layered project stack. `hero_template.py` owns the shared English/Arabic markup; `dist/assets/hero-motion.css` owns the responsive composition; `dist/assets/hero-motion.js` owns the GSAP entrance, fine-pointer response and desktop scroll exit. The four-project reel remains in `dist/assets/site.js` and supports pause, previous/next and rapid navigation.

GSAP 3.15.0 core and ScrollTrigger are committed under `dist/assets/vendor/`, retaining their copyright notices and licence link. They are loaded locally before the homepage scripts. The pinned npm dev dependency supports reproducible vendor updates; production does not depend on an external animation CDN or installing development packages. Reduced motion skips the entrance, pointer and scroll effects and starts the reel paused. The content and anchor links remain usable if JavaScript or the library is unavailable.

Run `node check_hero_motion.mjs` against the local server for responsive, RTL, reduced-motion changes, pointer/scroll response, rapid reel navigation, library failure and no-JavaScript checks. See `hero-motion-plan.md` for art direction and `QA_REPORT.md` for results.


## Editorial refactor — 27 October 2026

Current hero/navigation/filter direction follows `DESIGN.md`, mirrored unchanged from the workspace root. The homepage uses #06070B and #FDFDFD, locally hosted Inter and Playfair Display, and the existing connected IBM Plex Sans Arabic. Google Fonts source families and their SIL OFL licences are bundled under `dist/assets/fonts/`.

`src/components/HeroHeading.jsx`, `Navigation.jsx` and `ProjectFilters.jsx` are small, server-rendered React entry points hydrated by `src/editorial-entry.jsx`. Heading lines have nested overflow masks. The active filter uses Framer Motion's `layoutId="active-project-filter"`. All springs share stiffness 190, damping 24 and mass 1 from `src/motion-system.js`. The existing native controller still owns menu actions, project classification, image/anchor selection and inquiry composition. Its filter click handler is delegated to the stable filter group; motion hooks subscribe to that same selection. The motion bridge adds springs to existing preview/filter interactions without changing the data model. HTML headings, navigation and category controls remain present when the bundle is blocked; native filtering and contact composition still work.

Edit components in `src/` and styles in `dist/assets/editorial.css`, then run `npm run build:editorial`. This produces both bilingual `motion-fragments.json` and the locally bundled `dist/assets/editorial-motion.js`, then regenerates static pages. For copy-only changes outside the entry points, run `python build_site.py`. Both fragments and bundle are committed, so Vercel continues to publish static assets and does not need a React server. GSAP files remain available for the previous design but are no longer loaded by the homepages. Earlier GSAP-specific QA is historical; run `node check_editorial.mjs` for this implementation, followed by `node check_professional.mjs`. Finish with `node build_public_kit.mjs && node validate-production.mjs`.
