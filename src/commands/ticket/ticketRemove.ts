import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketRemoveCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-remove')
        .setDescription('Xóa một người dùng hoặc Role khỏi Ticket này')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Người dùng muốn xóa'))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role muốn xóa'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;
        const targetUser = interaction.options.getUser('user');
        const targetRole = interaction.options.getRole('role');

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        if (!targetUser && !targetRole) {
            await interaction.reply({ content: '❌ Bạn phải chọn ít nhất một người dùng hoặc một Role để xóa!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Tước quyền xem kênh (chuyển ViewChannel thành false)
            if (targetUser) {
                await ticketChannel.permissionOverwrites.edit(targetUser.id, { ViewChannel: false });
            }
            if (targetRole) {
                await ticketChannel.permissionOverwrites.edit(targetRole.id, { ViewChannel: false });
            }

            const removedMentions = [targetUser?.toString(), targetRole?.toString()].filter(Boolean).join(' và ');
            await interaction.reply({ content: `⛔ Đã tước quyền truy cập Ticket của ${removedMentions}.` });

        } catch (error) {
            console.error('Lỗi khi xóa người khỏi ticket:', error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra. Vui lòng kiểm tra quyền của Bot.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default TicketRemoveCommand;