import { Events, Interaction, ButtonInteraction, VoiceChannel, MessageFlags } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { YCClient } from '../structures/YCClient';
import { handleCreateTicket, handleSaveTicket, handleCloseTicket, handleDeleteTicket } from '../utils/ticketHandlers';
import { handleVerifyRole } from '../utils/verifyHandlers';
import { handleVoiceButtons } from '../utils/voiceHandlers';

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

            if (customId.startsWith('verify_role_')) {
                const roleId = customId.split('_')[2];

                // Gọi hàm từ file utils và truyền dữ liệu sang
                await handleVerifyRole(interaction as ButtonInteraction, roleId);
                return;
            }

            if (customId.startsWith('vc_')) {
                await handleVoiceButtons(interaction as ButtonInteraction);
                return;
            }
        }

        if (interaction.isModalSubmit()) {
            const channel = interaction.channel as VoiceChannel;
            if (interaction.customId === 'modal_vc_rename') {
                const newName = interaction.fields.getTextInputValue('new_name');
                await channel.setName(newName);
                await interaction.reply({ content: `✅ Đã đổi tên phòng thành: **${newName}**`, flags: MessageFlags.Ephemeral });
            }
            if (interaction.customId === 'modal_vc_limit') {
                const newLimit = parseInt(interaction.fields.getTextInputValue('new_limit'));
                if (isNaN(newLimit) || newLimit < 0 || newLimit > 99) {
                    await interaction.reply({ content: '❌ Số lượng không hợp lệ! Vui lòng nhập từ 0 đến 99.', flags: MessageFlags.Ephemeral });
                    return;
                }
                await channel.setUserLimit(newLimit);
                await interaction.reply({ content: `✅ Đã giới hạn phòng: **${newLimit === 0 ? 'Vô hạn' : `${newLimit} người`}**`, flags: MessageFlags.Ephemeral });
            }
        }
    }
};

export default InteractionCreateEvent;