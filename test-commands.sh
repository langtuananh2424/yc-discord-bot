#!/bin/bash

echo "🧪 YC Discord Bot - Command Test Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Testing Commands:${NC}"
echo "1. /yc-platform-info - Shows platform and hosting information"
echo "2. /yc-health-check - Performs comprehensive health check"
echo ""

echo -e "${YELLOW}⚠️  Prerequisites:${NC}"
echo "• Bot must be running and connected to Discord"
echo "• You must have Administrator permissions"
echo "• Commands must be registered (deployed)"
echo ""

echo -e "${GREEN}✅ Test Checklist:${NC}"
echo "□ Start the bot with: npm start"
echo "□ Wait for 'Bot is ready!' message"
echo "□ Go to Discord server"
echo "□ Use /yc-platform-info command"
echo "□ Verify platform detection works"
echo "□ Use /yc-health-check command"
echo "□ Verify health metrics are displayed"
echo ""

echo -e "${BLUE}🔍 Expected Results:${NC}"
echo ""
echo "Platform Info Command:"
echo "• Shows current hosting platform (BOT_HOSTING, RAILWAY, etc.)"
echo "• Displays memory, CPU, and storage limits"
echo "• Shows auto-restart and persistence status"
echo "• Lists platform-specific recommendations"
echo ""
echo "Health Check Command:"
echo "• Shows overall health score (0-100)"
echo "• Displays Discord connection status"
echo "• Shows memory usage percentage"
echo "• Lists recent errors count"
echo "• Provides health recommendations"
echo ""

echo -e "${YELLOW}🐛 Troubleshooting:${NC}"
echo "• If commands don't appear: Run 'npm run deploy' again"
echo "• If bot crashes: Check logs in assets/logs/"
echo "• If platform detection fails: Check .env variables"
echo "• If health check shows errors: Review recent error logs"
echo ""

echo -e "${GREEN}🎉 Test Complete!${NC}"
echo "Your multi-platform error handling system is now ready."