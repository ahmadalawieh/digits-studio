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
