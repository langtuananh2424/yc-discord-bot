import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../../utils/database';
import { ICommand } from '../../interfaces/Command';

const DelSchematicCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('del-schematic')
        .setDescription('Xóa bài đăng bán Schematic trên chợ (Dành cho Người bán hoặc Admin)')
        .addStringOption(opt => 
            opt.setName('id')
            .setDescription('Mã ID của bài đăng (Xem ở dưới cùng của bài đăng)')
            .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const listingId = interaction.options.getString('id', true);

        const listing = await prisma.schematicItem.findUnique({ where: { id: listingId } });

        if (!listing) {
            await interaction.editReply('❌ Bài viết này không tồn tại hoặc đã bị xóa từ trước!');
            return;
        }

        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
        
        if (listing.sellerId !== interaction.user.id && !isAdmin) {
            await interaction.editReply('❌ Bạn không có quyền xóa bài viết của người khác!');
            return;
        }

        await prisma.schematicItem.delete({ where: { id: listingId } });

        await interaction.editReply(`✅ Đã xóa thành công bài bán **${listing.title}** khỏi hệ thống Database!\n*(Lưu ý: Tin nhắn trên kênh chat vẫn sẽ tồn tại nhưng không ai có thể mua được nữa).*`);
    }
};

export default DelSchematicCommand;