import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, TextChannel } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const ChatCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-chat')
        .setDescription('Bảo bot nói gì nó nói nấy')
        .addStringOption(option => 
            option.setName('message')
            .setDescription('Nội dung bạn muốn bot gửi')
            .setRequired(true)
        )
        // Vẫn giữ quyền ManageMessages để tránh member lạm dụng bot đi spam
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction: ChatInputCommandInteraction) {
        // Lấy câu chữ mà bạn vừa bắt bot nói
        const message = interaction.options.getString('message', true);

        try {
            // Bot nhả chữ ra kênh hiện tại
            const channel = interaction.channel as TextChannel;
            await channel.send(message);
            
            // Báo lại cho bạn biết là đã hoàn thành nhiệm vụ (chỉ bạn thấy)
            await interaction.reply({ content: '✅ Đã mượn danh Bot thành công!', flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Lỗi khi chạy lệnh /yc-chat:', error);
            await interaction.reply({ content: '❌ Không thể gửi tin nhắn. Kênh này có cấm bot chat không?', flags: MessageFlags.Ephemeral });
        }
    }
};

export default ChatCommand;