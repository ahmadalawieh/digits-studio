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

Mail settings and nameservers were preserved. Vercel manages HTTPS. Domain-level permanent redirects are configured in Vercel for www.digitsstudio.online and the earlier ATOCODE addresses, with digitsstudio.online as their destination. Legacy page-path redirects are maintained in vercel.json.

Local project entry: `C:\Users\Ahmad\Documents\Digits-Studio\digits-studio`. The parent Digits-Studio entry is a Windows directory junction to the existing workspace because Windows locked the parent folder during this session. There is one working copy. Earlier website sources, uncommitted work, naming concepts and private-review Git metadata are preserved under `archive/previous-brand/` beside the active project.

Verification: English/Arabic responsive interactions and accessibility checks passed locally. Production HTML, CSS, JavaScript, sitemap, robots and the PDF guide matched the published source. The brand ZIP returned HTTP 200 with its expected content length. Vercel reported both new domains as Valid Configuration and production Ready. Existing local DNS caches can retain the parking address temporarily after the DNS change.
