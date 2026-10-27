# Digits Studio production

Published on Vercel, 22 October 2026.

- Website: https://digitsstudio.online
- Arabic: https://digitsstudio.online/ar/
- Brand downloads: https://digitsstudio.online/brand-kit
- Social editor: https://digitsstudio.online/social-editor
- Repository: https://github.com/ahmadalawieh/digits-studio
- Vercel project: https://vercel.com/ahmadalawiehs-projects/digits-studio

Pushes to `main` deploy automatically. Vercel runs `node build_public_kit.mjs && node validate-production.mjs` and publishes `dist/`. The downloadable brand-kit ZIP is generated from the committed source during each build, so no archive binary needs to be uploaded through Git. Generated assets are committed; Python and image-generation tools are only needed when rebuilding those assets locally.

Namecheap BasicDNS remains authoritative. Website records configured from Vercel's project-specific values:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 216.198.79.1 |
| CNAME | www | 058482a322f06adf.vercel-dns-017.com. |

Nameservers and website records were preserved. The previously unused default mail forwarding was replaced by the verified Resend records on 27 October; see below. Vercel manages HTTPS. Domain-level permanent redirects are configured in Vercel for www.digitsstudio.online and the earlier ATOCODE addresses, with digitsstudio.online as their destination. Legacy page-path redirects are maintained in vercel.json.

Local project entry: `C:\Users\Ahmad\Documents\Digits-Studio\digits-studio`. The parent Digits-Studio entry is a Windows directory junction to the existing workspace because Windows locked the parent folder during this session. There is one working copy. Earlier website sources, uncommitted work, naming concepts and private-review Git metadata are preserved under `archive/previous-brand/` beside the active project.

Verification: English/Arabic responsive interactions and accessibility checks passed locally. Production HTML, CSS, JavaScript, sitemap, robots and the PDF guide matched the published source. The brand ZIP returned HTTP 200 with its expected content length. Vercel reported both new domains as Valid Configuration and production Ready. Existing local DNS caches can retain the parking address temporarily after the DNS change.


## Production inquiry delivery and mailbox — 27 October 2026

The Vercel project remains digits-studio in ahmadalawiehs-projects. Deployment still packages the committed distribution; /api/inquiry.js is a Node.js Vercel Function (15-second maximum), with Resend installed as a production dependency. The hosted Vercel build must validate both the static assets and API output. Local `vercel build --prod` currently encounters a Windows CLI shell-spawn error after dependency installation; the independent `npm run build` passes.

The free Marketplace resource resend-email-blue-branch is connected to production, preview and development. Its dashboard is https://vercel.com/ahmadalawiehs-projects/~/stores/integration/ir_yTk3fwfUkkKO565O . The integration provisions RESEND_API_KEY and RESEND_EMAIL_DOMAIN. INQUIRY_EMAIL_ENABLED is a non-secret Config value set to true; code additionally disables direct sending for preview deployments. Pull a local environment with `vercel env pull .env.local`; environment files, integration tooling and .vercel output are ignored and excluded from both ZIP exporters. Never put keys in the browser bundle.

Sending and receiving for digitsstudio.online are verified. The actual inbox hello@digitsstudio.online exists in Resend Inboxes. Its incoming mail can be read/replied to in Resend via the resource dashboard. Website form submissions go to Ahmad's existing Gmail; ordinary mail sent to hello does not forward to Gmail. No autonomous inbox agent/actions are configured. No paid plan was purchased.

Additional Namecheap BasicDNS records:

| Type | Host | Purpose / destination |
| --- | --- | --- |
| TXT | resend._domainkey | Public DKIM value supplied by this Resend domain |
| TXT | send | v=spf1 include:amazonses.com ~all |
| MX | send | feedback-smtp.us-east-1.amazonses.com. priority 10 |
| MX | @ | receive.forge.rmta.net. priority 9 |

Resend confirmed all four records verified, including receiving MX. The existing website A and www CNAME records remain unchanged. The previous Email Forwarding configuration had no aliases. DNS credentials are not recorded in the project.

The inquiry API reports configuration availability by GET; valid explicit sends use fixed sender/recipient, validated Reply-To, a text body and provider idempotency. Do not submit a real test to a person without authorization. Automated UI tests intercept delivery POSTs; independent provider verification uses delivered@resend.dev. Errors retain WhatsApp/email alternatives.

Vercel Web Analytics is enabled on the included Hobby plan (no paid upgrade). @vercel/analytics and @vercel/speed-insights run only on the production apex/www host and skip automated browser traffic. We strip query/hash information and send no inquiry content. Custom conversion events are not enabled on this plan. The privacy page describes Resend/Vercel processing.
