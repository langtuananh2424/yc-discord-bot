import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { schematicCache } from '../../utils/tempCache';

const PostSchematicCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('post-schematic')
        .setDescription('Chia sẻ file Schematic miễn phí cho cộng đồng')
        .addAttachmentOption(opt => opt.setName('file').setDescription('File .schem hoặc .litematic').setRequired(true))
        .addAttachmentOption(opt => opt.setName('image1').setDescription('Ảnh minh họa 1').setRequired(true))
        .addAttachmentOption(opt => opt.setName('image2').setDescription('Ảnh minh họa 2').setRequired(false))
        .addAttachmentOption(opt => opt.setName('image3').setDescription('Ảnh minh họa 3').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const file = interaction.options.getAttachment('file', true);
        
        const images = [];
        for (let i = 1; i <= 3; i++) {
            const img = interaction.options.getAttachment(`image${i}`);
            if (img) images.push({ url: img.url, name: img.name });
        }

        schematicCache.set(interaction.user.id, { 
            fileUrl: file.url, 
            fileName: file.name,
            images: images 
        });

        const modal = new ModalBuilder()
            .setCustomId('modal_schematic_sell')
            .setTitle('Chia sẻ Schematic');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Tên công trình')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('desc')
            .setLabel('Mô tả công trình')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};
export default PostSchematicCommand;