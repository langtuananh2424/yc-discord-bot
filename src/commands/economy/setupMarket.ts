import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { saveGuildConfig } from '../../utils/guildConfigHelper';

const SetupMarketCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('setup-market')
        .setDescription('Thiết lập kênh Sàn giao dịch và Kho lưu trữ Schematic (Chỉ Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt => 
            opt.setName('market_channel')
            .setDescription('Kênh hoặc Diễn đàn để đăng bài bán Schematic')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildForum)
            .setRequired(true)
        )
        .addChannelOption(opt => 
            opt.setName('storage_channel')
            .setDescription('Kênh KÍN để Bot cất giấu file (Nên đặt private)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const marketChannel = interaction.options.getChannel('market_channel', true);
        const storageChannel = interaction.options.getChannel('storage_channel', true);
        const guildId = interaction.guildId!;

        // Gọi hàm helper để lưu cấu hình thay vì dùng fs trực tiếp
        const isSaved = saveGuildConfig(guildId, {
            schematicMarketChannelId: marketChannel.id,
            schematicStorageChannelId: storageChannel.id
        });

        if (isSaved) {
            await interaction.editReply(`✅ Đã lưu cấu hình thành công!\n🛒 Kênh Chợ: <#${marketChannel.id}>\n📦 Kênh Kho: <#${storageChannel.id}>`);
        } else {
            await interaction.editReply(`❌ Có lỗi xảy ra khi ghi file \`guild_config.json\`!`);
        }
    }
};

export default SetupMarketCommand;