#!/bin/bash

# 📦 YC Discord Bot - Docker Deployment Script
# Dùng cho bot-hosting.net hoặc Docker hosting bất kỳ
# 
# Usage: bash deploy.sh
# 
# Quy trình:
# 1. Build TypeScript
# 2. Zip các file cần thiết
# 3. Hiển thị hướng dẫn upload

set -e  # Exit on error

echo "🚀 YC Discord Bot - Docker Deployment Packager"
echo "=============================================="
echo ""

# 1. Clean old builds & packages
echo "🧹 Cleaning old builds..."
rm -rf dist/
rm -f deployment.zip release.zip *.zip 2>/dev/null || true

# 2. Build TypeScript
echo "📦 Building TypeScript..."
npm run build || {
    echo "❌ Build failed! Check your code."
    exit 1
}

# 3. Update Prisma
echo "📊 Updating Prisma schema..."
npx prisma generate || {
    echo "⚠️  Prisma generate warning (continue anyway)"
}

# 4. Verify required folders
echo "✅ Verifying required files..."
REQUIRED=("dist" "package.json" "package-lock.json" "prisma" ".env")
for file in "${REQUIRED[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Also check for assets if it exists
if [ -d "assets" ]; then
    echo "✅ Found assets folder"
fi

# 5. Create zip package
echo "📦 Creating deployment package..."

FILES_TO_ZIP=(
    "dist"
    "prisma"
    "assets"
    "package.json"
    "package-lock.json"
    ".env"
)

# Filter existing files only
EXISTING_FILES=()
for file in "${FILES_TO_ZIP[@]}"; do
    if [ -e "$file" ]; then
        EXISTING_FILES+=("$file")
    fi
done

# Create zip
zip -r deployment.zip "${EXISTING_FILES[@]}" > /dev/null 2>&1

FILESIZE=$(ls -lh deployment.zip | awk '{print $5}')
echo "✅ Package created: deployment.zip ($FILESIZE)"

echo ""
echo "================================"
echo "✨ Ready to deploy!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Upload deployment.zip to bot-hosting.net"
echo "2. Unzip (usually automatic)"
echo "3. Click 'Start' or restart container"
echo ""
echo "📝 What was packaged:"
for file in "${EXISTING_FILES[@]}"; do
    echo "   ✓ $file"
done
echo ""
echo "💡 Tips:"
echo "   • Make sure .env has correct values"
echo "   • Check ERROR_CHANNEL_ID if using Discord alerts"
echo "   • Keep .env private (don't share zip file)"
echo ""
echo "✅ Done! Your bot is ready to deploy."
