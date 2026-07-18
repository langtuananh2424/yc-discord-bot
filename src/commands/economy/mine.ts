import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';
import { getRandomMiningItem } from '../../configs/items';
import { EMOJIS } from '../../configs/emojis';

const MAX_ENERGY = 64;
const ENERGY_REGEN_MINUTES = 5; // Cứ 5 phút hồi 1 thể lực

const MineCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('Vác cúp đi đào khoáng sản (Tốn 1 Thể lực)'),

    async execute(interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;
        const now = new Date();

        // LẤY HOẶC TẠO DỮ LIỆU NGƯỜI CHƠI
        let userDb = await prisma.user.findUnique({ where: { id: userId } });
        if (!userDb) {
            userDb = await prisma.user.create({ data: { id: userId } });
        }

        // TÍNH TOÁN HỒI PHỤC THỂ LỰC (NẾU AFK)
        let currentEnergy = userDb.energy;
        let lastUpdate = userDb.lastEnergyUpdate;

        if (currentEnergy < MAX_ENERGY) {
            const msPassed = now.getTime() - lastUpdate.getTime();
            const minsPassed = Math.floor(msPassed / (1000 * 60));
            const energyToAdd = Math.floor(minsPassed / ENERGY_REGEN_MINUTES);

            if (energyToAdd > 0) {
                currentEnergy += energyToAdd;
                if (currentEnergy > MAX_ENERGY) currentEnergy = MAX_ENERGY;

                // Cộng dồn thời gian để không bị mất những phút lẻ (VD: 9 phút thì tính 5 phút hồi 1, dư 4 phút)
                const msToAdvance = energyToAdd * ENERGY_REGEN_MINUTES * 60 * 1000;
                lastUpdate = new Date(lastUpdate.getTime() + msToAdvance);
            }
        }

        // KIỂM TRA ĐIỀU KIỆN ĐÀO
        if (currentEnergy <= 0) {
            // Tính xem bao lâu nữa hồi 1 thể lực
            const msNextRegen = (ENERGY_REGEN_MINUTES * 60 * 1000) - (now.getTime() - lastUpdate.getTime());
            const minsWait = Math.ceil(msNextRegen / (1000 * 60));
            
            await interaction.reply({ 
                content: `❌ Bạn đã kiệt sức! Cần nghỉ ngơi thêm **${minsWait} phút** nữa để hồi 1 Thể lực.`, 
                flags: ['Ephemeral'] as any,
                ephemeral: true
            });

            return;
        }

        // QUAY GACHA LẤY ITEM
        const droppedItem = getRandomMiningItem();

        // THÊM VÀO KHO ĐỒ (Logic Minecraft: 64 ô, mỗi ô chứa 64 cái)
        const userInventory = await prisma.inventoryItem.findMany({
            where: { userId: userId },
            orderBy: { slot: 'asc' }
        });

        // Tìm xem có ô nào chứa Item này mà chưa đầy 64 cái không
        let targetSlot = userInventory.find(i => i.itemId === droppedItem.id && i.quantity < 64);
        let actionMessage = '';

        if (targetSlot) {
            // Cộng dồn vào slot cũ
            await prisma.inventoryItem.update({
                where: { id: targetSlot.id },
                data: { quantity: { increment: 1 } }
            });
        } else {
            // Nếu chưa có hoặc các slot cũ đã đầy 64 -> Tạo slot mới
            if (userInventory.length >= 64) {
                await interaction.reply({ content: '🎒 Kho đồ của bạn đã chật cứng (64/64 ô)! Hãy bán bớt đồ trước khi đào tiếp.', flags: ['Ephemeral'] as any, ephemeral: true });
                return;
            }

            // Tìm số slot trống nhỏ nhất (Từ 1 -> 64)
            const usedSlots = userInventory.map(i => i.slot);
            let newSlotNumber = 1;
            while (usedSlots.includes(newSlotNumber)) {
                newSlotNumber++;
            }

            await prisma.inventoryItem.create({
                data: {
                    userId: userId,
                    itemId: droppedItem.id,
                    quantity: 1,
                    slot: newSlotNumber
                }
            });
            actionMessage = `*(Tạo ô trống mới: Slot ${newSlotNumber})*`;
        }

        // CẬP NHẬT LẠI THỂ LỰC VÀO DATABASE
        await prisma.user.update({
            where: { id: userId },
            data: {
                energy: currentEnergy - 1, // Trừ 1 thể lực
                lastEnergyUpdate: lastUpdate // Cập nhật mốc thời gian hồi
            }
        });

        // TRẢ KẾT QUẢ CHO NGƯỜI DÙNG
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.DIAMOND_PICKAXE} Bạn vừa vung cúp đập đá!`)
            .setDescription(`Sau một hồi lụi cụi, bạn đào được:\n\n**${droppedItem.emoji} 1x ${droppedItem.name}**\n${actionMessage}`)
            .setColor(0x2ECC71)
            .setFooter({ text: `⚡ Thể lực còn lại: ${currentEnergy - 1}/64` });

        // Nếu ra TNT thì cho nổ chơi 
        if (droppedItem.id === 'tnt') {
            embed.setColor(0xE74C3C);
            embed.setTitle('💥 BÙMMMMMMM!');
            embed.setDescription(`Bạn lỡ tay gõ trúng một khối:\n\n**${droppedItem.emoji} 1x ${droppedItem.name}**\nCũng may là có giáp chống nổ nên bạn vẫn bình an vô sự!`);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

export default MineCommand;