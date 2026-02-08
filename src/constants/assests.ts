import path from 'path';

const assetsPath = path.join(__dirname, '../../../assets/images');

export const ASSETS = {
    LOGO_PATH: path.join(assetsPath, 'logo.png'),
    WELCOME_BANNER_PATH: path.join(assetsPath, 'welcome-banner.png'),
    
    NAMES: {
        LOGO: 'logo.png',
        WELCOME_BANNER: 'welcome-banner.png'
    }
} as const;