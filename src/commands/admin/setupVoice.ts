import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, PermissionFlagsBits, VoiceChannel, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { saveGuildConfig } from '../../utils/guildConfigHelper';

const SetupVoiceCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-setup-voice')
        .setDescription('Thiết lập kênh Tạo phòng thoại tự động')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Kênh Voice gốc (Người dùng bấm vào đây sẽ tạo phòng mới)')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        const voiceChannel = interaction.options.getChannel('channel') as VoiceChannel;
        const guildId = interaction.guildId;

        if (!guildId) return;

        const isSuccess = saveGuildConfig(guildId, { jtcChannelId: voiceChannel.id });

        if (isSuccess) {
            await interaction.reply({ 
                content: `✅ Đã thiết lập thành công! Kênh tạo phòng tự động hiện tại là ${voiceChannel}.`, 
                flags: MessageFlags.Ephemeral 
            });
        } else {
            await interaction.reply({ 
                content: '❌ Có lỗi khi lưu cấu hình JSON. Hãy kiểm tra lại log.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};

export default SetupVoiceCommand;