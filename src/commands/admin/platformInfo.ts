import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { platformDetector } from '../../utils/platformDetector';
import { errorLogger } from '../../utils/errorLogger';

const platformInfoCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-platform-info')
        .setDescription('📊 Xem thông tin platform hosting và health check (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const platformInfo = platformDetector.getPlatformInfo();
            const config = platformInfo.config;

            // Get recent errors count
            const recentErrors = await errorLogger.getRecentErrors(100);
            const errorCount = recentErrors.split('\n').filter(line => line.trim()).length;

            const embed = new EmbedBuilder()
                .setTitle('🌐 Platform Information & Health Check')
                .setColor('#00FF00')
                .setTimestamp()
                .addFields(
                    {
                        name: '🏠 Hosting Platform',
                        value: `\`\`\`${config.platform.toUpperCase()}\`\`\``,
                        inline: true
                    },
                    {
                        name: '💾 Memory Limit',
                        value: `\`\`\`${config.memoryLimit}MB\`\`\``,
                        inline: true
                    },
                    {
                        name: '⚡ CPU Limit',
                        value: `\`\`\`${config.cpuLimit} cores\`\`\``,
                        inline: true
                    },
                    {
                        name: '🔄 Auto Restart',
                        value: config.autoRestart ? '✅ **Enabled**' : '❌ **Disabled**',
                        inline: true
                    },
                    {
                        name: '💽 Persistent Storage',
                        value: config.persistentStorage ? '✅ **Yes**' : '❌ **No**',
                        inline: true
                    },
                    {
                        name: '📝 File Logging',
                        value: config.logToFile ? '✅ **Enabled**' : '❌ **Disabled**',
                        inline: true
                    },
                    {
                        name: '📢 Discord Notifications',
                        value: config.discordNotifications ? '✅ **Enabled**' : '❌ **Disabled**',
                        inline: true
                    },
                    {
                        name: '🐳 Docker Support',
                        value: config.hasDocker ? '✅ **Yes**' : '❌ **No**',
                        inline: true
                    },
                    {
                        name: '⚙️ PM2 Support',
                        value: config.hasPM2 ? '✅ **Yes**' : '❌ **No**',
                        inline: true
                    },
                    {
                        name: '📊 Recent Errors',
                        value: `\`\`\`${errorCount} errors in last 100 entries\`\`\``,
                        inline: true
                    }
                );

            // Add recommendations if any
            if (platformInfo.recommendations.length > 0) {
                embed.addFields({
                    name: '💡 Platform Recommendations',
                    value: platformInfo.recommendations.map(rec => `• ${rec}`).join('\n'),
                    inline: false
                });
            }

            // Add system info
            const uptime = process.uptime();
            const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
            
            embed.addFields({
                name: '⏱️ System Uptime',
                value: `\`\`\`${uptimeFormatted}\`\`\``,
                inline: true
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Không thể lấy thông tin platform: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
};

export default platformInfoCommand;
