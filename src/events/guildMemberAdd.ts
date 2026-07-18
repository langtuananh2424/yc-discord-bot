import { Events, GuildMember, TextChannel, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { BOT_CONFIG } from '../config';
import { getImageBuffer } from '../utils/imageHelper';
import { getWelcomeGif } from '../utils/randomGifHelper';
import { getRandomWelcomeContent } from '../utils/welcomeContentHelper';
import { getGuildConfig } from '../utils/guildConfigHelper';

const GuildMemberAddEvent: IEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        try {
        const config = BOT_CONFIG.welcome;
        if (!config.enabled) return;

        const guildConfig = getGuildConfig(member.guild.id);

        const targetChannelId = guildConfig.welcomeChannelId || config.channelId;

        const channel = member.guild.channels.cache.get(config.channelId) as TextChannel;
        if (!channel) {
                console.log(`[Welcome] Không tìm thấy kênh ${targetChannelId} tại server ${member.guild.name}`);
                return;
        }

        const { attachment, embedImageUrl } = getWelcomeGif();
        const content = getRandomWelcomeContent();

        const welcomeTitle = content.title;
        // Thay thế các placeholder trong tin nhắn
        const welcomeMessage = content.message
            .replace('{user}', member.toString())
            .replace('{guild}', member.guild.name);
        
        // Tạo Embed theo phong cách Webhooks
        const welcomeEmbed = new EmbedBuilder()
            .setColor(BOT_CONFIG.colors.welcome as any)
            .setTitle(welcomeTitle)
            .setDescription(welcomeMessage)
            .setImage(embedImageUrl)
            .setTimestamp();

        if (config.thumbnail) {
            welcomeEmbed.setThumbnail(member.user.displayAvatarURL());
        }

        try {
                if (channel.permissionsFor(member.guild.members.me!)?.has('ManageWebhooks')) {
                    const webhooks = await channel.fetchWebhooks();
                    let webhook = webhooks.find(wh => wh.name === config.webhookName);

                    if (!webhook) {
                        const avatarBuffer = await getImageBuffer(config.webhookAvatar);
                        webhook = await channel.createWebhook({ name: config.webhookName, avatar: avatarBuffer });
                    }

                    await webhook.send({ embeds: [welcomeEmbed], files: attachment ? [attachment] : [], username: config.webhookName });
                } else {
                    console.log(`[Welcome] Bot thiếu quyền Webhooks tại ${channel.name}. Sử dụng tin nhắn thường...`);
                    await channel.send({ embeds: [welcomeEmbed], files: attachment ? [attachment] : [] });
                }
            } catch (webhookError) {
                console.error('[Welcome] Lỗi Webhook, fallback sang tin nhắn thường:', webhookError);
                await channel.send({ embeds: [welcomeEmbed], files: attachment ? [attachment] : [] }).catch(e => console.error('Không gửi được:', e));
            }

        } catch (error) {
            console.error('Lỗi nghiêm trọng tại GuildMemberAddEvent:', error);
        }
    }
};

export default GuildMemberAddEvent;