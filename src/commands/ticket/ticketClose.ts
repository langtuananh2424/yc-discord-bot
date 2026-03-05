import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketCloseCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-close')
        .setDescription('🔒 Đóng Ticket (Ẩn kênh khỏi người dùng)'),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            // Lấy danh sách những người đang có quyền xem kênh
            const members = ticketChannel.members;

            // Lặp qua từng người, nếu không phải Bot và không có quyền Manage Channels (Staff) thì tước quyền xem kênh
            members.forEach(member => {
                if (!member.user.bot && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    ticketChannel.permissionOverwrites.edit(member.id, { ViewChannel: false }).catch(() => null);
                }
            });

            const closeEmbed = new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle('🔒 Ticket đã đóng')
                .setDescription(`Ticket đã được đóng bởi lệnh của ${interaction.user}. Người dùng không còn nhìn thấy kênh này nữa.`)
                .setTimestamp();

            await interaction.reply({ embeds: [closeEmbed] });

        } catch (error) {
            console.error('Lỗi đóng ticket bằng lệnh:', error);
            await interaction.reply({ content: '❌ Lỗi khi đóng ticket. Hãy kiểm tra lại quyền.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default TicketCloseCommand;