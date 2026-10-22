from pathlib import Path
import zipfile,shutil
R=Path(__file__).resolve().parent;B=R/'dist'/'brand'
# The hosted kit contains the identity assets and usable source fonts, not a nested copy of itself.
with zipfile.ZipFile(B/'digits-studio-brand-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((R/'dist').rglob('*')):
        if p.is_file() and p.suffix!='.zip': z.write(p,'Digits Studio/dist/'+p.relative_to(R/'dist').as_posix())
    for name in ['build_assets.py','export_assets.mjs','build_site.py','build_guide.py','build_showcase.py','package_kit.py','check_site.mjs','check_extras.mjs','package.json','package-lock.json','vercel.json','validate-production.mjs','design-plan.md','QA_REPORT.md','DEPLOYMENT.md','.gitattributes']:
        z.write(R/name,'Digits Studio/'+name)
    z.write(R/'README.md','Digits Studio/README.md')
    z.write(R/'strategy.md','Digits Studio/strategy.md')
# Full local handoff includes the complete site, source generators and print deliverables.
with zipfile.ZipFile(R/'digits-studio-complete.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(R.rglob('*')):
        if not p.is_file():continue
        rel=p.relative_to(R)
        if any(part in {'.git','qa','__pycache__','node_modules','.sites-runtime','.openai','.vercel','.publish','archive','profile-setup'} for part in rel.parts):continue
        if (p.suffix=='.zip' and p.parent!=B) or p.name.endswith('.tar.gz'):continue
        z.write(p,'Digits Studio/'+rel.as_posix())
print('Hosted brand kit and complete source handoff ZIPs created.')
