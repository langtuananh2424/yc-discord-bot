import { ASSETS } from "./constants/assets";

export const BOT_CONFIG = {
    prefix: 'yc',
    colors: {
        success: 0x00ff00,
        error: 0xff0000,
        welcome: 0x5865F2
    },
    welcome: {
        enabled: true,
        channelId: '1469951916208427266',
        webhookName: 'YC Welcome Bot',
        webhookAvatar: ASSETS.LOGO_PATH,
        title: 'Chào mừng thành viên mới!',
        message: 'Chào mừng {user} đã gia nhập server **{guild}**! Chúc bạn có những giây phút vui vẻ.',
        thumbnail: true
    }
};