import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import * as discordTranscripts from 'discord-html-transcripts';
import { getGuildConfig } from '../../utils/guildConfigHelper';

const TicketSaveCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-ticket-save')
        .setDescription('🗂️ Lưu trữ lịch sử chat của Ticket này'),

    async execute(interaction: ChatInputCommandInteraction) {
        const ticketChannel = interaction.channel as TextChannel;
        const guildId = interaction.guildId!;

        // Kiểm tra xem có đúng là kênh ticket không
        if (!ticketChannel.name.includes('-ticket-')) {
            await interaction.reply({ content: '❌ Lệnh này chỉ có thể dùng trong kênh Ticket!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Lấy kênh Log từ file JSON thay vì từ Nút bấm
            const guildConfig = getGuildConfig(guildId);
            const logChannelId = guildConfig.ticketLogChannelId;

            if (!logChannelId) {
                await interaction.editReply({ content: '❌ Không tìm thấy kênh Log. Vui lòng chạy lại lệnh `/yc-setup-help-ticket` để cài đặt.' });
                return;
            }

            const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
            if (!logChannel) {
                await interaction.editReply({ content: '❌ Kênh Log đã bị xóa hoặc Bot không nhìn thấy.' });
                return;
            }

            // Tạo file HTML
            const transcriptAttachment = await discordTranscripts.createTranscript(ticketChannel, {
                limit: -1,
                filename: `Luu-tru-${ticketChannel.name}.html`,
                poweredBy: false
            });

            // Gửi vào kênh Log
            const logEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🗂️ Đã lưu trữ Ticket (Bằng Lệnh)')
                .addFields(
                    { name: 'Tên Ticket', value: `\`${ticketChannel.name}\``, inline: true },
                    { name: 'Người lưu', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed], files: [transcriptAttachment] });
            await interaction.editReply({ content: `✅ **Đã sao lưu thành công!** File lịch sử đã được gửi an toàn vào kênh ${logChannel}.` });

        } catch (error) {
            console.error('Lỗi khi dùng lệnh lưu ticket:', error);
            await interaction.editReply({ content: '❌ Đã có lỗi xảy ra khi tạo file lưu trữ.' });
        }
    }
};

export default TicketSaveCommand;