import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const LoCheoCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('lo-cheo')
        .setDescription('Tiến hành "lọ chéo" với một người anh em')
        .addUserOption(opt => 
            opt.setName('user')
            .setDescription('Người mà bạn muốn lọ chéo cùng')
            .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user', true);

        // (Tùy chọn) Kiểm tra xem có tự tag chính mình không
        if (targetUser.id === interaction.user.id) {
            await interaction.reply({ 
                content: '❌ Bạn không thể tự "lọ chéo" với chính bản thân mình được! Hãy tìm một người anh em đi!', 
                ephemeral: true 
            });
            return;
        }

        // (Tùy chọn) Kiểm tra xem có tag Bot không
        if (targetUser.bot) {
            await interaction.reply({ 
                content: '❌ Tha cho Bot đi, Bot là máy móc không biết "lọ chéo" đâu!', 
                ephemeral: true 
            });
            return;
        }

        // Gửi tin nhắn ra kênh chat công khai
        await interaction.reply({
            content: `⚔️ <@${interaction.user.id}> đã lọ chéo với <@${targetUser.id}>!`
        });
    }
};

export default LoCheoCommand;