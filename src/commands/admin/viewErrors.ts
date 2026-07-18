import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { errorLogger } from '../../utils/errorLogger';

const viewErrorsCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-view-errors')
        .setDescription('📋 Xem các lỗi gần đây của bot (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const lines = interaction.options.getNumber('lines') ?? 50;
        
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const recentErrors = await errorLogger.getRecentErrors(Math.min(lines, 100));
            
            const errorMessage = recentErrors || 'Không có lỗi được ghi nhận';
            const formatted = `\`\`\`${errorMessage.substring(0, 1900)}\`\`\``;

            await interaction.editReply({
                content: formatted
            });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Không thể lấy lỗi: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
};

export default viewErrorsCommand;
