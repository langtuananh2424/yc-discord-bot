import path from 'path';
import fs from 'fs';

const ROOT_PATH = process.cwd();
const IMAGES_PATH = path.join(ROOT_PATH, 'assets', 'images');
const GIFS_PATH = path.join(ROOT_PATH, 'assets', 'gifs');

// Hàm tự động quét thư mục và lấy danh sách đường dẫn các file .gif
const getWelcomeGifs = (): string[] => {
    try {
        // Đọc toàn bộ tên file trong thư mục
        const files = fs.readdirSync(GIFS_PATH);
        
        // Lọc ra những file có đuôi .gif và ghép thành đường dẫn hoàn chỉnh
        return files
            .filter(file => file.toLowerCase().endsWith('.gif'))
            .map(file => path.join(GIFS_PATH, file));
    } catch (error) {
        console.error('❌ Lỗi không thể đọc thư mục GIF:', error);
        return []; // Trả về mảng rỗng nếu thư mục không tồn tại để tránh sập Bot
    }
};

export const ASSETS = {
    LOGO_PATH: path.join(IMAGES_PATH, 'logo.png'),
    
    WELCOME_GIFS: getWelcomeGifs(),
    
    NAMES: {
        LOGO: 'logo.png',
        WELCOME_ATTACHMENT: 'welcome_image.gif'
    },
    VERIFY_GIFS: path.join(GIFS_PATH, 'welcome-gif-3.gif')
} as const;