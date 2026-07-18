import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const HelpCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-help')
        .setDescription('Xem danh sách toàn bộ các lệnh dành cho Thành viên'),

    async execute(interaction: ChatInputCommandInteraction) {
        // Tạo một bảng Embed đẹp mắt để liệt kê các lệnh cho Member
        const embed = new EmbedBuilder()
            .setTitle('🤖 Bảng Hướng Dẫn Sử Dụng YC Bot')
            .setDescription('Dưới đây là danh sách các tính năng mà bạn có thể trải nghiệm tại **YC Studio**:')
            .setColor(0x2B2D31) // Màu xám đen sang trọng giống màu nền Discord
            .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
            .addFields(
                { 
                    name: '⛏️ HỆ THỐNG KINH TẾ (ĐÀO KHOÁNG)', 
                    value: '`/mine` - Vác cúp đi đào khoáng sản (Tốn 1 Thể lực)\n`/inventory` - Kiểm tra túi đồ chứa chiến lợi phẩm\n`/balance` - Xem số dư YC Coin và Thể lực hiện tại\n`/market` - Xem bảng giá chứng khoán (khoáng sản) hôm nay\n`/sell` - Bán khoáng sản trong kho lấy YC Coin' 
                },
                { 
                    name: '🛒 HỆ THỐNG CHỢ SCHEMATIC', 
                    value: '`/post-schematic` - Đăng bán file Schematic lên chợ (Giao dịch bằng YC Coin)\n`/del-schematic` - Gỡ bài đăng bán Schematic của bạn' 
                },
                { 
                    name: '📌 CÁC LỆNH CHUNG', 
                    value: '`/yc-help` - Hiển thị bảng hướng dẫn này' 
                }
            )
            .setFooter({ 
                text: 'YC Studio System', 
                iconURL: interaction.guild?.iconURL() || undefined 
            })
            .setTimestamp();

        // Gửi dưới dạng Ephemeral để chỉ người gõ lệnh mới nhìn thấy, không làm rác kênh chat
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};

export default HelpCommand;