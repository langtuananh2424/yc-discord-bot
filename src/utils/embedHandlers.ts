import { ModalSubmitInteraction, EmbedBuilder, ColorResolvable, TextChannel, MessageFlags } from 'discord.js';

// XỬ LÝ FORM TẠO EMBED CHUNG
export async function handleEmbedMakerModal(interaction: ModalSubmitInteraction) {
    const title = interaction.fields.getTextInputValue('title');
    const desc = interaction.fields.getTextInputValue('desc');
    const color = interaction.fields.getTextInputValue('color');
    const image = interaction.fields.getTextInputValue('image');
    const footer = interaction.fields.getTextInputValue('footer');

    const embed = new EmbedBuilder().setDescription(desc);

    if (title) embed.setTitle(title);
    if (image) embed.setImage(image);
    if (footer) embed.setFooter({ text: footer });

    if (color) {
        try {
            embed.setColor(color as ColorResolvable);
        } catch {
            embed.setColor(0x2B2D31);
        }
    } else {
        embed.setColor(0x2B2D31);
    }

    try {
        const channel = interaction.channel as TextChannel;
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Đã phóng Embed thành công rực rỡ!', flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Lỗi khi gửi Custom Embed:', error);
        await interaction.reply({ content: '❌ Có lỗi xảy ra! Hãy kiểm tra lại xem Link ảnh có đúng chuẩn không nhé.', flags: MessageFlags.Ephemeral });
    }
}