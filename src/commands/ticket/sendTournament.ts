import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { getGuildConfig } from '../../utils/guildConfigHelper';

const SendTournamentCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('send-tournament')
        .setDescription('Gửi thông báo Giải Đấu đã cài đặt vào kênh này (Chỉ Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(opt => 
            opt.setName('ping')
            .setDescription('Có tag @everyone không?')
            .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const config = getGuildConfig(interaction.guildId!);

        if (!config.tournamentTitle || !config.tournamentDesc) {
            await interaction.editReply('❌ Bạn chưa setup giải đấu! Vui lòng dùng lệnh `/setup-tournament` trước.');
            return;
        }

        const pingEveryone = interaction.options.getBoolean('ping');

        const embed = new EmbedBuilder()
            .setTitle(config.tournamentTitle)
            .setDescription(config.tournamentDesc)
            .setColor((config.tournamentColor as any) || '#F1C40F');

        if (config.tournamentImage?.startsWith('http')) embed.setImage(config.tournamentImage);
        if (config.tournamentFooter) embed.setFooter({ text: config.tournamentFooter });

        if (interaction.channel?.isTextBased()) {
            await (interaction.channel as TextChannel).send({ 
                content: pingEveryone ? '@everyone 🏆 **THÔNG BÁO GIẢI ĐẤU!**' : undefined,
                embeds: [embed] 
            });
        }

        await interaction.editReply('✅ Đã phát sóng thông báo Giải đấu thành công!');
    }
};

export default SendTournamentCommand;