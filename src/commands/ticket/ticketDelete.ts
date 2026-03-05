import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const TicketDeleteCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-delete')
        .setDescription('⛔ Xóa vĩnh viễn kênh Ticket hiện tại'),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;

        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.reply({ content: '⛔ Kênh sẽ bị xóa vĩnh viễn sau 5 giây...' });
        
        setTimeout(() => {
            ticketChannel.delete().catch(console.error);
        }, 5000);
    }
};

export default TicketDeleteCommand;