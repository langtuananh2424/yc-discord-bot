import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, MessageFlags, TextChannel } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const SendIntroCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-send-intro')
        .setDescription('Gửi bài giới thiệu Server YC Studio cực cháy vào kênh hiện tại')
        .addStringOption(option => 
            option.setName('gif_url')
            .setDescription('Link ảnh GIF (Không bắt buộc, bot sẽ dùng ảnh mặc định nếu để trống)')
            .setRequired(false)
        )
        // Chỉ cho phép người có quyền Quản lý Server (Admin) dùng lệnh này
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        // Nếu bạn không tự điền link GIF, bot sẽ lấy một cái GIF creeper nổ tấu hài mặc định
        const defaultGif = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjRqaTNrMThwZG1zOHFnZmVpYnp1Z3V6MXNnbTFyODRqMmM4ZzM5dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuHjncTuHW40g/giphy.gif';
        const gifUrl = interaction.options.getString('gif_url') || defaultGif;

        // Xây dựng nội dung Embed từ kịch bản của bạn
        const description = `Đừng luống cuống! Bạn đã hạ cánh an toàn xuống **YC Studio** - tụ điểm "khét lẹt" nhất vũ trụ dành riêng cho hội anh em tay to hệ Minecraft Builder, Creators và những linh hồn đam mê xếp gạch.\n\n` +
        `Dưới đây là các tụ điểm bạn cần biết trước khi tham gia vào cộng đồng:\n\n` +
        `**🛂 1. ONBOARDING**\n` +
        `> Nơi đầu tiên bạn phải làm thủ tục. Nhớ đọc luật cho kỹ để không bị bế đi nhé! Bấm nhẹ cái dấu tích ✅ ở kênh lấy role để chính thức được cấp hộ chiếu làm công dân YC Studio.\n\n` +
        `**📢 2. ANNOUNCEMENTS**\n` +
        `> Đây là khu vực thông báo. Nơi các bô lão Admin thỉnh thoảng hiện hồn và ping everyone. Sự kiện nóng bỏng, giải build, hóng biến, hay tìm IP Server Minecraft thì cứ cắm trại ở đây.\n\n` +
        `**💬 3. COMMUNITY**\n` +
        `> Đây là khu vực trao đổi và tấu hài! Nơi anh em gạch thủ trao đổi chiêu thức, hoặc gõ lệnh bot.\n\n` +
        `**🛠️ 4. IDEA & BUILD**\n` +
        `> Sân khấu để anh em flex trình độ! Dù bạn vừa xây cái chuồng heo bằng đất hay một tòa lâu đài chọc trời, cứ tự tin ném ảnh vào đây. Kênh này còn là mỏ vàng để hôi của: ai có mod ngon, resource pack mượt hay tips xây nhà đỉnh thì cứ share mạnh tay nhé!\n\n` +
        `**🛒 5. MARKETPLACE**\n` +
        `> Sàn giao dịch "tư bản" và an toàn nhất hệ mặt trời. Mua bán Schematic chuẩn bài "tiền trao cháo múc". Với hệ thống Ký quỹ do con Bot trung gian siêu cấp vô địch của chúng ta giám sát, đố ông nào lừa đảo được! Lươn lẹo là ra chuồng gà chơi ngay! 💸\n\n` +
        `**🎧 6. VOICE & MUSIC**\n` +
        `> Trầm cảm vì dính deadline? Vào ngay các kênh Voice để nghe nhạc thư giãn hoặc gào thét cùng đồng bọn. Hệ thống "Tạo phòng" thông minh sẽ đẻ ra các phòng voice mới nhanh như cách bạn chết vì creeper.\n\n` +
        `**🚑 7. MEMBER SUPPORT**\n` +
        `> Game lỗi? Bot ngáo? Cần ăn vạ hay hiến kế cho server? Bấm tạo ngay một chiếc Ticket, đội ngũ Staff sẽ lập tức "phi trâu" đến cấp cứu hỗ trợ bạn 1-1 tận giường.`;

        const embed = new EmbedBuilder()
            .setTitle('🌟 CHÀO MỪNG ĐẾN VỚI CỘNG ĐỒNG CỦA CÁC GẠCH THỦ YC STUDIO 🌟')
            .setDescription(description)
            .setColor(0xFFA500) // Màu cam vàng rực rỡ
            .setImage(gifUrl) // Chèn ảnh GIF bự chà bá ở cuối
            .setFooter({ text: 'YC Studio', iconURL: interaction.guild?.iconURL() || undefined });

        try {
            const channel = interaction.channel as TextChannel;
            await channel.send({ embeds: [embed] });
            
            // Báo lại cho Admin biết là đã gửi xong (chỉ Admin thấy)
            await interaction.reply({ content: '✅ Đã gửi bài giới thiệu thành công!', flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Lỗi khi gửi intro:', error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi gửi bài.', flags: MessageFlags.Ephemeral });
        }
    }
};

export default SendIntroCommand;