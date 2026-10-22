from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent
origin='https://digitsstudio.online'
old='https://digits-studio-ahmad.ahmad-alawieh77.chatgpt.site'
for name in ['build_site.py','README.md','strategy.md','design-plan.md','QA_REPORT.md','build_showcase.py','dist/brand/launch-copy.md','dist/brand/email-signature.html','dist/brand/contact.vcf']:
    p=ROOT/name;s=p.read_text(encoding='utf-8').replace(old,origin)
    if name=='strategy.md':
        s=s.replace('Before registering, buying a domain or placing a substantial print order, complete relevant name and trademark checks in the intended markets.','The user has purchased digitsstudio.online and authorized the public launch. Domain ownership does not establish trademark rights.')
        s=s.replace('- Existing domain: https://atocode.online','- Official website: https://digitsstudio.online')
        s=s.replace('The existing domain is a current contact reference. Do not imply it already displays the Digits rebrand until publication has been verified. No new Digits domain or social handle is claimed in these materials. Add confirmed social links only after account setup. The reusable captions avoid printing an unregistered domain or handle.','Ahmad purchased digitsstudio.online on 22 October 2026. Use this as the website across the identity. The existing Gmail and WhatsApp remain the contact channels. Social handles are not reserved or claimed; add links only after account setup.')
    if name=='build_showcase.py':
        s=s.replace('No unregistered Digits domain or social handle appears on the card.','The card includes the official digitsstudio.online website and the existing verified contact channels.')
        s=s.replace('This identity uses the name approved by Ahmad. Name and trademark clearance remain incomplete; no new domain or handle is claimed. The website is a private review build. The portfolio is previous web work by Ahmad. Nothing in this kit schedules or publishes social posts.','The official website is digitsstudio.online. The portfolio is previous web work by Ahmad. These files are reusable brand resources; social posts are downloaded for manual publication.')
    if name=='dist/brand/launch-copy.md':
        s=s.replace('Link field: https://wa.me/96170332361','Link field: https://digitsstudio.online')
        s=s.replace('Name clearance is incomplete. Do not claim a registered Digits domain, reserved social handle or exclusive rights. Keep the existing contact email and WhatsApp until replacements are actually set up. Verify any published website URL before adding it to captions.','Ahmad has purchased digitsstudio.online for the Digits Studio launch. Use https://digitsstudio.online as the website. Social handles and trademark rights are not implied by domain ownership. Keep the existing contact email and WhatsApp until replacements are configured.')
    if name=='dist/brand/email-signature.html' and 'digitsstudio.online' not in s:
        s=s.replace('<p style="margin:9px 0 0;font-weight:700;">','<p style="margin:4px 0 0;"><a href="https://digitsstudio.online" style="color:#292a32;text-decoration:underline;">digitsstudio.online</a></p>\n        <p style="margin:9px 0 0;font-weight:700;">')
    if name=='dist/brand/contact.vcf':
        s=s.replace('URL:https://wa.me/96170332361','URL:https://digitsstudio.online')
    if name=='README.md':
        s=s.replace('or retain the configured private Sites deployment.','The production target is Vercel, with https://digitsstudio.online as the canonical origin.')
        s=s.replace('No unregistered Digits domain or social handle is printed.','The official digitsstudio.online domain is printed. No new email mailbox or social handle is implied.')
        s=s.replace('The project data comes from the existing ATOCODE portfolio.','The project data comes from Ahmad\'s previous portfolio.')
        s=s.replace('No domain has been bought or social handle reserved. Current hosted review is private.','Ahmad has purchased digitsstudio.online and authorized public production deployment to Vercel. Social handles remain unreserved.')
        s=s.replace('If the original ATOCODE assets are present, builds reuse them; otherwise bundled copies are used.','All fonts, project captures and rebuild dependencies belong to this project; no previous-brand checkout is required.')
    if name=='design-plan.md':
        s=s.replace('privately hosted review','public production website').replace('Existing ATOCODE checkout and domains stay intact.','Earlier brand explorations and website sources are preserved in the workspace archive. Production uses digitsstudio.online on Vercel.')
    if name=='QA_REPORT.md':
        s=s.replace('Name/trademark clearance and new domain/social-account registration are incomplete.','Ahmad has purchased digitsstudio.online. Trademark clearance and social-handle registration remain separate from domain ownership.')
    if name=='dist/brand/contact.vcf':p.write_bytes(s.replace('\r\n','\n').replace('\n','\r\n').encode('utf-8'))
    else:p.write_text(s,encoding='utf-8')

# Visible public URL, social metadata and a concrete machine-readable agency identity.
p=ROOT/'build_site.py';s=p.read_text(encoding='utf-8')
if 'name="twitter:card"' not in s:s=s.replace('<meta property="og:type" content="website">','<meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><meta property="og:url" content="https://digitsstudio.online/{\'ar/\' if ar else \'\'}">')
s=s.replace('<span>© 2026 Digits Studio / Ahmad Alawieh</span>','<span>© 2026 Digits Studio / Ahmad Alawieh</span><a href="https://digitsstudio.online">digitsstudio.online</a>')
p.write_text(s,encoding='utf-8')
print('Production domain and brand references updated.')
