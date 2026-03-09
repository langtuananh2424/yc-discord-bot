import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const CreateEmbedCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-create-embed')
        .setDescription('Tạo tin nhắn Embed cực đẹp thông qua Form điền')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction: ChatInputCommandInteraction) {
        // Khởi tạo Form (Modal)
        const modal = new ModalBuilder()
            .setCustomId('embed_maker_modal')
            .setTitle('📝 Thiết kế tin nhắn Embed');

        // Tạo 5 ô nhập liệu (Discord giới hạn tối đa 5 ô)
        const titleInput = new TextInputBuilder()
            .setCustomId('title').setLabel('Tiêu đề').setStyle(TextInputStyle.Short).setRequired(false);
            
        const descInput = new TextInputBuilder()
            .setCustomId('desc').setLabel('Nội dung chính (Có thể xuống dòng)').setStyle(TextInputStyle.Paragraph).setRequired(true);
            
        const colorInput = new TextInputBuilder()
            .setCustomId('color').setLabel('Mã màu Hex (VD: #FFA500 hoặc #58b9ff)').setStyle(TextInputStyle.Short).setRequired(false);
            
        const imageInput = new TextInputBuilder()
            .setCustomId('image').setLabel('Link ảnh đính kèm (Phải có đuôi .png, .jpg)').setStyle(TextInputStyle.Short).setRequired(false);
            
        const footerInput = new TextInputBuilder()
            .setCustomId('footer').setLabel('Chữ dưới cùng (Footer)').setStyle(TextInputStyle.Short).setRequired(false);

        // Gắn 5 ô này vào Form
        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput)
        );

        // Bật Form lên cho Admin điền
        await interaction.showModal(modal);
    }
};

export default CreateEmbedCommand;