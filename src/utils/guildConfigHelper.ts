import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'assets/data/guild_config.json');

export interface IGuildConfig {
    welcomeChannelId?: string;
    ticketLogChannelId?: string;
    jtcChannelId?: string;
    marketChannelId?: string;
    marketCategoryId?: string;
    marketSupervisorRoleId?: string;
    marketArchiveChannelId?: string;
    marketLogChannelId?: string;
    marketSellerRoleId?: string;
    marketMmBankName?: string;
    marketMmBankInfo?: string;
    marketMmTransferContent?: string;
    marketMmBankOwner?: string;
}

// Hàm đọc cấu hình
export function getGuildConfig(guildId: string): IGuildConfig {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return {};
        }
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const configs = JSON.parse(data);
        return configs[guildId] || {};
    } catch (error) {
        console.error('Lỗi đọc guild_config.json:', error);
        return {};
    }
}

// Hàm lưu cấu hình
export function saveGuildConfig(guildId: string, newConfig: Partial<IGuildConfig>) {
    try {
        let configs: Record<string, IGuildConfig> = {};
        
        // Đọc dữ liệu cũ để không bị ghi đè mất các cấu hình khác
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            configs = JSON.parse(data);
        }

        // Gộp dữ liệu cũ của Server này với dữ liệu mới vừa cài đặt
        configs[guildId] = {
            ...configs[guildId],
            ...newConfig
        };

        // Đảm bảo thư mục assets/data tồn tại trước khi ghi file
        const dir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Ghi lại vào file
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs, null, 4), 'utf-8');
        return true;
    } catch (error) {
        console.error('Lỗi ghi guild_config.json:', error);
        return false;
    }
}