from pathlib import Path
import zipfile,shutil
R=Path(__file__).resolve().parent;B=R/'dist'/'brand'
# The hosted kit contains the identity assets and usable source fonts, not a nested copy of itself.
with zipfile.ZipFile(B/'digits-studio-brand-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((R/'dist').rglob('*')):
        if p.is_file() and p.suffix!='.zip': z.write(p,'Digits Studio/dist/'+p.relative_to(R/'dist').as_posix())
    for name in ['build_experience_demos.py','projects-catalog.json','concept-generation-briefs.json','check_projects.mjs','build_concepts.py','export_concepts.mjs','concepts-content.json','concepts-plan.md','CONCEPT_ASSET_NOTES.md','check_concepts.mjs','build_professional.py','build_brand_worlds.py','brand_drawing.py','build_client_cases.py','polish_portfolio.py','check_professional.mjs','professional-direction.md','photography-credits.json','build_assets.py','build_public_kit.mjs','export_assets.mjs','build_site.py','hero_template.py','build_editorial.mjs','motion-fragments.json','editorial-refactor-plan.md','DESIGN.md','check_editorial.mjs','hero-motion-plan.md','check_hero_motion.mjs','build_guide.py','build_showcase.py','package_kit.py','check_site.mjs','check_extras.mjs','check_motion.mjs','package.json','package-lock.json','vercel.json','validate-production.mjs','design-plan.md','QA_REPORT.md','DEPLOYMENT.md','.gitattributes']:
        z.write(R/name,'Digits Studio/'+name)
    for source in sorted((R/'src').rglob('*')):
        if source.is_file(): z.write(source,'Digits Studio/'+source.relative_to(R).as_posix())
    z.write(R/'README.md','Digits Studio/README.md')
    z.write(R/'strategy.md','Digits Studio/strategy.md')
# Full local handoff includes the complete site, source generators and print deliverables.
source_files={'README.md','strategy.md','build_experience_demos.py','projects-catalog.json','concept-generation-briefs.json','check_projects.mjs','build_concepts.py','export_concepts.mjs','concepts-content.json','concepts-plan.md','CONCEPT_ASSET_NOTES.md','check_concepts.mjs','build_professional.py','build_brand_worlds.py','brand_drawing.py','build_client_cases.py','polish_portfolio.py','check_professional.mjs','professional-direction.md','photography-credits.json','build_assets.py','build_public_kit.mjs','export_assets.mjs','build_site.py','hero_template.py','build_editorial.mjs','motion-fragments.json','editorial-refactor-plan.md','DESIGN.md','check_editorial.mjs','hero-motion-plan.md','check_hero_motion.mjs','build_guide.py','build_showcase.py','package_kit.py','check_site.mjs','check_extras.mjs','check_motion.mjs','package.json','package-lock.json','vercel.json','validate-production.mjs','design-plan.md','QA_REPORT.md','DEPLOYMENT.md','.gitattributes','.gitignore','brand-board.png'}
with zipfile.ZipFile(R/'digits-studio-complete.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(R.rglob('*')):
        if not p.is_file():continue
        rel=p.relative_to(R)
        if not (rel.parts[0] in ('dist','src') or (rel.parts[:2]==('output','pdf') and p.suffix=='.pdf') or (len(rel.parts)==1 and p.name in source_files)):continue
        if (p.suffix=='.zip' and p.parent!=B) or p.name.endswith('.tar.gz'):continue
        z.write(p,'Digits Studio/'+rel.as_posix())
print('Hosted brand kit and complete source handoff ZIPs created.')
