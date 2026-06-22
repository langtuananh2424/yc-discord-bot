import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';

const BalanceCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Kiểm tra số dư YC Coin và Thể lực của bạn')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('Xem tài sản của người khác (Bỏ trống để xem của mình)')
            .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        // Lấy User gốc
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        // Lấy Member trong Server
        const targetMember = interaction.options.getMember('user') || interaction.member;
        
        // Lấy tên hiển thị trong Server
        const displayName = (targetMember as GuildMember)?.displayName || targetUser.username;

        // Tìm trong Database
        let userDb = await prisma.user.findUnique({ where: { id: targetUser.id } });

        // Nếu người này chưa từng nhắn tin hay tương tác bao giờ
        if (!userDb) {
            userDb = await prisma.user.create({ data: { id: targetUser.id } });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏦 Tài khoản của ${displayName}`)
            .setDescription(`**Số dư:** \`${userDb.coins.toFixed(1)}\` YC Coin 🪙\n**Thể lực đào:** \`${userDb.energy}/64\` ⚡`)
            .setColor(0xFFD700) 
            .setThumbnail(targetUser.displayAvatarURL());

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

export default BalanceCommand;