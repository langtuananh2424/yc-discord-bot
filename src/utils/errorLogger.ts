import { Client, EmbedBuilder, TextChannel, Interaction } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { platformDetector } from './platformDetector';

export interface ErrorContext {
    userId?: string;
    commandName?: string;
    guildId?: string;
    interaction?: Interaction;
    additionalData?: Record<string, any>;
}

export class ErrorLogger {
    private logDir = path.join(process.cwd(), 'logs');
    private errorLogFile = path.join(this.logDir, 'errors.log');
    private discordClient?: Client;
    private errorChannelId?: string;
    private platformConfig: any;

    constructor() {
        // Get platform config on initialization
        this.platformConfig = platformDetector.getPlatformConfig();
    }

    async initialize(client: Client, errorChannelId?: string) {
        this.discordClient = client;
        this.errorChannelId = errorChannelId;

        // Platform-aware logging setup
        if (this.platformConfig.logToFile) {
            await fs.ensureDir(this.logDir);
        }

        const platformName = platformDetector.getPlatformName();
        await this.info(`Error logger initialized for platform: ${platformName}`, {
            additionalData: {
                platform: platformName,
                config: this.platformConfig
            }
        });
    }

    /**
     * Log lỗi đầy đủ (file + Discord)
     */
    async error(
        error: Error | string,
        context?: ErrorContext,
        shouldNotify: boolean = true
    ): Promise<void> {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';

        // Platform-aware logging
        if (this.platformConfig.logToFile) {
            const logEntry = this.formatLogEntry(timestamp, errorMessage || 'Unknown error', errorStack || '', context);
            await this.writeToFile(logEntry);
        }

        // Always log to console (platform-independent)
        if (this.platformConfig.logToConsole) {
            console.error(`\n❌ [ERROR] ${timestamp}`);
            console.error(`Message: ${errorMessage}`);
            if (context?.commandName) console.error(`Command: ${context.commandName}`);
            if (context?.userId) console.error(`User: ${context.userId}`);
            if (context?.guildId) console.error(`Guild: ${context.guildId}`);
            if (errorStack) console.error(`Stack:\n${errorStack}`);
        }

        // Platform-aware Discord notifications
        if (shouldNotify && this.platformConfig.discordNotifications && this.discordClient && this.errorChannelId) {
            await this.notifyDiscord(errorMessage || 'Unknown error', errorStack || '', context);
        }
    }

    /**
     * Log cảnh báo (không gửi Discord)
     */
    async warn(warning: string, context?: ErrorContext): Promise<void> {
        const timestamp = new Date().toISOString();

        if (this.platformConfig.logToFile) {
            const logEntry = this.formatLogEntry(timestamp, `⚠️ WARNING: ${warning}`, '', context);
            await this.writeToFile(logEntry);
        }

        if (this.platformConfig.logToConsole) {
            console.warn(`⚠️  [WARN] ${timestamp} - ${warning}`);
        }
    }

    /**
     * Log thông tin (debugging)
     */
    async info(message: string, context?: ErrorContext): Promise<void> {
        const timestamp = new Date().toISOString();

        if (this.platformConfig.logToFile) {
            const logEntry = this.formatLogEntry(timestamp, `ℹ️  INFO: ${message}`, '', context);
            await this.writeToFile(logEntry);
        }

        if (this.platformConfig.logToConsole) {
            console.log(`ℹ️  [INFO] ${timestamp} - ${message}`);
        }
    }

    /**
     * Gửi thông báo đến Discord
     */
    private async notifyDiscord(
        errorMessage: string,
        errorStack: string,
        context?: ErrorContext
    ): Promise<void> {
        try {
            if (!this.discordClient || !this.errorChannelId) return;

            const channel = await this.discordClient.channels.fetch(this.errorChannelId).catch(() => null);
            if (!channel || !(channel instanceof TextChannel)) {
                console.error('❌ Error channel không hợp lệ hoặc không tìm thấy');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('🚨 Bot Error Alert')
                .setDescription(errorMessage.substring(0, 1024))
                .setColor('#FF0000')
                .setTimestamp()
                .addFields(
                    { name: '📍 Guild', value: context?.guildId || 'N/A', inline: true },
                    { name: '👤 User', value: `<@${context?.userId || 'Unknown'}>`, inline: true },
                    { name: '⚙️  Command', value: context?.commandName || 'N/A', inline: true },
                    { name: '🌐 Platform', value: this.platformConfig.platform, inline: true },
                    { name: '💾 Memory Limit', value: `${this.platformConfig.memoryLimit}MB`, inline: true },
                    { name: '🔄 Auto Restart', value: this.platformConfig.autoRestart ? '✅ Yes' : '❌ No', inline: true }
                );

            // Thêm stack trace nếu không quá dài
            if (errorStack.length > 0 && errorStack.length < 1024) {
                embed.addFields({
                    name: '📋 Stack Trace',
                    value: `\`\`\`${errorStack.substring(0, 1020)}\`\`\``
                });
            }

            // Thêm dữ liệu bổ sung nếu có
            if (context?.additionalData && Object.keys(context.additionalData).length > 0) {
                const dataJson = JSON.stringify(context.additionalData, null, 2).substring(0, 1000);
                embed.addFields({
                    name: '📊 Additional Data',
                    value: `\`\`\`json\n${dataJson}\`\`\``
                });
            }

            await channel.send({ embeds: [embed] }).catch(err => {
                console.error('❌ Không thể gửi error embed:', err.message);
            });
        } catch (err) {
            console.error('❌ Lỗi khi gửi Discord notification:', err);
        }
    }

    /**
     * Ghi log vào file
     */
    private async writeToFile(entry: string): Promise<void> {
        try {
            await fs.appendFile(this.errorLogFile, entry + '\n', 'utf-8');
        } catch (err) {
            console.error('❌ Không thể ghi file log:', err);
        }
    }

    /**
     * Format log entry
     */
    private formatLogEntry(
        timestamp: string,
        message: string,
        stack: string,
        context?: ErrorContext
    ): string {
        let entry = `[${timestamp}] ${message}`;
        
        if (context?.commandName) entry += ` | Command: ${context.commandName}`;
        if (context?.userId) entry += ` | User: ${context.userId}`;
        if (context?.guildId) entry += ` | Guild: ${context.guildId}`;
        
        if (stack) entry += `\n  Stack: ${stack.substring(0, 500)}`;
        if (context?.additionalData) entry += `\n  Data: ${JSON.stringify(context.additionalData)}`;
        
        return entry;
    }

    /**
     * Lấy lịch sử lỗi gần đây
     */
    async getRecentErrors(lines: number = 50): Promise<string> {
        if (!this.platformConfig.logToFile) {
            return `Platform ${this.platformConfig.platform} không support file logging. Logs chỉ có trong console.`;
        }

        try {
            const content = await fs.readFile(this.errorLogFile, 'utf-8');
            return content.split('\n').slice(-lines).join('\n');
        } catch (err) {
            return `Không có lỗi được ghi nhận hoặc file log không tồn tại. Platform: ${this.platformConfig.platform}`;
        }
    }

    /**
     * Clear log file
     */
    async clearLogs(): Promise<void> {
        if (!this.platformConfig.logToFile) {
            console.log(`Platform ${this.platformConfig.platform} không support file logging. Không có file để clear.`);
            return;
        }

        try {
            await fs.remove(this.errorLogFile);
            console.log(`✅ Cleared error logs for platform: ${this.platformConfig.platform}`);
        } catch (err) {
            console.error(`❌ Không thể xóa log file: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();
