import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { getGuildConfig } from '../../utils/guildConfigHelper';
import { marketFileCache } from '../../utils/marketHandlers';

const MarketPostCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-market-post')
        .setDescription('Upload file trước, điền thông tin sau')
        .addStringOption(option => option.setName('title').setDescription('Tiêu đề (VD: Spawn Sinh Tồn 150x150)').setRequired(true))
        .addAttachmentOption(option => option.setName('schematic').setDescription('File Schematic gốc').setRequired(true))
        .addAttachmentOption(option => option.setName('image').setDescription('Ảnh chính (Sẽ làm ảnh bìa)').setRequired(true))
        .addAttachmentOption(option => option.setName('image2').setDescription('Ảnh phụ 1 (Không bắt buộc)').setRequired(false))
        .addAttachmentOption(option => option.setName('image3').setDescription('Ảnh phụ 2 (Không bắt buộc)').setRequired(false))
        .addAttachmentOption(option => option.setName('image4').setDescription('Ảnh phụ 3 (Không bắt buộc)').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const config = getGuildConfig(interaction.guildId!);
        
        // 1. Kiểm tra Role
        const member = interaction.guild!.members.cache.get(interaction.user.id);
        const hasSellerRole = config.marketSellerRoleId ? member?.roles.cache.has(config.marketSellerRoleId) : false;
        const isAdmin = member?.permissions.has(PermissionFlagsBits.Administrator);

        if (!hasSellerRole && !isAdmin) {
            await interaction.reply({ content: '❌ Bạn không có Role để đăng bán công trình!', flags: MessageFlags.Ephemeral });
            return;        
        }

        const title = interaction.options.getString('title', true);

        // 2. Lưu tạm file vào Cache
        marketFileCache.set(interaction.user.id, {
            title: title,
            schematic: interaction.options.getAttachment('schematic', true),
            image: interaction.options.getAttachment('image', true),
            image2: interaction.options.getAttachment('image2'),
            image3: interaction.options.getAttachment('image3'),
            image4: interaction.options.getAttachment('image4')
        });

        // 3. Bật Form (Modal) lên cho người dùng điền
        const modal = new ModalBuilder().setCustomId('market_post_modal').setTitle('📝 Nhập thông tin Công trình');

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Mô tả công trình').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('price').setLabel('Giá tiền (VD: 36000)').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('bank_name').setLabel('Tên Ngân hàng của bạn').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('bank_info').setLabel('Số tài khoản của bạn').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('bank_owner').setLabel('Tên Chủ Tài Khoản của bạn').setStyle(TextInputStyle.Short).setRequired(true))        );

        // Hiển thị form (Không được dùng deferReply trước hàm này)
        await interaction.showModal(modal);
    }
};

export default MarketPostCommand;