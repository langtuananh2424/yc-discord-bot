import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { MINING_ITEMS } from '../../configs/items';
import { EMOJIS } from '../../configs/emojis';
import { getDailyPrice, BASE_PRICES } from '../../configs/prices';

const MarketCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Xem bảng giá thu mua khoáng sản hôm nay (Cập nhật 00:00 mỗi ngày)'),

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle(`📈 Sàn Giao Dịch YC Studio`)
            .setColor(0x00FFFF);

        let marketInfo = '';
        
        for (const item of MINING_ITEMS) {
            const dailyData = getDailyPrice(item.id);
            const basePrice = BASE_PRICES[item.id] || 0.1;
            
            // Tính toán phần trăm thay đổi
            const percent = Math.round((dailyData.multiplier - 1) * 100);
            const percentText = percent >= 0 ? `+${percent}%` : `${percent}%`;
            
            marketInfo += `${item.emoji} **${item.name}**: \`${dailyData.price}\` ${EMOJIS.COIN || '🪙'} ${dailyData.trend} \`(${percentText})\` *(Gốc: ${basePrice})*\n`;
        }

        embed.setDescription('Giá cả sẽ dao động ngẫu nhiên theo từng ngày. Hãy canh lúc được giá để chốt lời nhé!\n\n' + marketInfo);
        embed.setFooter({ text: 'Thị trường sẽ làm mới vào đúng 00:00 ngày mai' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

export default MarketCommand;