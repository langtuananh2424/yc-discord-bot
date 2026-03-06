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

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)

- **Node.js**: Phiên bản 16.14.0 trở lên.
- **Discord Bot Token**: Tạo tại [Discord Developer Portal](https://discord.com/developers/applications).

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

1. **Cài đặt thư viện:**
   Mở Terminal tại thư mục dự án và chạy:
   ```bash
   npm install

2. **Cấu hình biến môi trường:**
Tạo một file .env ở thư mục gốc hoặc copy file env.example và đổi tên thành .env sau đó điền các thông tin sau:
    TOKEN=YOUR_BOT_TOKEN_HERE
    CLIENT_ID=YOUR_BOT_CLIENT_ID
    GUILD_ID=YOUR_SERVER_ID

3. **Đăng ký lệnh Slash:**
Mỗi khi thêm lệnh mới, chạy lệnh này để đẩy cấu trúc lên Discord:
    npm run register

3. **Khởi chạy Bot (Chế độ Dev):**
    npm run dev

## ☁️ Hướng Dẫn Hostinging (Hiện tại đang host ở bot-hosting.net)

1. **Chạy lệnh build trên máy tính:**net

2. **Nén các file/thư mục sau thành file .zip:**

3. **Upload và giải nén trên Panel của Host.**

4. **Quan trọng: Ở phần Startup / Variables của Host, đảm bảo Bot JS File (hoặc Main File) được trỏ vào:**
    dist/index.js

5. **Bật Bot và chờ hệ thống tự chạy npm install**

⚠️ CÁC LƯU Ý ĐẶC BIỆT QUAN TRỌNG (CẦN ĐỌC)
1. Phân Quyền Vai Trò (Role Hierarchy)

Để tính năng Verify (cấp role) hoạt động, bạn BẮT BUỘC phải vào Cài đặt Máy chủ -> Vai trò và kéo Role của YC Bot nằm CAO HƠN các Role mà bot sẽ cấp (VD: @Member, @Builder). Nếu bot nằm dưới, nó sẽ báo lỗi không thể cấp quyền.
2. Cấp Quyền Cho Bot (Permissions)

Đảm bảo Role của Bot có các quyền sau:

    Manage Channels (Quản lý Kênh) - Để tạo/xóa Ticket và kênh Voice.

    Manage Roles (Quản lý Vai trò) - Để cấp role Verify.

    Move Members (Di chuyển Thành viên) - Để bế người dùng sang phòng Voice mới tạo.

3. Bật Intents (Developer Portal)

Truy cập trang quản lý Bot của Discord, vào mục Bot, cuộn xuống phần Privileged Gateway Intents và BẬT XANH các mục sau:

    Presence Intent

    Server Members Intent

    Message Content Intent

Trong code (index.ts), đảm bảo đã bật GatewayIntentBits.GuildVoiceStates để Bot nghe được sự kiện tạo phòng thoại.
📚 Danh Sách Lệnh Quản Trị Khởi Tạo (Setup Commands)

    /yc-setup-ticket: Gửi bảng tạo Ticket xuống kênh hiện tại.

    /yc-setup-verify: Thiết lập hệ thống duyệt thành viên (Chọn kênh và Role sẽ cấp).

    /yc-setup-voice: Chọn kênh Voice gốc để làm điểm "Join-to-Create".