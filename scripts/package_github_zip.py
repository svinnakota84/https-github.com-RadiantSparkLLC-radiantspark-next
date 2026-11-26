import os
import shutil
import zipfile

# Temporary staging directory for static dist deploy
target_dir = '/tmp/github_upload'
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)
os.makedirs(target_dir)

# Copy all compiled production assets from dist (excluding any .zip files)
for item in os.listdir('dist'):
    if item.endswith('.zip'):
        continue
    s = os.path.join('dist', item)
    d = os.path.join(target_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

with open(os.path.join(target_dir, 'CNAME'), 'w') as f:
    f.write('radiantsparkllc.com\n')

with open(os.path.join(target_dir, '.nojekyll'), 'w') as f:
    f.write('')

readme_content = """# Radiant Spark Global — Production Build & Live SparkDeals Package

## Option A: Deploy Full Repository with Automated 15-Minute Deal Refresh (Recommended)
Use `radiant-spark-full-codebase.zip`:
1. Unzip and push all files (including `.github/workflows/pages.yml`) to the `main` branch of `RadiantSparkLLC/radiantspark-site`.
2. In GitHub **Settings -> Pages**, set **Source** to **GitHub Actions**.
3. The site builds and automatically refreshes `deals-feed.json` every 15 minutes with verified live & Black Friday deals.

## Option B: Static Branch Upload
Use `radiantspark-final.zip`:
1. Unzip all compiled files (`index.html`, `sparkdeals.html`, `deals-feed.json`, `assets/`, `CNAME`, `.nojekyll`) to the `main` branch root.
2. In GitHub **Settings -> Pages**, set **Source** to **Deploy from a branch -> main / (root)**.
"""

with open(os.path.join(target_dir, 'README.md'), 'w') as f:
    f.write(readme_content)

# 1. Production Static Dist ZIP
final_zip_base = 'public/radiantspark-final'
final_zip_name = 'public/radiantspark-final.zip'
if os.path.exists(final_zip_name):
    os.remove(final_zip_name)
shutil.make_archive(final_zip_base, 'zip', target_dir)
shutil.copy2(final_zip_name, 'public/radiant-spark-production-dist.zip')

# 2. Clean Full Source Repository ZIP (includes .github/workflows, src, server.ts, scripts, public without screenshots/zips)
exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio', 'aistudio'}
full_codebase_zip = 'public/radiant-spark-full-codebase.zip'
if os.path.exists(full_codebase_zip):
    os.remove(full_codebase_zip)

with zipfile.ZipFile(full_codebase_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        rel_root = os.path.relpath(root, '.')
        dirs[:] = [
            d for d in dirs
            if d not in exclude_dirs
            and not (rel_root == '.' and d == 'data')
            and not (rel_root == 'public/assets' and d == 'aistudio')
        ]
        for f in files:
            if f.endswith('.zip') or f.startswith('.env') and f != '.env.example':
                continue
            filepath = os.path.join(root, f)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)

# 3. SparkDeals-Only Drop-in ZIP (ONLY sparkdeals.html, deals-feed.json, assets/sparkdeals-tech.jpg — zero changes to index.html or rest of site)
sparkdeals_only_zip = 'public/sparkdeals-only-update.zip'
if os.path.exists(sparkdeals_only_zip):
    os.remove(sparkdeals_only_zip)

with zipfile.ZipFile(sparkdeals_only_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write('dist/sparkdeals.html', 'sparkdeals.html')
    zf.write('dist/deals-feed.json', 'deals-feed.json')
    if os.path.exists('dist/assets/sparkdeals-tech.jpg'):
        zf.write('dist/assets/sparkdeals-tech.jpg', 'assets/sparkdeals-tech.jpg')
    elif os.path.exists('public/assets/sparkdeals-tech.jpg'):
        zf.write('public/assets/sparkdeals-tech.jpg', 'assets/sparkdeals-tech.jpg')

# 4. Brand-New Standalone SparkDeals GitHub Pages Site ZIP (for a NEW GitHub repo + Zoho Domain; zero impact on radiantsparkllc.com)
standalone_zip = 'public/sparkdeals-github-pages-site.zip'
if os.path.exists(standalone_zip):
    os.remove(standalone_zip)

with zipfile.ZipFile(standalone_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write('standalone-sparkdeals-site/index.html', 'index.html')
    zf.write('standalone-sparkdeals-site/README.md', 'README.md')
    zf.write('standalone-sparkdeals-site/.github/workflows/pages.yml', '.github/workflows/pages.yml')
    zf.write('standalone-sparkdeals-site/scripts/refresh-deals.mjs', 'scripts/refresh-deals.mjs')
    zf.write('scripts/deals-fetcher.mjs', 'scripts/deals-fetcher.mjs')
    zf.write('public/deals-feed.json', 'deals-feed.json')
    zf.writestr('.nojekyll', '')
    for fname in os.listdir('public/assets'):
        fpath = os.path.join('public/assets', fname)
        if os.path.isfile(fpath):
            zf.write(fpath, os.path.join('assets', fname))

print('Packaged successfully:')
print(' -', final_zip_name, os.path.getsize(final_zip_name), 'bytes')
print(' -', full_codebase_zip, os.path.getsize(full_codebase_zip), 'bytes')
print(' -', sparkdeals_only_zip, os.path.getsize(sparkdeals_only_zip), 'bytes')
print(' -', standalone_zip, os.path.getsize(standalone_zip), 'bytes')
