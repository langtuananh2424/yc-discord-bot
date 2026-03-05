import { Events, Interaction, ButtonInteraction } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { YCClient } from '../structures/YCClient';
import { handleCreateTicket, handleSaveTicket, handleCloseTicket, handleDeleteTicket } from '../utils/ticketHandlers';

const InteractionCreateEvent: IEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        
        // Xử lý Slash Command
        if (interaction.isChatInputCommand()) {
            const client = interaction.client as YCClient;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (!interaction.replied) await interaction.reply({ content: 'Đã có lỗi!', ephemeral: true });
            }
        }

        // Xử lý Nút Bấm
        if (interaction.isButton()) {
            const { customId, guild } = interaction;
            if (!guild) return;

            // Xử lý tạo Ticket
            if (customId.startsWith('create_ticket_')) {
                const parts = customId.split('_'); 
                const categoryId = parts[2];
                const roleId = parts[3];
                const logChannelId = parts[4]; 
                await handleCreateTicket(interaction as ButtonInteraction, 'Hỗ trợ', categoryId, roleId, logChannelId);
                return; 
            }

            // Xử lý lưu Ticket
            if (customId.startsWith('ticket_save_')) {
                const logChannelId = customId.split('_')[2]; 
                await handleSaveTicket(interaction as ButtonInteraction, logChannelId);
                return;
            }

            // Xử lý đóng và xóa
            switch (customId) {
                case 'ticket_close':
                    await handleCloseTicket(interaction as ButtonInteraction);
                    break;
                case 'ticket_delete':
                    await handleDeleteTicket(interaction as ButtonInteraction);
                    break;
            }
        }
    }
};

export default InteractionCreateEvent;