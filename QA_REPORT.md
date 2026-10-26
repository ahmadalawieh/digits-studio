# Digits Studio verification

Verified locally on 22 October 2026.

- English and Arabic homepages tested at 360, 768 and 1440 px. No horizontal overflow or browser exceptions observed.
- Axe WCAG 2 A/AA and 2.1 AA checks returned zero violations on these six homepage combinations.
- Mobile menu open/close, project-dialog open/Escape close and inquiry composition passed in both languages at all three sizes.
- Inquiry tests verified literal text rendering, URL encoding, the intended WhatsApp number and the email destination. No inquiry was actually sent.
- Brand-kit, social-editor and privacy pages tested at 360 and 1440 px. No overflow, browser exceptions or axe violations observed.
- Social editor generated a PNG download at 1080 x 1350. English and shaped right-to-left Arabic previews were visually reviewed.
- All local HTML links and anchor targets resolved. The brand directory contained 77 assets at the time of the final check.
- Four PDFs validated: 12-page brand guide; two-page cards at 91 x 61 mm including bleed; A4 letterhead; A4 proposal cover. Rendered pages reviewed. The final guide logo and pattern pages were re-rendered after refinement.
- QR decoded successfully from the standalone PNG, the exported card PNG and the rendered card PDF. All three decoded to https://wa.me/96170332361.
- True black/white logo masters and transparent PNG exports are supplied. Font licenses are bundled.

Limits: automated accessibility checks do not establish complete WCAG conformance. Print PDFs are RGB proofs, not printer-certified CMYK production files. Ahmad has purchased digitsstudio.online. Trademark clearance and social-handle registration remain separate from domain ownership. No live analytics, backend form delivery, social publishing or advertising service is configured. Contact works by a visitor opening WhatsApp or email and sending the message themselves.

Browser outputs and machine reports are stored in qa/ and excluded from the hosted source and ZIP.

Production launch: Vercel Ready; apex and www Valid Configuration. Production HTML/CSS/JS, sitemap, robots and PDF guide matched source. Brand ZIP returned HTTP 200 and the expected length. Old domains redirect permanently to digitsstudio.online. See DEPLOYMENT.md.

Business card refinement: centred front and reverse; enlarged 18 mm QR decoded from both PNG and rendered PDF to the intended WhatsApp URL. The two-page vector proof has 85 x 55 mm TrimBox and 3 mm bleed. Both proof pages and the updated guide card spread were visually reviewed.

Website motion revamp: original section order and palette retained. English and Arabic checked at 360/768/1440 px with zero automated accessibility violations, overflow or browser exceptions. Project selectors route all three previews to the correct dialogs; service accordions work with keyboard and reduced motion. Locally hosted IBM Plex Sans Arabic weights load successfully. Motion and font requests return no failed responses. Machine evidence: qa/motion-report.json.


Portfolio concepts — 23 October 2026: 28 combinations of demo, case-study, identity-guide and email-preview pages passed automated WCAG A/AA checks with zero reported violations, overflow, browser exceptions or failed asset requests. Demo and case pages were exercised at 360/768/1440 px, in English and Arabic. Functional flows verified product category filtering, product details, add-to-basket, quantity changes, calculated totals, removal, empty state, review disclosure and cart preservation across language changes. Example Fornaya total changed from $8.00 to $12.50; Riwa from $68.00 to $92.00 when the first quantity increased. No order, payment, email or inquiry was submitted.

Original outlined identity assets, bilingual typography, generated photography, campaign posts, Arabic stories, ads, case-study layouts and actual website screenshots were visually reviewed. Both concept card QR codes decoded to the corresponding public case-study URLs. Existing homepage functionality, motion, keyboard accordion, reduced motion and auxiliary pages passed regression checks. Machine reports and review screenshots are under ignored `qa/`. PNG export uses embedded JPEG photos because WebP-in-SVG is not portable across raster renderers.


Unified projects and two additional concepts: 18 automated combinations passed for the unified homepage and new demos across 360/768/1440 px in EN/AR, with zero axe violations, overflow, browser exceptions or failed responses. Verified all-project count 7; service-filter counts 4/7/4; relevant media loads and identity/website/campaign anchors; service-gallery counts 4/7/4. Dar Saha room selection, modal details, future-date plan, invalid past-date rejection, stale-estimate clearing and $585.00 estimate for three sample suite nights passed. Paceform category counts 2/2/1/5, session details, selection, clearing and language preservation passed. Six additional 320 px homepage/demo/case routes had no horizontal overflow. Machine evidence: `qa/projects-report.json`.

The expanded concept suite checked 44 combinations of original demos, all four EN/AR case studies, guides and email previews with no reported violations or missing assets. Both new QR codes decoded to their intended public case-study URLs. Display artwork is now served as WebP, retaining full-size PNGs for downloads. New identity boards, campaign posts, Arabic stories and actual website previews were visually reviewed.


## Professional portfolio revision — 26 October 2026

Research-informed design revision: clearer studio offer, original-project hero showcase with pause/next/previous controls, filtered project views, full bilingual case studies for the three actual client websites, differentiated concept stores, original vector application systems and licensed reference photography. Existing client identities and documented website scopes are preserved. No new client results or branding commissions are asserted.

19 professional-page combinations passed automated checks with zero reported WCAG A/AA violations, overflow, browser exceptions or failed assets: six homepage EN/AR combinations at 360/768/1440 px, twelve client case combinations at 360/1440 px and the media credits page. Normal playback, pause, play, next/previous destinations and reduced-motion stopping were verified. Inquiry composition still renders literal user text and targets the intended WhatsApp recipient without sending.

The existing 44-combination concept suite passed after the new artwork, typography and layouts; retail details, baskets, language preservation, campaign pages and guides remained functional. The homepage/form/navigation regression suite and auxiliary-page/internal-link checks passed. A mobile studio-panel aspect-ratio overflow and yellow-background secondary-text contrast issue were found and fixed before release. Actual website preview images were recaptured from the new demos. Photography provenance and licence URLs are supplied in the public credits page and concept kits.


GSAP hero opening — 26 October 2026: `check_hero_motion.mjs` passed 18 combinations: English/Arabic at 320/360/768/1440 px with and without reduced motion, plus unavailable-library and JavaScript-disabled fallbacks. The checks cover fully visible headline text, horizontal overflow, CTA navigation, matching project destinations, rapid repeated navigation, pause/play, pointer response, desktop scroll response and dynamic motion-preference changes. Automated WCAG 2 A/AA and 2.1 AA scans on the 360/1440 px bilingual reduced-motion homepages reported zero violations. Normal/reduced pages reported no browser exceptions or failed asset responses. Test artifacts are in `qa/hero-motion/` and `qa/hero-motion-report.json`.

`check_professional.mjs` also passed all 19 existing portfolio checks, including homepage classification, mobile navigation, inquiry preview/encoding and client case-study routes. No real inquiry was sent. Visual review covered 320/360/768/1024/1440/1920 px compositions and corrected heading/caption collisions and 320 px Arabic clipping. The entrance uses GSAP 3.15.0 core, with locally served ScrollTrigger for the desktop exit. Content is rendered before animation initialization and stays accessible when the motion library fails. All seven main sections and project classifications remain intact.
