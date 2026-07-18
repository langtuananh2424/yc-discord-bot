import { Events, Interaction, ButtonInteraction, MessageFlags } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { YCClient } from '../structures/YCClient';
import { handleCreateTicket, handleSaveTicket, handleCloseTicket, handleDeleteTicket } from '../utils/ticketHandlers';
import { handleVerifyRole } from '../utils/verifyHandlers';
import { handleVoiceButtons, handleVoiceLimitModal, handleVoiceRenameModal } from '../utils/voiceHandlers';
import { handleMarketBuy, handleMarketConfirm, handleMarketTicketControls, handleMarketPostModal, handleMarketDeletePost } from '../utils/marketHandlers';
import { handleEmbedMakerModal } from '../utils/embedHandlers';
import { handleTournamentSetupModal } from '../utils/tournamentHandlers';
import { executeCommandSafely, executeInteractionSafely } from '../utils/commandErrorWrapper';

const InteractionCreateEvent: IEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        
        // Xử lý Slash Command
        if (interaction.isChatInputCommand()) {
            const client = interaction.client as YCClient;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            await executeCommandSafely(interaction, () => command.execute(interaction));
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
                await executeInteractionSafely(interaction, 'handleCreateTicket', () =>
                    handleCreateTicket(interaction as ButtonInteraction, 'Hỗ trợ', categoryId, roleId, logChannelId)
                );
                return; 
            }

            // Xử lý lưu Ticket
            if (customId.startsWith('ticket_save_')) {
                const logChannelId = customId.split('_')[2]; 
                await executeInteractionSafely(interaction, 'handleSaveTicket', () =>
                    handleSaveTicket(interaction as ButtonInteraction, logChannelId)
                );
                return;
            }

            // Xử lý đóng và xóa
            if (customId === 'ticket_close') {
                await executeInteractionSafely(interaction, 'handleCloseTicket', () =>
                    handleCloseTicket(interaction as ButtonInteraction)
                );
                return;
            }

            if (customId === 'ticket_delete') {
                await executeInteractionSafely(interaction, 'handleDeleteTicket', () =>
                    handleDeleteTicket(interaction as ButtonInteraction)
                );
                return;
            }

            if (customId.startsWith('verify_role_')) {
                const roleId = customId.split('_')[2];
                await executeInteractionSafely(interaction, 'handleVerifyRole', () =>
                    handleVerifyRole(interaction as ButtonInteraction, roleId)
                );
                return;
            }

            if (customId.startsWith('vc_')) {
                await executeInteractionSafely(interaction, 'handleVoiceButtons', () =>
                    handleVoiceButtons(interaction as ButtonInteraction)
                );
                return;
            }

            // NÚT MUA HÀNG MARKET
            if (customId.startsWith('market_buy_')) {
                const parts = customId.split('_');
                const postId = parts[2];
                const sellerId = parts[3];
                await executeInteractionSafely(interaction, 'handleMarketBuy', () =>
                    handleMarketBuy(interaction as ButtonInteraction, postId, sellerId)
                );
                return;
            }
            
            if (customId.startsWith('market_delpost_')) {
                const parts = customId.split('_');
                const postId = parts[2];
                const sellerId = parts[3];
                await executeInteractionSafely(interaction, 'handleMarketDeletePost', () =>
                    handleMarketDeletePost(interaction as ButtonInteraction, postId, sellerId)
                );
                return;
            }

            // NÚT XÁC NHẬN GIAO DỊCH TRUNG GIAN
            if (customId.startsWith('market_confirm_')) {
                await executeInteractionSafely(interaction, 'handleMarketConfirm', () =>
                    handleMarketConfirm(interaction as ButtonInteraction)
                );
                return;
            }

            // NÚT TICKET CONTROLS
            if (customId.startsWith('ticket_')) {
                await executeInteractionSafely(interaction, 'handleMarketTicketControls', () =>
                    handleMarketTicketControls(interaction as ButtonInteraction)
                );
                return;
            }
        }

        // Xử lý Modal Submit
        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case 'modal_vc_rename':
                    await executeInteractionSafely(interaction, 'handleVoiceRenameModal', () =>
                        handleVoiceRenameModal(interaction)
                    );
                    break;

                case 'modal_vc_limit':
                    await executeInteractionSafely(interaction, 'handleVoiceLimitModal', () =>
                        handleVoiceLimitModal(interaction)
                    );
                    break;

                case 'market_post_modal':
                    await executeInteractionSafely(interaction, 'handleMarketPostModal', () =>
                        handleMarketPostModal(interaction)
                    );
                    break;

                case 'embed_maker_modal':
                    await executeInteractionSafely(interaction, 'handleEmbedMakerModal', () =>
                        handleEmbedMakerModal(interaction)
                    );
                    break;

                case 'modal_setup_tournament':
                    await executeInteractionSafely(interaction, 'handleTournamentSetupModal', () =>
                        handleTournamentSetupModal(interaction as any)
                    );
                    break;
                case 'modal_schematic_sell':
                    return;
                default:
                    console.warn(`Chưa có handler cho Modal: ${interaction.customId}`);
                    break;
            }
            return;
        }

        
    }
};

export default InteractionCreateEvent;