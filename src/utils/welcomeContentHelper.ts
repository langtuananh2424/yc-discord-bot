import fs from 'fs';
import path from 'path';
import { getRandomElement } from './randomHelper';
import { BOT_CONFIG } from '../config';

interface IWelcomeContent {
    title: string;
    message: string;
}

export function getRandomWelcomeContent(): IWelcomeContent {
    try {
        const filePath = path.join(process.cwd(), 'assets/data/welcome_messages.json');
        
        // Kiểm tra file có tồn tại không trước khi đọc
        if (!fs.existsSync(filePath)) {
            throw new Error('File JSON không tồn tại');
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const contents: IWelcomeContent[] = JSON.parse(fileContent);
        
        return getRandomElement(contents);
    } catch (error) {
        console.error('⚠️ [WelcomeHelper] Lỗi đọc JSON, sử dụng nội dung mặc định từ config:', error);
        
        // Trả về nội dung từ config.ts khi JSON lỗi
        return {
            title: BOT_CONFIG.welcome.defaultTitle,
            message: BOT_CONFIG.welcome.defaultMessage
        };
    }
}