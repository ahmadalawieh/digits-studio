"""Rebuild the complete professional portfolio from committed source and licensed media."""
from pathlib import Path
import os,subprocess,shutil
R=Path(__file__).resolve().parent;env=dict(os.environ,PYTHONUTF8='1')
for command in [['python','build_concepts.py'],['python','build_experience_demos.py'],['python','build_brand_worlds.py'],['node','export_concepts.mjs'],['python','build_client_cases.py'],['python','build_site.py'],['python','polish_portfolio.py']]:
 subprocess.run(command,cwd=R,env=env,check=True)
for slug,source,destination in [('fornaya','brand-applications.webp','packaging.webp'),('riwa-grove','project-cover.webp','hero.webp')]:
 folder=R/'dist/assets/concepts'/slug;shutil.copy2(folder/source,folder/destination)
print('Professional agency, seven bilingual case studies and four branded demo experiences rebuilt.')
