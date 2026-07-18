import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { saveGuildConfig } from './guildConfigHelper';

export async function handleTournamentSetupModal(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.fields.getTextInputValue('title');
    const desc = interaction.fields.getTextInputValue('desc');
    const color = interaction.fields.getTextInputValue('color') || '#F1C40F'; // Mặc định Vàng nếu bỏ trống
    const image = interaction.fields.getTextInputValue('image') || '';
    const footer = interaction.fields.getTextInputValue('footer') || '';

    // Kiểm tra an toàn mã màu Hex (Chống lỗi sập Bot nếu nhập sai)
    let finalColor: any = color;
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
        finalColor = '#F1C40F';
    }

    // Lưu vào guild_config.json
    saveGuildConfig(interaction.guildId!, {
        tournamentTitle: title,
        tournamentDesc: desc,
        tournamentColor: finalColor,
        tournamentImage: image,
        tournamentFooter: footer
    });

    // Tạo bản xem trước (Preview)
    const previewEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setColor(finalColor);
    
    if (image.startsWith('http')) previewEmbed.setImage(image);
    if (footer) previewEmbed.setFooter({ text: footer });

    await interaction.editReply({
        content: '✅ **Đã lưu cấu hình giải đấu thành công!** Dưới đây là bản xem trước. Dùng lệnh `/send-tournament` để gửi ra kênh chat.',
        embeds: [previewEmbed]
    });
}