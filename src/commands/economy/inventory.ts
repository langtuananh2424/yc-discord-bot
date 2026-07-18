import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';
import { MINING_ITEMS } from '../../configs/items';
import { EMOJIS } from '../../configs/emojis';

const InventoryCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Kiểm tra kho đồ (balo) chứa khoáng sản của bạn')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('Xem trộm kho đồ của người khác (Bỏ trống để xem của mình)')
            .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        // Dùng deferReply() để báo cho Discord biết Bot đang lục kho, tránh lỗi quá 3 giây
        await interaction.deferReply({ephemeral: true}); 

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.options.getMember('user') || interaction.member;
        const displayName = (targetMember as GuildMember)?.displayName || targetUser.username;

        // 1. LẤY DỮ LIỆU TỪ DATABASE (Sắp xếp theo thứ tự ô từ 1 -> 64)
        const inventory = await prisma.inventoryItem.findMany({
            where: { userId: targetUser.id },
            orderBy: { slot: 'asc' }
        });

        const usedSlots = inventory.length; // Tổng số ô đang bị chiếm dụng

        // 2. TẠO GIAO DIỆN RƯƠNG ĐỒ
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.WOODEN_CHEST} Kho đồ của ${displayName}`)
            .setColor(0x8B4513) // Màu Nâu Gỗ (Màu của chiếc rương Minecraft)
            .setThumbnail(targetUser.displayAvatarURL());

        // Nếu kho đồ chưa có gì
        if (usedSlots === 0) {
            embed.setDescription('*Kho đồ trống rỗng, chỉ có vài con nhện giăng tơ...*\n*Hãy dùng lệnh `/mine` để đi cày cuốc nhé!*');
            embed.setFooter({ text: `Đã dùng: 0/64 ô` });
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        // 3. LẮP RÁP DANH SÁCH VẬT PHẨM
        let inventoryString = '';
        
        for (const item of inventory) {
            // Tra cứu thông tin vật phẩm (Tên, Emoji) từ file configs/items.ts
            const itemConfig = MINING_ITEMS.find(i => i.id === item.itemId);
            
            // Lỡ có vật phẩm lỗi (Bị xóa trong code nhưng vẫn còn trong DB) thì để mặc định
            const itemName = itemConfig ? itemConfig.name : 'Vật phẩm bí ẩn';
            const itemEmoji = itemConfig ? itemConfig.emoji : '❓';

            // Format hiển thị: [1] <:yc_diamond:> 12x Kim Cương
            inventoryString += `**[${item.slot}]** ${itemEmoji} \`${item.quantity}x\` ${itemName}\n`;
        }

        // Nhét toàn bộ danh sách vào phần Description (Discord cho phép tối đa 4096 ký tự, 64 dòng của chúng ta tốn khoảng 2000 ký tự nên vô cùng an toàn)
        embed.setDescription(inventoryString);
        embed.setFooter({ text: `Đã dùng: ${usedSlots}/64 ô` });

        // 4. HIỂN THỊ LÊN KÊNH CHAT
        await interaction.editReply({ embeds: [embed] });
    }
};

export default InventoryCommand;