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
        channelId: '1086211595446784020',
        webhookName: 'YC Welcome Bot',
        webhookAvatar: ASSETS.LOGO_PATH,
        defaultTitle: 'Chào mừng thành viên mới!',
        defaultMessage: 'Chào mừng {user} đã gia nhập server **{guild}**! Chúc bạn có những giây phút vui vẻ.',
        thumbnail: true
    },
    ID_FOLDER_DRIVE: process.env.DRIVE_FOLDER_ID,
    // ID_SUPPORT_DIRECTORY: '1089855669764632647'
};