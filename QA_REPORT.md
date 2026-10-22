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
