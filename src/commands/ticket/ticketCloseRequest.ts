import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketCloseRequestCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-closerequest')
        .setDescription('Gửi yêu cầu xác nhận đóng Ticket tới người dùng')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;

        // Kiểm tra xem có đúng là kênh ticket không
        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Phản hồi ngầm cho Staff biết lệnh đã chạy
            await interaction.reply({ content: '✅ Đã gửi yêu cầu đóng Ticket xuống kênh.', flags: MessageFlags.Ephemeral });

            // Tạo tin nhắn Embed hỏi ý kiến người dùng
            const requestEmbed = new EmbedBuilder()
                .setColor(0xFFFF00) // Màu vàng cảnh báo/chú ý
                .setTitle('❓ Yêu cầu đóng Ticket')
                .setDescription(`Xin chào! Quản trị viên **${interaction.user.username}** đã gửi yêu cầu đóng Ticket này.\n\nNếu vấn đề của bạn đã được giải quyết, vui lòng nhấn nút **Đóng Ticket** bên dưới.\nNếu bạn vẫn cần hỗ trợ, hãy bỏ qua tin nhắn này và tiếp tục trò chuyện nhé!`)
                .setTimestamp();

            // Tái sử dụng lại nút "ticket_close" đã có sẵn trong hệ thống
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Đóng Ticket ngay')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Secondary)
            );

            // Gửi tin nhắn vào kênh
            await ticketChannel.send({ embeds: [requestEmbed], components: [row] });

        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đóng ticket:', error);
            await interaction.editReply({ content: '❌ Có lỗi xảy ra khi gửi yêu cầu.' });
        }
    }
};

export default TicketCloseRequestCommand;