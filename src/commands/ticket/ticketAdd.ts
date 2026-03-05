import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketAddCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-add')
        .setDescription('Thêm một người dùng hoặc Role vào Ticket này')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Người dùng muốn thêm vào'))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role muốn thêm vào'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Chỉ Staff mới dùng được

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;
        const targetUser = interaction.options.getUser('user');
        const targetRole = interaction.options.getRole('role');

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        if (!targetUser && !targetRole) {
            await interaction.reply({ content: '❌ Bạn phải chọn ít nhất một người dùng hoặc một Role để thêm vào!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Cấp quyền xem và gửi tin nhắn
            if (targetUser) {
                await ticketChannel.permissionOverwrites.edit(targetUser.id, {
                    ViewChannel: true,
                    SendMessages: true
                });
            }
            if (targetRole) {
                await ticketChannel.permissionOverwrites.edit(targetRole.id, {
                    ViewChannel: true,
                    SendMessages: true
                });
            }

            const addedMentions = [targetUser?.toString(), targetRole?.toString()].filter(Boolean).join(' và ');
            await interaction.reply({ content: `✅ Đã cấp quyền truy cập Ticket cho ${addedMentions}.` });

        } catch (error) {
            console.error('Lỗi khi thêm người vào ticket:', error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra. Vui lòng kiểm tra quyền của Bot.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default TicketAddCommand;