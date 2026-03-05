import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketOpenCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-open')
        .setDescription('Mở lại Ticket đã đóng (Khôi phục quyền truy cập cho người dùng)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await interaction.deferReply();
            
            const overwrites = ticketChannel.permissionOverwrites.cache;
            let restoredCount = 0;

            // Quét qua tất cả các quyền được cài đặt trên kênh này
            for (const [id, overwrite] of overwrites) {
                // overwrite.type === 1 nghĩa là quyền của Người dùng (không phải Role)
                if (overwrite.type === 1) {
                    // Nếu người này đang bị cấm xem kênh (do lệnh Close trước đó)
                    if (overwrite.deny.has(PermissionFlagsBits.ViewChannel)) {
                        // Trả lại quyền xem cho họ
                        await ticketChannel.permissionOverwrites.edit(id, { ViewChannel: true });
                        restoredCount++;
                    }
                }
            }

            if (restoredCount > 0) {
                await interaction.editReply({ content: `🔓 **Đã mở lại Ticket!** Khôi phục quyền truy cập cho ${restoredCount} người dùng.` });
            } else {
                await interaction.editReply({ content: `⚠️ Kênh đã được mở sẵn hoặc không tìm thấy người dùng nào bị đóng quyền.` });
            }

        } catch (error) {
            console.error('Lỗi khi mở lại ticket:', error);
            await interaction.editReply({ content: '❌ Có lỗi xảy ra khi khôi phục quyền.' });
        }
    }
};

export default TicketOpenCommand;