import { Events, GuildMember, TextChannel, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { BOT_CONFIG } from '../config';
import { getImageBuffer } from '../utils/imageHelper';
import { getWelcomeGif } from '../utils/randomGifHelper';
import { getRandomWelcomeContent } from '../utils/welcomeContentHelper';

const GuildMemberAddEvent: IEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        const config = BOT_CONFIG.welcome;
        if (!config.enabled) return;

        const channel = member.guild.channels.cache.get(config.channelId) as TextChannel;
        if (!channel) return;

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
            // Kiểm tra xem kênh có Webhook nào chưa, nếu chưa thì tạo mới
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === config.webhookName);

            const avatarBuffer = await getImageBuffer(config.webhookAvatar);

            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: config.webhookName,
                    avatar: avatarBuffer, 
                });
            } else if (avatarBuffer) {
                await webhook.edit({ avatar: avatarBuffer });
            }

            // Gửi tin nhắn thông qua Webhook
            await webhook?.send({
                embeds: [welcomeEmbed],
                files: attachment ? [attachment] : [],
                username: config.webhookName
            });

        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn chào mừng qua Webhook:', error);
            // Fallback: Gửi tin nhắn bình thường nếu Webhook lỗi
            await channel.send({ embeds: [welcomeEmbed] });
        }
    }
};

export default GuildMemberAddEvent;