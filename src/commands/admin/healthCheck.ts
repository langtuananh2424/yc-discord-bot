import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { errorLogger } from '../../utils/errorLogger';
import { platformDetector } from '../../utils/platformDetector';

const healthCheckCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-health-check')
        .setDescription('🏥 Kiểm tra sức khỏe tổng thể của bot (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const client = interaction.client;
            const platformInfo = platformDetector.getPlatformInfo();

            // Check various health metrics
            const healthMetrics = {
                discordConnection: client.ws.status === 0 ? '✅ Connected' : '❌ Disconnected',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
                commands: client.application?.commands.cache.size || 0,
                recentErrors: await errorLogger.getRecentErrors(50),
                platform: platformInfo.config.platform
            };

            // Calculate health score
            let healthScore = 100;
            const issues: string[] = [];

            // Check memory usage (warn if > 80% of limit)
            const memoryLimit = platformInfo.config.memoryLimit * 1024 * 1024; // Convert to bytes
            const memoryUsagePercent = (healthMetrics.memoryUsage.heapUsed / memoryLimit) * 100;
            
            if (memoryUsagePercent > 90) {
                healthScore -= 30;
                issues.push('🚨 **Critical Memory Usage**');
            } else if (memoryUsagePercent > 80) {
                healthScore -= 15;
                issues.push('⚠️ **High Memory Usage**');
            }

            // Check for recent errors
            const errorLines = healthMetrics.recentErrors.split('\n').filter(line => line.trim());
            if (errorLines.length > 10) {
                healthScore -= 20;
                issues.push('⚠️ **High Error Count**');
            } else if (errorLines.length > 0) {
                healthScore -= 5;
                issues.push('ℹ️ **Some Errors Detected**');
            }

            // Check uptime (bonus for long uptime)
            if (healthMetrics.uptime > 86400) { // 24 hours
                healthScore += 5;
            }

            // Check Discord connection
            if (healthMetrics.discordConnection.includes('❌')) {
                healthScore -= 50;
                issues.push('🚨 **Discord Connection Issue**');
            }

            // Determine health status
            let healthStatus: string;
            let healthColor: number;
            
            if (healthScore >= 90) {
                healthStatus = '🟢 **Excellent**';
                healthColor = 0x00FF00;
            } else if (healthScore >= 75) {
                healthStatus = '🟡 **Good**';
                healthColor = 0xFFFF00;
            } else if (healthScore >= 60) {
                healthStatus = '🟠 **Fair**';
                healthColor = 0xFFA500;
            } else {
                healthStatus = '🔴 **Poor**';
                healthColor = 0xFF0000;
            }

            const embed = new EmbedBuilder()
                .setTitle('🏥 Bot Health Check Report')
                .setColor(healthColor)
                .setTimestamp()
                .addFields(
                    {
                        name: '📊 Overall Health',
                        value: `${healthStatus}\n**Score: ${healthScore}/100**`,
                        inline: false
                    },
                    {
                        name: '🌐 Discord Status',
                        value: healthMetrics.discordConnection,
                        inline: true
                    },
                    {
                        name: '⏱️ Uptime',
                        value: `\`\`\`${Math.floor(healthMetrics.uptime / 3600)}h ${Math.floor((healthMetrics.uptime % 3600) / 60)}m\`\`\``,
                        inline: true
                    },
                    {
                        name: '💾 Memory Usage',
                        value: `\`\`\`${Math.round(memoryUsagePercent)}% (${Math.round(healthMetrics.memoryUsage.heapUsed / 1024 / 1024)}MB)\`\`\``,
                        inline: true
                    },
                    {
                        name: '🏠 Guilds',
                        value: `\`\`\`${healthMetrics.guilds}\`\`\``,
                        inline: true
                    },
                    {
                        name: '👥 Users',
                        value: `\`\`\`${healthMetrics.users}\`\`\``,
                        inline: true
                    },
                    {
                        name: '⚡ Commands',
                        value: `\`\`\`${healthMetrics.commands}\`\`\``,
                        inline: true
                    },
                    {
                        name: '📝 Recent Errors',
                        value: `\`\`\`${errorLines.length} errors\`\`\``,
                        inline: true
                    },
                    {
                        name: '🏠 Platform',
                        value: `\`\`\`${healthMetrics.platform.toUpperCase()}\`\`\``,
                        inline: true
                    }
                );

            if (issues.length > 0) {
                embed.addFields({
                    name: '⚠️ Issues Detected',
                    value: issues.join('\n'),
                    inline: false
                });
            }

            // Add recommendations based on health score
            const recommendations: string[] = [];
            if (healthScore < 75) {
                recommendations.push('• Consider restarting the bot to clear memory');
                recommendations.push('• Check error logs for recurring issues');
                recommendations.push('• Verify database connections');
            }
            if (memoryUsagePercent > 80) {
                recommendations.push('• Monitor memory usage closely');
                recommendations.push('• Consider optimizing memory-intensive operations');
            }
            if (errorLines.length > 5) {
                recommendations.push('• Review recent error logs for patterns');
                recommendations.push('• Check for API rate limiting issues');
            }

            if (recommendations.length > 0) {
                embed.addFields({
                    name: '💡 Recommendations',
                    value: recommendations.join('\n'),
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Không thể thực hiện health check: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
};

export default healthCheckCommand;
