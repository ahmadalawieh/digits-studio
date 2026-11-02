# Digital menu demonstration

Ahmad approved this Arabic/English mobile menu and its public `/menu-demo/` route for the studio's QR-menu service Reel on November 3, 2026. Food, descriptions and prices are illustrative. It has browsing, search and category filtering, not ordering or checkout.

The deployable static export is committed in `../dist/menu-demo/`. The studio's standard build preserves that folder. This Next.js 15 / React 19 / Tailwind / Framer Motion source is retained for edits.

To rebuild locally: copy `../dist/menu-demo/assets/` into `public/assets/` here, run `npm ci`, then `npm run build`. Copy the contents of `out/` back into `../dist/menu-demo/`. It is a static export with basePath `/menu-demo`; do not publish `.next`, node_modules or private environment files. No runtime API keys are needed.

Photo source/author/license records: `../dist/menu-demo/photo-credits.json`. The demo uses the approved IBM Plex Sans Arabic and Archivo fonts. Native browser verification covered Arabic/English switching, item details, search, categories and mobile overflow at 320 and 390 px; all 13 first-page asset references were verified in the export. Site production build passed before release.
