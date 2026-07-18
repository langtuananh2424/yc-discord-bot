#!/bin/bash

# Script để setup & chạy bot với PM2

echo "🚀 YC Discord Bot - PM2 Setup"
echo "================================"

# 1. Kiểm tra PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 không được cài đặt"
    echo "📦 Cài đặt PM2 với: npm install pm2 -g"
    exit 1
fi

echo "✅ PM2 đã cài đặt"

# 2. Build TypeScript
echo "📦 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build thất bại!"
    exit 1
fi

echo "✅ Build thành công"

# 3. Kiểm tra logs directory
if [ ! -d "logs" ]; then
    echo "📁 Tạo thư mục logs..."
    mkdir -p logs
fi

# 4. Khởi động bot với PM2
echo "🤖 Khởi động bot..."
pm2 start ecosystem.config.js

# 5. Lưu PM2 config
pm2 save

echo ""
echo "✅ Bot đã khởi động thành công!"
echo ""
echo "📋 Lệnh hữu ích:"
echo "   pm2 status          - Xem trạng thái"
echo "   pm2 logs yc-bot     - Xem real-time logs"
echo "   pm2 monit           - Monitor tài nguyên"
echo "   pm2 stop yc-bot     - Dừng bot"
echo "   pm2 restart yc-bot  - Restart bot"
echo "   pm2 delete yc-bot   - Xóa bot khỏi PM2"
