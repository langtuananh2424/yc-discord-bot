import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    TextChannel,
    ChannelType
} from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { saveGuildConfig } from '../../utils/guildConfigHelper';

const SetupWelcomeCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-setup-welcome')
        .setDescription('Thiết lập kênh để gửi tin nhắn chào mừng thành viên mới')
        .addChannelOption(option => 
            option.setName('welcome-channel')
                .setDescription('Kênh văn bản sẽ hiển thị tin nhắn chào mừng')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const welcomeChannel = interaction.options.getChannel('welcome-channel') as TextChannel;
        const guildId = interaction.guildId;

        // Chống lỗi nếu ai đó dùng lệnh này trong tin nhắn riêng với Bot
        if (!guildId) {
            await interaction.reply({ content: '❌ Lệnh này chỉ dùng được trong Server!', ephemeral: true });
            return
        }

        // Lưu dữ liệu vào JSON
        const isSuccess = saveGuildConfig(guildId, { welcomeChannelId: welcomeChannel.id });

        if (isSuccess) {
            await interaction.reply({ 
                content: `✅ Đã lưu kênh chào mừng thành công tại ${welcomeChannel}!`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: `❌ Lỗi hệ thống: Không thể lưu cấu hình. Vui lòng kiểm tra console log.`, 
                ephemeral: true 
            });
        }
    }
};

export default SetupWelcomeCommand;