import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { saveGuildConfig } from '../../utils/guildConfigHelper';

const SetupMarketCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-setup-market')
        .setDescription('Thiết lập hệ thống Sàn giao dịch Escrow')
        .addChannelOption(option => option.setName('market_channel').setDescription('Kênh hiển thị bài đăng bán').addChannelTypes(ChannelType.GuildText, ChannelType.GuildForum).setRequired(true))
        .addChannelOption(option => option.setName('category').setDescription('Danh mục tạo Ticket giao dịch').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
        .addRoleOption(option => option.setName('supervisor_role').setDescription('Role Giám sát viên (Trade Mod)').setRequired(true))
        .addChannelOption(option => option.setName('archive_channel').setDescription('Kênh lưu trữ Schematic ẩn').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addChannelOption(option => option.setName('log_channel').setDescription('Kênh lưu Transcript HTML').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addRoleOption(option => option.setName('seller_role').setDescription('Role được phép đăng bài bán hàng').setRequired(true))
        .addStringOption(option => option.setName('mm_bank_name').setDescription('Tên Ngân Hàng của Trade Mod').setRequired(true))
        .addStringOption(option => option.setName('mm_bank_info').setDescription('Số Tài Khoản của Trade Mod').setRequired(true))
        .addStringOption(option => option.setName('mm_bank_owner').setDescription('Tên Chủ Tài Khoản của Trade Mod').setRequired(true))
        .addStringOption(option => option.setName('mm_content').setDescription('Nội dung CK mặc định (VD: MUA CONG TRINH)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        const guildId = interaction.guildId!;
        const configData = {
            marketChannelId: interaction.options.getChannel('market_channel', true).id,
            marketCategoryId: interaction.options.getChannel('category', true).id,
            marketSupervisorRoleId: interaction.options.getRole('supervisor_role', true).id,
            marketArchiveChannelId: interaction.options.getChannel('archive_channel', true).id,
            marketLogChannelId: interaction.options.getChannel('log_channel', true).id,
            marketSellerRoleId: interaction.options.getRole('seller_role', true).id,
            marketMmBankName: interaction.options.getString('mm_bank_name', true),
            marketMmBankInfo: interaction.options.getString('mm_bank_info', true),
            marketMmBankOwner: interaction.options.getString('mm_bank_owner', true),
            marketMmTransferContent: interaction.options.getString('mm_content', true)
        };

        const isSuccess = saveGuildConfig(guildId, configData);
        if (isSuccess) {
            await interaction.reply({ content: `✅ **Đã thiết lập Sàn Giao Dịch thành công!**`, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: '❌ Lỗi lưu cấu hình JSON.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default SetupMarketCommand;