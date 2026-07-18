import 'dotenv/config';
import { YCClient } from './structures/YCClient';
import { errorLogger } from './utils/errorLogger';
import { platformDetector } from './utils/platformDetector';

const client = new YCClient();

// Get platform info early
const platformInfo = platformDetector.getPlatformInfo();
console.log(`\n🌐 Detected Platform: ${platformInfo.platform.toUpperCase()}`);
console.log(`📊 Platform Config:`, {
    'Auto Restart': platformInfo.config.autoRestart ? '✅' : '❌',
    'Persistent Storage': platformInfo.config.persistentStorage ? '✅' : '❌',
    'Memory Limit': `${platformInfo.config.memoryLimit}MB`,
    'Discord Notifications': platformInfo.config.discordNotifications ? '✅' : '❌'
});

if (platformInfo.recommendations.length > 0) {
    console.log(`💡 Recommendations:`);
    platformInfo.recommendations.forEach(rec => console.log(`   ${rec}`));
}
console.log(''); // Empty line

/**
 * Global Error Handlers
 * Bắt tất cả lỗi không được xử lí để bot không crash
 */

// Bắt uncaught exceptions
process.on('uncaughtException', async (error: Error) => {
    console.error('\n🔴 UNCAUGHT EXCEPTION');
    await errorLogger.error(error, {
        commandName: '[SYSTEM] Uncaught Exception'
    }, true);
});

// Bắt unhandled promise rejections
process.on('unhandledRejection', async (reason: any) => {
    console.error('\n🔴 UNHANDLED REJECTION');
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await errorLogger.error(error, {
        commandName: '[SYSTEM] Unhandled Rejection'
    }, true);
});

// Bắt lỗi từ Discord client
process.on('error', async (error: Error) => {
    console.error('\n🔴 PROCESS ERROR');
    await errorLogger.error(error, {
        commandName: '[SYSTEM] Process Error'
    }, true);
});

// Xử lí graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    await errorLogger.info('Bot is shutting down');
    client.destroy();
    process.exit(0);
});

(async () => {
    try {
        // Load lệnh và sự kiện trước khi khởi động
        await client.loadCommands();
        await client.loadEvents();
        
        // Initialize error logger khi bot ready
        client.once('ready', async () => {
            const errorChannelId = process.env.ERROR_CHANNEL_ID;
            await errorLogger.initialize(client, errorChannelId);
            
            if (errorChannelId) {
                await errorLogger.info(`✅ Error logger initialized. Channel: ${errorChannelId}`);
            }

            // Display platform info on startup
            const platformName = platformDetector.getPlatformName();
            const config = platformDetector.getPlatformConfig();
            
            console.log(`\n🤖 YC Bot đã sẵn sàng! Đăng nhập dưới tên: ${client.user?.tag}`);
            console.log(`🌐 Hosting Platform: ${platformName.toUpperCase()}`);
            console.log(`💾 Memory Limit: ${config.memoryLimit}MB`);
            console.log(`🔄 Auto Restart: ${config.autoRestart ? 'Enabled' : 'Disabled'}`);
            console.log(`📁 Persistent Storage: ${config.persistentStorage ? 'Yes' : 'No'}`);
            console.log(`📢 Discord Notifications: ${config.discordNotifications ? 'Enabled' : 'Disabled'}`);
            console.log(`📝 File Logging: ${config.logToFile ? 'Enabled' : 'Disabled'}`);
            console.log('');
        });
        
        client.start(process.env.DISCORD_TOKEN!);
    } catch (error) {
        console.error('❌ Failed to start client:', error);
        await errorLogger.error(error as Error, {
            commandName: '[SYSTEM] Startup Error'
        }, true);
        process.exit(1);
    }
})();