#!/bin/bash
# Radiant Spark Global - One-Click GitHub Push Script

echo "======================================================="
echo "   Pushing Latest Codebase to GitHub Repository       "
echo "   https://github.com/RadiantSparkLLC/radiantspark-site"
echo "======================================================="

if [ -z "$1" ]; then
  echo "Usage: ./push_to_github.sh <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>"
  echo "Or set GITHUB_TOKEN environment variable."
  exit 1
fi

TOKEN=$1
REMOTE_URL="https://${TOKEN}@github.com/RadiantSparkLLC/radiantspark-site.git"

git config --global --add safe.directory /app/applet
git config user.email "vsandeep442@gmail.com"
git config user.name "Radiant Spark Build"

git branch -M main
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"

echo "Pushing to main branch..."
git push -u origin main --force

echo "✅ Successfully pushed latest code to https://github.com/RadiantSparkLLC/radiantspark-site!"
