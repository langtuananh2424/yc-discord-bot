import { Message } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { prisma } from '../utils/database';

const MessageCreateEvent: IEvent = {
    name: 'messageCreate',
    once: false,
    async execute(message: Message) {
        // Bỏ qua tin nhắn của Bot
        if (message.author.bot) return;

        const userId = message.author.id;
        const now = new Date();

        // Tìm user trong Database, nếu chưa có thì tạo mới
        let user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            user = await prisma.user.create({
                data: { id: userId }
            });
        }

        // Tính toán khoảng thời gian giữa 2 lần nhắn tin (Tính bằng Mili-giây)
        const timeDiff = now.getTime() - user.lastMessageTime.getTime();
        const COOLDOWN_MS = 30 * 1000; // 30 giây

        // Nếu đã qua 30 giây kể từ lần cuối nhận tiền
        if (timeDiff >= COOLDOWN_MS) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    coins: { increment: 0.1 }, // Cộng 0.1 YC Coin
                    lastMessageTime: now       // Cập nhật lại mốc thời gian
                }
            });
            // (Bạn có thể thêm console.log ở đây để test xem tiền có cộng không)
        }
    }
};

export default MessageCreateEvent;