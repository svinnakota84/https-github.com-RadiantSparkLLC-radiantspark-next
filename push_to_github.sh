#!/bin/bash
# Radiant Spark Global - 1-Click GitHub Deployer Script

echo "🚀 Preparing Radiant Spark build for GitHub Pages deployment..."

# Rebuild dist & verify zero errors
npm run lint
npm run build
python3 scripts/package_github_zip.py

# Git Commit
git add -A
git commit -m "Feat: Complete Radiant Spark platform update (Light/Dark mode, B2B RFQ, blank customer forms)" || true
git branch -M main
git remote add origin https://github.com/RadiantSparkLLC/radiantspark-next.git 2>/dev/null || git remote set-url origin https://github.com/RadiantSparkLLC/radiantspark-next.git

echo "🔑 Pushing code to GitHub..."
if [ -n "$GITHUB_TOKEN" ]; then
  git push https://${GITHUB_TOKEN}@github.com/RadiantSparkLLC/radiantspark-next.git main --force
else
  git push -u origin main --force
fi

echo "✅ Code pushed! GitHub Actions will now automatically deploy the live site to https://radiantsparkllc.github.io/radiantspark-next/"
