import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketRenameCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-rename')
        .setDescription('Đổi tên kênh Ticket hiện tại')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Tên mới cho Ticket (Không chứa dấu cách)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;
        const newName = interaction.options.getString('name', true);

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        // Kênh Discord không cho phép dấu cách và một số ký tự đặc biệt
        const formattedName = newName.toLowerCase().replace(/\s+/g, '-');

        try {
            await interaction.deferReply(); // Câu giờ vì đổi tên kênh có thể mất 1-2 giây
            
            const oldName = ticketChannel.name;
            await ticketChannel.setName(formattedName);
            
            await interaction.editReply({ content: `✏️ Đã đổi tên Ticket từ \`${oldName}\` thành \`${ticketChannel.name}\`.` });

        } catch (error) {
            console.error('Lỗi khi đổi tên ticket:', error);
            await interaction.editReply({ content: '❌ Có lỗi xảy ra. Lưu ý: Discord chỉ cho phép đổi tên kênh 2 lần mỗi 10 phút!' });
        }
    }
};

export default TicketRenameCommand;