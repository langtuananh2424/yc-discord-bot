import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const HelpCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-help')
        .setDescription('Xem danh sách toàn bộ các lệnh của YC Bot'),

    async execute(interaction: ChatInputCommandInteraction) {
        // Tạo một bảng Embed đẹp mắt để liệt kê các lệnh
        const embed = new EmbedBuilder()
            .setTitle('🤖 Bảng Hướng Dẫn Sử Dụng YC Bot')
            .setDescription('Dưới đây là danh sách toàn bộ các tính năng xịn sò mà Bot đang hỗ trợ cho cộng đồng **YC Studio**:')
            .setColor(0x2B2D31) // Màu xám đen sang trọng giống màu nền Discord
            .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
            .addFields(
                { 
                    name: '🛒 HỆ THỐNG SÀN GIAO DỊCH (MARKET)', 
                    value: '`/yc-setup-market` - Cài đặt các kênh và role cho Sàn giao dịch (Admin)\n`/yc-market-post` - Mở form đăng bán công trình Schematic mới (Mọi người)' 
                },
                { 
                    name: '🔊 HỆ THỐNG PHÒNG THOẠI (JOIN-TO-CREATE)', 
                    value: '`/yc-setup-voice` - Cài đặt kênh gốc để tự động tạo phòng Voice (Admin)' 
                },
                { 
                    name: '🎫 HỆ THỐNG TICKET HỖ TRỢ', 
                    value: '`/yc-setup-ticket` - Đặt bảng tạo Ticket tại kênh hiện tại (Admin)' 
                },
                { 
                    name: '✅ HỆ THỐNG XÁC NHẬN LUẬT (VERIFY)', 
                    value: '`/yc-setup-verify` - Đặt bảng xác nhận luật và tự động cấp Role (Admin)' 
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