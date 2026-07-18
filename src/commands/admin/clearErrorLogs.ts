import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { errorLogger } from '../../utils/errorLogger';

const clearErrorLogsCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-clear-error-logs')
        .setDescription('🗑️ Xóa tất cả error logs (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            await errorLogger.clearLogs();
            
            await interaction.editReply({
                content: '✅ Đã xóa tất cả error logs thành công!'
            });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Không thể xóa logs: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
};

export default clearErrorLogsCommand;
