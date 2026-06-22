import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    GuildMember 
} from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { BOT_CONFIG } from '../../config';
const TestWelcomeCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName(`${BOT_CONFIG.prefix}-test-welcome`)
        .setDescription('Giả lập sự kiện chào mừng thành viên mới')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels),
    
    async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member;

    if (member && 'guild' in member) {
        // Ép kiểu hoặc truyền trực tiếp sau khi đã check 'guild' in member
        interaction.client.emit('guildMemberAdd', member as GuildMember);
        
        await interaction.reply({ 
            content: '✅ Đã gửi tín hiệu giả lập chào mừng cho chính bạn!', 
            ephemeral: true 
        });
    } else {
        await interaction.reply({ 
            content: '❌ Không thể giả lập: Bạn phải thực hiện lệnh này trong Server.', 
            ephemeral: true 
        });
    }
}
};

export default TestWelcomeCommand;