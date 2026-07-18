import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { ICommand } from '../../interfaces/Command';
// 👇 1. Import hàm đọc cấu hình
import { getGuildConfig } from '../../utils/guildConfigHelper';

const SetupTournamentCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('setup-tournament')
        .setDescription('Cài đặt thông báo Giải Đấu (Chỉ Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        const config = getGuildConfig(interaction.guildId!);

        // Tạo bảng Form
        const modal = new ModalBuilder()
            .setCustomId('modal_setup_tournament')
            .setTitle('🏆 Cài đặt Thông tin Giải Đấu');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Tiêu đề giải đấu')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        if (config.tournamentTitle) titleInput.setValue(config.tournamentTitle);

        const descInput = new TextInputBuilder()
            .setCustomId('desc')
            .setLabel('Nội dung chi tiết')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        if (config.tournamentDesc) descInput.setValue(config.tournamentDesc);

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel('Mã màu Hex (VD: #FF0000)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        if (config.tournamentColor) colorInput.setValue(config.tournamentColor);

        const imageInput = new TextInputBuilder()
            .setCustomId('image')
            .setLabel('Link Ảnh (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        if (config.tournamentImage) imageInput.setValue(config.tournamentImage);

        const footerInput = new TextInputBuilder()
            .setCustomId('footer')
            .setLabel('Nội dung Footer')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        if (config.tournamentFooter) footerInput.setValue(config.tournamentFooter);

        // Đưa 5 ô vào Form
        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput)
        );

        // Hiển thị Form cho người dùng
        await interaction.showModal(modal);
    }
};

export default SetupTournamentCommand;