import os
import shutil
import zipfile

# Directory to package
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

# Ensure CNAME file configured for radiantsparkllc.com for GitHub Pages
with open(os.path.join(target_dir, 'CNAME'), 'w') as f:
    f.write('radiantsparkllc.com\n')

# Ensure .nojekyll file to prevent GitHub Pages from dropping assets/
with open(os.path.join(target_dir, '.nojekyll'), 'w') as f:
    f.write('')

# Add a clear README.md inside the zip
readme_content = """# Radiant Spark LLC — Official Web & Mobile Apps Production Package

This repository contains the complete production-ready build for Radiant Spark LLC, SparkSync OS, and SparkDeals Hub.

## GitHub Pages Deployment in 3 Simple Steps

1. Unzip this package (`radiantspark-final.zip`).
2. Upload all files and folders (including `assets/`, `app.html`, `index.html`, `CNAME`, `.nojekyll`) into your GitHub repository root (`main` branch).
   - *Tip:* If using Git CLI:
     ```bash
     git add .
     git commit -m "Deploy Radiant Spark & SparkSync Mobile OS"
     git push origin main
     ```
3. In GitHub, go to **Settings** ➔ **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` ➔ `/ (root)`
   - Click **Save**.
4. Your site will be live immediately at **https://radiantsparkllc.com**!

## Can I Make My GitHub Repository Private?
- **GitHub Free Account:** GitHub Pages is ONLY available on **Public** repositories. If you change a free repository to Private, GitHub Pages turns off and `radiantsparkllc.com` will stop working.
- **GitHub Pro ($4/mo) or GitHub Enterprise:** YES! GitHub Pages supports **Private** repositories. Your code remains private to you, while your website and mobile apps stay publicly live at `radiantsparkllc.com`.
- **Free Private Alternative:** You can also deploy this exact repository to **Cloudflare Pages**, **Vercel**, or **Netlify** (all have free tiers with 100% private GitHub repositories and custom domain support).

## Key Pages Included
- `index.html`: Corporate Global Portal with instant pre-rendered layout & Mobile App Download Center
- `app.html`: Standalone 1,221-Line SparkSync Mobile Super-App (Dynamic Island, 3D Biometric Plexus, Apple Watch ECG telemetry, Smart Photo Cleaner, Market Pulse, 8 tabs, Deals)
- `sparkdeals.html`: Standalone Dedicated SparkDeals Live Hub
- `spardeals.html`: Instant redirect for typo safety
- `manifest.json` & `sw.js`: PWA Mobile app install capabilities
- `CNAME`: Configured for `radiantsparkllc.com`
- `.nojekyll`: Disables Jekyll so all folders and scripts are served correctly
"""

with open(os.path.join(target_dir, 'README.md'), 'w') as f:
    f.write(readme_content)

# Zip everything cleanly into public/radiantspark-final.zip
final_zip_base = 'public/radiantspark-final'
final_zip_name = 'public/radiantspark-final.zip'
if os.path.exists(final_zip_name):
    os.remove(final_zip_name)

shutil.make_archive(final_zip_base, 'zip', target_dir)

# Also copy into dist so it is directly downloadable from server
shutil.copy2(final_zip_name, 'dist/radiantspark-final.zip')

# Production dist zip
shutil.copy2(final_zip_name, 'public/radiant-spark-production-dist.zip')
shutil.copy2(final_zip_name, 'dist/radiant-spark-production-dist.zip')

# Full codebase zip
exclude_dirs = {'node_modules', '.git', 'dist'}
full_codebase_zip = 'public/radiant-spark-full-codebase.zip'
with zipfile.ZipFile(full_codebase_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f.endswith('.zip'):
                continue
            filepath = os.path.join(root, f)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)

shutil.copy2(full_codebase_zip, 'dist/radiant-spark-full-codebase.zip')

print('All zips packaged successfully!')
print('radiantspark-final.zip size:', os.path.getsize(final_zip_name), 'bytes')
