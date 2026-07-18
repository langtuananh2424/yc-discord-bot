import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';
import { MINING_ITEMS } from '../../configs/items';
import { EMOJIS } from '../../configs/emojis';
import { getDailyPrice } from '../../configs/prices';

const SellCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Bán khoáng sản lấy YC Coin (Giá thay đổi mỗi ngày)')
        .addStringOption(option => 
            option.setName('item')
            .setDescription('Chọn vật phẩm bạn muốn bán')
            .setRequired(true)
            .addChoices(
                { name: '💰 BÁN TẤT CẢ (Dọn sạch kho)', value: 'all' },
                { name: `Đá Cuội`, value: 'cobblestone' },
                { name: `Than`, value: 'coal' },
                { name: `Thỏi Sắt`, value: 'iron_ingot' },
                { name: `Thỏi Vàng`, value: 'gold_ingot' },
                { name: `Đá Đỏ`, value: 'redstone' },
                { name: `Ngọc Lưu Ly`, value: 'lapislazuli' },
                { name: `Kim Cương`, value: 'diamond' },
                { name: `Ngọc Lục Bảo`, value: 'emarald' },
                { name: `Netherite`, value: 'netherite' },
                { name: `Khối TNT`, value: 'tnt' }
            )
        )
        .addIntegerOption(option => 
            option.setName('amount')
            .setDescription('Số lượng muốn bán (Bỏ trống = Bán hết sạch loại đó)')
            .setMinValue(1)
            .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ephemeral: true});

        const userId = interaction.user.id;
        const itemChoice = interaction.options.getString('item', true);
        const amountChoice = interaction.options.getInteger('amount');

        const inventory = await prisma.inventoryItem.findMany({
            where: { userId: userId },
            orderBy: { slot: 'asc' }
        });

        if (inventory.length === 0) {
            await interaction.editReply('❌ Kho đồ của bạn trống rỗng!');
            return;
        }

        let totalEarned = 0;
        let soldMessage = '';

        // 1. CHỌN BÁN TẤT CẢ MỌI THỨ
        if (itemChoice === 'all') {
            for (const item of inventory) {
                // 👇 Gọi giá thị trường hôm nay
                const dailyPrice = getDailyPrice(item.itemId).price;
                totalEarned += item.quantity * dailyPrice;
            }

            await prisma.inventoryItem.deleteMany({ where: { userId: userId } });
            soldMessage = `Bạn đã "xả hàng" dọn sạch kho đồ!`;
        } 
        
        // 2. CHỌN BÁN 1 LOẠI CỤ THỂ
        else {
            const itemsOfType = inventory.filter(i => i.itemId === itemChoice);
            const totalOwned = itemsOfType.reduce((sum, i) => sum + i.quantity, 0);

            if (totalOwned === 0) {
                await interaction.editReply('❌ Bạn không có vật phẩm này trong kho!');
                return;
            }

            const amountToSell = amountChoice || totalOwned;

            if (amountToSell > totalOwned) {
                await interaction.editReply(`❌ Bạn chỉ có **${totalOwned}** cái, không đủ để bán!`);
                return;
            }

            let amountLeft = amountToSell;
            for (const slot of itemsOfType) {
                if (amountLeft <= 0) break;
                if (slot.quantity <= amountLeft) {
                    amountLeft -= slot.quantity;
                    await prisma.inventoryItem.delete({ where: { id: slot.id } });
                } else {
                    await prisma.inventoryItem.update({
                        where: { id: slot.id },
                        data: { quantity: slot.quantity - amountLeft }
                    });
                    amountLeft = 0;
                }
            }

            const itemConfig = MINING_ITEMS.find(i => i.id === itemChoice);
            const dailyPrice = getDailyPrice(itemChoice).price;
            totalEarned = amountToSell * dailyPrice;

            soldMessage = `Bạn đã chốt lời **${amountToSell}x ${itemConfig?.emoji} ${itemConfig?.name}**`;
        }

        // CỘNG TIỀN VÀO TÀI KHOẢN
        await prisma.user.update({
            where: { id: userId },
            data: { coins: { increment: totalEarned } }
        });

        const embed = new EmbedBuilder()
            .setTitle(`🏦 Giao dịch thành công!`)
            .setDescription(`${soldMessage}\n\n**💵 Thu về:** \`+${totalEarned.toFixed(1)}\` YC Coin ${EMOJIS.COIN || '🪙'}`)
            .setColor(0xF1C40F);

        await interaction.editReply({ embeds: [embed]});
    }
};

export default SellCommand;