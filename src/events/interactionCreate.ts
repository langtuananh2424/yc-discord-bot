import { Events, Interaction, ButtonInteraction } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { YCClient } from '../structures/YCClient';
import { handleCreateTicket, handleSaveTicket, handleCloseTicket, handleDeleteTicket } from '../utils/ticketHandlers';
import { handleVerifyRole } from '../utils/verifyHandlers';
import { handleVoiceButtons, handleVoiceLimitModal, handleVoiceRenameModal } from '../utils/voiceHandlers';
import { handleMarketBuy, handleMarketConfirm, handleMarketTicketControls, handleMarketPostModal, handleMarketDeletePost } from '../utils/marketHandlers';
import { handleEmbedMakerModal } from '../utils/embedHandlers';

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

            // NÚT MUA HÀNG MARKET
            if (customId.startsWith('market_buy_')) {
                const parts = customId.split('_');
                const postId = parts[2];
                const sellerId = parts[3];
                await handleMarketBuy(interaction as ButtonInteraction, postId, sellerId);
                return;
            }
            
            if (customId.startsWith('market_delpost_')) {
                const parts = customId.split('_');
                const postId = parts[2];
                const sellerId = parts[3];
                await handleMarketDeletePost(interaction as ButtonInteraction, postId, sellerId);
                return;
            }

            // NÚT XÁC NHẬN GIAO DỊCH TRUNG GIAN
            if (customId.startsWith('market_confirm_')) {
                await handleMarketConfirm(interaction as ButtonInteraction);
                return;
            }

            if (['market_close', 'market_transcript', 'market_delete'].includes(customId)) {
                await handleMarketTicketControls(interaction as ButtonInteraction);
            return;
            }

            
        }

        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case 'modal_vc_rename':
                    await handleVoiceRenameModal(interaction);
                    break;

                case 'modal_vc_limit':
                    await handleVoiceLimitModal(interaction);
                    break;

                case 'market_post_modal':
                    await handleMarketPostModal(interaction);
                    break;

                case 'embed_maker_modal':
                    await handleEmbedMakerModal(interaction);
                    break;
                    
                default:
                    console.warn(`Chưa có handler cho Modal: ${interaction.customId}`);
                    break;
            }
            return;
        }

        
    }
};

export default InteractionCreateEvent;