# 🤖 YC Studio Discord Bot

Bot quản lý Server Discord chuyên nghiệp được thiết kế riêng cho **YC Studio** - Cộng đồng Minecraft Builder. Bot được xây dựng bằng **TypeScript** và **Discord.js v14**.

## ✨ Tính Năng Nổi Bật

1. **🎫 Hệ Thống Ticket Nâng Cao**
   - Tạo Ticket bằng nút bấm giao diện đẹp.
   - Quản lý Ticket toàn diện: `Add`, `Remove`, `Rename`, `Claim` (Nhận hỗ trợ), `Close`, `Open`.
   - Lưu trữ lịch sử chat (Transcript) ra file HTML cực kỳ chuyên nghiệp.

2. **✅ Hệ Thống Xác Thực (Verify System)**
   - Nút bấm xác nhận luật server thay thế hoàn toàn Carl-bot.
   - Tốc độ phản hồi tức thì, tự động cấp Role khi người dùng đồng ý.

3. **🔊 Hệ Thống Phòng Thoại Tự Động (Join-to-Create)**
   - Tự động tạo phòng Voice riêng (Lấy theo biệt danh/DisplayName) khi người dùng tham gia kênh gốc.
   - Bảng điều khiển UI dành riêng cho Chủ phòng (Khóa/Mở, Ẩn/Hiện, Đổi tên, Giới hạn người).
   - Tự động dọn dẹp (xóa kênh) khi không còn ai trong phòng.

4. **🛡️ Hệ Thống Xử Lý Lỗi Nâng Cao (Advanced Error Handling)**
   - **Tự Động Phát Hiện Platform**: Tự động nhận diện hosting platform (bot-hosting.net, Railway, Replit, Oracle Cloud, etc.)
   - **Logging Thông Minh**: Ghi log ra file hoặc console tùy theo platform
   - **Thông Báo Discord**: Tự động gửi lỗi nghiêm trọng đến kênh Discord
   - **Retry Mechanism**: Tự động thử lại các thao tác thất bại
   - **Health Check**: Kiểm tra sức khỏe tổng thể của bot
   - **Platform Info**: Hiển thị thông tin hosting và cấu hình

5. **💰 Hệ Thống Kinh Tế (Economy System)**
   - Quản lý coin, inventory, market trading
   - Schematic trading system
   - Mining system với cooldown

6. **🎯 Tournament Management**
   - Tạo và quản lý giải đấu
   - Đăng ký người tham gia
   - Quản lý bracket và kết quả

7. **🎮 Fun Commands**
   - Các lệnh giải trí cho cộng đồng

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)

