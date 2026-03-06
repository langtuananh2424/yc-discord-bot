import { ButtonInteraction, VoiceChannel, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export async function handleVoiceButtons(interaction: ButtonInteraction) {
    const channel = interaction.channel as VoiceChannel;

    // CHỈ CHỦ PHÒNG MỚI ĐƯỢC BẤM NÚT
    // Vì lúc tạo phòng ta đã cấp quyền ManageChannels cho chủ phòng, nên dùng nó làm điều kiện kiểm tra
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '❌ Bạn không phải là chủ của phòng này!', flags: MessageFlags.Ephemeral });
        return;
    }

    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        switch (interaction.customId) {
            case 'vc_lock':
                // Đảo ngược quyền Connect của @everyone
                const currentConnect = channel.permissionsFor(guildId)?.has(PermissionFlagsBits.Connect);
                await channel.permissionOverwrites.edit(guildId, { Connect: !currentConnect });
                await interaction.reply({ 
                    content: !currentConnect ? '🔓 Đã **MỞ KHÓA** phòng. Mọi người có thể vào.' : '🔒 Đã **KHÓA** phòng. Người lạ không thể vào.', 
                    flags: MessageFlags.Ephemeral 
                });
                break;

            case 'vc_hide':
                // Đảo ngược quyền ViewChannel của @everyone
                const currentView = channel.permissionsFor(guildId)?.has(PermissionFlagsBits.ViewChannel);
                await channel.permissionOverwrites.edit(guildId, { ViewChannel: !currentView });
                await interaction.reply({ 
                    content: !currentView ? '👁️ Đã **HIỆN** phòng. Mọi người có thể nhìn thấy.' : '👻 Đã **ẨN** phòng. Kênh đã tàng hình.', 
                    flags: MessageFlags.Ephemeral 
                });
                break;

            case 'vc_rename':
                // Hiện Form điền tên (Modal)
                const renameModal = new ModalBuilder().setCustomId('modal_vc_rename').setTitle('✏️ Đổi Tên Phòng');
                const nameInput = new TextInputBuilder()
                    .setCustomId('new_name')
                    .setLabel('Nhập tên phòng mới:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(30);
                renameModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
                await interaction.showModal(renameModal);
                break;

            case 'vc_limit':
                // Hiện Form điền số lượng (Modal)
                const limitModal = new ModalBuilder().setCustomId('modal_vc_limit').setTitle('👥 Giới Hạn Người Dùng');
                const limitInput = new TextInputBuilder()
                    .setCustomId('new_limit')
                    .setLabel('Số người tối đa (0-99, 0 là vô hạn):')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(2);
                limitModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(limitInput));
                await interaction.showModal(limitModal);
                break;
        }
    } catch (error) {
        console.error('Lỗi khi xử lý nút Voice:', error);
        await interaction.reply({ content: '❌ Có lỗi xảy ra. Hãy chắc chắn Bot có quyền Quản lý Kênh.', flags: MessageFlags.Ephemeral });
    }
}