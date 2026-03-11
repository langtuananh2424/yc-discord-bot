import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';
import { EMOJIS } from '../../configs/emojis';

const AddCoinCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('add-coin')
        .setDescription('Tặng YC Coin cho người chơi (Chỉ Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Giới hạn quyền Admin
        .addUserOption(opt => 
            opt.setName('user')
            .setDescription('Người bạn muốn tặng coin')
            .setRequired(true)
        )
        .addNumberOption(opt => 
            opt.setName('amount')
            .setDescription('Số lượng YC Coin muốn tặng')
            .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user', true);
        const amount = interaction.options.getNumber('amount', true);

        if (amount <= 0) {
            await interaction.editReply('❌ Số lượng coin phải lớn hơn 0!');
            return;
        }

        // Cập nhật Database: Nếu user chưa có thì tạo mới và cộng tiền
        await prisma.user.upsert({
            where: { id: targetUser.id },
            update: { coins: { increment: amount } },
            create: { id: targetUser.id, coins: amount }
        });

        const embed = new EmbedBuilder()
            .setTitle('💰 Bơm vốn thành công!')
            .setDescription(`Đã chuyển **${amount}** YC Coin ${EMOJIS.COIN || '🪙'} vào tài khoản của <@${targetUser.id}>.`)
            .setColor(0x2ECC71);

        await interaction.editReply({ embeds: [embed] });
        
        // Gửi thông báo công khai (Tùy chọn, nếu không thích bạn có thể xóa dòng này)
        if (interaction.channel?.isTextBased()) {
            await (interaction.channel as TextChannel).send(`🎉 Quản trị viên vừa tặng **${amount} YC Coin** cho <@${targetUser.id}>!`);
        }
    }
};

export default AddCoinCommand;