- **Node.js**: Phiên bản 16.14.0 trở lên.
- **Discord Bot Token**: Tạo tại [Discord Developer Portal](https://discord.com/developers/applications).
- **Database**: SQLite (tự động tạo) hoặc PostgreSQL (cho production).

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Tạo file `.env` với nội dung:
   ```env
   TOKEN=YOUR_BOT_TOKEN_HERE
   CLIENT_ID=YOUR_BOT_CLIENT_ID
   GUILD_ID=YOUR_SERVER_ID
   ERROR_CHANNEL_ID=YOUR_ERROR_LOG_CHANNEL_ID  # Optional - for error notifications
   ```

3. **Đăng ký lệnh Slash:**
   ```bash
   npm run deploy
   ```

4. **Khởi chạy Bot (Chế độ Dev):**
   ```bash
   npm run dev
   ```

## ☁️ Hướng Dẫn Hosting (Multi-Platform Support)

Bot được tối ưu hóa để chạy trên nhiều platform hosting khác nhau:

### **🚀 Deploy Script (Tự Động)**
```bash
npm run deploy
```
Script này sẽ:
- Build TypeScript
- Update Prisma schema
- Tạo package `deployment.zip`
- Sẵn sàng upload lên hosting platform

### **🌐 Supported Platforms**

| Platform | Status | Auto-Detection | Notes |
|----------|--------|----------------|-------|
| bot-hosting.net | ✅ Tested | ✅ Yes | Primary platform |
| Railway | ✅ Supported | ✅ Yes | Docker optimized |
| Replit | ✅ Supported | ✅ Yes | Limited storage |
| Oracle Cloud | ✅ Supported | ✅ Yes | Full control |
| Heroku | ✅ Supported | ✅ Yes | Ephemeral storage |
| VPS/Linux | ✅ Supported | ✅ Yes | Manual setup |

### **📊 Admin Commands**

Sau khi deploy, sử dụng các lệnh admin sau (cần quyền Administrator):

- **`/yc-platform-info`**: Hiển thị thông tin platform hosting hiện tại
- **`/yc-health-check`**: Kiểm tra sức khỏe tổng thể của bot

### **🔧 Environment Variables**

```env
# Required
TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# Optional - Error Handling
ERROR_CHANNEL_ID=error_log_channel_id
LOG_TO_FILE=true/false
DISCORD_NOTIFICATIONS=true/false

# Database (SQLite auto-created)
DATABASE_URL="file:./dev.db"
```

## 🐛 Error Handling & Monitoring

### **Tự Động Phát Hiện Platform**
Bot tự động phát hiện platform hosting và điều chỉnh cấu hình phù hợp:
- **bot-hosting.net**: File logging, Discord notifications
- **Railway**: Console logging, persistent storage
- **Replit**: Limited logging, no file storage
- **Oracle Cloud**: Full logging, custom optimizations

### **Health Check Features**
- Memory usage monitoring
- Error count tracking
- Discord connection status
- Uptime monitoring
- Platform-specific recommendations

### **Logging System**
- **File Logging**: Lưu ra `assets/logs/error.log`
- **Console Logging**: Hiển thị trên terminal
- **Discord Notifications**: Gửi lỗi nghiêm trọng đến kênh chỉ định
- **Platform Aware**: Tự động điều chỉnh theo hosting platform

## 📁 Cấu Trúc Dự Án

```
yc-discord-bot/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── admin/        # Admin commands (platform-info, health-check)
│   │   ├── economy/      # Economy system
│   │   ├── fun/          # Fun commands
│   │   ├── general/      # General commands
│   │   ├── market/       # Market system
│   │   ├── ticket/       # Ticket system
│   │   ├── tournament/   # Tournament management
│   │   └── utility/      # Utility commands
│   ├── events/           # Discord events
│   ├── utils/            # Utility functions
│   │   ├── errorLogger.ts        # Advanced error handling
│   │   ├── platformDetector.ts   # Platform detection
│   │   ├── commandErrorWrapper.ts # Safe command execution
│   │   └── retryHandler.ts       # Retry mechanism
│   ├── structures/       # Bot structures
│   ├── interfaces/       # TypeScript interfaces
│   ├── constants/        # Constants and configs
│   └── configs/          # Configuration files
├── assets/               # Static assets
├── prisma/              # Database schema
├── test/                # Test files
├── deploy.sh           # Deployment script
├── test-commands.sh    # Command testing script
└── README.md           # This file
```

## 🧪 Testing

Chạy script test để kiểm tra các commands mới:
```bash
./test-commands.sh
```

## ⚠️ CÁC LƯU Ý ĐẶC BIỆT QUAN TRỌNG

1. **Phân Quyền Vai Trò (Role Hierarchy)**
   Để tính năng Verify (cấp role) hoạt động, bạn BẮT BUỘC phải vào Cài đặt Máy chủ -> Vai trò và kéo Role của YC Bot nằm CAO HƠN các Role mà bot sẽ cấp (VD: @Member, @Builder). Nếu bot nằm dưới, nó sẽ báo lỗi không thể cấp quyền.

2. **Cấp Quyền Cho Bot (Permissions)**
   Đảm bảo Role của Bot có các quyền sau:
   - Manage Channels (Quản lý Kênh) - Để tạo/xóa Ticket và kênh Voice.
   - Manage Roles (Quản lý Vai trò) - Để cấp role Verify.
   - Move Members (Di chuyển Thành viên) - Để bế người dùng sang phòng Voice mới tạo.

3. **Bật Intents (Developer Portal)**
   Truy cập trang quản lý Bot của Discord, vào mục Bot, cuộn xuống phần Privileged Gateway Intents và BẬT XANH các mục sau:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

   Trong code (index.ts), đảm bảo đã bật `GatewayIntentBits.GuildVoiceStates` để Bot nghe được sự kiện tạo phòng thoại.

## 📚 Danh Sách Lệnh Quản Trị Khởi Tạo (Setup Commands)

- `/yc-setup-ticket`: Gửi bảng tạo Ticket xuống kênh hiện tại.
- `/yc-setup-verify`: Thiết lập hệ thống duyệt thành viên (Chọn kênh và Role sẽ cấp).
- `/yc-setup-voice`: Chọn kênh Voice gốc để làm điểm "Join-to-Create".
- `/yc-setup-market`: Thiết lập kênh Market cho giao dịch.
- `/yc-platform-info`: Hiển thị thông tin platform hosting (Admin only).
- `/yc-health-check`: Kiểm tra sức khỏe bot (Admin only).

## 📝 License

Dự án này được phát triển riêng cho **YC Studio** - Cộng đồng Minecraft Builder.