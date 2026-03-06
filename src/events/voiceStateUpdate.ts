import { Events, VoiceState, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { getGuildConfig } from '../utils/guildConfigHelper';

// Bộ nhớ tạm lưu ID các kênh do Bot tạo ra để biết đường xóa
export const tempVoiceChannels = new Set<string>();

const VoiceStateUpdateEvent: IEvent = {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        const member = newState.member;
        if (!member) return;

        // LOGIC TẠO PHÒNG
        // Khi người dùng tham gia vào một kênh thoại
        if (newState.channelId && newState.channelId !== oldState.channelId) {
            const guildConfig = getGuildConfig(newState.guild.id);
            const masterChannelId = guildConfig.jtcChannelId;

            if (newState.channelId === masterChannelId) {
                const masterChannel = newState.channel;
                if (!masterChannel) return;

                try {
                    // Tạo kênh Voice mới
                    const newChannel = await newState.guild.channels.create({
                        name: `Phòng của ${member.displayName}`,
                        type: ChannelType.GuildVoice,
                        parent: masterChannel.parentId,
                        permissionOverwrites: [
                            {
                                id: newState.guild.id, // Quyền mặc định của @everyone
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                            },
                            {
                                id: member.id, // Quyền của Chủ phòng
                                allow: [
                                    PermissionFlagsBits.ManageChannels, 
                                    PermissionFlagsBits.MoveMembers,
                                    PermissionFlagsBits.MuteMembers
                                ],
                            }
                        ]
                    });

                    tempVoiceChannels.add(newChannel.id);

                    // Bế người dùng sang kênh mới
                    await member.voice.setChannel(newChannel);

                    // TẠO BẢNG ĐIỀU KHIỂN UI
                    const controlEmbed = new EmbedBuilder()
                        .setTitle('🎛️ Bảng Điều Khiển Phòng Thoại')
                        .setDescription(`Chào mừng ${member}!\nBạn là chủ của phòng thoại này. Hãy sử dụng các nút bên dưới để tùy chỉnh nhé.`)
                        .setColor(0x00FFFF);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder().setCustomId('vc_lock').setEmoji('🔒').setLabel('Khóa/Mở').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('vc_hide').setEmoji('👻').setLabel('Ẩn/Hiện').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('vc_rename').setEmoji('✏️').setLabel('Đổi tên').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('vc_limit').setEmoji('👥').setLabel('Giới hạn').setStyle(ButtonStyle.Primary)
                    );

                    // Gửi UI vào phần chat văn bản của kênh Voice
                    await newChannel.send({ embeds: [controlEmbed], components: [row] });

                } catch (error) {
                    console.error('Lỗi tạo phòng:', error);
                }
            }
        }

        // LOGIC XÓA PHÒNG TRỐNG
        // Khi người dùng rời khỏi kênh (có oldState.channelId)
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            if (tempVoiceChannels.has(oldState.channelId)) {
                const leftChannel = oldState.channel;
                
                // Kênh không còn ai -> Bốc hơi
                if (leftChannel && leftChannel.members.size === 0) {
                    try {
                        await leftChannel.delete();
                        tempVoiceChannels.delete(oldState.channelId);
                    } catch (error) {
                        console.error('Lỗi xóa phòng:', error);
                    }
                }
            }
        }
    }
};

export default VoiceStateUpdateEvent;