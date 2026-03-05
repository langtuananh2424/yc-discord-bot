import { 
    ButtonInteraction, 
    TextChannel, 
    ChannelType, 
    PermissionFlagsBits, 
    MessageFlags, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} from 'discord.js';
import * as discordTranscripts from 'discord-html-transcripts';

// Hàm tạo Ticket
export async function handleCreateTicket(interaction: ButtonInteraction, type: string, categoryId: string, roleId: string, logChannelId: string) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const guild = interaction.guild!;
    const user = interaction.user;

    try {
        const ticketChannel = await guild.channels.create({
            name: `${user.username}-ticket-${Math.floor(Math.random() * 1000)}`,
            type: ChannelType.GuildText, 
            parent: categoryId, 
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, 
                { id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } 
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle('🎫 Hệ Thống Quản Lý Ticket')
            .setDescription(`Xin chào ${user}, đây là ticket **${type}** của bạn.\nSử dụng các nút bên dưới để điều khiển kênh này.`)
            .setColor(0x5865F2);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Đóng').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`ticket_save_${logChannelId}`).setLabel('Lưu').setEmoji('🗂️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_delete').setLabel('Xóa').setEmoji('⛔').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${user} | <@&${roleId}>`, embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ Đã tạo ticket thành công tại ${ticketChannel}` });

    } catch (error) {
        console.error('Lỗi khi tạo kênh ticket:', error);
        await interaction.editReply({ content: '❌ Không thể tạo kênh ticket. Vui lòng kiểm tra quyền.' });
    }
}

// Hàm lưu Ticket
export async function handleSaveTicket(interaction: ButtonInteraction, logChannelId: string) {
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const ticketChannel = interaction.channel as TextChannel;
        const guild = interaction.guild!;

        const transcriptAttachment = await discordTranscripts.createTranscript(ticketChannel, {
            limit: -1, 
            filename: `Luu-tru-${ticketChannel.name}.html`, 
            poweredBy: false
        });

        const logChannel = guild.channels.cache.get(logChannelId) as TextChannel;
        
        if (!logChannel) {
            return await interaction.editReply({ content: '❌ Không tìm thấy kênh Log! Kênh có thể đã bị xóa.' });
        }

        const logEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🗂️ Đã lưu trữ Ticket')
            .addFields(
                { name: 'Tên Ticket', value: `\`${ticketChannel.name}\``, inline: true },
                { name: 'Người lưu', value: `${interaction.user}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed], files: [transcriptAttachment] });
        await interaction.editReply({ content: `✅ **Đã sao lưu thành công!** File lịch sử đã được gửi an toàn vào kênh ${logChannel}.` });

    } catch (error) {
        console.error('Lỗi khi lưu ticket:', error);
        await interaction.editReply({ content: '❌ Đã có lỗi xảy ra khi tạo file lưu trữ.' });
    }
}

// Hàm đóng Ticket (Ẩn khỏi người dùng)
export async function handleCloseTicket(interaction: ButtonInteraction) {
    try {
        const ticketChannel = interaction.channel as TextChannel;
        
        // Cập nhật quyền: cấm người dùng tạo ticket xem kênh này nữa
        await ticketChannel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: false 
        });

        const closeEmbed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('🔒 Ticket đã đóng')
            .setDescription(`Ticket đã được đóng bởi ${interaction.user}. Người dùng không còn nhìn thấy kênh này nữa.`)
            .setTimestamp();

        await interaction.reply({ embeds: [closeEmbed] });
    } catch (error) {
        console.error('Lỗi đóng ticket:', error);
        await interaction.reply({ content: '❌ Lỗi khi đóng ticket. Hãy kiểm tra quyền Manage Channels.', flags: MessageFlags.Ephemeral });
    }
}

// Hàm xóa Ticket
export async function handleDeleteTicket(interaction: ButtonInteraction) {
    try {
        await interaction.reply({ content: '⛔ Kênh sẽ bị xóa vĩnh viễn sau 5 giây...' });
        const ticketChannel = interaction.channel as TextChannel;
        
        setTimeout(() => {
            ticketChannel.delete().catch(console.error);
        }, 5000);
    } catch (error) {
        console.error('Lỗi khi xóa ticket:', error);
    }
}