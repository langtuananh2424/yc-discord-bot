import * as fs from 'fs';
import axios from 'axios';

/**
 * Chuyển đổi URL hoặc Đường dẫn Local thành Buffer để Discord API xử lý.
 */
export async function getImageBuffer(pathOrUrl: string): Promise<Buffer | null> {
    try {
        if (pathOrUrl.startsWith('http')) {
            const response = await axios.get(pathOrUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data, 'binary');
        }

        if (fs.existsSync(pathOrUrl)) {
            return fs.readFileSync(pathOrUrl);
        }

        console.warn(`[ImageHelper] Không tìm thấy ảnh tại: ${pathOrUrl}`);
        return null;
    } catch (error) {
        console.error(`[ImageHelper] Lỗi khi xử lý ảnh:`, error);
        return null;
    }
}