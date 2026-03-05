import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketClaimCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-claim')
        .setDescription('🙋‍♂️ Nhận hỗ trợ Ticket này')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            const claimEmbed = new EmbedBuilder()
                .setColor(0x00FF00) // Màu xanh lá
                .setTitle('👋 Ticket đã được tiếp nhận!')
                .setDescription(`Xin chào! Ticket của bạn đã được nhận và sẽ được hỗ trợ trực tiếp bởi ${interaction.user}.\n\nVui lòng cung cấp chi tiết vấn đề của bạn và chờ đợi trong giây lát, chúng tôi sẽ xử lý ngay!`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [claimEmbed] });

            // Đổi tên kênh thêm tiền tố "claimed-" để các staff khác dễ nhìn thấy
            // Giới hạn đổi tên của Discord là 2 lần/10 phút nên chúng ta bọc trong try/catch phụ để không báo lỗi nếu bị giới hạn
            try {
                if (!ticketChannel.name.startsWith('claimed-')) {
                    await ticketChannel.setName(`claimed-${ticketChannel.name}`);
                }
            } catch (nameError) {
                console.log('Không thể đổi tên kênh lúc này (giới hạn Discord).');
            }

        } catch (error) {
            console.error('Lỗi khi claim ticket:', error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi nhận ticket.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default TicketClaimCommand;