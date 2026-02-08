import { AttachmentBuilder } from 'discord.js';
import { ASSETS } from '../constants/assets';
import { getRandomElement } from './randomHelper';

interface IRandomGifResult {
    attachment: AttachmentBuilder | null;
    embedImageUrl: string;
}

/**
 * Chọn một GIF ngẫu nhiên từ danh sách và chuẩn hóa thông tin hiển thị.
 */
export function getWelcomeGif(): IRandomGifResult {
    const randomGif = getRandomElement(ASSETS.WELCOME_GIFS);
    
    // Nếu là URL (Link ảnh trên mạng)
    if (randomGif.startsWith('http')) {
        return {
            attachment: null,
            embedImageUrl: randomGif
        };
    }

    // Nếu là đường dẫn Local
    const attachment = new AttachmentBuilder(randomGif, { name: ASSETS.NAMES.WELCOME_ATTACHMENT });
    return {
        attachment,
        embedImageUrl: `attachment://${ASSETS.NAMES.WELCOME_ATTACHMENT}`
    };
}