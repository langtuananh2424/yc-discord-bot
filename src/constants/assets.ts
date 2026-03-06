import path from 'path';

const ROOT_PATH = process.cwd();
const IMAGES_PATH = path.join(ROOT_PATH, 'assets', 'images');
const GIFS_PATH = path.join(ROOT_PATH, 'assets', 'gifs');
export const ASSETS = {
    LOGO_PATH: path.join(IMAGES_PATH, 'logo.png'),
    WELCOME_GIFS: [
        path.join(GIFS_PATH, 'welcome-gif-1.gif'),
        path.join(GIFS_PATH, 'welcome-gif-2.gif'),
        path.join(GIFS_PATH, 'welcome-gif-3.gif')
    ],
    
    NAMES: {
        LOGO: 'logo.png',
        WELCOME_ATTACHMENT: 'welcome_image.gif'
    },
    VERIFY_GIFS: path.join(GIFS_PATH, 'welcome-gif-3.gif')
} as const;