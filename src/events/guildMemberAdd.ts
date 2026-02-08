import { Events, GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { BOT_CONFIG } from '../config';

const GuildMemberAddEvent: IEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        const config = BOT_CONFIG.welcome;
        if (!config.enabled) return;

        const channel = member.guild.channels.cache.get(config.channelId) as TextChannel;
        if (!channel) return;

        // Thay thế các placeholder trong tin nhắn
        const welcomeMessage = config.message
            .replace('{user}', member.toString())
            .replace('{guild}', member.guild.name);

        // Tạo Embed theo phong cách Webhooks
        const welcomeEmbed = new EmbedBuilder()
            .setColor(BOT_CONFIG.colors.welcome)
            .setTitle(config.title)
            .setDescription(welcomeMessage)
            .setTimestamp();

        if (config.thumbnail) {
            welcomeEmbed.setThumbnail(member.user.displayAvatarURL());
        }

        try {
            // Kiểm tra xem kênh có Webhook nào chưa, nếu chưa thì tạo mới
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === config.webhookName);

            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: config.webhookName,
                    avatar: config.webhookAvatar,
                });
            }

            // Gửi tin nhắn thông qua Webhook
            await webhook.send({
                embeds: [welcomeEmbed],
                username: config.webhookName,
                avatarURL: config.webhookAvatar
            });

        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn chào mừng qua Webhook:', error);
            // Fallback: Gửi tin nhắn bình thường nếu Webhook lỗi
            await channel.send({ embeds: [welcomeEmbed] });
        }
    }
};

export default GuildMemberAddEvent;